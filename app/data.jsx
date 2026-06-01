/* ===================== COLORES JS ===================== */
const C = {
  navy:'#0A1F5C', blue:'#1A3BAA', red:'#D91F2D', bg:'#F0F2F7', white:'#fff',
  green:'#00B050', amber:'#F59E0B', orange:'#EA580C', gray:'#6B7280', gray2:'#9CA3AF', line:'#E5E7EB', ink:'#374151',
};

/* ===================== BANCOS ===================== */
const BANKS = [
  {id:'all',  name:'Todos los bancos', short:'Todos',        color:'#0A1F5C'},
  {id:'pop',  name:'Banco Popular',    short:'Popular',      color:'#16A34A'},
  {id:'bog',  name:'Banco de Bogotá',  short:'Bogotá',       color:'#1A3BAA'},
  {id:'occ',  name:'Banco de Occidente',short:'Occidente',   color:'#38A8E0'},
  {id:'avv',  name:'Banco AV Villas',  short:'AV Villas',    color:'#D91F2D'},
];
const bankName = id => (BANKS.find(b=>b.id===id)||{}).name || id;
const bankShort = id => (BANKS.find(b=>b.id===id)||{}).short || id;
const bankColor = id => (BANKS.find(b=>b.id===id)||{}).color || C.navy;

/* ===================== USUARIO AUTENTICADO ===================== */
const CURRENT_USER = {
  name:'Carolina Mejía', role:'Administrador Banco', roleId:'admin_banco',
  initials:'CM', scope:'multi', email:'c.mejia@everest.co',
};

/* ===================== FORMATO COP ===================== */
const cop = n => '$'+Math.round(n).toLocaleString('es-CO');
const copK = n => n>=1e6 ? '$'+(n/1e6).toFixed(n%1e6===0?0:1)+'M' : cop(n);

/* ===================== ROLES (Módulo 1) ===================== */
const ROLES = [
  {id:'admin_banco', name:'Administrador Banco', scope:'Banco', users:8,  active:true,  desc:'Control total del banco: configuración, aprobaciones y gestión de usuarios.'},
  {id:'op_banco',    name:'Operador Banco',      scope:'Banco', users:24, active:true,  desc:'Operación diaria, inicio de trámites y transacciones.'},
  {id:'aml',         name:'Cumplimiento / AML',  scope:'Banco', users:5,  active:true,  desc:'Evaluación de riesgo, listas restrictivas y firma de cumplimiento.'},
  {id:'auditor',     name:'Auditor',             scope:'Banco', users:3,  active:true,  desc:'Solo lectura y exportación. No modifica configuración.'},
  {id:'admin_corr',  name:'Admin Corresponsal',  scope:'Red',   users:42, active:true,  desc:'Administra su red de corresponsales y usuarios asociados.'},
  {id:'sup_corr',    name:'Supervisor Corresponsal',scope:'Red',users:61, active:true,  desc:'Supervisa puntos y autoriza reversos en su red.'},
  {id:'cajero',      name:'Cajero / Operador Corresponsal',scope:'Punto',users:340,active:false,desc:'Operación en punto de atención.'},
];

/* permisos: módulo -> acciones */
const PERM_MODULES = [
  {id:'corr', name:'Gestión Corresponsal', actions:['Ver','Crear','Editar','Aprobar','Bloquear','Baja']},
  {id:'tx',   name:'Transacciones',        actions:['Ver','Iniciar','Aprobar','Reversar','Exportar']},
  {id:'doc',  name:'Documentación',        actions:['Ver','Cargar','Validar','Rechazar']},
  {id:'usr',  name:'Usuarios',             actions:['Ver','Crear','Editar','Asignar Rol','Desactivar']},
  {id:'lim',  name:'Límites',              actions:['Ver','Configurar','Aprobar cambio']},
  {id:'notif',name:'Notificaciones',       actions:['Ver','Configurar','Enviar masivo']},
  {id:'rep',  name:'Reportes/Auditoría',   actions:['Ver','Exportar','Configurar']},
  {id:'sys',  name:'Parámetros sistema',   actions:['Ver','Editar']},
];
/* matriz inicial de permisos roleId -> {moduleId: [acciones activas]} */
const PERM_MATRIX = {
  admin_banco:{corr:['Ver','Crear','Editar','Aprobar','Bloquear','Baja'],tx:['Ver','Aprobar','Reversar','Exportar'],doc:['Ver','Cargar','Validar','Rechazar'],usr:['Ver','Crear','Editar','Asignar Rol','Desactivar'],lim:['Ver','Configurar','Aprobar cambio'],notif:['Ver','Configurar','Enviar masivo'],rep:['Ver','Exportar','Configurar'],sys:['Ver','Editar']},
  op_banco:{corr:['Ver','Crear','Editar'],tx:['Ver','Iniciar','Exportar'],doc:['Ver','Cargar'],usr:['Ver'],lim:['Ver'],notif:['Ver'],rep:['Ver'],sys:['Ver']},
  aml:{corr:['Ver','Aprobar','Bloquear'],tx:['Ver'],doc:['Ver','Validar','Rechazar'],usr:['Ver'],lim:['Ver','Aprobar cambio'],notif:['Ver','Configurar'],rep:['Ver','Exportar'],sys:['Ver']},
  auditor:{corr:['Ver'],tx:['Ver','Exportar'],doc:['Ver'],usr:['Ver'],lim:['Ver'],notif:['Ver'],rep:['Ver','Exportar'],sys:['Ver']},
  admin_corr:{corr:['Ver','Editar'],tx:['Ver','Iniciar','Exportar'],doc:['Ver','Cargar'],usr:['Ver','Crear','Editar'],lim:['Ver'],notif:['Ver'],rep:['Ver','Exportar'],sys:[]},
  sup_corr:{corr:['Ver'],tx:['Ver','Iniciar','Reversar'],doc:['Ver','Cargar'],usr:['Ver'],lim:['Ver'],notif:['Ver'],rep:['Ver'],sys:[]},
  cajero:{corr:['Ver'],tx:['Ver','Iniciar'],doc:['Ver'],usr:[],lim:['Ver'],notif:['Ver'],rep:[],sys:[]},
};

/* historial de cambios (drawer auditoría) */
const ROLE_HISTORY = [
  {who:'Carolina Mejía',role:'Admin Banco',date:'29 May 2026 · 09:14',action:'Agregó permiso "Reversar" en Transacciones a Supervisor Corresponsal',color:'blue'},
  {who:'Andrés Salcedo',role:'Cumplimiento',date:'28 May 2026 · 16:42',action:'Quitó permiso "Editar" en Parámetros sistema a Operador Banco',color:'amber'},
  {who:'Sistema',role:'Auto',date:'27 May 2026 · 00:00',action:'Bloqueo automático: conflicto SoD detectado en rol Operador Banco',color:'red'},
  {who:'Carolina Mejía',role:'Admin Banco',date:'25 May 2026 · 11:08',action:'Clonó rol "Admin Corresponsal" → "Admin Corresponsal Regional"',color:'green'},
];

/* ===================== CORRESPONSALES (Módulo 3) ===================== */
const CORR_STATUS = {
  borrador:{label:'Borrador',cls:'b-gray'},
  revision:{label:'En revisión',cls:'b-amber'},
  observado:{label:'Observado',cls:'b-orange'},
  aprobado:{label:'Aprobado',cls:'b-blue'},
  activo:{label:'Activo',cls:'b-green'},
  suspendido:{label:'Suspendido',cls:'b-red'},
  baja:{label:'Baja',cls:'b-darkgray'},
};
const RISK = {bajo:{label:'Bajo',cls:'b-green'},medio:{label:'Medio',cls:'b-amber'},alto:{label:'Alto',cls:'b-red'}};
const CORRESPONSALES = [
  {id:'CB-10428',name:'Supermercado La 14 — Cali',bank:'occ',type:'Jurídica',risk:'medio',status:'activo',last:'Hace 4 min',docs:[7,7],puntos:3},
  {id:'CB-10431',name:'Droguería Cruz Verde Norte',bank:'bog',type:'Jurídica',risk:'bajo',status:'activo',last:'Hace 22 min',docs:[7,7],puntos:1},
  {id:'CB-10455',name:'Papelería El Estudiante',bank:'pop',type:'Natural',risk:'bajo',status:'revision',last:'Hace 1 h',docs:[5,7],puntos:1},
  {id:'CB-10460',name:'Mercado Express Chapinero',bank:'avv',type:'Jurídica',risk:'alto',status:'observado',last:'Hace 2 h',docs:[6,7],puntos:2},
  {id:'CB-10477',name:'Tienda D1 Suba Centro',bank:'bog',type:'Jurídica',risk:'medio',status:'aprobado',last:'Ayer',docs:[7,7],puntos:1},
  {id:'CB-10481',name:'Comercializadora Andina S.A.',bank:'occ',type:'Jurídica',risk:'alto',status:'revision',last:'Ayer',docs:[4,7],puntos:5},
  {id:'CB-10490',name:'Minimercado El Vecino',bank:'pop',type:'Natural',risk:'bajo',status:'borrador',last:'Hace 3 días',docs:[2,7],puntos:1},
  {id:'CB-10366',name:'Almacenes Éxito — Envigado',bank:'avv',type:'Jurídica',risk:'medio',status:'suspendido',last:'Hace 5 días',docs:[7,7],puntos:4},
  {id:'CB-10301',name:'Variedades San Andresito',bank:'occ',type:'Natural',risk:'alto',status:'baja',last:'Hace 12 días',docs:[7,7],puntos:1},
];

/* ===================== TRANSACCIONES (Módulo 4) ===================== */
const TX_TYPES = ['Depósito','Retiro','Pago de servicios','Transferencia','Recarga','Consulta de saldo'];
const TX_CHANNELS = ['POS','App','Terminal'];
const TX_STATUS = {
  aprobada:{label:'Aprobada',cls:'b-green'},
  rechazada:{label:'Rechazada',cls:'b-red'},
  pendiente:{label:'Pendiente',cls:'b-amber'},
  reversada:{label:'Reversada',cls:'b-darkgray'},
};
function genTx(){
  const names = CORRESPONSALES.filter(c=>c.status==='activo'||c.status==='aprobado');
  const out=[]; let base=Date.now();
  const seeds=[
    ['Depósito','pop','aprobada',840000,'POS'],['Retiro','bog','aprobada',150000,'App'],
    ['Pago de servicios','occ','pendiente',92300,'Terminal'],['Transferencia','avv','aprobada',1250000,'POS'],
    ['Recarga','pop','rechazada',20000,'App'],['Depósito','bog','aprobada',3400000,'POS'],
    ['Retiro','occ','reversada',500000,'Terminal'],['Pago de servicios','avv','aprobada',187400,'POS'],
    ['Transferencia','pop','aprobada',640000,'App'],['Depósito','occ','aprobada',2100000,'POS'],
    ['Consulta de saldo','bog','aprobada',0,'App'],['Retiro','avv','pendiente',300000,'POS'],
    ['Depósito','pop','aprobada',75000,'Terminal'],['Pago de servicios','bog','rechazada',45600,'POS'],
  ];
  seeds.forEach((s,i)=>{
    const c=names[i%names.length];
    base -= (90000 + i*53000);
    const d=new Date(base);
    out.push({id:'TX-'+(982340-i),bank:s[1],corr:c.id,type:s[0],amount:s[3],status:s[2],channel:s[4],
      time:d.toLocaleString('es-CO',{hour:'2-digit',minute:'2-digit',day:'2-digit',month:'short'})});
  });
  return out;
}
const TRANSACTIONS = genTx();

/* catálogo tipo×banco */
const TX_CATALOG = [
  {type:'Depósito',         banks:{pop:true, bog:true, occ:true, avv:true}},
  {type:'Retiro',           banks:{pop:true, bog:true, occ:false,avv:true}},
  {type:'Pago de servicios',banks:{pop:true, bog:false,occ:true, avv:true}},
  {type:'Transferencia',    banks:{pop:true, bog:true, occ:true, avv:false}},
  {type:'Recarga',          banks:{pop:true, bog:false,occ:false,avv:true}},
  {type:'Reverso',          banks:{pop:true, bog:true, occ:true, avv:true}, note:'Solo Supervisor / Admin'},
  {type:'Consulta de saldo',banks:{pop:true, bog:true, occ:true, avv:true}},
];

/* límites */
const LIMITS = [
  {type:'Depósito',         min:10000, max:5000000, daily:30000000, monthly:600000000, ops:120, alert:80, status:'activo'},
  {type:'Retiro',           min:20000, max:2000000, daily:10000000, monthly:200000000, ops:80,  alert:75, status:'activo'},
  {type:'Pago de servicios',min:5000,  max:1500000, daily:8000000,  monthly:160000000, ops:200, alert:90, status:'activo'},
  {type:'Transferencia',    min:10000, max:10000000,daily:40000000, monthly:800000000, ops:60,  alert:70, status:'pendiente'},
  {type:'Recarga',          min:1000,  max:200000,  daily:2000000,  monthly:40000000,  ops:300, alert:85, status:'activo'},
];

/* disputas conciliación */
const DISPUTES = [
  {id:'DS-5521',bank:'occ',corr:'CB-10428',amount:500000,status:'En análisis',days:2,owner:'J. Restrepo'},
  {id:'DS-5519',bank:'pop',corr:'CB-10490',amount:75000, status:'Pendiente evidencia',days:4,owner:'M. Lozano'},
  {id:'DS-5510',bank:'bog',corr:'CB-10477',amount:1250000,status:'Escalada',days:7,owner:'Sin asignar'},
];

/* notificaciones enviadas (Módulo 2) */
const NOTIF_HISTORY = [
  {date:'29 May · 08:10',bank:'all',role:'Operador',type:'Operación',sev:'Alta',sent:312,read:289,ack:201,by:'C. Mejía'},
  {date:'28 May · 17:45',bank:'occ',role:'Admin',type:'Seguridad',sev:'Crítica',sent:14,read:14,ack:14,by:'A. Salcedo'},
  {date:'28 May · 09:00',bank:'bog',role:'Auditor',type:'Cumplimiento',sev:'Media',sent:6,read:5,ack:3,by:'Sistema'},
  {date:'27 May · 14:20',bank:'pop',role:'Cajero',type:'Sistema',sev:'Baja',sent:340,read:120,ack:0,by:'C. Mejía'},
];

window.Everest = {
  C, BANKS, bankName, bankShort, bankColor, CURRENT_USER, cop, copK,
  ROLES, PERM_MODULES, PERM_MATRIX, ROLE_HISTORY,
  CORR_STATUS, RISK, CORRESPONSALES,
  TX_TYPES, TX_CHANNELS, TX_STATUS, TRANSACTIONS, TX_CATALOG, LIMITS, DISPUTES,
  NOTIF_HISTORY,
};
