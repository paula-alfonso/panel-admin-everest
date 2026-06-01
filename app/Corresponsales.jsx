const { C, BANKS, bankName, CORRESPONSALES, CORR_STATUS, RISK } = window.Everest;

function Corresponsales({bank}){
  const [view,setView]=React.useState('list');   // list | stepper
  const [q,setQ]=React.useState('');
  const [statusF,setStatusF]=React.useState('all');
  const [riskF,setRiskF]=React.useState('all');
  const [detail,setDetail]=React.useState(null);

  let rows=CORRESPONSALES.filter(c=>bank==='all'||c.bank===bank);
  if(q)rows=rows.filter(c=>c.name.toLowerCase().includes(q.toLowerCase())||c.id.toLowerCase().includes(q.toLowerCase()));
  if(statusF!=='all')rows=rows.filter(c=>c.status===statusF);
  if(riskF!=='all')rows=rows.filter(c=>c.risk===riskF);

  if(view==='stepper')return <ActivationStepper bank={bank} onExit={()=>setView('list')}/>;

  return (
    <div className="fade-in">
      <PageHeader title="Gestión Corresponsal"
        sub="Registro, activación y administración de la red de corresponsales"
        actions={<>
          <button className="btn btn-soft btn-sm" onClick={()=>logAuditEvent('Exportó listado de corresponsales',bankName(bank))}><Icon name="download" size={16}/>Exportar</button>
          <button className="btn btn-primary btn-sm" onClick={()=>setView('stepper')}><Icon name="plus" size={16}/>Nuevo corresponsal</button>
        </>}/>

      {/* KPIs */}
      <div className="grid mb20" style={{gridTemplateColumns:'repeat(4,1fr)'}}>
        <Kpi color="green" label="Activos" value={CORRESPONSALES.filter(c=>c.status==='activo').length} icon="store"/>
        <Kpi color="amber" label="En revisión / observados" value={CORRESPONSALES.filter(c=>['revision','observado'].includes(c.status)).length} icon="clock"/>
        <Kpi color="red" label="Riesgo alto" value={CORRESPONSALES.filter(c=>c.risk==='alto').length} icon="alert"/>
        <Kpi label="Total red" value={CORRESPONSALES.length} foot="9 entidades · 19 puntos" icon="building"/>
      </div>

      {/* Filtros */}
      <div className="card card-pad mb20">
        <div className="row gap12 wrap center">
          <div className="header-search" style={{margin:0,width:280,background:'var(--bg)'}}>
            <Icon name="search" size={17} color={C.gray}/>
            <input placeholder="Buscar por razón social o ID…" value={q} onChange={e=>setQ(e.target.value)}/>
          </div>
          <select className="select" style={{width:'auto',minWidth:150}} value={statusF} onChange={e=>setStatusF(e.target.value)}>
            <option value="all">Todos los estados</option>
            {Object.entries(CORR_STATUS).map(([k,v])=><option key={k} value={k}>{v.label}</option>)}
          </select>
          <select className="select" style={{width:'auto',minWidth:140}} value={riskF} onChange={e=>setRiskF(e.target.value)}>
            <option value="all">Todo riesgo</option>
            {Object.entries(RISK).map(([k,v])=><option key={k} value={k}>Riesgo {v.label}</option>)}
          </select>
          <button className="btn btn-soft btn-sm"><Icon name="calendar" size={15}/>Rango de fechas</button>
          <span className="tiny muted mla">{rows.length} resultados</span>
        </div>
      </div>

      {/* Tabla */}
      <div className="card" style={{overflow:'hidden'}}>
        {rows.length===0
          ? <EmptyState title="Sin corresponsales" sub="Ajusta los filtros o crea un nuevo corresponsal."
              action={<button className="btn btn-primary btn-sm" onClick={()=>setView('stepper')}><Icon name="plus" size={15}/>Nuevo corresponsal</button>}/>
          : <div className="tbl-wrap"><table className="tbl">
          <thead><tr><th>ID</th><th>Razón social</th><th>Banco</th><th>Tipo</th><th>Riesgo</th><th>Estado</th><th>Última actividad</th><th>Documentos</th><th></th></tr></thead>
          <tbody>{rows.map(c=>(
            <tr key={c.id} style={{cursor:'pointer'}} onClick={()=>setDetail(c)}>
              <td className="mono" style={{fontWeight:700,color:C.blue}}>{c.id}</td>
              <td><div style={{fontWeight:700,color:C.navy}}>{c.name}</div><div className="tiny muted">{c.puntos} punto(s)</div></td>
              <td>{bankName(c.bank)}</td>
              <td>{c.type}</td>
              <td><Badge cls={RISK[c.risk].cls} dot>{RISK[c.risk].label}</Badge></td>
              <td><Badge cls={CORR_STATUS[c.status].cls} dot>{CORR_STATUS[c.status].label}</Badge></td>
              <td className="muted">{c.last}</td>
              <td><div className="row center gap6"><Icon name={c.docs[0]===c.docs[1]?'doccheck':'doc'} size={15}
                color={c.docs[0]===c.docs[1]?C.green:C.amber}/><span className="num" style={{fontSize:12}}>{c.docs[0]}/{c.docs[1]}</span></div></td>
              <td><button className="icon-btn" style={{width:30,height:30}}><Icon name="chevright" size={16}/></button></td>
            </tr>
          ))}</tbody>
        </table></div>}
      </div>

      {/* Drawer detalle */}
      <Drawer open={!!detail} onClose={()=>setDetail(null)} title={detail?.name} sub={detail?.id} icon="store" wide
        foot={detail&&<div className="row gap10"><button className="btn btn-ghost" style={{flex:1}}>Ver expediente</button>
          <button className="btn btn-secondary" style={{flex:1}}>Editar</button></div>}>
        {detail&&<>
          <div className="row gap10 wrap mb16">
            <Badge cls={CORR_STATUS[detail.status].cls} dot>{CORR_STATUS[detail.status].label}</Badge>
            <Badge cls={RISK[detail.risk].cls} dot>Riesgo {RISK[detail.risk].label}</Badge>
            <Badge cls="b-blue">{detail.type}</Badge>
          </div>
          {[['Banco',bankName(detail.bank)],['Tipo de entidad',detail.type],['Puntos de atención',detail.puntos],
            ['Documentos validados',`${detail.docs[0]} de ${detail.docs[1]}`],['Última actividad',detail.last]].map(([k,v])=>(
            <div key={k} className="row between" style={{padding:'11px 0',borderBottom:'1px solid var(--line)'}}>
              <span className="muted" style={{fontWeight:600}}>{k}</span><span style={{fontWeight:700,color:C.navy}}>{v}</span></div>
          ))}
          <h4 style={{fontSize:13,margin:'18px 0 10px'}}>Servicios habilitados</h4>
          <div className="row wrap gap8">{['Depósitos','Retiros','Pagos','Transferencias'].map(s=>
            <span key={s} className="chip"><Icon name="check" size={13}/>{s}</span>)}</div>
          <div className="alert info mt20"><Icon name="shield" size={17}/><span>Vista sin PII expuesta. El expediente completo requiere permiso "Ver" + registro de acceso.</span></div>
        </>}
      </Drawer>
    </div>
  );
}

/* ===================== STEPPER DE ACTIVACIÓN (5 pasos) ===================== */
const STEPS=[
  {k:'Paso 1',t:'Registro y datos'},
  {k:'Paso 2',t:'Parámetros y cuentas'},
  {k:'Paso 3',t:'Carga documental'},
  {k:'Paso 4',t:'KYC/KYB y AML'},
  {k:'Paso 5',t:'Revisión y activación'},
];
function ActivationStepper({bank,onExit}){
  const [step,setStep]=React.useState(0);
  const [done,setDone]=React.useState([]);
  const [risk,setRisk]=React.useState('medio');
  const [activate,setActivate]=React.useState(false);
  const next=()=>{setDone(d=>[...new Set([...d,step])]);setStep(s=>Math.min(4,s+1));window.scrollTo(0,0);};
  const back=()=>setStep(s=>Math.max(0,s-1));

  return (
    <div className="fade-in">
      <div className="row center gap10 mb20">
        <button className="icon-btn" onClick={onExit}><Icon name="chevleft" size={20}/></button>
        <div><h1 className="page-title" style={{fontSize:22}}>Activación de corresponsal</h1>
          <div className="page-sub">Borrador guardado automáticamente · {bankName(bank)}</div></div>
        <span className="badge b-amber mla" style={{height:28}}><Icon name="clock" size={13}/>Borrador</span>
      </div>

      {/* Stepper */}
      <div className="card card-pad mb20">
        <div className="stepper">
          {STEPS.map((s,i)=>(
            <React.Fragment key={i}>
              <div className={'step '+(i===step?'active':done.includes(i)?'done':'')}>
                <span className="step-num">{done.includes(i)&&i!==step?<Icon name="check" size={16} stroke={3}/>:i+1}</span>
                <span className="step-txt"><span className="step-k">{s.k}</span><div className="step-t">{s.t}</div></span>
              </div>
              {i<4&&<span className={'step-line '+(done.includes(i)?'done':'')}/>}
            </React.Fragment>
          ))}
        </div>
      </div>

      <div className="card card-pad">
        {step===0&&<Step1/>}
        {step===1&&<Step2 bank={bank}/>}
        {step===2&&<Step3/>}
        {step===3&&<Step4 risk={risk} setRisk={setRisk}/>}
        {step===4&&<Step5 risk={risk} onActivate={()=>setActivate(true)}/>}
      </div>

      {/* Footer nav */}
      <div className="row between center mt20">
        <button className="btn btn-soft" onClick={back} disabled={step===0}><Icon name="chevleft" size={16}/>Anterior</button>
        <span className="tiny muted">Paso {step+1} de 5</span>
        {step<4
          ? <button className="btn btn-secondary" onClick={next}>Guardar y continuar<Icon name="chevright" size={16}/></button>
          : <button className="btn btn-primary" disabled={risk==='alto'} onClick={()=>setActivate(true)}><Icon name="check" size={16}/>Activar Corresponsal</button>}
      </div>

      <ConfirmModal open={activate} onClose={()=>setActivate(false)} title="Activar corresponsal" requireNote
        desc="Se realizará el alta técnica, vinculación de terminales y configuración de límites iniciales. Acción crítica irreversible."
        confirmLabel="Activar ahora" danger
        onConfirm={note=>{logAuditEvent('Activó corresponsal','Nuevo CB · '+bankName(bank)+(note?' · '+note:''));onExit();}}/>
    </div>
  );
}

/* ===== Sub-componentes de paso ===== */
function SubH({n,children}){return <div className="row center gap8 mb14 mt4"><span style={{width:5,height:18,borderRadius:3,background:C.red}}/><h4 style={{fontSize:14}}>{children}</h4></div>;}
function F({label,req,children,full}){return <div className="field" style={full?{gridColumn:'1/-1'}:{}}>
  <label className="label">{label}{req&&<span className="req"> *</span>}</label>{children}</div>;}
const grid2={display:'grid',gridTemplateColumns:'1fr 1fr',gap:16};

function Step1(){
  const [tipo,setTipo]=React.useState('juridica');
  const [services,setServices]=React.useState(['Depósitos','Retiros']);
  const [subpoints,setSubpoints]=React.useState(true);
  const tg=(v)=>setServices(s=>s.includes(v)?s.filter(x=>x!==v):[...s,v]);
  return <div className="fade-in">
    <SubH>Identificación legal</SubH>
    <div className="row gap10 mb16">
      <button className={'perm '+(tipo==='juridica'?'on':'')} style={{height:38}} onClick={()=>setTipo('juridica')}>Persona jurídica</button>
      <button className={'perm '+(tipo==='natural'?'on':'')} style={{height:38}} onClick={()=>setTipo('natural')}>Persona natural</button>
    </div>
    <div style={grid2}>
      <F label="Razón social / Nombre" req><input className="input" placeholder="Ej. Supermercado La 14 S.A."/></F>
      <F label="NIT / ID fiscal" req><input className="input" placeholder="900.123.456-7"/></F>
      <F label="Representante legal" req><input className="input" placeholder="Nombre completo"/></F>
      <F label="ID representante" req><input className="input" placeholder="C.C. 79.xxx.xxx"/></F>
    </div>
    <F label="Acta constitutiva / Registro mercantil" req full><UploadZone/></F>
    <div className="divider"/>
    <SubH>Datos operativos</SubH>
    <div style={grid2}>
      <F label="Dirección" req full><input className="input" placeholder="Autocompletado geolocalizado…"/></F>
      <F label="Ciudad"><input className="input" placeholder="Cali"/></F>
      <F label="Departamento"><input className="input" placeholder="Valle del Cauca"/></F>
      <F label="Teléfono"><input className="input" placeholder="+57 …"/></F>
      <F label="Correo de contacto"><input className="input" type="email" placeholder="contacto@…"/></F>
    </div>
    <div className="alert info mt8" style={{padding:'10px 13px'}}><Icon name="pin" size={16}/><span>Coordenadas GPS opcionales con mapa embebido. Horario de operación: grid de días + rango horario.</span></div>
    <div className="divider"/>
    <SubH>Servicios a habilitar</SubH>
    <div className="row wrap gap8">{['Depósitos','Retiros','Pagos de servicios','Transferencias','Recargas','Consulta de saldo'].map(s=>
      <button key={s} className={'perm '+(services.includes(s)?'on':'')} style={{height:34}} onClick={()=>tg(s)}>{services.includes(s)&&<Icon name="check" size={12} stroke={3}/>}{s}</button>)}</div>
    <div className="divider"/>
    <SubH>Estructura de puntos</SubH>
    <div className="row center gap10"><Switch on={subpoints} blue onClick={()=>setSubpoints(s=>!s)}/>
      <span style={{fontWeight:600,fontSize:13}}>¿Tiene sucursales / sub-puntos?</span></div>
    {subpoints&&<div className="mt12" style={{padding:'14px',background:'var(--bg)',borderRadius:11}}>
      <div className="row between center mb12"><span style={{fontWeight:700,color:C.navy,fontSize:13}}>Punto #1</span>
        <button className="btn btn-ghost btn-sm"><Icon name="plus" size={14}/>Agregar punto</button></div>
      <div style={grid2}><F label="Nombre del punto"><input className="input" placeholder="Sucursal Norte"/></F>
        <F label="Dirección"><input className="input"/></F></div>
    </div>}
  </div>;
}

function Step2({bank}){
  return <div className="fade-in">
    <SubH>Parámetros comerciales y cuentas</SubH>
    <div style={grid2}>
      <F label="Banco asignado" req><select className="select" disabled={bank!=='all'} defaultValue={bank}>
        {BANKS.filter(b=>b.id!=='all').map(b=><option key={b.id} value={b.id}>{b.name}</option>)}</select></F>
      <F label="Calendario de corte"><select className="select"><option>Diario</option><option>Semanal</option><option>Mensual</option></select></F>
    </div>
    <h4 style={{fontSize:13,margin:'18px 0 10px'}}>Cuenta de liquidación</h4>
    <div style={{display:'grid',gridTemplateColumns:'2fr 1fr 1fr',gap:16}}>
      <F label="Número de cuenta" req><input className="input" placeholder="•••• •••• 4821"/></F>
      <F label="Tipo"><select className="select"><option>Ahorros</option><option>Corriente</option></select></F>
      <F label="Moneda"><select className="select"><option>COP</option><option>USD</option></select></F>
    </div>
    <F label="Carátula / estado de cuenta" req full><UploadZone/></F>
    <div className="divider"/>
    <SubH>Esquema de comisiones</SubH>
    <div className="tbl-wrap"><table className="tbl" style={{border:'1px solid var(--line)',borderRadius:12}}>
      <thead><tr><th>Tipo de transacción</th><th>Tipo comisión</th><th>Valor</th></tr></thead>
      <tbody>{['Depósito','Retiro','Pago de servicios'].map(t=>(
        <tr key={t}><td style={{fontWeight:600}}>{t}</td>
          <td><select className="select" style={{height:36}}><option>Porcentaje</option><option>Fijo</option></select></td>
          <td><input className="input" style={{height:36,width:120}} defaultValue="1.2%"/></td></tr>))}</tbody>
    </table></div>
    <div className="divider"/>
    <SubH>Canales / dispositivos</SubH>
    <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:16}}>
      <F label="Tipo"><select className="select"><option>POS</option><option>App</option><option>Terminal</option></select></F>
      <F label="Identificador"><input className="input" placeholder="POS-00231"/></F>
      <F label="IP autorizada"><input className="input mono" placeholder="190.0.0.0/24"/></F>
    </div>
  </div>;
}

function Step3(){
  const DOCS=[
    {name:'Acta constitutiva',req:'Sí',status:'validado',vig:'—'},
    {name:'ID fiscal / Comprobante domicilio',req:'Sí',status:'cargado',vig:'1 año'},
    {name:'ID Representante legal',req:'Sí',status:'validado',vig:'—'},
    {name:'Poderes notariales',req:'Condicional',status:'na',vig:'—'},
    {name:'Contrato de corresponsalía',req:'Sí',status:'pendiente',vig:'—'},
    {name:'Cuenta liquidación (carátula)',req:'Sí',status:'rechazado',vig:'6 meses'},
    {name:'Evidencia de capacitación',req:'Condicional',status:'na',vig:'1 año'},
  ];
  const ST={validado:{l:'Validado',cls:'b-green',ic:'check'},cargado:{l:'Cargado',cls:'b-blue',ic:'doc'},
    pendiente:{l:'Pendiente',cls:'b-amber',ic:'clock'},rechazado:{l:'Rechazado',cls:'b-red',ic:'x'},na:{l:'N/A',cls:'b-gray',ic:'info'}};
  return <div className="fade-in">
    <SubH>Carga documental (checklist parametrizable)</SubH>
    <div className="tbl-wrap"><table className="tbl" style={{border:'1px solid var(--line)',borderRadius:12}}>
      <thead><tr><th>Documento</th><th>Obligatorio</th><th>Estado</th><th>Vigencia</th><th>Acción</th></tr></thead>
      <tbody>{DOCS.map(d=>(
        <tr key={d.name}><td style={{fontWeight:600,color:C.navy}}>{d.name}</td>
          <td><Badge cls={d.req==='Sí'?'b-red':'b-gray'}>{d.req}</Badge></td>
          <td><Badge cls={ST[d.status].cls} dot>{ST[d.status].l}</Badge>
            {d.status==='rechazado'&&<div className="tiny" style={{color:C.red,marginTop:3}}>Motivo: ilegible</div>}</td>
          <td className="muted">{d.vig}</td>
          <td>{d.status==='na'?<span className="tiny muted">No aplica</span>:
            <button className="btn btn-ghost btn-sm"><Icon name="upload" size={13}/>{d.status==='pendiente'||d.status==='rechazado'?'Cargar':'Reemplazar'}</button>}</td></tr>))}</tbody>
    </table></div>
    <div className="alert warn mt16"><Icon name="clock" size={17}/><span>Alerta automática 30 días antes del vencimiento. Si expira un documento crítico, el corresponsal se bloquea automáticamente.</span></div>
    <div className="mt16"><UploadZone big/></div>
  </div>;
}

function Step4({risk,setRisk}){
  const [aml,setAml]=React.useState('revision');
  return <div className="fade-in">
    <SubH>Cumplimiento KYC/KYB y AML</SubH>
    <label className="label" style={{display:'block',marginBottom:8}}>Nivel de riesgo asignado</label>
    <div className="row gap10 mb16 wrap">
      {[['bajo','Bajo'],['medio','Medio'],['alto','Alto']].map(([v,l])=>
        <button key={v} className={'perm '+(risk===v?'on':'')} style={{height:38}} onClick={()=>setRisk(v)}>
          <span className="bdot" style={{width:8,height:8,borderRadius:'50%',background:RISK[v]?C[v==='bajo'?'green':v==='medio'?'amber':'red']:C.gray}}/>{l}</button>)}
    </div>
    <h4 style={{fontSize:13,margin:'8px 0 10px'}}>Consulta a listas restrictivas</h4>
    <div className="grid mb16" style={{gridTemplateColumns:'repeat(3,1fr)'}}>
      {[['OFAC','ok'],['PEP','ok'],['Listas locales',risk==='alto'?'hit':'ok']].map(([l,r])=>(
        <div key={l} className="row center gap10" style={{padding:'13px 14px',border:'1px solid var(--line)',borderRadius:12,
          background:r==='hit'?'var(--red-soft)':'var(--green-soft)'}}>
          <Icon name={r==='hit'?'x':'check'} size={18} color={r==='hit'?C.red:C.green}/>
          <div><div style={{fontWeight:700,fontSize:13,color:C.navy}}>{l}</div>
            <div className="tiny" style={{color:r==='hit'?C.red:'#067a3a',fontWeight:600}}>{r==='hit'?'Coincidencia detectada':'Sin coincidencias'}</div></div>
        </div>))}
    </div>
    <label className="label" style={{display:'block',marginBottom:8}}>Resultado de evaluación AML</label>
    <Segmented value={aml} onChange={setAml} options={[{value:'aprobado',label:'Aprobado',color:C.green},{value:'revision',label:'Requiere revisión',color:C.amber},{value:'rechazado',label:'Rechazado',color:C.red}]}/>
    <F label="Observaciones del oficial de cumplimiento" full><textarea className="textarea mt12" rows={3} placeholder="Notas de la evaluación AML…"/></F>
    {risk==='alto'&&<div className="alert danger mt16"><Icon name="lock" size={18}/>
      <span><b>Riesgo Alto:</b> el Paso 5 queda bloqueado hasta recibir la firma obligatoria de Cumplimiento/AML. Se requieren 3 aprobaciones.</span></div>}
  </div>;
}

function Step5({risk,onActivate}){
  const levels = risk==='bajo'?1:risk==='medio'?2:3;
  const approvers=[
    {n:'Jorge Restrepo',r:'Operador Banco',st:'aprobado',date:'29 May 09:02'},
    {n:'Carolina Mejía',r:'Admin Banco',st:levels>=2?'pendiente':'na',date:'SLA: 2h 30min'},
    {n:'Andrés Salcedo',r:'Cumplimiento/AML',st:levels>=3?'bloqueado':'na',date:'—'},
  ].slice(0,levels);
  const ST={aprobado:{cls:'b-green',ic:'check',l:'Aprobado'},pendiente:{cls:'b-amber',ic:'clock',l:'Pendiente'},
    bloqueado:{cls:'b-gray',ic:'lock',l:'Bloqueado'},rechazado:{cls:'b-red',ic:'x',l:'Rechazado'}};
  return <div className="fade-in">
    <SubH>Subpaso A — Workflow de aprobación</SubH>
    <div className="row gap10 wrap mb16">
      {STEPS.slice(0,4).map((s,i)=><span key={i} className="chip"><Icon name="check" size={13}/>{s.t}</span>)}
    </div>
    <div className="alert info mb16"><Icon name="info" size={17}/>
      <span>Riesgo <b>{RISK[risk].label}</b> → <b>{levels} aprobación(es)</b> requerida(s). Un mismo usuario no puede crear y aprobar (SoD).</span></div>
    <div className="card" style={{boxShadow:'none',border:'1px solid var(--line)'}}>
      {approvers.map((a,i)=>(
        <div key={i} className="row center gap12" style={{padding:'14px 16px',borderBottom:i<approvers.length-1?'1px solid var(--line)':'none'}}>
          <div className="su-avatar" style={{width:36,height:36,fontSize:13}}>{a.n.split(' ').map(x=>x[0]).join('')}</div>
          <div style={{flex:1}}><div style={{fontWeight:700,fontSize:13,color:C.navy}}>{a.n}</div>
            <div className="tiny muted">{a.r} · {a.date}</div></div>
          <Badge cls={ST[a.st]?.cls||'b-gray'} dot>{ST[a.st]?.l||'—'}</Badge>
        </div>
      ))}
    </div>
    <div className="row gap10 mt16 wrap">
      <button className="btn btn-secondary btn-sm" onClick={()=>logAuditEvent('Aprobó etapa de corresponsal','Workflow de activación')}><Icon name="check" size={15}/>Aprobar</button>
      <button className="btn btn-danger-ghost btn-sm"><Icon name="x" size={15}/>Rechazar con motivo</button>
      <button className="btn btn-soft btn-sm"><Icon name="edit" size={15}/>Solicitar corrección</button>
      <button className="btn btn-soft btn-sm"><Icon name="escalate" size={15}/>Escalar</button>
    </div>
    <div className="divider"/>
    <SubH>Subpaso B — Activación técnica</SubH>
    {risk==='alto'
      ? <div className="alert danger"><Icon name="lock" size={18}/><span>Bloqueado hasta completar las 3 aprobaciones (incluida firma de Cumplimiento/AML).</span></div>
      : <div className="col gap16">
        <div><h4 style={{fontSize:13,marginBottom:10}}>Alta de usuarios del corresponsal</h4>
          <div style={{display:'grid',gridTemplateColumns:'1.4fr 1fr 1fr 1fr',gap:12}}>
            <F label="Nombre"><input className="input" style={{height:38}}/></F>
            <F label="Rol"><select className="select" style={{height:38}}><option>Admin</option><option>Supervisor</option><option>Cajero</option></select></F>
            <F label="Correo"><input className="input" style={{height:38}}/></F>
            <F label="2FA"><div className="row center gap8" style={{height:38}}><Switch on blue onClick={()=>{}}/><span className="tiny">Obligatorio</span></div></F>
          </div></div>
        <div><h4 style={{fontSize:13,marginBottom:10}}>Límites iniciales</h4>
          <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:12}}>
            <F label="Mín. por tx"><input className="input mono" style={{height:38}} defaultValue="$10.000"/></F>
            <F label="Máx. por tx"><input className="input mono" style={{height:38}} defaultValue="$2.000.000"/></F>
            <F label="Diario"><input className="input mono" style={{height:38}} defaultValue="$20.000.000"/></F>
            <F label="Mensual"><input className="input mono" style={{height:38}} defaultValue="$400.000.000"/></F>
          </div></div>
        <div className="row center gap12 wrap" style={{padding:'14px',background:'var(--bg)',borderRadius:12}}>
          <button className="btn btn-ghost btn-sm" onClick={()=>logAuditEvent('Ejecutó prueba de conectividad','Resultado: Exitosa')}><Icon name="zap" size={15}/>Prueba de conectividad</button>
          <span className="badge b-green" style={{height:28}}><Icon name="check" size={13}/>Exitosa · 240ms</span>
          <div className="field mla" style={{minWidth:200}}><label className="label">Go-live</label><input className="input" type="datetime-local" style={{height:38}}/></div>
        </div>
      </div>}
  </div>;
}

function UploadZone({big}){
  const [file,setFile]=React.useState(null);
  return (
    <label style={{display:'flex',flexDirection:'column',alignItems:'center',gap:8,padding:big?'30px':'20px',
      border:'1.5px dashed var(--line-2)',borderRadius:12,cursor:'pointer',background:file?'var(--green-soft)':'var(--slate-50)',textAlign:'center'}}>
      <input type="file" style={{display:'none'}} onChange={e=>setFile(e.target.files[0]?.name)}/>
      <Icon name={file?'doccheck':'upload'} size={big?28:22} color={file?C.green:C.blue}/>
      <span style={{fontSize:12.5,fontWeight:700,color:file?'#067a3a':C.navy}}>{file||'Arrastra o haz clic para cargar'}</span>
      <span className="tiny muted">PDF, JPG, PNG · máx 10 MB</span>
    </label>
  );
}
window.Corresponsales = Corresponsales;
