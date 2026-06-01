const { C, ROLES, PERM_MODULES, PERM_MATRIX, ROLE_HISTORY, BANKS, bankName } = window.Everest;

/* ===== Reglas de Segregación de Funciones (SoD) ===== */
/* Devuelve lista de conflictos por rol según la matriz actual */
function detectSoD(roleId, perms){
  const conflicts=[]; // {module, actions:[...], msg}
  const has=(m,a)=>(perms[m]||[]).includes(a);
  // 1) Quien crea un corresponsal NO puede aprobarlo
  if(has('corr','Crear')&&has('corr','Aprobar'))
    conflicts.push({module:'corr',actions:['Crear','Aprobar'],msg:'Conflicto SoD: el mismo rol crea y aprueba corresponsales. Doble control obligatorio.'});
  // 2) Quien modifica límites NO puede aprobar el cambio
  if(has('lim','Configurar')&&has('lim','Aprobar cambio'))
    conflicts.push({module:'lim',actions:['Configurar','Aprobar cambio'],msg:'Conflicto SoD: configura y aprueba cambios de límite. Requiere segregación.'});
  // 3) Auditor: solo lectura y exportación
  if(roleId==='auditor'){
    Object.entries(perms).forEach(([m,acts])=>{
      const bad=acts.filter(a=>!['Ver','Exportar'].includes(a));
      if(bad.length) conflicts.push({module:m,actions:bad,msg:'El rol Auditor solo permite Ver y Exportar. No puede modificar configuración.'});
    });
  }
  return conflicts;
}

function RolesMatrix({bank}){
  const [matrix,setMatrix]=React.useState(()=>JSON.parse(JSON.stringify(PERM_MATRIX)));
  const [dirty,setDirty]=React.useState(false);
  const [hist,setHist]=React.useState(false);
  const [detail,setDetail]=React.useState(null);   // rol seleccionado para drawer detalle
  const [confirm,setConfirm]=React.useState(false);
  const [clone,setClone]=React.useState(null);
  const [statusFilter,setStatusFilter]=React.useState('all');

  const toggle=(roleId,modId,action)=>{
    if(roleId==='auditor'&&!['Ver','Exportar'].includes(action)){
      // permitir togglear pero quedará marcado conflicto — refleja validación UI
    }
    setMatrix(m=>{
      const cur=new Set(m[roleId][modId]||[]);
      cur.has(action)?cur.delete(action):cur.add(action);
      return {...m,[roleId]:{...m[roleId],[modId]:[...cur]}};
    });
    setDirty(true);
  };

  // conflictos por rol
  const conflictsByRole={};
  ROLES.forEach(r=>conflictsByRole[r.id]=detectSoD(r.id,matrix[r.id]||{}));
  const totalConflicts=Object.values(conflictsByRole).reduce((a,c)=>a+c.length,0);

  const roles = ROLES.filter(r=>statusFilter==='all'||(statusFilter==='active'?r.active:!r.active));
  const isAuditorBlocked=false; // se permite editar en UI pero se marca conflicto

  return (
    <div className="fade-in">
      <PageHeader title="Roles y Perfiles"
        sub="Matriz de roles × permisos con validación de segregación de funciones (SoD)"
        actions={<>
          <button className="btn btn-soft btn-sm" onClick={()=>setHist(true)}><Icon name="history" size={16}/>Historial</button>
          <button className="btn btn-soft btn-sm" onClick={()=>logAuditEvent('Exportó matriz de roles','Formato Excel · '+bankName(bank))}><Icon name="download" size={16}/>Exportar</button>
          <button className="btn btn-primary btn-sm" disabled={!dirty} onClick={()=>setConfirm(true)}><Icon name="check" size={16}/>Guardar cambios</button>
        </>}/>

      {/* barra de estado SoD + filtros */}
      <div className="row between center wrap gap12 mb16">
        <div className="row gap10 center wrap">
          <div className="seg">
            {[['all','Todos'],['active','Activos'],['inactive','Inactivos']].map(([v,l])=>
              <button key={v} className={statusFilter===v?'on':''} onClick={()=>setStatusFilter(v)}>{l}</button>)}
          </div>
          <span className="sr-lock"><Icon name="building" size={14}/> Scope: {bankName(bank)}</span>
        </div>
        {totalConflicts>0
          ? <div className="alert warn" style={{padding:'9px 14px'}}><Icon name="alert" size={18}/>
              <span>{totalConflicts} conflicto(s) de segregación de funciones detectados. Revisa las celdas marcadas.</span></div>
          : <div className="alert ok" style={{padding:'9px 14px'}}><Icon name="shieldcheck" size={18}/><span>Sin conflictos de SoD. Doble control garantizado.</span></div>}
      </div>

      {/* MATRIZ */}
      <div className="card" style={{overflow:'hidden'}}>
        <div className="tbl-wrap">
          <table className="tbl" style={{minWidth:1180}}>
            <thead>
              <tr>
                <th style={{position:'sticky',left:0,background:'var(--th)',zIndex:2,minWidth:240}}>Rol del sistema</th>
                {PERM_MODULES.map(m=><th key={m.id} style={{minWidth:175}}>{m.name}</th>)}
              </tr>
            </thead>
            <tbody>
              {roles.map(r=>{
                const conf=conflictsByRole[r.id];
                const confSet=new Set(conf.flatMap(c=>c.actions.map(a=>c.module+'·'+a)));
                return (
                  <tr key={r.id}>
                    <td style={{position:'sticky',left:0,background:'#fff',zIndex:1,boxShadow:'2px 0 0 var(--line)'}}>
                      <div className="row center gap10">
                        <div style={{flex:1,minWidth:0}}>
                          <div className="row center gap6">
                            <button onClick={()=>setDetail(r)} style={{fontWeight:700,color:C.navy,fontSize:13.5,textAlign:'left'}}>{r.name}</button>
                            {conf.length>0&&<Tip text={conf[0].msg}><Icon name="alert" size={16} color={C.amber}/></Tip>}
                          </div>
                          <div className="row center gap8 mt4">
                            <Badge cls={r.active?'b-green':'b-gray'} dot>{r.active?'Activo':'Inactivo'}</Badge>
                            <span className="tiny muted">{r.users} usuarios</span>
                          </div>
                        </div>
                        <button className="icon-btn" style={{width:30,height:30}} title="Clonar rol"
                          onClick={()=>setClone(r)}><Icon name="copy" size={15} color={C.gray}/></button>
                      </div>
                    </td>
                    {PERM_MODULES.map(m=>(
                      <td key={m.id} style={{verticalAlign:'top'}}>
                        <div className="row wrap gap6">
                          {m.actions.map(a=>{
                            const on=(matrix[r.id][m.id]||[]).includes(a);
                            const isConf=confSet.has(m.id+'·'+a);
                            return (
                              <button key={a} className={'perm '+(on?'on ':'')+(isConf?'conflict':'')}
                                onClick={()=>toggle(r.id,m.id,a)}>
                                {isConf&&<Icon name="alert" size={11} stroke={2.5}/>}{a}
                              </button>
                            );
                          })}
                        </div>
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
      <div className="row gap16 mt12 wrap tiny muted">
        <span className="row center gap6"><span className="perm on" style={{height:18,padding:'0 8px',fontSize:10}}>Activo</span> permiso concedido</span>
        <span className="row center gap6"><span className="perm conflict" style={{height:18,padding:'0 8px',fontSize:10}}>SoD</span> conflicto de segregación</span>
        <span className="row center gap6"><Icon name="copy" size={13}/> clonar rol</span>
      </div>

      {/* DRAWER: detalle de rol */}
      <Drawer open={!!detail} onClose={()=>setDetail(null)} title={detail?.name} sub={detail?'Scope: '+detail.scope:''} icon="shieldcheck" wide>
        {detail&&<>
          <p style={{color:C.gray,lineHeight:1.55,fontWeight:500}}>{detail.desc}</p>
          <div className="row gap10 mt16 mb20 wrap">
            <Badge cls={detail.active?'b-green':'b-gray'} dot>{detail.active?'Activo':'Inactivo'}</Badge>
            <Badge cls="b-blue">{detail.users} usuarios</Badge>
            {conflictsByRole[detail.id].length>0&&<Badge cls="b-amber">{conflictsByRole[detail.id].length} conflicto(s) SoD</Badge>}
          </div>
          <h4 style={{fontSize:13,marginBottom:10}}>Usuarios con este rol</h4>
          <div className="col gap8 mb20">
            {['María Lozano','Jorge Restrepo','Diana Quintero'].slice(0,detail.users>3?3:detail.users).map((n,i)=>(
              <div key={i} className="row center gap10" style={{padding:'9px 12px',background:'var(--bg)',borderRadius:10}}>
                <div className="su-avatar" style={{width:32,height:32,fontSize:12}}>{n.split(' ').map(x=>x[0]).join('')}</div>
                <span style={{fontWeight:600,fontSize:13,color:C.navy}}>{n}</span>
                <a className="mla tiny" style={{fontWeight:700}}>Ver perfil →</a>
              </div>
            ))}
            {detail.users>3&&<span className="tiny muted">+ {detail.users-3} usuarios más…</span>}
          </div>
          <div className="alert info"><Icon name="clock" size={17}/>
            <span>Última modificación: <b>Carolina Mejía</b> · 29 May 2026 · agregó permiso "Reversar".</span></div>
        </>}
      </Drawer>

      {/* DRAWER: historial */}
      <AuditDrawer open={hist} onClose={()=>setHist(false)} sub="Matriz de roles y permisos" items={ROLE_HISTORY}/>

      {/* Confirmar guardado */}
      <ConfirmModal open={confirm} onClose={()=>setConfirm(false)}
        title="Guardar cambios en la matriz" requireNote
        desc={totalConflicts>0
          ? `Hay ${totalConflicts} conflicto(s) de SoD sin resolver. Guardar requerirá una justificación y aprobación de un segundo control.`
          : 'Se aplicarán los cambios de permisos. La acción genera un registro de auditoría.'}
        confirmLabel="Guardar y registrar" danger={totalConflicts>0}
        onConfirm={note=>{setDirty(false);logAuditEvent('Actualizó matriz de roles',(note||'Cambios de permisos')+' · '+bankName(bank));}}/>

      {/* Clonar rol */}
      <Modal open={!!clone} onClose={()=>setClone(null)}>
        <div className="card-head" style={{borderRadius:'18px 18px 0 0'}}>
          <div className="icirc sm" style={{background:'var(--blue-soft)',boxShadow:'none'}}><Icon name="copy" size={19} color={C.blue}/></div>
          <h3>Clonar rol</h3>
          <button className="icon-btn mla" onClick={()=>setClone(null)}><Icon name="x" size={18}/></button>
        </div>
        <div className="card-pad">
          <p className="muted" style={{fontWeight:500}}>Crea una variante de <b style={{color:C.navy}}>{clone?.name}</b> con los mismos permisos como punto de partida.</p>
          <div className="field mt16"><label className="label">Nombre del nuevo rol <span className="req">*</span></label>
            <input className="input" defaultValue={clone?clone.name+' (copia)':''}/></div>
          <div className="row gap12 mt20" style={{justifyContent:'flex-end'}}>
            <button className="btn btn-soft" onClick={()=>setClone(null)}>Cancelar</button>
            <button className="btn btn-secondary" onClick={()=>{logAuditEvent('Clonó rol',clone.name);setClone(null);}}>Crear variante</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
window.RolesMatrix = RolesMatrix;
