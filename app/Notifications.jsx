const { C, BANKS, bankName, bankColor, NOTIF_HISTORY } = window.Everest;

const NOTIF_ROLES = [
  {id:'admin', label:'Administrador', sub:'eventos críticos, seguridad, disponibilidad', n:8},
  {id:'op',    label:'Operador',      sub:'operativos, transacciones, conciliaciones', n:24},
  {id:'aud',   label:'Auditor',       sub:'cumplimiento, accesos, configuración', n:3},
  {id:'adc',   label:'Admin Corresponsal', sub:'alertas de su red', n:42},
  {id:'sup',   label:'Supervisor Cajero', sub:'', n:61},
  {id:'caj',   label:'Cajero', sub:'', n:220},
  {id:'opc',   label:'Operador Corresponsal', sub:'', n:120},
];
const NOTIF_CATS = [
  {id:'tx',  icon:'transactions',label:'Alertas de transacciones', items:['Transacción rechazada / timeout','Umbral excedido (monto / volumen)','Riesgo / Fraude (regla disparada)']},
  {id:'sys', icon:'settings',    label:'Actualizaciones de sistema',items:['Ventana de mantenimiento','Degradación / Incidente','Cambio de versión / Despliegue']},
  {id:'sec', icon:'lock',        label:'Seguridad',                items:['Accesos fallidos / Bloqueo de cuenta','Cambio de credenciales o roles','Nuevo dispositivo / Sesión sospechosa']},
  {id:'ops', icon:'refresh',     label:'Operación / Procesos',     items:['Lotes / ETL / Conciliaciones','Colas con backlog','Reprocesos pendientes']},
  {id:'cmp', icon:'doccheck',    label:'Cumplimiento / Auditoría', items:['Cambios en parámetros críticos','Accesos a datos sensibles','Exportaciones / Reportes regulatorios']},
];
const SEV = {Crítica:{c:C.red,cls:'b-red'},Alta:{c:C.orange,cls:'b-orange'},Media:{c:C.amber,cls:'b-amber'},Baja:{c:C.gray,cls:'b-gray'}};
const VARS = ['{{banco}}','{{fecha}}','{{severidad}}','{{referencia_id}}','{{corresponsal}}'];
const CHANNELS = ['Push in-app','Correo','SMS','Teams/Slack'];

function Notifications({bank}){
  const [nBank,setNBank]=React.useState(bank==='all'?'all':bank);
  const [roles,setRoles]=React.useState(['op']);
  const [cats,setCats]=React.useState({sys:['Ventana de mantenimiento']});
  const [openCat,setOpenCat]=React.useState('sys');
  const [sev,setSev]=React.useState('Alta');
  const [title,setTitle]=React.useState('Mantenimiento programado del core bancario');
  const [desc,setDesc]=React.useState('Actualización del core bancario a las 22:00 hrs. Cierre todas las operaciones antes de las 21:30 hrs.');
  const [cta,setCta]=React.useState(['Ver detalle']);
  const [channels,setChannels]=React.useState(['Push in-app']);
  const [mode,setMode]=React.useState('inmediata');
  const [days,setDays]=React.useState(['L','M','X','J','V']);
  const [advanced,setAdvanced]=React.useState(false);
  const [overrideCrit,setOverrideCrit]=React.useState(true);
  const [dnd,setDnd]=React.useState(false);
  const [confirm,setConfirm]=React.useState(false);

  const titleRef=React.useRef();
  const reach = roles.reduce((a,r)=>a+(NOTIF_ROLES.find(x=>x.id===r)?.n||0),0)*(nBank==='all'?4:1);
  const banksCount = nBank==='all'?4:1;

  const toggleArr=(arr,set,v)=>set(arr.includes(v)?arr.filter(x=>x!==v):[...arr,v]);
  const toggleCatItem=(catId,item)=>setCats(c=>{
    const cur=new Set(c[catId]||[]); cur.has(item)?cur.delete(item):cur.add(item);
    const next={...c,[catId]:[...cur]}; if(!next[catId].length)delete next[catId]; return next;
  });
  const insertVar=v=>setTitle(t=>t+(t&&!t.endsWith(' ')?' ':'')+v);

  const render=txt=>txt.replace('{{corresponsal}}','Supermercado La 14').replace('{{banco}}',bankName(nBank))
    .replace('{{fecha}}','29 May 09:14').replace('{{severidad}}',sev).replace('{{referencia_id}}','TX-982340');

  return (
    <div className="fade-in">
      <PageHeader title="Notificaciones push masivas"
        sub="Configura y envía alertas segmentadas por banco, rol y severidad"
        actions={<span className="sr-lock"><Icon name="building" size={14}/> Scope: {bankName(bank)}</span>}/>

      <div className="grid" style={{gridTemplateColumns:'1.5fr 1fr',gap:22,alignItems:'start'}}>
        {/* ===== COLUMNA FORM (60%) ===== */}
        <div className="col gap20">
          {/* A — Banco y alcance */}
          <Section n="A" title="Configuración de banco y alcance">
            <div className="field">
              <label className="label">Banco <span className="req">*</span></label>
              <select className="select" value={nBank} onChange={e=>setNBank(e.target.value)}>
                {BANKS.map(b=><option key={b.id} value={b.id}>{b.name}</option>)}
              </select>
              <span className="help">Los bancos fuera de tu scope quedan bloqueados. "Todos los bancos" solo visible para perfil multi-banco.</span>
            </div>
          </Section>

          {/* B — Audiencia */}
          <Section n="B" title="Audiencia (rol receptor)">
            <div className="col gap8">
              {NOTIF_ROLES.map(r=>(
                <div key={r.id} className="row center gap10" style={{padding:'10px 12px',border:'1px solid var(--line)',borderRadius:10,
                  background:roles.includes(r.id)?'var(--blue-soft)':'#fff'}}>
                  <Checkbox on={roles.includes(r.id)} onClick={()=>toggleArr(roles,setRoles,r.id)}/>
                  <div style={{flex:1}}>
                    <div style={{fontWeight:700,fontSize:13,color:C.navy}}>{r.label}</div>
                    {r.sub&&<div style={{fontSize:11.5,color:C.gray}}>{r.sub}</div>}
                  </div>
                  <span className="tiny muted">{r.n} usuarios</span>
                </div>
              ))}
            </div>
            <div className="row between center mt12">
              <Checkbox on={false} onClick={()=>{}} label="Excepción por usuario específico (opt-in/opt-out)"/>
              <span className="chip chip-count"><Icon name="users" size={14}/> {reach.toLocaleString('es-CO')} recibirán</span>
            </div>
          </Section>

          {/* C — Tipo */}
          <Section n="C" title="Tipo de notificación">
            <div className="col gap8">
              {NOTIF_CATS.map(cat=>{
                const sel=(cats[cat.id]||[]).length;
                return (
                  <div key={cat.id} style={{border:'1px solid var(--line)',borderRadius:11,overflow:'hidden'}}>
                    <button className="row center gap10" style={{width:'100%',padding:'11px 13px',background:sel?'var(--blue-soft)':'#fff'}}
                      onClick={()=>setOpenCat(openCat===cat.id?'':cat.id)}>
                      <Icon name={cat.icon} size={18} color={C.blue}/>
                      <span style={{fontWeight:700,fontSize:13,color:C.navy,flex:1,textAlign:'left'}}>{cat.label}</span>
                      {sel>0&&<span className="chip chip-count" style={{height:22}}>{sel}</span>}
                      <Icon name={openCat===cat.id?'chevdown':'chevright'} size={16} color={C.gray}/>
                    </button>
                    {openCat===cat.id&&<div className="col gap6" style={{padding:'10px 13px',borderTop:'1px solid var(--line)'}}>
                      {cat.items.map(it=><Checkbox key={it} on={(cats[cat.id]||[]).includes(it)} onClick={()=>toggleCatItem(cat.id,it)} label={it}/>)}
                    </div>}
                  </div>
                );
              })}
            </div>
            <label className="label mt16" style={{display:'block',marginBottom:8}}>Severidad</label>
            <div className="row between center wrap gap10">
              <div className="seg">
                {Object.keys(SEV).map(s=><button key={s} className={sev===s?'on':''} onClick={()=>setSev(s)}
                  style={sev===s?{color:SEV[s].c}:{}}>{s}</button>)}
              </div>
              {sev==='Crítica'&&<span className="alert danger" style={{padding:'7px 11px',fontSize:12}}>
                <Icon name="alert" size={15}/> Ignora "No molestar"</span>}
            </div>
          </Section>

          {/* D — Contenido */}
          <Section n="D" title="Contenido de la notificación">
            <div className="field">
              <div className="row between"><label className="label">Título</label><span className="counter">{title.length}/65</span></div>
              <input ref={titleRef} className="input" maxLength={65} value={title} onChange={e=>setTitle(e.target.value)}/>
            </div>
            <div className="field mt12">
              <div className="row between"><label className="label">Descripción</label><span className="counter">{desc.length}/180</span></div>
              <textarea className="textarea" rows={3} maxLength={180} value={desc} onChange={e=>setDesc(e.target.value)}/>
            </div>
            <div className="mt12"><span className="label" style={{display:'block',marginBottom:7}}>Variables dinámicas</span>
              <div className="row wrap gap8">{VARS.map(v=><button key={v} className="chip click" onClick={()=>insertVar(v)}>{v}</button>)}</div></div>
            <div className="mt16"><span className="label" style={{display:'block',marginBottom:7}}>Acción (CTA)</span>
              <div className="row wrap gap8">{['Ver detalle','Reconocer (ACK)','Escalar'].map(a=>
                <button key={a} className={'perm '+(cta.includes(a)?'on':'')} style={{height:32}} onClick={()=>toggleArr(cta,setCta,a)}>{a}</button>)}</div></div>
            <div className="alert warn mt16"><Icon name="alert" size={17}/>
              <span>No incluyas datos sensibles (PAN, cuentas, claves) en el texto push. Usa "Ver detalle" con acceso autenticado.</span></div>
            <div className="mt16"><span className="label" style={{display:'block',marginBottom:7}}>Canal de envío</span>
              <div className="row wrap gap8">{CHANNELS.map(ch=>
                <button key={ch} className={'perm '+(channels.includes(ch)?'on':'')} style={{height:32}} onClick={()=>toggleArr(channels,setChannels,ch)}>{ch}</button>)}</div></div>
          </Section>

          {/* E — Frecuencia */}
          <Section n="E" title="Frecuencia y horario">
            <div className="col gap8">
              {[['inmediata','Inmediata (real-time)','recomendado para Crítica / Alta'],
                ['diario','Resumen diario','consolida eventos Medio / Bajo'],
                ['semanal','Resumen semanal','métricas e informativos'],
                ['programada','Programada','selector de fecha y hora']].map(([v,l,s])=>
                <div key={v} className="row center gap10" style={{padding:'9px 12px',border:'1px solid var(--line)',borderRadius:10,
                  background:mode===v?'var(--blue-soft)':'#fff'}}>
                  <Radio on={mode===v} onClick={()=>setMode(v)} label={l} sub={s}/>
                </div>)}
            </div>
            <div className="row gap16 mt16 wrap">
              <div className="field" style={{flex:1,minWidth:130}}><label className="label">Desde</label><input className="input" type="time" defaultValue="08:00"/></div>
              <div className="field" style={{flex:1,minWidth:130}}><label className="label">Hasta</label><input className="input" type="time" defaultValue="18:00"/></div>
              <div className="field" style={{flex:1.4,minWidth:160}}><label className="label">Zona horaria</label>
                <select className="select"><option>America/Bogotá (TZ banco)</option><option>TZ del usuario</option></select></div>
            </div>
            <div className="mt12"><span className="label" style={{display:'block',marginBottom:7}}>Días activos</span>
              <div className="row gap6">{['L','M','X','J','V','S','D'].map(d=>
                <button key={d} className={'perm '+(days.includes(d)?'on':'')} style={{width:38,height:38,justifyContent:'center',borderRadius:10}}
                  onClick={()=>toggleArr(days,setDays,d)}>{d}</button>)}</div></div>
            <button className="row center gap6 mt16" style={{fontWeight:700,color:C.blue,fontSize:13}} onClick={()=>setAdvanced(a=>!a)}>
              <Icon name={advanced?'chevdown':'chevright'} size={15}/> Reglas avanzadas</button>
            {advanced&&<div className="col gap10 mt12" style={{padding:'14px',background:'var(--bg)',borderRadius:11}}>
              <div className="row center gap10"><Switch on={overrideCrit} blue onClick={()=>setOverrideCrit(o=>!o)}/>
                <span style={{fontSize:13,fontWeight:600}}>Override severidad Crítica (ignora ventana horaria)</span></div>
              <div className="row center gap10"><Switch on={dnd} blue onClick={()=>setDnd(d=>!d)}/>
                <span style={{fontSize:13,fontWeight:600}}>Modo "No molestar" para Media / Baja</span></div>
              <div className="row center gap10 wrap"><span style={{fontSize:13,fontWeight:600,flex:1}}>Agrupar eventos iguales en</span>
                <input className="input" style={{width:70,height:38}} defaultValue="5"/><span className="tiny muted">min</span></div>
              <div className="row center gap10 wrap"><span style={{fontSize:13,fontWeight:600,flex:1}}>Rate limit por tipo / hora</span>
                <input className="input" style={{width:70,height:38}} defaultValue="20"/><span className="tiny muted">máx</span></div>
            </div>}
          </Section>
        </div>

        {/* ===== COLUMNA PREVIEW (40%) ===== */}
        <div className="col gap20" style={{position:'sticky',top:90}}>
          <div className="card card-pad col center gap16">
            <h3 className="section-title" style={{alignSelf:'flex-start'}}>Previsualización</h3>
          <div className="web-prev">
            <div className="web-top">
              <span className="web-dot" style={{background:'#ff5f57'}}/>
              <span className="web-dot" style={{background:'#febc2e'}}/>
              <span className="web-dot" style={{background:'#28c840'}}/>
              <span className="web-url"><Icon name="lock" size={12} color={C.gray}/> app.everest.co/notificaciones</span>
            </div>
            <div className="web-canvas">
              {/* barra de app simulada */}
              <div className="web-appbar">
                <div className="brand-mark" style={{width:26,height:26,borderRadius:8,boxShadow:'none'}}><Icon name="scale" size={14} color="#fff"/></div>
                <span style={{fontWeight:900,fontSize:13,color:C.navy}}>Everest</span>
                <div className="web-skeleton" style={{maxWidth:120,marginLeft:6}}><span style={{width:'90%'}}/><span style={{width:'60%'}}/></div>
                <div className="row center gap8 mla">
                  <span style={{position:'relative'}}><Icon name="bell" size={18} color={C.navy}/>
                    <span style={{position:'absolute',top:-3,right:-3,width:8,height:8,borderRadius:'50%',background:C.red,border:'2px solid #fff'}}/></span>
                  <span className="su-avatar" style={{width:26,height:26,fontSize:10,borderRadius:8}}>CM</span>
                </div>
              </div>

              {/* TOAST web (esquina sup. derecha del navegador) */}
              <div>
                <div className="web-label" style={{marginBottom:7}}>Toast en navegador</div>
                <div className="web-toast" style={{borderLeft:'4px solid '+SEV[sev].c}}>
                  <Icon name="x" size={15} className="wt-close"/>
                  <div className="row center gap8 mb8">
                    <div className="brand-mark" style={{width:22,height:22,borderRadius:6,boxShadow:'none'}}><Icon name="scale" size={12} color="#fff"/></div>
                    <span style={{fontWeight:800,fontSize:12,color:C.navy}}>Everest</span>
                    <span className={'badge '+SEV[sev].cls} style={{height:18,fontSize:9.5}}>{sev}</span>
                    <span className="tiny muted" style={{marginLeft:'auto',marginRight:18}}>ahora</span>
                  </div>
                  <div style={{fontWeight:700,fontSize:13.5,color:C.navy,lineHeight:1.3}}>{render(title)||'Título de la notificación'}</div>
                  <div style={{fontSize:12,color:C.gray,marginTop:5,lineHeight:1.45}}>{render(desc)||'Descripción del mensaje…'}</div>
                  <div className="row center gap8 mt10">
                    <Icon name="building" size={13} color={C.gray2}/><span className="tiny muted">{bankName(nBank)}</span>
                    {cta.length>0&&<div className="row gap6 mla">{cta.map(a=>
                      <span key={a} className="btn btn-sm" style={{background:a==='Ver detalle'?C.red:'var(--blue-soft)',
                        color:a==='Ver detalle'?'#fff':C.blue,height:28,padding:'0 11px',fontSize:11.5}}>{a}</span>)}</div>}
                  </div>
                </div>
              </div>

              {/* Centro de notificaciones (in-app web) */}
              <div>
                <div className="web-label" style={{marginBottom:7}}>Centro de notificaciones (in-app)</div>
                <div className="web-inapp">
                  <div className="web-inapp-head">
                    <Icon name="bell" size={15} color={C.navy}/>
                    <span style={{fontWeight:800,fontSize:12.5,color:C.navy}}>Notificaciones</span>
                    <span className="chip chip-count" style={{height:20,marginLeft:'auto',fontSize:10.5}}>1 nueva</span>
                  </div>
                  <div className="web-inapp-item" style={{background:'var(--blue-soft)'}}>
                    <span style={{width:9,height:9,borderRadius:'50%',background:SEV[sev].c,marginTop:5,flexShrink:0}}/>
                    <div style={{minWidth:0}}>
                      <div className="row center gap6">
                        <span style={{fontWeight:700,fontSize:12.5,color:C.navy}}>{render(title)}</span>
                        <span className={'badge '+SEV[sev].cls} style={{height:16,fontSize:9}}>{sev}</span>
                      </div>
                      <div style={{fontSize:11.5,color:C.gray,marginTop:4,lineHeight:1.45}}>{render(desc)}</div>
                      <div className="tiny muted mt8">{bankName(nBank)} · hace un momento</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
            <div className="alert info" style={{width:'100%'}}><Icon name="users" size={17}/>
              <span>Notificará a <b>~{reach.toLocaleString('es-CO')}</b> usuarios en <b>{banksCount}</b> banco(s) vía {channels.join(', ')||'—'}.</span></div>
            <div className="row gap10" style={{width:'100%'}}>
              <button className="btn btn-primary" style={{flex:1}} onClick={()=>setConfirm(true)}><Icon name="send" size={17}/>Enviar</button>
              <button className="btn btn-ghost" onClick={()=>logAuditEvent('Guardó plantilla de notificación',title)}>Plantilla</button>
            </div>
          </div>
        </div>
      </div>

      {/* Historial */}
      <div className="card mt24">
        <div className="card-head"><h3>Historial de notificaciones enviadas</h3></div>
        <div className="tbl-wrap"><table className="tbl">
          <thead><tr><th>Fecha</th><th>Banco</th><th>Rol</th><th>Tipo</th><th>Severidad</th><th>Enviadas</th><th>Leídas</th><th>ACK</th><th>Enviado por</th></tr></thead>
          <tbody>{NOTIF_HISTORY.map((h,i)=>(
            <tr key={i}><td style={{fontWeight:600}}>{h.date}</td><td>{bankName(h.bank)}</td><td>{h.role}</td><td>{h.type}</td>
              <td><Badge cls={SEV[h.sev].cls}>{h.sev}</Badge></td><td className="num">{h.sent}</td>
              <td className="num">{h.read}</td><td className="num">{h.ack}</td><td>{h.by}</td></tr>
          ))}</tbody>
        </table></div>
      </div>

      <ConfirmModal open={confirm} onClose={()=>setConfirm(false)}
        title="Enviar notificación masiva" requireNote danger={sev==='Crítica'}
        desc={`Se enviará a ~${reach.toLocaleString('es-CO')} usuarios en ${banksCount} banco(s) con severidad ${sev} vía ${channels.join(', ')}. Esta acción es irreversible.`}
        confirmLabel="Enviar ahora"
        onConfirm={note=>logAuditEvent('Envió notificación masiva',`${title} · ${sev} · ~${reach} usuarios`+(note?' · '+note:''))}/>
    </div>
  );
}

function Section({n,title,children}){
  return (
    <div className="card card-pad">
      <div className="row center gap10 mb16">
        <span style={{width:26,height:26,borderRadius:8,background:'var(--navy)',color:'#fff',display:'grid',placeItems:'center',fontWeight:800,fontSize:13}}>{n}</span>
        <h3 className="section-title" style={{fontSize:16}}>{title}</h3>
      </div>
      {children}
    </div>
  );
}
window.Notifications = Notifications;
