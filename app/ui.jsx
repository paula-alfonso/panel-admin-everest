const { useState, useEffect, useRef, useCallback } = React;
const { C, BANKS, bankName, bankColor, bankShort, CURRENT_USER } = window.Everest;

/* ===================== AUDITORÍA (registro de acciones críticas) ===================== */
window.__audit = [];
function logAuditEvent(action, detail){
  const evt = {ts:new Date().toLocaleString('es-CO'), user:CURRENT_USER.name, action, detail};
  window.__audit.unshift(evt);
  window.dispatchEvent(new CustomEvent('toast',{detail:{msg:action, sub:detail}}));
  return evt;
}
window.logAuditEvent = logAuditEvent;

/* ===================== TOASTS ===================== */
function ToastHost(){
  const [items,setItems]=useState([]);
  useEffect(()=>{
    const h=e=>{
      const id=Math.random();
      setItems(x=>[...x,{id,...e.detail}]);
      setTimeout(()=>setItems(x=>x.filter(i=>i.id!==id)),3600);
    };
    window.addEventListener('toast',h);return()=>window.removeEventListener('toast',h);
  },[]);
  return (
    <div style={{position:'fixed',right:24,bottom:24,zIndex:99,display:'flex',flexDirection:'column',gap:10,maxWidth:360}}>
      {items.map(t=>(
        <div key={t.id} className="fade-in" style={{background:'#fff',borderRadius:13,boxShadow:'var(--shadow-lg)',
          padding:'13px 16px',display:'flex',gap:11,borderLeft:'4px solid '+C.green}}>
          <div style={{width:30,height:30,borderRadius:9,background:'var(--green-soft)',display:'grid',placeItems:'center',flexShrink:0}}>
            <Icon name="check" size={17} color={C.green}/>
          </div>
          <div style={{minWidth:0}}>
            <div style={{fontWeight:700,fontSize:13,color:C.navy}}>{t.msg}</div>
            {t.sub&&<div style={{fontSize:11.5,color:C.gray,marginTop:2}}>{t.sub}</div>}
            <div style={{fontSize:10.5,color:C.gray2,marginTop:3,fontWeight:600}}>Registrado en auditoría ✓</div>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ===================== BADGE ===================== */
function Badge({cls,children,dot}){
  return <span className={'badge '+(cls||'b-gray')}>{dot&&<span className="bdot" style={{background:'currentColor'}}/>}{children}</span>;
}

/* ===================== SWITCH ===================== */
function Switch({on,onClick,blue}){
  return <button type="button" className={'switch '+(blue?'blue ':'')+(on?'on':'')} onClick={onClick} aria-pressed={on}/>;
}
function Checkbox({on,onClick,red,label,sub}){
  return (
    <div className="cbx-row" onClick={onClick}>
      <span className={'cbx '+(red?'red ':'')+(on?'on':'')}>{on&&<Icon name="check" size={13} stroke={3}/>}</span>
      {label!==undefined&&<span style={{display:'flex',flexDirection:'column'}}>
        <span>{label}</span>{sub&&<span style={{fontWeight:500,fontSize:11.5,color:C.gray}}>{sub}</span>}</span>}
    </div>
  );
}
function Radio({on,onClick,label,sub}){
  return (
    <div className="cbx-row" onClick={onClick}>
      <span className={'radio '+(on?'on':'')}/>
      {label!==undefined&&<span style={{display:'flex',flexDirection:'column'}}>
        <span>{label}</span>{sub&&<span style={{fontWeight:500,fontSize:11.5,color:C.gray}}>{sub}</span>}</span>}
    </div>
  );
}

/* ===================== TOOLTIP ===================== */
function Tip({text,children}){
  const [s,setS]=useState(false);
  return <span className="tip" onMouseEnter={()=>setS(true)} onMouseLeave={()=>setS(false)}>
    {children}{s&&<span className="tip-pop">{text}</span>}</span>;
}

/* ===================== SEGMENTED ===================== */
function Segmented({options,value,onChange}){
  return <div className="seg">{options.map(o=>{
    const v=typeof o==='string'?o:o.value, l=typeof o==='string'?o:o.label;
    return <button key={v} className={value===v?'on':''} onClick={()=>onChange(v)}
      style={value===v&&o.color?{color:o.color}:{}}>{l}</button>;
  })}</div>;
}

/* ===================== MODAL ===================== */
function Modal({open,onClose,children,width}){
  useEffect(()=>{
    if(!open)return;
    const h=e=>e.key==='Escape'&&onClose();
    window.addEventListener('keydown',h);return()=>window.removeEventListener('keydown',h);
  },[open,onClose]);
  if(!open)return null;
  return (
    <div className="overlay" onClick={onClose}>
      <div className="modal" style={width?{width}:{}} onClick={e=>e.stopPropagation()}>{children}</div>
    </div>
  );
}

/* ConfirmModal — confirmación con campo de observación */
function ConfirmModal({open,onClose,onConfirm,title,desc,confirmLabel='Confirmar',danger,requireNote}){
  const [note,setNote]=useState('');
  useEffect(()=>{if(open)setNote('');},[open]);
  return (
    <Modal open={open} onClose={onClose}>
      <div className="card-head" style={{borderRadius:'18px 18px 0 0'}}>
        <div className="icirc sm" style={{background:danger?'var(--red-soft)':'var(--blue-soft)',boxShadow:'none'}}>
          <Icon name={danger?'alert':'info'} size={20} color={danger?C.red:C.blue}/>
        </div>
        <h3>{title}</h3>
        <button className="icon-btn mla" onClick={onClose}><Icon name="x" size={18}/></button>
      </div>
      <div className="card-pad">
        <p style={{color:C.gray,lineHeight:1.55,fontWeight:500}}>{desc}</p>
        <div className="field mt16">
          <label className="label">Observación {requireNote&&<span className="req">*</span>}</label>
          <textarea className="textarea" rows={3} value={note} onChange={e=>setNote(e.target.value)}
            placeholder="Describe el motivo de esta acción (queda en auditoría)…"/>
        </div>
        <div className="alert info mt16">
          <Icon name="shield" size={18}/>
          <span>Esta acción queda registrada en el log de auditoría con tu usuario, fecha y hora.</span>
        </div>
        <div className="row gap12 mt20" style={{justifyContent:'flex-end'}}>
          <button className="btn btn-soft" onClick={onClose}>Cancelar</button>
          <button className={'btn '+(danger?'btn-primary':'btn-secondary')}
            disabled={requireNote&&!note.trim()}
            onClick={()=>{onConfirm(note);onClose();}}>{confirmLabel}</button>
        </div>
      </div>
    </Modal>
  );
}

/* ===================== DRAWER ===================== */
function Drawer({open,onClose,title,sub,icon,wide,children,foot}){
  useEffect(()=>{
    if(!open)return;
    const h=e=>e.key==='Escape'&&onClose();
    window.addEventListener('keydown',h);return()=>window.removeEventListener('keydown',h);
  },[open,onClose]);
  if(!open)return null;
  return (
    <div className="drawer-wrap" onClick={onClose}>
      <div className={'drawer '+(wide?'wide':'')} onClick={e=>e.stopPropagation()}>
        <div className="drawer-head">
          {icon&&<div className="icirc sm" style={{background:'var(--blue-soft)',boxShadow:'none'}}><Icon name={icon} size={20} color={C.blue}/></div>}
          <div style={{flex:1,minWidth:0}}>
            <h3 style={{fontSize:17}}>{title}</h3>
            {sub&&<div style={{fontSize:12.5,color:C.gray,marginTop:3,fontWeight:500}}>{sub}</div>}
          </div>
          <button className="icon-btn" onClick={onClose}><Icon name="x" size={19}/></button>
        </div>
        <div style={{padding:'20px 24px',flex:1}}>{children}</div>
        {foot&&<div style={{padding:'16px 24px',borderTop:'1px solid var(--line)',position:'sticky',bottom:0,background:'#fff'}}>{foot}</div>}
      </div>
    </div>
  );
}

/* AuditDrawer — timeline de historial de cambios */
function AuditDrawer({open,onClose,title,sub,items}){
  return (
    <Drawer open={open} onClose={onClose} title={title||'Historial de cambios'} sub={sub} icon="history" wide>
      <div className="tl">
        {(items||[]).map((h,i)=>(
          <div className="tl-item" key={i}>
            <span className={'tl-dot '+(h.color||'blue')}/>
            <div style={{fontSize:13,fontWeight:700,color:C.navy}}>{h.action}</div>
            <div style={{fontSize:12,color:C.gray,marginTop:3,fontWeight:500}}>
              <b style={{color:C.ink}}>{h.who}</b> · {h.role} · {h.date}
            </div>
          </div>
        ))}
      </div>
    </Drawer>
  );
}

/* ===================== BANK SELECTOR (controlado por scope) ===================== */
function BankSelector({value,onChange,scope='multi'}){
  const [open,setOpen]=useState(false);
  const ref=useRef();
  useEffect(()=>{
    const h=e=>{if(ref.current&&!ref.current.contains(e.target))setOpen(false);};
    document.addEventListener('mousedown',h);return()=>document.removeEventListener('mousedown',h);
  },[]);
  const locked = scope!=='multi';
  const opts = scope==='multi'?BANKS:BANKS.filter(b=>b.id!=='all');
  return (
    <div className="bank-sel" ref={ref}>
      <button className="bank-trigger" onClick={()=>!locked&&setOpen(o=>!o)} style={locked?{cursor:'default',opacity:.92}:{}}>
        <span className="bank-dot" style={{background:bankColor(value)}}/>
        <span style={{whiteSpace:'nowrap'}}>{bankName(value)}</span>
        {locked ? <Icon name="lock" size={14} color={C.gray}/> : <Icon name="chevdown" size={15} color={C.gray}/>}
      </button>
      {open&&!locked&&(
        <div className="bank-menu">
          <div className="scope-lock"><Icon name="globe" size={13}/> Scope: multi-banco</div>
          {opts.map(b=>(
            <button key={b.id} className={'bank-opt '+(b.id===value?'sel':'')} onClick={()=>{onChange(b.id);setOpen(false);}}>
              <span className="bank-dot" style={{background:b.color}}/>{b.name}
              {b.id===value&&<Icon name="check" size={16} className="chk"/>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* ===================== KPI ===================== */
function Kpi({label,value,foot,color,icon,dense}){
  return (
    <div className={'kpi '+(color||'')+(dense?' dense':'')}>
      <div className="kpi-label">{label}{icon&&<Icon name={icon} size={16} color={C.blue}/>}</div>
      <div className="kpi-val">{value}</div>
      {foot&&<div className="kpi-foot">{foot}</div>}
    </div>
  );
}

/* ===================== EMPTY STATE ===================== */
function EmptyState({icon='search',title,sub,action}){
  return (
    <div className="empty">
      <div className="ei"><Icon name={icon} size={28}/></div>
      <div><div style={{fontWeight:700,color:C.navy,fontSize:15}}>{title}</div>
        {sub&&<div style={{marginTop:5,maxWidth:340}}>{sub}</div>}</div>
      {action}
    </div>
  );
}

/* ===================== SIDEBAR ===================== */
const NAV = [
  {id:'dashboard',  label:'Dashboard',           icon:'dashboard'},
  {id:'corr',       label:'Gestión Corresponsal',icon:'store',  badge:'3'},
  {id:'tx',         label:'Transacciones',       icon:'transactions'},
  {id:'roles',      label:'Roles y Perfiles',    icon:'shieldcheck'},
  {id:'notif',      label:'Notificaciones',      icon:'megaphone'},
  {id:'reportes',   label:'Reportes y Auditoría',icon:'report'},
  {id:'config',     label:'Configuración',       icon:'settings'},
];
function Sidebar({route,setRoute,collapsed,mobileOpen,setMobileOpen}){
  return (
    <aside className={'sidebar '+(collapsed?'collapsed ':'')+(mobileOpen?'mobile-open':'')}>
      <div className="sidebar-brand">
        <div className="brand-mark"><Icon name="scale" size={20} color="#fff" stroke={2.4}/></div>
        <span className="brand-name">Everest</span>
      </div>
      <nav className="nav">
        <div className="nav-label">Operación</div>
        {NAV.slice(0,5).map(n=>(
          <a key={n.id} className={'nav-item '+(route===n.id?'active':'')}
            onClick={()=>{setRoute(n.id);setMobileOpen&&setMobileOpen(false);}}>
            <Icon name={n.icon} size={19}/><span className="nav-text">{n.label}</span>
            {n.badge&&<span className="nav-badge">{n.badge}</span>}
          </a>
        ))}
        <div className="nav-label">Sistema</div>
        {NAV.slice(5).map(n=>(
          <a key={n.id} className={'nav-item '+(route===n.id?'active':'')}
            onClick={()=>{setRoute(n.id);setMobileOpen&&setMobileOpen(false);}}>
            <Icon name={n.icon} size={19}/><span className="nav-text">{n.label}</span>
          </a>
        ))}
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

/* ===================== HEADER ===================== */
const CRUMBS = {
  dashboard:['Dashboard'], corr:['Gestión Corresponsal'], tx:['Transacciones'],
  roles:['Roles y Perfiles'], notif:['Notificaciones'], reportes:['Reportes y Auditoría'], config:['Configuración'],
};
function Header({route,bank,setBank,onMenu,onToggleCollapse}){
  return (
    <header className="header">
      <button className="icon-btn" onClick={onMenu} title="Menú"><Icon name="menu" size={20}/></button>
      <div className="crumb">
        <Icon name="building" size={15} color={C.gray}/>
        <span>Admin</span><span className="sep">/</span><b>{(CRUMBS[route]||['—'])[0]}</b>
      </div>
      <div className="header-search">
        <Icon name="search" size={17} color={C.gray}/>
        <input placeholder="Buscar corresponsal, transacción, usuario…"/>
      </div>
      <BankSelector value={bank} onChange={setBank} scope={CURRENT_USER.scope}/>
      <button className="icon-btn" title="Notificaciones">
        <Icon name="bell" size={20}/><span className="bell-count">3</span>
      </button>
      <div className="su-avatar" style={{background:C.blue,width:40,height:40,borderRadius:11}} title={CURRENT_USER.name}>{CURRENT_USER.initials}</div>
    </header>
  );
}

/* ===================== PAGE HEADER ===================== */
function PageHeader({title,sub,actions}){
  return (
    <div className="row between center wrap gap16 mb24">
      <div><h1 className="page-title">{title}</h1>{sub&&<div className="page-sub">{sub}</div>}</div>
      {actions&&<div className="row gap10 wrap">{actions}</div>}
    </div>
  );
}

/* exportar al scope global */
Object.assign(window,{
  Badge,Switch,Checkbox,Radio,Tip,Segmented,Modal,ConfirmModal,Drawer,AuditDrawer,
  BankSelector,Kpi,EmptyState,Sidebar,Header,PageHeader,ToastHost,
});
