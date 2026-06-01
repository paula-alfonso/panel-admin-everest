const { C, BANKS, bankName, cop, TRANSACTIONS, TX_STATUS, TX_TYPES, TX_CATALOG, LIMITS, DISPUTES, RISK } = window.Everest;

function Transacciones({bank}){
  const [tab,setTab]=React.useState('monitor');
  const TABS=[['monitor','Monitor en vivo','transactions'],['catalogo','Catálogo','doc'],['limites','Límites','scale'],['concil','Conciliación','refresh']];
  return (
    <div className="fade-in">
      <PageHeader title="Transacciones y parametrización"
        sub="Monitoreo, catálogo, límites y conciliación de la operación transaccional"
        actions={<span className="sr-lock"><Icon name="building" size={14}/> Scope: {bankName(bank)}</span>}/>
      <div className="tabs mb24">
        {TABS.map(([id,l,ic])=><button key={id} className={'tab '+(tab===id?'on':'')} onClick={()=>setTab(id)}>
          <span className="row center gap8"><Icon name={ic} size={16}/>{l}</span></button>)}
      </div>
      {tab==='monitor'&&<MonitorTab bank={bank}/>}
      {tab==='catalogo'&&<CatalogTab/>}
      {tab==='limites'&&<LimitsTab/>}
      {tab==='concil'&&<ReconcileTab/>}
    </div>
  );
}

/* ===== TAB 1 — Monitor en vivo ===== */
function MonitorTab({bank}){
  const [detail,setDetail]=React.useState(null);
  const [reverse,setReverse]=React.useState(null);
  const [tick,setTick]=React.useState(0);
  React.useEffect(()=>{const t=setInterval(()=>setTick(x=>x+1),30000);return()=>clearInterval(t);},[]);
  let rows=TRANSACTIONS.filter(t=>bank==='all'||t.bank===bank);
  const sum=(f)=>rows.filter(f);
  const total=rows.length, aprob=sum(t=>t.status==='aprobada').length, rech=sum(t=>t.status==='rechazada').length,
    pend=sum(t=>t.status==='pendiente').length, rev=sum(t=>t.status==='reversada').length,
    monto=sum(t=>t.status==='aprobada').reduce((a,t)=>a+t.amount,0);
  return <div className="fade-in">
    <div className="grid mb20" style={{gridTemplateColumns:'repeat(6,minmax(0,1fr))',gap:14}}>
      <Kpi dense color="" label="Total hoy" value={total}/>
      <Kpi dense color="green" label="Aprobadas" value={aprob}/>
      <Kpi dense color="red" label="Rechazadas" value={rech}/>
      <Kpi dense color="amber" label="Pendientes" value={pend}/>
      <Kpi dense color="" label="Reversadas" value={rev}/>
      <Kpi dense color="green" label="Monto total" value={cop(monto)}/>
    </div>
    <div className="card" style={{overflow:'hidden'}}>
      <div className="card-head"><h3>Transacciones recientes</h3>
        <span className="badge b-green" style={{gap:6}}><span className="bdot" style={{background:C.green}}/>Auto-refresh 30s</span>
        <button className="btn btn-soft btn-sm mla"><Icon name="filter" size={14}/>Filtros</button></div>
      <div className="tbl-wrap"><table className="tbl">
        <thead><tr><th>ID</th><th>Banco</th><th>Corresponsal</th><th>Tipo</th><th>Monto</th><th>Estado</th><th>Canal</th><th>Fecha</th><th>Acciones</th></tr></thead>
        <tbody>{rows.map(t=>(
          <tr key={t.id}>
            <td className="mono" style={{fontWeight:700,color:C.blue}}>{t.id}</td>
            <td>{bankName(t.bank)}</td><td className="mono tiny">{t.corr}</td><td style={{fontWeight:600}}>{t.type}</td>
            <td className="num">{t.amount?cop(t.amount):'—'}</td>
            <td><Badge cls={TX_STATUS[t.status].cls} dot>{TX_STATUS[t.status].label}</Badge></td>
            <td>{t.channel}</td><td className="muted">{t.time}</td>
            <td><div className="row gap6">
              <button className="icon-btn" style={{width:30,height:30}} title="Ver detalle" onClick={()=>setDetail(t)}><Icon name="eye" size={15}/></button>
              <button className="icon-btn" style={{width:30,height:30}} title="Reversar" disabled={t.status!=='aprobada'}
                onClick={()=>setReverse(t)}><Icon name="reverse" size={15} color={t.status==='aprobada'?C.red:C.gray2}/></button>
              <button className="icon-btn" style={{width:30,height:30}} title="Escalar"><Icon name="escalate" size={15}/></button>
            </div></td>
          </tr>
        ))}</tbody>
      </table></div>
    </div>

    <Drawer open={!!detail} onClose={()=>setDetail(null)} title={detail?.id} sub={detail&&detail.type+' · '+bankName(detail.bank)} icon="transactions" wide
      foot={detail&&detail.status==='aprobada'&&<button className="btn btn-danger-ghost" style={{width:'100%'}} onClick={()=>{setReverse(detail);setDetail(null);}}><Icon name="reverse" size={16}/>Reversar transacción</button>}>
      {detail&&<>
        <div className="row gap10 wrap mb16"><Badge cls={TX_STATUS[detail.status].cls} dot>{TX_STATUS[detail.status].label}</Badge>
          <Badge cls="b-blue">{detail.channel}</Badge></div>
        {[['Monto',detail.amount?cop(detail.amount):'—'],['Corresponsal',detail.corr],['Banco',bankName(detail.bank)],
          ['Tipo',detail.type],['Canal',detail.channel],['Fecha',detail.time]].map(([k,v])=>(
          <div key={k} className="row between" style={{padding:'11px 0',borderBottom:'1px solid var(--line)'}}>
            <span className="muted" style={{fontWeight:600}}>{k}</span><span style={{fontWeight:700,color:C.navy}}>{v}</span></div>))}
        <h4 style={{fontSize:13,margin:'18px 0 12px'}}>Ciclo de vida</h4>
        <div className="tl">
          {[['Iniciada','green'],['Autorizada','green'],[detail.status==='reversada'?'Reversada':'Liquidada',detail.status==='reversada'?'red':'green']].map(([l,c],i)=>(
            <div key={i} className="tl-item"><span className={'tl-dot '+c}/><div style={{fontWeight:700,fontSize:13,color:C.navy}}>{l}</div>
              <div className="tiny muted">{detail.time}</div></div>))}
        </div>
        <div className="alert info mt16"><Icon name="shield" size={17}/><span>Datos sin PII expuesta. Logs de auditoría disponibles según rol.</span></div>
      </>}
    </Drawer>

    <ConfirmModal open={!!reverse} onClose={()=>setReverse(null)} title="Reversar transacción" requireNote danger
      desc={reverse&&`Se reversará ${reverse.id} por ${cop(reverse.amount)}. Requiere doble confirmación y queda registrada en auditoría.`}
      confirmLabel="Confirmar reverso"
      onConfirm={note=>logAuditEvent('Reversó transacción',reverse.id+' · '+cop(reverse.amount)+(note?' · '+note:''))}/>
  </div>;
}

/* ===== TAB 2 — Catálogo ===== */
function CatalogTab(){
  const [cat,setCat]=React.useState(()=>JSON.parse(JSON.stringify(TX_CATALOG)));
  const [add,setAdd]=React.useState(false);
  const banks=BANKS.filter(b=>b.id!=='all');
  const toggle=(ti,bid)=>setCat(c=>c.map((r,i)=>i===ti?{...r,banks:{...r.banks,[bid]:!r.banks[bid]}}:r));
  return <div className="fade-in">
    <div className="row between center mb16 wrap gap12">
      <p className="muted" style={{fontWeight:500,maxWidth:560}}>Habilitación de tipos de transacción por banco. Cada cambio queda registrado en auditoría.</p>
      <button className="btn btn-primary btn-sm" onClick={()=>setAdd(true)}><Icon name="plus" size={15}/>Agregar tipo</button>
    </div>
    <div className="card" style={{overflow:'hidden'}}>
      <div className="tbl-wrap"><table className="tbl">
        <thead><tr><th>Tipo de transacción</th>{banks.map(b=><th key={b.id} style={{textAlign:'center'}}>{b.short}</th>)}</tr></thead>
        <tbody>{cat.map((r,ti)=>(
          <tr key={r.type}><td><div style={{fontWeight:700,color:C.navy}}>{r.type}</div>{r.note&&<div className="tiny" style={{color:C.amber,fontWeight:600}}>{r.note}</div>}</td>
            {banks.map(b=>(
              <td key={b.id} style={{textAlign:'center'}}>
                <div className="row center" style={{justifyContent:'center',gap:6}}>
                  <Switch on={r.banks[b.id]} blue onClick={()=>{toggle(ti,b.id);logAuditEvent('Cambió catálogo',`${r.type} · ${b.short} · ${!r.banks[b.id]?'Activo':'Inactivo'}`);}}/>
                </div>
              </td>))}
          </tr>))}</tbody>
      </table></div>
    </div>
    <Modal open={add} onClose={()=>setAdd(false)}>
      <div className="card-head" style={{borderRadius:'18px 18px 0 0'}}><div className="icirc sm" style={{background:'var(--blue-soft)',boxShadow:'none'}}><Icon name="plus" size={19} color={C.blue}/></div>
        <h3>Agregar tipo de transacción</h3><button className="icon-btn mla" onClick={()=>setAdd(false)}><Icon name="x" size={18}/></button></div>
      <div className="card-pad">
        <div className="field mb12"><label className="label">Nombre del tipo <span className="req">*</span></label><input className="input" placeholder="Ej. Pago de impuestos"/></div>
        <div className="field"><label className="label">Bancos habilitados</label>
          <div className="row wrap gap8 mt4">{banks.map(b=><span key={b.id} className="chip">{b.short}</span>)}</div></div>
        <div className="row gap12 mt20" style={{justifyContent:'flex-end'}}>
          <button className="btn btn-soft" onClick={()=>setAdd(false)}>Cancelar</button>
          <button className="btn btn-secondary" onClick={()=>{logAuditEvent('Agregó tipo de transacción','Nuevo tipo');setAdd(false);}}>Crear</button></div>
      </div>
    </Modal>
  </div>;
}

/* ===== TAB 3 — Límites ===== */
function LimitsTab(){
  const [level,setLevel]=React.useState('Banco');
  const [rows,setRows]=React.useState(()=>JSON.parse(JSON.stringify(LIMITS)));
  const [overdraft,setOverdraft]=React.useState(false);
  const ST={activo:{cls:'b-green',l:'Activo'},pendiente:{cls:'b-amber',l:'Pend. aprobación'}};
  return <div className="fade-in">
    <div className="row center gap10 mb16 wrap">
      <span className="label">Nivel de configuración:</span>
      <div className="seg">{['Banco','Corresponsal','Terminal','Usuario'].map(l=>
        <button key={l} className={level===l?'on':''} onClick={()=>setLevel(l)}>{l}</button>)}</div>
      <span className="tiny muted mla">Jerarquía: Banco › Corresponsal › Terminal › Usuario</span>
    </div>
    <div className="card" style={{overflow:'hidden'}}>
      <div className="tbl-wrap"><table className="tbl">
        <thead><tr><th>Tipo</th><th>Mín</th><th>Máx</th><th>Límite diario</th><th>Límite mensual</th><th>Ops/día</th><th>Alerta %</th><th>Estado</th></tr></thead>
        <tbody>{rows.map((r,i)=>(
          <tr key={r.type}><td style={{fontWeight:700,color:C.navy}}>{r.type}</td>
            <td><EditNum value={r.min}/></td><td><EditNum value={r.max}/></td>
            <td><EditNum value={r.daily}/></td><td><EditNum value={r.monthly}/></td>
            <td className="num">{r.ops}</td>
            <td><div className="row center gap6"><input className="input" style={{height:32,width:56}} defaultValue={r.alert}/><span className="tiny muted">%</span></div></td>
            <td>{r.status==='pendiente'
              ? <Tip text="Requiere aprobación de Admin Banco (SoD: quien configura no aprueba)"><Badge cls="b-amber" dot>Pend. aprobación</Badge></Tip>
              : <Badge cls="b-green" dot>Activo</Badge>}</td></tr>))}</tbody>
      </table></div>
    </div>
    <div className="grid mt20" style={{gridTemplateColumns:'1fr 1fr'}}>
      <div className="card card-pad">
        <h4 style={{fontSize:14,marginBottom:12}}>Excepciones</h4>
        <div className="row center gap10 mb12"><Switch on={overdraft} blue onClick={()=>setOverdraft(o=>!o)}/>
          <span style={{fontWeight:600,fontSize:13}}>Permitir sobregiro controlado</span></div>
        {overdraft&&<div className="grid fade-in" style={{gridTemplateColumns:'1fr 1fr',gap:12}}>
          <F2 label="Monto máx. excepción"><input className="input mono" style={{height:38}} defaultValue="$500.000"/></F2>
          <F2 label="Rol aprobador"><select className="select" style={{height:38}}><option>Admin Banco</option><option>Cumplimiento</option></select></F2>
          <F2 label="Timeout (min)"><input className="input" style={{height:38}} defaultValue="15"/></F2>
        </div>}
      </div>
      <div className="card card-pad">
        <h4 style={{fontSize:14,marginBottom:12}}>Umbrales de alerta</h4>
        <F2 label="Notificar al alcanzar % del límite"><div className="row center gap8"><input className="input" style={{height:38,width:80}} defaultValue="80"/><span className="muted">%</span></div></F2>
        <div className="field mt12"><label className="label">Destino de alerta</label>
          <div className="row wrap gap8 mt4">{['Admin Banco','Operador','Supervisor'].map(r=><span key={r} className="chip">{r}</span>)}</div></div>
      </div>
    </div>
    <div className="row mt16" style={{justifyContent:'flex-end'}}>
      <button className="btn btn-primary btn-sm" onClick={()=>logAuditEvent('Solicitó cambio de límites','Nivel '+level+' · pendiente de aprobación')}><Icon name="check" size={15}/>Solicitar cambios</button>
    </div>
  </div>;
}
function EditNum({value}){return <input className="input mono" style={{height:32,width:120,fontSize:12}} defaultValue={cop(value)}/>;}
function F2({label,children}){return <div className="field"><label className="label">{label}</label>{children}</div>;}

/* ===== TAB 4 — Conciliación ===== */
function ReconcileTab(){
  const banks=BANKS.filter(b=>b.id!=='all');
  return <div className="fade-in col gap20">
    <div className="card card-pad">
      <h4 style={{fontSize:15,marginBottom:16}}>Configuración de conciliación</h4>
      <div className="grid" style={{gridTemplateColumns:'1fr 1fr 1fr',gap:16}}>
        <F2 label="Frecuencia"><select className="select"><option>Intradiaria (cada 4h)</option><option>Diaria</option><option>Manual</option></select></F2>
        <F2 label="Fuentes de match"><select className="select"><option>Core + Switch + POS + App</option><option>Solo Core</option></select></F2>
        <F2 label="Regla de match"><select className="select"><option>ID + Monto + Fecha + Terminal</option><option>ID + Monto</option></select></F2>
      </div>
      <h4 style={{fontSize:13,margin:'20px 0 12px'}}>Hora de cut-off por banco</h4>
      <div className="grid" style={{gridTemplateColumns:'repeat(4,1fr)',gap:12}}>
        {banks.map(b=><div key={b.id} style={{padding:'12px 14px',border:'1px solid var(--line)',borderRadius:12}}>
          <div className="row center gap8 mb8"><span className="bank-dot" style={{background:b.color}}/><span style={{fontWeight:700,fontSize:12.5,color:C.navy}}>{b.short}</span></div>
          <input className="input" type="time" style={{height:36}} defaultValue="18:00"/></div>)}
      </div>
    </div>

    <div className="card" style={{overflow:'hidden'}}>
      <div className="card-head"><h3>Partidas en disputa</h3><span className="badge b-amber mla">{DISPUTES.length} abiertas</span></div>
      <div className="tbl-wrap"><table className="tbl">
        <thead><tr><th>ID</th><th>Banco</th><th>Corresponsal</th><th>Monto</th><th>Estado</th><th>Días abierto</th><th>Asignado a</th><th>Acciones</th></tr></thead>
        <tbody>{DISPUTES.map(d=>(
          <tr key={d.id}><td className="mono" style={{fontWeight:700,color:C.blue}}>{d.id}</td><td>{bankName(d.bank)}</td>
            <td className="mono tiny">{d.corr}</td><td className="num">{cop(d.amount)}</td>
            <td><Badge cls={d.status==='Escalada'?'b-red':d.status==='Pendiente evidencia'?'b-amber':'b-blue'} dot>{d.status}</Badge></td>
            <td><span className={d.days>=7?'num':'num'} style={{color:d.days>=7?C.red:C.ink}}>{d.days} días</span></td>
            <td>{d.owner==='Sin asignar'?<span className="tiny muted">{d.owner}</span>:d.owner}</td>
            <td><div className="row gap6">
              <button className="btn btn-soft btn-sm" onClick={()=>logAuditEvent('Resolvió partida en disputa',d.id)}>Resolver</button>
              <button className="icon-btn" style={{width:30,height:30}} title="Ver evidencia"><Icon name="eye" size={15}/></button>
              <button className="icon-btn" style={{width:30,height:30}} title="Escalar"><Icon name="escalate" size={15}/></button>
            </div></td></tr>))}</tbody>
      </table></div>
    </div>

    <div className="grid" style={{gridTemplateColumns:'1fr 1fr'}}>
      <div className="card card-pad">
        <h4 style={{fontSize:15,marginBottom:14}}>Políticas de reverso</h4>
        <div className="col gap12">
          <F2 label="Ventana máxima de reverso"><div className="row gap10"><input className="input" style={{height:38,width:90}} defaultValue="60"/>
            <select className="select" style={{height:38}}><option>minutos</option><option>mismo día</option></select></div></F2>
          <div className="row gap12"><F2 label="Rol que inicia"><select className="select" style={{height:38}}><option>Supervisor</option><option>Admin</option></select></F2>
            <F2 label="Rol que aprueba"><select className="select" style={{height:38}}><option>Admin Banco</option><option>Cumplimiento</option></select></F2></div>
          <div className="row center gap10"><Switch on blue onClick={()=>{}}/><span style={{fontWeight:600,fontSize:13}}>Doble confirmación para reversos &gt; $1.000.000</span></div>
        </div>
      </div>
      <div className="card card-pad">
        <h4 style={{fontSize:15,marginBottom:14}}>Seguridad transaccional</h4>
        <div className="col gap12">
          <F2 label="Timeout de sesión operativa (min)"><input className="input" style={{height:38,width:100}} defaultValue="10"/></F2>
          <div className="field"><label className="label">2FA requerido para</label>
            <div className="row wrap gap8 mt4">{['Reverso','Tx > $1M','Cambio de límite'].map(x=><span key={x} className="chip"><Icon name="lock" size={13}/>{x}</span>)}</div></div>
          <div className="row gap12">
            <F2 label="Reintentos máx."><input className="input" style={{height:38,width:80}} defaultValue="3"/></F2>
            <F2 label="Rate limit (ops/min)"><input className="input" style={{height:38,width:90}} defaultValue="30"/></F2>
          </div>
          <div className="row center gap10"><span className="sr-lock"><Icon name="key" size={14}/>Cifrado en tránsito:</span><Badge cls="b-blue">HMAC + PKI</Badge>
            <span className="sr-lock"><Icon name="fingerprint" size={14}/>Idempotency key obligatoria</span></div>
        </div>
      </div>
    </div>
  </div>;
}
window.Transacciones = Transacciones;
