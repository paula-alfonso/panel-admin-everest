const { C, cop, bankName, CORRESPONSALES, TRANSACTIONS, TX_STATUS } = window.Everest;

/* operaciones rápidas — réplica desktop del estilo móvil */
const QUICK = [
  {icon:'cash',     color:'red', t:'Pagar',      s:'Servicios públicos'},
  {icon:'withdraw', color:'blue',t:'Retirar',    s:'Retiro sin tarjeta'},
  {icon:'deposit',  color:'red', t:'Depositar',  s:'En efectivo'},
  {icon:'card',     color:'blue',t:'Pagar',      s:'Tarjeta de crédito'},
  {icon:'transactions',color:'blue',t:'Transferir',s:'con llaves',badge:'NUEVO'},
  {icon:'building', color:'red', t:'Productos',  s:'Catálogo'},
  {icon:'scale',    color:'blue',t:'Conciliar',  s:'Cuadre del día'},
  {icon:'report',   color:'red', t:'Más',        s:'Ver todo'},
];

function Dashboard({bank}){
  const activos = CORRESPONSALES.filter(c=>c.status==='activo').length;
  const enRev = CORRESPONSALES.filter(c=>c.status==='revision'||c.status==='observado').length;
  const aprob = TRANSACTIONS.filter(t=>t.status==='aprobada').length;
  const rech = TRANSACTIONS.filter(t=>t.status==='rechazada').length;
  const monto = TRANSACTIONS.filter(t=>t.status==='aprobada').reduce((a,t)=>a+t.amount,0);

  return (
    <div className="fade-in">
      <div className="mb24">
        <h1 className="page-title" style={{fontSize:30}}>Hola, Carolina 👋</h1>
        <div className="page-sub">Panel de administración · {bankName(bank)} · Martes 29 de mayo, 2026</div>
      </div>

      {/* KPIs principales */}
      <div className="grid mb24" style={{gridTemplateColumns:'repeat(4,1fr)'}}>
        <Kpi color="" label="Corresponsales activos" value={activos} foot={`${enRev} en revisión`} icon="store"/>
        <Kpi color="green" label="Transacciones aprobadas hoy" value={aprob} foot={`${rech} rechazadas · ${TRANSACTIONS.length} totales`} icon="check"/>
        <Kpi color="amber" label="Pendientes de aprobación" value="3" foot="2 corresponsales · 1 límite" icon="clock"/>
        <Kpi color="red" label="Monto operado hoy" value={cop(monto)} foot="Comisiones est. $182.400" icon="trend"/>
      </div>

      <div className="grid" style={{gridTemplateColumns:'1.55fr 1fr',alignItems:'start'}}>
        {/* Operaciones rápidas — cards individuales */}
        <div>
          <h3 className="section-title mb16">Operaciones rápidas</h3>
          <div className="grid" style={{gridTemplateColumns:'repeat(4,1fr)',gap:14}}>
            {QUICK.map((q,i)=>(
              <button key={i} className="op-card">
                {q.badge&&<span className="op-badge">{q.badge}</span>}
                <span className={'icirc '+q.color}><Icon name={q.icon} size={23}/></span>
                <span className="op-t">{q.t}</span>
                <span className="op-s">{q.s}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Actividad reciente */}
        <div className="card">
          <div className="card-head"><h3>Actividad reciente</h3>
            <span className="badge b-green mla" style={{gap:6}}><span className="bdot" style={{background:C.green}}/>En vivo</span></div>
          <div style={{padding:'8px 8px'}}>
            {TRANSACTIONS.slice(0,6).map(t=>(
              <div key={t.id} className="row center gap12" style={{padding:'10px 14px',borderRadius:10}}>
                <div className="icirc sm" style={{background:'var(--bg)',color:C.blue,boxShadow:'none'}}>
                  <Icon name={t.type==='Retiro'?'withdraw':t.type==='Depósito'?'deposit':'transactions'} size={18}/>
                </div>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontWeight:700,fontSize:13,color:C.navy}}>{t.type}</div>
                  <div style={{fontSize:11.5,color:C.gray}}>{t.corr} · {t.time}</div>
                </div>
                <div style={{textAlign:'right'}}>
                  <div className="num" style={{fontSize:13}}>{t.amount?cop(t.amount):'—'}</div>
                  <Badge cls={TX_STATUS[t.status].cls}>{TX_STATUS[t.status].label}</Badge>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Banner soporte (estilo captura) */}
      <div className="cta-banner mt24">
        <div className="cta-icon"><Icon name="bolt" size={24} color="#fff"/></div>
        <div style={{flex:1}}>
          <div style={{fontWeight:800,fontSize:17}}>¿Cómo podemos ayudarte?</div>
          <div style={{opacity:.82,fontSize:13,marginTop:3}}>Gestiona corresponsales, supervisa transacciones y configura tu red, todo desde el panel.</div>
        </div>
        <button className="icon-btn" style={{background:'rgba(255,255,255,.12)',color:'#fff'}}><Icon name="chevright" size={22}/></button>
      </div>
    </div>
  );
}
window.Dashboard = Dashboard;
