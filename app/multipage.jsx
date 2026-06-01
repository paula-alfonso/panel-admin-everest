const { useState } = React;
const { CURRENT_USER, bankName } = window.Everest;

/* ===== Navegación entre páginas (multipágina) ===== */
const M_NAV = [
  {id:'dashboard', label:'Dashboard',            icon:'dashboard',   file:'index.html'},
  {id:'corr',      label:'Gestión Corresponsal', icon:'store', badge:'3', file:'gestion-corresponsal.html'},
  {id:'tx',        label:'Transacciones',        icon:'transactions',file:'transacciones.html'},
  {id:'roles',     label:'Roles y Perfiles',     icon:'shieldcheck', file:'roles-perfiles.html'},
  {id:'notif',     label:'Notificaciones',       icon:'megaphone',   file:'notificaciones.html'},
  {id:'reportes',  label:'Reportes y Auditoría', icon:'report',      file:'reportes.html'},
  {id:'config',    label:'Configuración',        icon:'settings',    file:'configuracion.html'},
];

function MultiSidebar({route,collapsed,mobileOpen}){
  const link = n => (
    <a key={n.id} href={n.file} className={'nav-item '+(route===n.id?'active':'')}>
      <Icon name={n.icon} size={19}/><span className="nav-text">{n.label}</span>
      {n.badge&&<span className="nav-badge">{n.badge}</span>}
    </a>
  );
  return (
    <aside className={'sidebar '+(collapsed?'collapsed ':'')+(mobileOpen?'mobile-open':'')}>
      <div className="sidebar-brand">
        <div className="brand-mark"><Icon name="scale" size={20} color="#fff" stroke={2.4}/></div>
        <span className="brand-name">Everest</span>
      </div>
      <nav className="nav">
        <div className="nav-label">Operación</div>
        {M_NAV.slice(0,5).map(link)}
        <div className="nav-label">Sistema</div>
        {M_NAV.slice(5).map(link)}
      </nav>
      <div className="sidebar-user">
        <div className="su-avatar">{CURRENT_USER.initials}</div>
        <div className="su-meta">
          <div className="su-name">{CURRENT_USER.name}</div>
          <div className="su-role">{CURRENT_USER.role}</div>
        </div>
        <button className="su-logout"><Icon name="logout" size={18}/></button>
      </div>
    </aside>
  );
}

/* Placeholder para módulos del roadmap */
function Placeholder({title,sub,icon}){
  return (
    <div className="fade-in">
      <PageHeader title={title} sub={sub}/>
      <div className="card"><EmptyState icon={icon} title="Módulo en construcción"
        sub="Esta sección forma parte del roadmap del panel. El foco de esta entrega son los 4 módulos núcleo: Corresponsal, Transacciones, Roles y Notificaciones."/></div>
    </div>
  );
}

function MultiApp(){
  const route = window.__ROUTE || 'dashboard';
  const [bank,setBank]=useState(()=>localStorage.getItem('everest_bank')||'all');
  const [collapsed,setCollapsed]=useState(false);
  const [mobileOpen,setMobileOpen]=useState(false);
  const setBankP = b=>{setBank(b);localStorage.setItem('everest_bank',b);};
  const onMenu=()=>{ if(window.innerWidth<=768)setMobileOpen(o=>!o); else setCollapsed(c=>!c); };

  return (
    <div className="app">
      <MultiSidebar route={route} collapsed={collapsed} mobileOpen={mobileOpen}/>
      {mobileOpen&&<div className="scrim" onClick={()=>setMobileOpen(false)}/>}
      <div className="main-col">
        <Header route={route} bank={bank} setBank={setBankP} onMenu={onMenu}/>
        <div className="content">
          {route==='dashboard'&&<Dashboard bank={bank}/>}
          {route==='corr'&&<Corresponsales bank={bank}/>}
          {route==='tx'&&<Transacciones bank={bank}/>}
          {route==='roles'&&<RolesMatrix bank={bank}/>}
          {route==='notif'&&<Notifications bank={bank}/>}
          {route==='reportes'&&<Placeholder title="Reportes y Auditoría" sub="Exportación y trazabilidad regulatoria" icon="report"/>}
          {route==='config'&&<Placeholder title="Configuración del sistema" sub="Parámetros globales del panel" icon="settings"/>}
        </div>
      </div>
      <ToastHost/>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<MultiApp/>);
