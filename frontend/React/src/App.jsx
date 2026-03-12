import { useState, useEffect, useRef, useCallback } from "react";
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, RadialBarChart, RadialBar
} from "recharts";

/* ─────────────────────────────────────────────────────────────────
   DESIGN TOKENS
───────────────────────────────────────────────────────────────── */
const T = {
  navy:    "#0b1929",
  navyM:   "#0f2237",
  navyL:   "#162d44",
  slate:   "#1e3a52",
  slateL:  "#2a4a64",
  teal:    "#0d9488",
  tealL:   "#14b8a6",
  tealXL:  "#5eead4",
  amber:   "#d97706",
  amberL:  "#fbbf24",
  rose:    "#e11d48",
  roseL:   "#fb7185",
  violet:  "#7c3aed",
  snow:    "#f0f9ff",
  fog:     "#cbd5e1",
  mist:    "#94a3b8",
  ghost:   "#64748b",
  white:   "#ffffff",
  glass:   "rgba(14,42,72,0.7)",
  glassBorder: "rgba(13,148,136,0.25)",
};

const FONT_HEADING = "'Playfair Display', Georgia, serif";
const FONT_BODY    = "'DM Sans', 'Segoe UI', sans-serif";

/* ─────────────────────────────────────────────────────────────────
   STATIC DATA
───────────────────────────────────────────────────────────────── */
const INCIDENT_TYPES = [
  "Sexual Harassment","Gender Discrimination","Verbal Abuse / Bullying",
  "Physical Unsafe Condition","Pay Disparity","Retaliation",
  "Hostile Work Environment","Wrongful Termination Threat","Other",
];
const DEPARTMENTS = [
  "Engineering","Human Resources","Finance","Operations",
  "Marketing","Legal","Sales","Executive","IT","Customer Support",
];
const LOCATIONS = [
  "HQ – Floor 1","HQ – Floor 2","HQ – Floor 3",
  "Branch Office A","Branch Office B","Warehouse / Factory",
  "Remote / Virtual","Client Site","Other",
];
const PRIORITIES  = ["Low","Medium","High","Critical"];
const STATUSES    = ["Pending Review","Under Investigation","Action Taken","Resolved","Closed"];
const PIE_PALETTE = [T.teal,"#0891b2","#7c3aed","#d97706","#e11d48","#059669","#dc2626","#6366f1"];

const SEED_REPORTS = [
  { reportId:"RPT-001", trackingCode:"SS-A1B2C3", incidentType:"Sexual Harassment",    department:"Engineering",     location:"HQ – Floor 2",        date:"2025-01-15", time:"14:30", priority:"High",     description:"Repeated unwanted comments about appearance from a senior colleague during team meetings over the past three weeks.",                additionalContext:"Happened in front of three other colleagues who can confirm.",      evidenceFiles:[], status:"Under Investigation", notes:"Assigned to investigator J.Patel. Initial interviews scheduled.", createdAt:"2025-01-15T14:45:00Z", updatedAt:"2025-01-22T09:00:00Z" },
  { reportId:"RPT-002", trackingCode:"SS-D4E5F6", incidentType:"Pay Disparity",         department:"Finance",         location:"HQ – Floor 1",        date:"2025-01-18", time:"10:00", priority:"Medium",   description:"Discovered through internal documents that male peers with identical roles and less experience earn 22% more.",                         additionalContext:"",                                                                  evidenceFiles:[{name:"salary_comparison.pdf",size:"245 KB"}], status:"Pending Review",      notes:"", createdAt:"2025-01-18T10:10:00Z", updatedAt:"2025-01-18T10:10:00Z" },
  { reportId:"RPT-003", trackingCode:"SS-G7H8I9", incidentType:"Verbal Abuse / Bullying",department:"Operations",    location:"Warehouse / Factory", date:"2025-01-20", time:"08:15", priority:"High",     description:"Manager uses demeaning language and shouts at female staff in front of the entire warehouse floor during morning briefings.",            additionalContext:"This has been ongoing for approximately 6 months.",                 evidenceFiles:[], status:"Action Taken",      notes:"Manager placed on formal warning. Sensitivity training scheduled.", createdAt:"2025-01-20T08:30:00Z", updatedAt:"2025-02-01T11:00:00Z" },
  { reportId:"RPT-004", trackingCode:"SS-J1K2L3", incidentType:"Gender Discrimination", department:"Marketing",       location:"HQ – Floor 3",        date:"2025-01-22", time:"16:00", priority:"Medium",   description:"Consistently passed over for leadership project assignments in favour of less-qualified male colleagues.",                              additionalContext:"Performance reviews consistently rated Exceeds Expectations.",       evidenceFiles:[{name:"perf_reviews.docx",size:"180 KB"}], status:"Resolved",          notes:"Policy review completed. Blind assignment process now in place.", createdAt:"2025-01-22T16:15:00Z", updatedAt:"2025-02-05T14:00:00Z" },
  { reportId:"RPT-005", trackingCode:"SS-M4N5O6", incidentType:"Hostile Work Environment",department:"Sales",         location:"Branch Office A",     date:"2025-01-25", time:"12:45", priority:"Medium",   description:"Group systematically excludes female team members from informal networking gatherings and client entertainment events.",                 additionalContext:"",                                                                  evidenceFiles:[], status:"Pending Review",      notes:"", createdAt:"2025-01-25T13:00:00Z", updatedAt:"2025-01-25T13:00:00Z" },
  { reportId:"RPT-006", trackingCode:"SS-P7Q8R9", incidentType:"Physical Unsafe Condition",department:"Operations",  location:"Warehouse / Factory", date:"2025-01-28", time:"07:30", priority:"High",     description:"Women's restroom facilities severely inadequate – only one stall for 40 female workers, no sanitary disposal, poor lighting.",          additionalContext:"Multiple informal complaints submitted previously with no response.",  evidenceFiles:[{name:"facility_photos.zip",size:"4.2 MB"}], status:"Resolved",   notes:"Facilities upgraded. Two additional stalls installed.", createdAt:"2025-01-28T07:45:00Z", updatedAt:"2025-02-10T15:00:00Z" },
  { reportId:"RPT-007", trackingCode:"SS-S1T2U3", incidentType:"Retaliation",            department:"HR",              location:"HQ – Floor 1",        date:"2025-02-01", time:"09:00", priority:"Critical", description:"After reporting a prior incident, my work schedule was altered, client accounts removed, and I was isolated from team communications.", additionalContext:"Timeline strongly correlates with the original complaint filing date.", evidenceFiles:[{name:"email_thread.pdf",size:"320 KB"}], status:"Under Investigation",notes:"Escalated to Legal. HR director recused due to conflict of interest.", createdAt:"2025-02-01T09:15:00Z", updatedAt:"2025-02-08T10:00:00Z" },
  { reportId:"RPT-008", trackingCode:"SS-V4W5X6", incidentType:"Sexual Harassment",      department:"Executive",       location:"HQ – Floor 3",        date:"2025-02-05", time:"19:30", priority:"Critical", description:"During a company dinner, a C-level executive made explicit remarks and unwanted physical contact witnessed by five other employees.",   additionalContext:"Witnesses include two external partners.",                           evidenceFiles:[{name:"witness_statements.pdf",size:"510 KB"}], status:"Under Investigation",notes:"External law firm engaged. Board notified.", createdAt:"2025-02-05T20:00:00Z", updatedAt:"2025-02-09T08:00:00Z" },
  { reportId:"RPT-009", trackingCode:"SS-Y7Z8A1", incidentType:"Gender Discrimination",  department:"Engineering",     location:"Remote / Virtual",    date:"2025-02-10", time:"11:00", priority:"Medium",   description:"Consistently interrupted and talked over during video calls while male colleagues are allowed to speak without interruption.",           additionalContext:"Happens in weekly sprints and all-hands meetings.",                  evidenceFiles:[], status:"Pending Review",      notes:"", createdAt:"2025-02-10T11:30:00Z", updatedAt:"2025-02-10T11:30:00Z" },
  { reportId:"RPT-010", trackingCode:"SS-B2C3D4", incidentType:"Pay Disparity",           department:"IT",              location:"Remote / Virtual",    date:"2025-02-12", time:"14:00", priority:"Low",      description:"Discovered that a recently hired male colleague with fewer certifications is offered a 30% higher salary for the same role.",            additionalContext:"Information shared by HR contact confidentially.",                   evidenceFiles:[], status:"Pending Review",      notes:"", createdAt:"2025-02-12T14:15:00Z", updatedAt:"2025-02-12T14:15:00Z" },
];

const TREND_DATA = [
  { month:"Jul", reports:2 },{ month:"Aug", reports:4 },
  { month:"Sep", reports:3 },{ month:"Oct", reports:6 },
  { month:"Nov", reports:5 },{ month:"Dec", reports:7 },
  { month:"Jan", reports:8 },{ month:"Feb", reports:5 },
];

/* ─────────────────────────────────────────────────────────────────
   HELPERS
───────────────────────────────────────────────────────────────── */
const genId   = () => "RPT-" + String(Date.now()).slice(-3).padStart(3,"0");
const genCode = () => "SS-" + Math.random().toString(36).slice(2,8).toUpperCase();
const fmtDate = (iso) => new Date(iso).toLocaleDateString("en-GB",{day:"2-digit",month:"short",year:"numeric"});
const priorityColor = (p) => ({Critical:T.rose,High:T.amber,Medium:T.teal,Low:T.ghost}[p]||T.ghost);
const statusColor   = (s) => ({
  "Pending Review":{bg:"rgba(217,119,6,0.15)",color:T.amberL},
  "Under Investigation":{bg:"rgba(99,102,241,0.15)",color:"#818cf8"},
  "Action Taken":{bg:"rgba(225,29,72,0.15)",color:T.roseL},
  Resolved:{bg:"rgba(13,148,136,0.15)",color:T.tealXL},
  Closed:{bg:"rgba(100,116,139,0.15)",color:T.ghost},
}[s]||{bg:"rgba(100,116,139,0.15)",color:T.ghost});

/* ─────────────────────────────────────────────────────────────────
   GLOBAL CSS (injected once)
───────────────────────────────────────────────────────────────── */
const GLOBAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700;800&family=DM+Sans:wght@300;400;500;600&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin:0; padding:0; }
  body { background:${T.navy}; color:${T.snow}; font-family:${FONT_BODY}; }
  ::-webkit-scrollbar { width:6px; height:6px; }
  ::-webkit-scrollbar-track { background:${T.navyM}; }
  ::-webkit-scrollbar-thumb { background:${T.slateL}; border-radius:3px; }
  ::selection { background:${T.teal}; color:#fff; }

  @keyframes fadeUp {
    from { opacity:0; transform:translateY(20px); }
    to   { opacity:1; transform:translateY(0); }
  }
  @keyframes fadeIn { from{opacity:0} to{opacity:1} }
  @keyframes pulse  { 0%,100%{opacity:1} 50%{opacity:.5} }
  @keyframes shimmer {
    0%   { background-position:200% center; }
    100% { background-position:-200% center; }
  }
  @keyframes spin { to { transform:rotate(360deg); } }
  @keyframes scanline {
    0%   { transform: translateY(-100%); }
    100% { transform: translateY(100vh); }
  }

  .anim-fadeUp   { animation: fadeUp .5s ease both; }
  .anim-fadeUp-1 { animation: fadeUp .5s .1s ease both; }
  .anim-fadeUp-2 { animation: fadeUp .5s .2s ease both; }
  .anim-fadeUp-3 { animation: fadeUp .5s .3s ease both; }
  .anim-fadeUp-4 { animation: fadeUp .5s .4s ease both; }
  .anim-fadeUp-5 { animation: fadeUp .5s .5s ease both; }
  .anim-fadeIn   { animation: fadeIn .4s ease both; }

  .btn-primary {
    display:inline-flex; align-items:center; gap:8px;
    padding:14px 28px; border-radius:8px; border:none; cursor:pointer;
    font-family:${FONT_BODY}; font-size:15px; font-weight:600;
    background:linear-gradient(135deg,${T.teal},${T.tealL});
    color:#fff; transition:all .2s;
    box-shadow:0 4px 20px rgba(13,148,136,.35);
  }
  .btn-primary:hover { transform:translateY(-2px); box-shadow:0 8px 28px rgba(13,148,136,.45); }
  .btn-primary:active{ transform:translateY(0); }

  .btn-outline {
    display:inline-flex; align-items:center; gap:8px;
    padding:13px 26px; border-radius:8px; cursor:pointer;
    font-family:${FONT_BODY}; font-size:15px; font-weight:500;
    background:transparent; border:1.5px solid ${T.slateL};
    color:${T.fog}; transition:all .2s;
  }
  .btn-outline:hover { border-color:${T.teal}; color:${T.tealXL}; background:rgba(13,148,136,.06); }

  .btn-ghost {
    background:none; border:none; cursor:pointer;
    color:${T.mist}; font-family:${FONT_BODY}; font-size:14px;
    padding:8px 12px; border-radius:6px; transition:all .2s;
  }
  .btn-ghost:hover { background:rgba(255,255,255,.05); color:${T.snow}; }

  .card {
    background:${T.navyM};
    border:1px solid ${T.glassBorder};
    border-radius:14px;
    transition: box-shadow .2s;
  }
  .card:hover { box-shadow:0 8px 32px rgba(0,0,0,.3); }

  .input-field {
    width:100%;
    padding:12px 16px;
    background:${T.navy};
    border:1.5px solid ${T.slateL};
    border-radius:8px;
    color:${T.snow};
    font-family:${FONT_BODY};
    font-size:15px;
    outline:none;
    transition:border-color .2s, box-shadow .2s;
  }
  .input-field:focus { border-color:${T.teal}; box-shadow:0 0 0 3px rgba(13,148,136,.15); }
  .input-field::placeholder { color:${T.ghost}; }
  .input-field option { background:${T.navyM}; }

  .field-error { border-color:${T.rose} !important; }
  .error-msg { color:${T.roseL}; font-size:12px; margin-top:4px; }

  .label {
    display:block; font-size:12px; font-weight:600;
    letter-spacing:.06em; text-transform:uppercase;
    color:${T.mist}; margin-bottom:7px;
  }

  .nav-link {
    padding:8px 16px; border-radius:6px; border:none; cursor:pointer;
    font-family:${FONT_BODY}; font-size:14px; font-weight:500;
    background:transparent; color:${T.mist}; transition:all .2s;
  }
  .nav-link:hover   { background:rgba(255,255,255,.05); color:${T.snow}; }
  .nav-link.active  { background:rgba(13,148,136,.15); color:${T.tealXL}; }

  .tab-btn {
    padding:10px 20px; border-radius:7px; border:none; cursor:pointer;
    font-family:${FONT_BODY}; font-size:14px; font-weight:500;
    background:transparent; color:${T.mist}; transition:all .2s;
  }
  .tab-btn.active { background:${T.slate}; color:${T.snow}; }
  .tab-btn:hover:not(.active) { color:${T.fog}; }

  .badge {
    display:inline-flex; align-items:center; gap:5px;
    padding:4px 12px; border-radius:100px;
    font-size:12px; font-weight:600; white-space:nowrap;
  }

  .table-row {
    border-bottom:1px solid rgba(255,255,255,.04);
    transition:background .15s;
    cursor:pointer;
  }
  .table-row:hover { background:rgba(13,148,136,.05); }
  .table-row.selected { background:rgba(13,148,136,.1); }

  .stat-card {
    background:${T.navyM};
    border:1px solid ${T.glassBorder};
    border-radius:12px;
    padding:22px 24px;
  }

  .priority-dot {
    width:8px; height:8px; border-radius:50%; display:inline-block;
  }

  .upload-zone {
    border:2px dashed ${T.slateL};
    border-radius:10px;
    padding:28px 20px;
    text-align:center;
    cursor:pointer;
    transition:all .2s;
    background:${T.navy};
  }
  .upload-zone:hover, .upload-zone.drag { border-color:${T.teal}; background:rgba(13,148,136,.05); }

  .progress-bar-track {
    background:${T.slate}; border-radius:100px; height:8px; overflow:hidden;
  }
  .progress-bar-fill {
    height:100%; border-radius:100px;
    background:linear-gradient(90deg,${T.teal},${T.tealL});
    transition:width .6s ease;
  }

  .hero-glow {
    position:absolute; border-radius:50%; filter:blur(80px); pointer-events:none;
  }

  .section-title {
    font-family:${FONT_HEADING};
    font-size:clamp(28px,3.5vw,40px);
    font-weight:700;
    color:${T.snow};
    letter-spacing:-0.5px;
    line-height:1.2;
  }

  .recharts-tooltip-wrapper .recharts-default-tooltip {
    background:${T.navyL} !important;
    border:1px solid ${T.glassBorder} !important;
    border-radius:8px !important;
    color:${T.snow} !important;
  }

  input[type=file] { display:none; }

  textarea.input-field { resize:vertical; min-height:100px; }

  .floating-label-group { position:relative; }

  .scrollable { overflow-y:auto; max-height:100%; }
`;

/* ─────────────────────────────────────────────────────────────────
   SMALL SHARED COMPONENTS
───────────────────────────────────────────────────────────────── */
function Dot({ color, size=8 }) {
  return <span className="priority-dot" style={{ width:size, height:size, background:color }} />;
}

function Badge({ label, bg, color }) {
  return <span className="badge" style={{ background:bg, color }}>{label}</span>;
}

function StatusBadge({ status }) {
  const s = statusColor(status);
  return <Badge label={status} bg={s.bg} color={s.color} />;
}

function PriorityBadge({ priority }) {
  const c = priorityColor(priority);
  return (
    <span className="badge" style={{ background:`${c}22`, color:c }}>
      <Dot color={c} size={6} /> {priority}
    </span>
  );
}

function Spinner() {
  return <span style={{ display:"inline-block", width:16, height:16, border:`2px solid rgba(255,255,255,.2)`, borderTopColor:"#fff", borderRadius:"50%", animation:"spin .7s linear infinite" }} />;
}

function ShieldLogo({ size=32 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none">
      <path d="M20 3L5 9v10c0 8.75 6.25 16.92 15 19 8.75-2.08 15-10.25 15-19V9L20 3z"
        fill="url(#shieldGrad)" opacity=".9"/>
      <path d="M20 3L5 9v10c0 8.75 6.25 16.92 15 19 8.75-2.08 15-10.25 15-19V9L20 3z"
        stroke={T.tealL} strokeWidth="1.2" fill="none"/>
      <path d="M14 20l4 4 8-8" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
      <defs>
        <linearGradient id="shieldGrad" x1="5" y1="3" x2="35" y2="38">
          <stop stopColor={T.teal}/>
          <stop offset="1" stopColor={T.tealL}/>
        </linearGradient>
      </defs>
    </svg>
  );
}

function SectionLabel({ text }) {
  return (
    <div style={{ display:"inline-flex", alignItems:"center", gap:8,
      background:"rgba(13,148,136,.12)", border:`1px solid rgba(13,148,136,.3)`,
      borderRadius:100, padding:"5px 14px", marginBottom:20 }}>
      <span style={{ width:6, height:6, borderRadius:"50%", background:T.teal, display:"inline-block",
        animation:"pulse 2s ease infinite" }}/>
      <span style={{ color:T.tealXL, fontSize:12, fontWeight:600, letterSpacing:".1em", textTransform:"uppercase" }}>
        {text}
      </span>
    </div>
  );
}

function ConfirmModal({ title, message, onConfirm, onCancel }) {
  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,.7)", display:"flex",
      alignItems:"center", justifyContent:"center", zIndex:999, backdropFilter:"blur(4px)" }}
      className="anim-fadeIn">
      <div className="card" style={{ maxWidth:420, width:"90%", padding:32 }}>
        <h3 style={{ fontFamily:FONT_HEADING, fontSize:22, color:T.snow, marginBottom:12 }}>{title}</h3>
        <p style={{ color:T.mist, fontSize:15, lineHeight:1.6, marginBottom:24 }}>{message}</p>
        <div style={{ display:"flex", gap:12, justifyContent:"flex-end" }}>
          <button className="btn-outline" onClick={onCancel}>Cancel</button>
          <button className="btn-primary" onClick={onConfirm}>Confirm</button>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────
   NAVBAR
───────────────────────────────────────────────────────────────── */
function Navbar({ page, setPage, isAdmin, onAdminLogout }) {
  return (
    <header style={{ position:"sticky", top:0, zIndex:90,
      background:"rgba(11,25,41,.9)", backdropFilter:"blur(12px)",
      borderBottom:`1px solid rgba(255,255,255,.06)` }}>
      <div style={{ width:"100%", margin:"0 auto", padding:"0 24px",
        height:64, display:"flex", alignItems:"center", justifyContent:"space-between" }}>

        {/* Logo */}
        <button onClick={() => setPage("home")}
          style={{ display:"flex", alignItems:"center", gap:10,
            background:"none", border:"none", cursor:"pointer" }}>
          <ShieldLogo size={32}/>
          <span style={{ fontFamily:FONT_HEADING, fontSize:22, fontWeight:700,
            color:T.snow, letterSpacing:"-0.3px" }}>
            Safe<span style={{ color:T.tealL }}>Space</span>
          </span>
        </button>

        {/* Nav Links */}
        {!isAdmin && (
          <nav style={{ display:"flex", alignItems:"center", gap:4 }}>
            {[["home","Home"],["report","Report Incident"],["track","Track Report"]].map(([key,label]) => (
              <button key={key} className={`nav-link${page===key?" active":""}`}
                onClick={()=>setPage(key)}>{label}</button>
            ))}
          </nav>
        )}

        {/* Right Side */}
        <div style={{ display:"flex", alignItems:"center", gap:8 }}>
          {isAdmin ? (
            <div style={{ display:"flex", alignItems:"center", gap:12 }}>
              <div style={{ display:"flex", alignItems:"center", gap:8,
                background:"rgba(13,148,136,.1)", border:`1px solid ${T.glassBorder}`,
                borderRadius:8, padding:"6px 14px" }}>
                <span style={{ width:8, height:8, borderRadius:"50%",
                  background:T.tealL, animation:"pulse 2s infinite" }}/>
                <span style={{ color:T.tealXL, fontSize:13, fontWeight:500 }}>Admin Active</span>
              </div>
              {[["dashboard","Dashboard"],["analytics","Analytics"]].map(([key,label]) => (
                <button key={key} className={`nav-link${page===key?" active":""}`}
                  onClick={()=>setPage(key)}>{label}</button>
              ))}
              <button className="btn-ghost" onClick={onAdminLogout}
                style={{ color:T.roseL, fontSize:13 }}>← Sign Out</button>
            </div>
          ) : (
            <button className="btn-outline" onClick={()=>setPage("admin-login")}
              style={{ fontSize:13, padding:"8px 16px" }}>
              Admin Login
            </button>
          )}
        </div>
      </div>
    </header>
  );
}

/* ─────────────────────────────────────────────────────────────────
   HOME PAGE
───────────────────────────────────────────────────────────────── */
function HomePage({ setPage, reports }) {
  const totalReports   = reports.length;
  const resolved       = reports.filter(r=>["Resolved","Action Taken","Closed"].includes(r.status)).length;
  const resolutionRate = totalReports ? Math.round((resolved/totalReports)*100) : 0;
  const pending        = reports.filter(r=>r.status==="Pending Review").length;

  const FEATURES = [
    { icon:"🔒", title:"Zero Identity Stored",     desc:"We collect zero personal identifiers. No IP, no cookies, no session data linked to your report." },
    { icon:"🛡️", title:"Military-Grade Encryption",desc:"All submissions and uploaded files are encrypted in transit and at rest using AES-256." },
    { icon:"📋", title:"Anonymous Tracking",        desc:"Receive a one-time code to check your report's progress — no login or identity required ever." },
    { icon:"⚡",  title:"48-Hour Response SLA",     desc:"Critical incidents are automatically escalated for review within 24 hours of submission." },
    { icon:"📁", title:"Secure Evidence Upload",    desc:"Attach screenshots, documents, or video. Files stored in isolated encrypted cloud storage." },
    { icon:"📊", title:"Transparent Outcomes",      desc:"Every report is tracked through to resolution with status updates available to the reporter." },
  ];

  const STATS = [
    { val:`${totalReports}+`,  label:"Reports Processed",   color:T.tealL },
    { val:`${resolutionRate}%`,label:"Resolution Rate",      color:T.amberL },
    { val:"48hr",              label:"Avg. Response Time",   color:"#818cf8" },
    { val:"100%",              label:"Identity Protected",   color:T.roseL },
  ];

  return (
    <div style={{ background:T.navy, minHeight:"100vh" }}>

      {/* ── Hero ─────────────────────── */}
      <section style={{ position:"relative", overflow:"hidden",
        padding:"100px 24px 90px", textAlign:"center" }}>

        {/* Glow Orbs */}
        <div className="hero-glow" style={{ width:500, height:500, top:-100, left:"50%",
          transform:"translateX(-50%)", background:`radial-gradient(circle,rgba(13,148,136,.18),transparent 70%)` }}/>
        <div className="hero-glow" style={{ width:300, height:300, bottom:-80, left:"15%",
          background:`radial-gradient(circle,rgba(124,58,237,.1),transparent 70%)` }}/>
        <div className="hero-glow" style={{ width:250, height:250, top:100, right:"10%",
          background:`radial-gradient(circle,rgba(225,29,72,.08),transparent 70%)` }}/>

        <div style={{ position:"relative", width:"100%", padding:"0 40px" }}>
          <div className="anim-fadeUp">
            <SectionLabel text="Confidential · Secure · Anonymous" />
          </div>
          <h1 className="anim-fadeUp-1" style={{ fontFamily:FONT_HEADING,
            fontSize:"clamp(46px,6.5vw,80px)", fontWeight:800,
            color:T.snow, lineHeight:1.05, letterSpacing:"-2px", marginBottom:24 }}>
            Your Voice.<br/>
            <span style={{ color:T.tealL,
              background:`linear-gradient(135deg,${T.teal},${T.tealXL})`,
              WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>
              Your Safety.
            </span>
          </h1>
          <p className="anim-fadeUp-2" style={{ fontSize:18, color:T.mist,
            lineHeight:1.75, maxWidth:580, margin:"0 auto 44px", fontWeight:300 }}>
            SafeSpace empowers women to report workplace safety incidents completely
            anonymously — with the certainty that every report is reviewed, tracked,
            and resolved.
          </p>
          <div className="anim-fadeUp-3" style={{ display:"flex", gap:14,
            justifyContent:"center", flexWrap:"wrap" }}>
            <button className="btn-primary" onClick={()=>setPage("report")}
              style={{ padding:"16px 36px", fontSize:16 }}>
              Report an Incident →
            </button>
            <button className="btn-outline" onClick={()=>setPage("track")}
              style={{ padding:"15px 32px", fontSize:16 }}>
              Track My Report
            </button>
          </div>
        </div>
      </section>

      {/* ── Stats Bar ──────────────────── */}
      <section style={{ background:T.navyM,
        borderTop:`1px solid rgba(255,255,255,.05)`,
        borderBottom:`1px solid rgba(255,255,255,.05)` }}>
        <div style={{ width:"100%", margin:"0 auto", padding:"36px 24px",
          display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:8 }}>
          {STATS.map((s,i) => (
            <div key={i} className={`anim-fadeUp-${i+1}`}
              style={{ textAlign:"center", padding:"12px 0" }}>
              <div style={{ fontFamily:FONT_HEADING, fontSize:"clamp(32px,3vw,48px)",
                fontWeight:800, color:s.color, letterSpacing:"-1.5px", lineHeight:1 }}>
                {s.val}
              </div>
              <div style={{ color:T.ghost, fontSize:13, marginTop:6,
                textTransform:"uppercase", letterSpacing:".06em" }}>
                {s.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── How It Works ─────────────── */}
      <section style={{ maxWidth:900, margin:"0 auto", padding:"80px 24px 60px" }}>
        <div style={{ textAlign:"center", marginBottom:52 }}>
          <SectionLabel text="How It Works" />
          <h2 className="section-title">Simple. Private. Effective.</h2>
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:0, position:"relative" }}>
          {[
            { step:"01", title:"Submit Anonymously",  desc:"Fill out the incident form. No name, email, or personal detail required at any step." },
            { step:"02", title:"Receive Tracking Code",desc:"Get a unique anonymous code to monitor your report's progress without revealing yourself." },
            { step:"03", title:"HR Takes Action",     desc:"Authorised HR investigators review, categorise, and resolve your report with full accountability." },
          ].map((s,i) => (
            <div key={i} style={{ position:"relative", padding:"28px 32px",
              borderRight: i<2 ? `1px solid rgba(255,255,255,.06)` : "none" }}>
              <div style={{ fontFamily:FONT_HEADING, fontSize:64, fontWeight:800,
                color:"rgba(13,148,136,.12)", lineHeight:1, marginBottom:16 }}>
                {s.step}
              </div>
              <h3 style={{ fontFamily:FONT_HEADING, fontSize:20, color:T.snow,
                marginBottom:10, letterSpacing:"-0.3px" }}>{s.title}</h3>
              <p style={{ color:T.mist, fontSize:15, lineHeight:1.65 }}>{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Features ─────────────────── */}
      <section style={{ width:"100%", padding:"20px 40px 80px" }}>
        <div style={{ textAlign:"center", marginBottom:52 }}>
          <SectionLabel text="Platform Features" />
          <h2 className="section-title">Built for your protection</h2>
          <p style={{ color:T.mist, fontSize:17, maxWidth:480, margin:"16px auto 0", lineHeight:1.7 }}>
            Every feature is designed with privacy as the absolute first principle.
          </p>
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(300px,1fr))", gap:20 }}>
          {FEATURES.map((f,i) => (
            <div key={i} className={`card anim-fadeUp-${Math.min(i+1,5)}`}
              style={{ padding:"28px 26px" }}>
              <div style={{ fontSize:34, marginBottom:16 }}>{f.icon}</div>
              <h3 style={{ fontFamily:FONT_HEADING, fontSize:19, color:T.snow,
                marginBottom:10, letterSpacing:"-0.2px" }}>{f.title}</h3>
              <p style={{ color:T.mist, fontSize:14.5, lineHeight:1.65 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA Banner ───────────────── */}
      <section style={{ background:`linear-gradient(135deg,${T.navyM},${T.slate})`,
        borderTop:`1px solid ${T.glassBorder}`,
        borderBottom:`1px solid rgba(255,255,255,.05)`, padding:"64px 24px", textAlign:"center" }}>
        <ShieldLogo size={52}/>
        <h2 style={{ fontFamily:FONT_HEADING, fontSize:"clamp(28px,3vw,42px)",
          color:T.snow, margin:"20px 0 14px", letterSpacing:"-0.8px" }}>
          You are not alone.
        </h2>
        <p style={{ color:T.mist, fontSize:17, maxWidth:480, margin:"0 auto 36px", lineHeight:1.7 }}>
          Every report — no matter how small — creates safer workplaces for everyone.
          Your identity will never be revealed.
        </p>
        <button className="btn-primary" onClick={()=>setPage("report")}
          style={{ padding:"16px 40px", fontSize:16 }}>
          Submit a Report — Anonymously
        </button>
        <p style={{ color:T.ghost, fontSize:13, marginTop:16 }}>
          ⚠️ If you are in immediate danger, please contact your local emergency services.
        </p>
      </section>

      {/* Footer */}
      <footer style={{ background:T.navyM, borderTop:`1px solid rgba(255,255,255,.04)`,
        padding:"32px 24px", textAlign:"center" }}>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:10, marginBottom:12 }}>
          <ShieldLogo size={22}/>
          <span style={{ fontFamily:FONT_HEADING, fontSize:18, color:T.snow }}>
            Safe<span style={{ color:T.tealL }}>Space</span>
          </span>
        </div>
        <p style={{ color:T.ghost, fontSize:13 }}>
          © 2026 SafeSpace Platform. All reports are anonymous and encrypted.
          No personal information is stored.
        </p>
      </footer>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────
   REPORT PAGE
───────────────────────────────────────────────────────────────── */
function ReportPage({ onSubmit }) {
  const [form, setForm] = useState({
    incidentType:"", department:"", location:"", date:"", time:"",
    priority:"Medium", description:"", additionalContext:"",
  });
  const [files, setFiles]       = useState([]);
  const [errors, setErrors]     = useState({});
  const [isDrag, setIsDrag]     = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone]         = useState(null);
  const fileRef                 = useRef();

  const upd = (k,v) => { setForm(f=>({...f,[k]:v})); setErrors(e=>({...e,[k]:undefined})); };

  const validate = () => {
    const e = {};
    if (!form.incidentType) e.incidentType = "Please select an incident type";
    if (!form.department)   e.department   = "Please select a department";
    if (!form.location)     e.location     = "Please select a location";
    if (!form.date)         e.date         = "Please provide the incident date";
    if (!form.description || form.description.trim().length < 30)
      e.description = "Description must be at least 30 characters";
    setErrors(e);
    return !Object.keys(e).length;
  };

  const addFiles = (newFiles) => {
    const allowed = ["image/jpeg","image/png","image/gif","application/pdf",
      "application/msword","application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "video/mp4","video/quicktime","application/zip"];
    const maxSize = 20 * 1024 * 1024;
    const valid = Array.from(newFiles).filter(f => allowed.includes(f.type) && f.size <= maxSize);
    setFiles(prev => [...prev, ...valid.map(f => ({
      name:f.name, size:f.size, type:f.type, preview:f.type.startsWith("image/") ? URL.createObjectURL(f):null
    }))]);
  };

  const handleSubmit = () => {
    if (!validate()) return;
    setSubmitting(true);
    setTimeout(() => {
      const code   = genCode();
      const report = {
        reportId: genId(), trackingCode:code, ...form,
        evidenceFiles: files.map(f=>({name:f.name, size:`${Math.round(f.size/1024)} KB`})),
        status:"Pending Review", notes:"",
        createdAt:new Date().toISOString(), updatedAt:new Date().toISOString(),
      };
      onSubmit(report);
      setDone(code);
      setSubmitting(false);
    }, 1800);
  };

  if (done) return <SubmitSuccess trackingCode={done} />;

  const inp = (k) => ({
    className:`input-field${errors[k]?" field-error":""}`,
    value:form[k], onChange:e=>upd(k,e.target.value),
  });

  return (
    <div style={{ background:T.navy, minHeight:"100vh", padding:"52px 24px" }}>
      <div style={{ width:"100%", padding:"0 40px" }}>

        {/* Page Header */}
        <div className="anim-fadeUp" style={{ marginBottom:36 }}>
          <SectionLabel text="Anonymous Report" />
          <h1 style={{ fontFamily:FONT_HEADING, fontSize:42, color:T.snow,
            letterSpacing:"-1px", marginBottom:12 }}>Report an Incident</h1>
          <p style={{ color:T.mist, fontSize:16, lineHeight:1.7, maxWidth:520 }}>
            Your submission is completely anonymous. We collect zero personal information
            — no IP address, no cookies, no identity.
          </p>
        </div>

        {/* Privacy Notice */}
        <div className="anim-fadeUp-1" style={{ background:"rgba(13,148,136,.08)",
          border:`1px solid ${T.glassBorder}`, borderRadius:10,
          padding:"14px 20px", marginBottom:32, display:"flex", alignItems:"center", gap:12 }}>
          <span style={{ fontSize:22 }}>🔒</span>
          <span style={{ color:T.tealXL, fontSize:14, fontWeight:400, lineHeight:1.5 }}>
            This form uses end-to-end encryption. Zero identifying information is
            collected or stored at any point in this process.
          </span>
        </div>

        {/* Form Card */}
        <div className="card anim-fadeUp-2" style={{ padding:"40px 44px" }}>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:22 }}>

            {/* Incident Type */}
            <div style={{ gridColumn:"1/-1" }}>
              <label className="label">Type of Incident *</label>
              <select {...inp("incidentType")} style={{ /* reuse input-field class via className */ }}>
                <option value="">Select incident type…</option>
                {INCIDENT_TYPES.map(t=><option key={t} value={t}>{t}</option>)}
              </select>
              {errors.incidentType && <p className="error-msg">{errors.incidentType}</p>}
            </div>

            {/* Department */}
            <div>
              <label className="label">Department *</label>
              <select {...inp("department")}>
                <option value="">Select department…</option>
                {DEPARTMENTS.map(d=><option key={d} value={d}>{d}</option>)}
              </select>
              {errors.department && <p className="error-msg">{errors.department}</p>}
            </div>

            {/* Location */}
            <div>
              <label className="label">Location *</label>
              <select {...inp("location")}>
                <option value="">Select location…</option>
                {LOCATIONS.map(l=><option key={l} value={l}>{l}</option>)}
              </select>
              {errors.location && <p className="error-msg">{errors.location}</p>}
            </div>

            {/* Date */}
            <div>
              <label className="label">Incident Date *</label>
              <input type="date" {...inp("date")}
                max={new Date().toISOString().split("T")[0]} />
              {errors.date && <p className="error-msg">{errors.date}</p>}
            </div>

            {/* Time */}
            <div>
              <label className="label">Approximate Time <span style={{color:T.ghost,textTransform:"lowercase",fontWeight:400}}>(optional)</span></label>
              <input type="time" {...inp("time")} />
            </div>

            {/* Priority */}
            <div style={{ gridColumn:"1/-1" }}>
              <label className="label">Priority / Urgency Level</label>
              <div style={{ display:"flex", gap:10, flexWrap:"wrap" }}>
                {PRIORITIES.map(p => (
                  <button key={p} onClick={()=>upd("priority",p)}
                    style={{ padding:"9px 22px", borderRadius:7, cursor:"pointer",
                      fontFamily:FONT_BODY, fontSize:14, fontWeight:500,
                      border:`1.5px solid ${form.priority===p?priorityColor(p):T.slateL}`,
                      background:form.priority===p?`${priorityColor(p)}22`:"transparent",
                      color:form.priority===p?priorityColor(p):T.mist,
                      transition:"all .2s" }}>
                    <Dot color={priorityColor(p)} size={7} />
                    {" "}{p}
                  </button>
                ))}
              </div>
            </div>

            {/* Description */}
            <div style={{ gridColumn:"1/-1" }}>
              <label className="label">Incident Description *</label>
              <textarea {...inp("description")} rows={6}
                placeholder="Describe what happened in as much detail as you feel comfortable sharing. Include dates, frequency, and any relevant context. The more detail provided, the better we can investigate." />
              <div style={{ display:"flex", justifyContent:"space-between", marginTop:5 }}>
                {errors.description
                  ? <p className="error-msg">{errors.description}</p>
                  : <span/>}
                <span style={{ color:form.description.length>=30?T.teal:T.ghost, fontSize:12 }}>
                  {form.description.length} characters
                  {form.description.length < 30 && ` (${30-form.description.length} more needed)`}
                </span>
              </div>
            </div>

            {/* Additional Context */}
            <div style={{ gridColumn:"1/-1" }}>
              <label className="label">
                Additional Context
                <span style={{ color:T.ghost, textTransform:"lowercase", fontWeight:400, marginLeft:6 }}>(optional)</span>
              </label>
              <textarea {...inp("additionalContext")} rows={3}
                placeholder="Any other relevant details, prior incidents, witnesses, or context that may be helpful for the investigation…" />
            </div>

            {/* Evidence Upload */}
            <div style={{ gridColumn:"1/-1" }}>
              <label className="label">
                Upload Evidence
                <span style={{ color:T.ghost, textTransform:"lowercase", fontWeight:400, marginLeft:6 }}>(optional)</span>
              </label>
              <div className={`upload-zone${isDrag?" drag":""}`}
                onClick={()=>fileRef.current.click()}
                onDragOver={e=>{e.preventDefault();setIsDrag(true);}}
                onDragLeave={()=>setIsDrag(false)}
                onDrop={e=>{e.preventDefault();setIsDrag(false);addFiles(e.dataTransfer.files);}}>
                <input ref={fileRef} type="file" multiple
                  accept=".jpg,.jpeg,.png,.gif,.pdf,.doc,.docx,.mp4,.mov,.zip"
                  onChange={e=>addFiles(e.target.files)}/>
                <div style={{ fontSize:32, marginBottom:10 }}>📁</div>
                <p style={{ color:T.mist, fontSize:15, marginBottom:4 }}>
                  Drag & drop files or <span style={{ color:T.tealXL }}>click to browse</span>
                </p>
                <p style={{ color:T.ghost, fontSize:13 }}>
                  JPG, PNG, GIF, PDF, DOC, DOCX, MP4, MOV, ZIP — max 20 MB each
                </p>
              </div>

              {/* File List */}
              {files.length > 0 && (
                <div style={{ marginTop:12, display:"flex", flexDirection:"column", gap:8 }}>
                  {files.map((f,i) => (
                    <div key={i} style={{ display:"flex", alignItems:"center", gap:12,
                      background:T.navy, borderRadius:8, padding:"10px 14px",
                      border:`1px solid ${T.slateL}` }}>
                      <span style={{ fontSize:20 }}>
                        {f.type.startsWith("image/")?"🖼️":f.type.includes("pdf")?"📄":f.type.includes("video")?"🎬":"📎"}
                      </span>
                      <div style={{ flex:1 }}>
                        <div style={{ color:T.snow, fontSize:14, fontWeight:500 }}>{f.name}</div>
                        <div style={{ color:T.ghost, fontSize:12 }}>{Math.round(f.size/1024)} KB</div>
                      </div>
                      <button className="btn-ghost" onClick={()=>setFiles(prev=>prev.filter((_,j)=>j!==i))}
                        style={{ color:T.ghost, fontSize:18, padding:"4px 8px" }}>×</button>
                    </div>
                  ))}
                </div>
              )}

              <p style={{ color:T.ghost, fontSize:13, marginTop:10 }}>
                🔒 Files are stored in isolated encrypted cloud storage. No link to your identity is ever created.
              </p>
            </div>
          </div>

          {/* Submit Section */}
          <div style={{ marginTop:36, paddingTop:28, borderTop:`1px solid rgba(255,255,255,.06)` }}>
            <button className="btn-primary" onClick={handleSubmit}
              disabled={submitting}
              style={{ width:"100%", justifyContent:"center", padding:"16px",
                fontSize:16, opacity:submitting?.7:1 }}>
              {submitting ? <><Spinner/> Submitting securely…</> : "Submit Report Anonymously →"}
            </button>
            <p style={{ color:T.ghost, fontSize:13, textAlign:"center", marginTop:14, lineHeight:1.5 }}>
              By submitting, you confirm this report is truthful to the best of your knowledge.
              <br/>Your anonymity is guaranteed. No personal data is stored.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function SubmitSuccess({ trackingCode }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard?.writeText(trackingCode).catch(()=>{});
    setCopied(true); setTimeout(()=>setCopied(false), 2500);
  };
  return (
    <div style={{ background:T.navy, minHeight:"100vh", display:"flex",
      alignItems:"center", justifyContent:"center", padding:24 }}>
      <div style={{ maxWidth:520, width:"100%", textAlign:"center" }} className="anim-fadeUp">
        <div style={{ width:80, height:80, borderRadius:"50%",
          background:"rgba(13,148,136,.15)", border:`2px solid ${T.teal}`,
          display:"flex", alignItems:"center", justifyContent:"center",
          margin:"0 auto 28px", fontSize:36 }}>✓</div>

        <h2 style={{ fontFamily:FONT_HEADING, fontSize:38, color:T.snow,
          letterSpacing:"-1px", marginBottom:14 }}>
          Report Submitted
        </h2>
        <p style={{ color:T.mist, fontSize:16, lineHeight:1.7, marginBottom:36 }}>
          Your report has been received and encrypted. Our HR team will review it
          within 24–48 hours. Use the code below to track progress — anonymously.
        </p>

        {/* Tracking Code Box */}
        <div style={{ background:T.navyM, border:`1.5px solid ${T.glassBorder}`,
          borderRadius:14, padding:"28px 32px", marginBottom:28 }}>
          <p style={{ color:T.tealXL, fontSize:12, fontWeight:600, letterSpacing:".1em",
            textTransform:"uppercase", marginBottom:10 }}>
            Your Anonymous Tracking Code
          </p>
          <div style={{ fontFamily:"'Courier New', monospace", fontSize:38,
            color:T.snow, letterSpacing:".18em", fontWeight:700,
            marginBottom:16, wordBreak:"break-all" }}>
            {trackingCode}
          </div>
          <button className="btn-outline" onClick={copy}
            style={{ borderColor:copied?T.teal:undefined, color:copied?T.tealXL:undefined }}>
            {copied ? "✓ Copied!" : "Copy Code"}
          </button>
          <p style={{ color:T.ghost, fontSize:13, marginTop:16, lineHeight:1.5 }}>
            Save this code somewhere safe. It is the <em>only</em> way to track
            your report — no account, no identity required.
          </p>
        </div>

        <div style={{ background:"rgba(225,29,72,.08)", border:"1px solid rgba(225,29,72,.2)",
          borderRadius:10, padding:"14px 18px", textAlign:"left" }}>
          <p style={{ color:T.roseL, fontSize:14, margin:0, fontWeight:500 }}>
            ⚠️ Important: We have not stored any information that could identify you.
            This report is completely anonymous and cannot be traced back to you.
          </p>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────
   TRACK PAGE
───────────────────────────────────────────────────────────────── */
function TrackPage({ reports }) {
  const [code, setCode]   = useState("");
  const [result, setResult] = useState(null);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading]   = useState(false);

  const handleSearch = () => {
    if (!code.trim()) return;
    setLoading(true);
    setTimeout(() => {
      const found = reports.find(r => r.trackingCode === code.trim().toUpperCase());
      setResult(found || null);
      setSearched(true);
      setLoading(false);
    }, 800);
  };

  const STEPS = ["Pending Review","Under Investigation","Action Taken","Resolved"];
  const stepIdx = result ? STEPS.indexOf(result.status) : -1;

  return (
    <div style={{ background:T.navy, minHeight:"100vh", padding:"64px 24px" }}>
      <div style={{ maxWidth:600, margin:"0 auto" }}>
        <div className="anim-fadeUp" style={{ textAlign:"center", marginBottom:44 }}>
          <SectionLabel text="Anonymous Tracking" />
          <h1 style={{ fontFamily:FONT_HEADING, fontSize:42, color:T.snow,
            letterSpacing:"-1px", marginBottom:14 }}>
            Track Your Report
          </h1>
          <p style={{ color:T.mist, fontSize:16, lineHeight:1.7 }}>
            Enter your anonymous tracking code to check the current status of your
            submission. No identity required.
          </p>
        </div>

        {/* Search */}
        <div className="card anim-fadeUp-1" style={{ padding:"32px 36px", marginBottom:24 }}>
          <label className="label">Tracking Code</label>
          <div style={{ display:"flex", gap:12 }}>
            <input className="input-field" value={code}
              onChange={e=>setCode(e.target.value)}
              onKeyDown={e=>e.key==="Enter"&&handleSearch()}
              placeholder="e.g. SS-A1B2C3"
              style={{ fontFamily:"'Courier New',monospace", fontSize:18,
                letterSpacing:".1em", flex:1 }}/>
            <button className="btn-primary" onClick={handleSearch}
              disabled={loading} style={{ whiteSpace:"nowrap" }}>
              {loading?<Spinner/>:"Check →"}
            </button>
          </div>
          <p style={{ color:T.ghost, fontSize:13, marginTop:10 }}>
            Demo code: <code style={{ background:T.slate, padding:"2px 7px",
              borderRadius:4, color:T.tealXL }}>SS-A1B2C3</code>
          </p>
        </div>

        {/* Result */}
        {searched && (
          <div className="card anim-fadeIn" style={{ overflow:"hidden" }}>
            {result ? (
              <>
                {/* Header */}
                <div style={{ background:T.navyL, padding:"20px 28px",
                  borderBottom:`1px solid ${T.glassBorder}`,
                  display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                  <div>
                    <span style={{ fontFamily:"'Courier New',monospace", color:T.tealXL,
                      fontSize:18, fontWeight:700 }}>{result.trackingCode}</span>
                    <p style={{ color:T.ghost, fontSize:13, marginTop:3 }}>
                      Submitted {fmtDate(result.createdAt)}
                    </p>
                  </div>
                  <StatusBadge status={result.status}/>
                </div>

                {/* Progress Bar */}
                <div style={{ padding:"24px 28px", borderBottom:`1px solid rgba(255,255,255,.04)` }}>
                  <p style={{ color:T.mist, fontSize:12, fontWeight:600,
                    textTransform:"uppercase", letterSpacing:".06em", marginBottom:14 }}>
                    Investigation Progress
                  </p>
                  <div style={{ display:"flex", gap:0, position:"relative" }}>
                    {STEPS.map((s,i) => {
                      const active = i <= stepIdx;
                      return (
                        <div key={s} style={{ flex:1, textAlign:"center", position:"relative" }}>
                          {i>0 && <div style={{ position:"absolute", top:14, right:"50%",
                            left:"-50%", height:2,
                            background:active?T.teal:T.slate, transition:"background .4s" }}/>}
                          <div style={{ width:28, height:28, borderRadius:"50%",
                            background:active?T.teal:T.slate,
                            border:`2px solid ${active?T.tealL:T.slateL}`,
                            display:"flex", alignItems:"center", justifyContent:"center",
                            margin:"0 auto 8px", position:"relative", zIndex:1,
                            color:"#fff", fontSize:12, fontWeight:700, transition:"all .4s" }}>
                            {active ? (i===stepIdx?"●":"✓") : "○"}
                          </div>
                          <p style={{ fontSize:11, color:active?T.tealXL:T.ghost,
                            lineHeight:1.3 }}>{s}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Details */}
                <div style={{ padding:"24px 28px" }}>
                  <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14, marginBottom:20 }}>
                    {[
                      ["Incident Type", result.incidentType],
                      ["Department",    result.department],
                      ["Priority",      result.priority],
                      ["Last Updated",  fmtDate(result.updatedAt)],
                    ].map(([k,v]) => (
                      <div key={k} style={{ background:T.navy, borderRadius:8, padding:"12px 16px" }}>
                        <p style={{ color:T.ghost, fontSize:12, textTransform:"uppercase",
                          letterSpacing:".06em", marginBottom:4 }}>{k}</p>
                        <p style={{ color:T.snow, fontSize:14, fontWeight:500 }}>{v}</p>
                      </div>
                    ))}
                  </div>
                  {result.notes && (
                    <div style={{ background:"rgba(13,148,136,.07)",
                      border:`1px solid ${T.glassBorder}`,
                      borderRadius:10, padding:"16px 18px" }}>
                      <p style={{ color:T.tealXL, fontSize:12, fontWeight:600,
                        textTransform:"uppercase", letterSpacing:".06em", marginBottom:8 }}>
                        HR Update
                      </p>
                      <p style={{ color:T.fog, fontSize:14, lineHeight:1.65 }}>
                        {result.notes}
                      </p>
                    </div>
                  )}
                  {!result.notes && (
                    <div style={{ background:T.navyL, borderRadius:10, padding:"16px 18px", textAlign:"center" }}>
                      <p style={{ color:T.ghost, fontSize:14 }}>
                        No update message yet. Check back in 24–48 hours.
                      </p>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div style={{ padding:"40px", textAlign:"center" }}>
                <div style={{ fontSize:40, marginBottom:16 }}>🔍</div>
                <h3 style={{ fontFamily:FONT_HEADING, fontSize:22, color:T.snow, marginBottom:10 }}>
                  Code Not Found
                </h3>
                <p style={{ color:T.mist, fontSize:15, lineHeight:1.6 }}>
                  No report was found for this tracking code. Please double-check
                  the code and try again. Codes are case-sensitive.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────
   ADMIN LOGIN
───────────────────────────────────────────────────────────────── */
function AdminLogin({ onLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError]       = useState("");
  const [loading, setLoading]   = useState(false);
  const [showPwd, setShowPwd]   = useState(false);

  const handleLogin = () => {
    if (!username || !password) { setError("Both fields are required."); return; }
    setLoading(true); setError("");
    setTimeout(() => {
      if (username === "admin" && password === "admin123") {
        onLogin();
      } else {
        setError("Invalid credentials. Please try again.");
        setLoading(false);
      }
    }, 1000);
  };

  return (
    <div style={{ background:T.navy, minHeight:"100vh",
      display:"flex", alignItems:"center", justifyContent:"center",
      padding:24, position:"relative", overflow:"hidden" }}>

      {/* Background Glows */}
      <div className="hero-glow" style={{ width:400, height:400, top:-100, left:-100,
        background:`radial-gradient(circle,rgba(13,148,136,.12),transparent 70%)` }}/>
      <div className="hero-glow" style={{ width:300, height:300, bottom:-80, right:-80,
        background:`radial-gradient(circle,rgba(124,58,237,.08),transparent 70%)` }}/>

      <div style={{ maxWidth:420, width:"100%", position:"relative" }} className="anim-fadeUp">
        <div style={{ textAlign:"center", marginBottom:36 }}>
          <ShieldLogo size={52}/>
          <h1 style={{ fontFamily:FONT_HEADING, fontSize:32, color:T.snow,
            letterSpacing:"-0.8px", marginTop:16, marginBottom:8 }}>
            Admin Access
          </h1>
          <p style={{ color:T.mist, fontSize:15 }}>
            Authorised HR personnel only
          </p>
        </div>

        <div className="card" style={{ padding:"36px 40px" }}>
          <div style={{ marginBottom:20 }}>
            <label className="label">Username</label>
            <input className="input-field" type="text" value={username}
              onChange={e=>{setUsername(e.target.value);setError("");}}
              onKeyDown={e=>e.key==="Enter"&&handleLogin()}
              placeholder="Enter username" autoComplete="username"/>
          </div>
          <div style={{ marginBottom:24 }}>
            <label className="label">Password</label>
            <div style={{ position:"relative" }}>
              <input className="input-field" type={showPwd?"text":"password"}
                value={password}
                onChange={e=>{setPassword(e.target.value);setError("");}}
                onKeyDown={e=>e.key==="Enter"&&handleLogin()}
                placeholder="Enter password" autoComplete="current-password"
                style={{ paddingRight:48 }}/>
              <button onClick={()=>setShowPwd(v=>!v)}
                style={{ position:"absolute", right:14, top:"50%", transform:"translateY(-50%)",
                  background:"none", border:"none", cursor:"pointer",
                  color:T.ghost, fontSize:16 }}>
                {showPwd?"🙈":"👁️"}
              </button>
            </div>
          </div>

          {error && (
            <div style={{ background:"rgba(225,29,72,.1)", border:"1px solid rgba(225,29,72,.25)",
              borderRadius:8, padding:"10px 14px", marginBottom:20 }}>
              <p style={{ color:T.roseL, fontSize:14, margin:0 }}>⚠️ {error}</p>
            </div>
          )}

          <button className="btn-primary" onClick={handleLogin}
            disabled={loading} style={{ width:"100%", justifyContent:"center", padding:"14px" }}>
            {loading ? <><Spinner/> Signing in…</> : "Sign In →"}
          </button>

          <div style={{ marginTop:20, padding:"14px 16px", background:T.navy,
            borderRadius:8, border:`1px solid ${T.slateL}` }}>
            <p style={{ color:T.ghost, fontSize:13, margin:0, textAlign:"center" }}>
              Demo credentials: <span style={{ color:T.tealXL }}>admin / admin123</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────
   ADMIN DASHBOARD
───────────────────────────────────────────────────────────────── */
function AdminDashboard({ reports, onUpdateReport }) {
  const [search, setSearch]   = useState("");
  const [filterStatus, setFS] = useState("All");
  const [filterDept, setFD]   = useState("All");
  const [filterType, setFT]   = useState("All");
  const [filterPrio, setFP]   = useState("All");
  const [selected, setSelected] = useState(null);
  const [noteText, setNoteText] = useState("");
  const [noteSaved, setNoteSaved] = useState(false);

  const filtered = reports.filter(r => {
    const q = search.toLowerCase();
    const matchSearch = !q ||
      r.reportId.toLowerCase().includes(q) ||
      r.incidentType.toLowerCase().includes(q) ||
      r.department.toLowerCase().includes(q) ||
      r.trackingCode.toLowerCase().includes(q);
    return matchSearch &&
      (filterStatus==="All" || r.status===filterStatus) &&
      (filterDept==="All"   || r.department===filterDept) &&
      (filterType==="All"   || r.incidentType===filterType) &&
      (filterPrio==="All"   || r.priority===filterPrio);
  });

  const updateStatus = (id, status) => {
    onUpdateReport(id, { status, updatedAt:new Date().toISOString() });
    if (selected?.reportId===id) setSelected(s=>({...s,status,updatedAt:new Date().toISOString()}));
  };

  const saveNote = () => {
    if (!selected || !noteText.trim()) return;
    onUpdateReport(selected.reportId, { notes:noteText, updatedAt:new Date().toISOString() });
    setSelected(s=>({...s, notes:noteText}));
    setNoteSaved(true);
    setTimeout(()=>setNoteSaved(false),2500);
  };

  const openReport = (r) => { setSelected(r); setNoteText(r.notes||""); };

  const STAT_CARDS = [
    { label:"Total Reports",        val:reports.length,                                              icon:"📋", color:T.tealL },
    { label:"Pending Review",        val:reports.filter(r=>r.status==="Pending Review").length,       icon:"⏳", color:T.amberL },
    { label:"Under Investigation",   val:reports.filter(r=>r.status==="Under Investigation").length,  icon:"🔍", color:"#818cf8" },
    { label:"Critical Priority",     val:reports.filter(r=>r.priority==="Critical").length,           icon:"🚨", color:T.roseL },
  ];

  return (
    <div style={{ background:T.navy, minHeight:"100vh" }}>
      {/* Dashboard Header */}
      <div style={{ background:T.navyM, borderBottom:`1px solid rgba(255,255,255,.05)`,
        padding:"24px 32px" }}>
        <div style={{ maxWidth:1400, margin:"0 auto",
          display:"flex", justifyContent:"space-between", alignItems:"center" }}>
          <div>
            <h1 style={{ fontFamily:FONT_HEADING, fontSize:28, color:T.snow,
              letterSpacing:"-0.5px", margin:0 }}>Incident Reports</h1>
            <p style={{ color:T.ghost, fontSize:14, marginTop:4 }}>
              {reports.length} total reports · Last updated {new Date().toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>

      <div style={{ maxWidth:1400, margin:"0 auto", padding:"24px 32px" }}>

        {/* Stat Cards */}
        <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:16, marginBottom:24 }}>
          {STAT_CARDS.map((c,i) => (
            <div key={i} className="stat-card" style={{ display:"flex", alignItems:"center", gap:18 }}>
              <div style={{ width:50, height:50, borderRadius:12,
                background:`${c.color}18`, display:"flex", alignItems:"center",
                justifyContent:"center", fontSize:24, flexShrink:0 }}>
                {c.icon}
              </div>
              <div>
                <div style={{ fontFamily:FONT_HEADING, fontSize:34, fontWeight:800,
                  color:c.color, letterSpacing:"-1px", lineHeight:1 }}>{c.val}</div>
                <div style={{ color:T.ghost, fontSize:13, marginTop:3 }}>{c.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="card" style={{ padding:"16px 20px", marginBottom:20 }}>
          <div style={{ display:"flex", gap:12, flexWrap:"wrap", alignItems:"center" }}>
            <input className="input-field" value={search}
              onChange={e=>setSearch(e.target.value)}
              placeholder="Search by ID, type, department…"
              style={{ maxWidth:260, padding:"9px 14px", fontSize:14 }}/>

            {[
              ["Status", filterStatus, setFS, ["All",...STATUSES]],
              ["Dept",   filterDept,   setFD, ["All",...DEPARTMENTS.slice(0,7)]],
              ["Type",   filterType,   setFT, ["All",...INCIDENT_TYPES.slice(0,6)]],
              ["Priority",filterPrio,  setFP, ["All",...PRIORITIES]],
            ].map(([label,val,setVal,opts]) => (
              <div key={label} style={{ display:"flex", alignItems:"center", gap:6 }}>
                <span style={{ color:T.ghost, fontSize:12 }}>{label}:</span>
                <select value={val} onChange={e=>setVal(e.target.value)}
                  className="input-field"
                  style={{ padding:"8px 12px", fontSize:13, minWidth:140 }}>
                  {opts.map(o=><option key={o} value={o}>{o}</option>)}
                </select>
              </div>
            ))}

            {(search||filterStatus!=="All"||filterDept!=="All"||filterType!=="All"||filterPrio!=="All") && (
              <button className="btn-ghost" style={{ fontSize:13 }}
                onClick={()=>{setSearch("");setFS("All");setFD("All");setFT("All");setFP("All");}}>
                Clear Filters
              </button>
            )}

            <span style={{ marginLeft:"auto", color:T.ghost, fontSize:13 }}>
              {filtered.length} of {reports.length} reports
            </span>
          </div>
        </div>

        {/* Main Grid: Table + Detail */}
        <div style={{ display:"grid",
          gridTemplateColumns:selected?"1fr 440px":"1fr", gap:20 }}>

          {/* Table */}
          <div className="card" style={{ overflow:"hidden" }}>
            <div style={{ overflowX:"auto" }}>
              <table style={{ width:"100%", borderCollapse:"collapse", fontSize:14 }}>
                <thead>
                  <tr style={{ background:T.navyL, borderBottom:`1px solid rgba(255,255,255,.06)` }}>
                    {["Report ID","Type","Department","Date","Priority","Status","Action"]
                      .map(h => (
                        <th key={h} style={{ padding:"13px 16px", textAlign:"left",
                          color:T.ghost, fontSize:11.5, fontWeight:600,
                          letterSpacing:".06em", textTransform:"uppercase",
                          whiteSpace:"nowrap" }}>
                          {h}
                        </th>
                      ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(r => (
                    <tr key={r.reportId}
                      className={`table-row${selected?.reportId===r.reportId?" selected":""}`}
                      onClick={()=>openReport(r)}>
                      <td style={{ padding:"14px 16px" }}>
                        <span style={{ fontFamily:"'Courier New',monospace",
                          color:T.tealXL, fontWeight:700, fontSize:13 }}>
                          {r.reportId}
                        </span>
                      </td>
                      <td style={{ padding:"14px 16px", color:T.fog,
                        maxWidth:160, whiteSpace:"nowrap", overflow:"hidden",
                        textOverflow:"ellipsis" }}>
                        {r.incidentType}
                      </td>
                      <td style={{ padding:"14px 16px", color:T.mist }}>{r.department}</td>
                      <td style={{ padding:"14px 16px", color:T.mist,
                        fontFamily:"'Courier New',monospace", fontSize:12 }}>
                        {r.date}
                      </td>
                      <td style={{ padding:"14px 16px" }}>
                        <PriorityBadge priority={r.priority}/>
                      </td>
                      <td style={{ padding:"14px 16px" }}>
                        <StatusBadge status={r.status}/>
                      </td>
                      <td style={{ padding:"14px 16px" }}>
                        <button className="btn-outline"
                          onClick={e=>{e.stopPropagation();openReport(r);}}
                          style={{ padding:"6px 14px", fontSize:12 }}>
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {!filtered.length && (
                <div style={{ padding:"48px", textAlign:"center" }}>
                  <div style={{ fontSize:36, marginBottom:12 }}>🔍</div>
                  <p style={{ color:T.ghost, fontSize:15 }}>No reports match the current filters.</p>
                </div>
              )}
            </div>
          </div>

          {/* Detail Panel */}
          {selected && (
            <div className="card anim-fadeIn" style={{ height:"fit-content", overflow:"hidden" }}>
              {/* Panel Header */}
              <div style={{ background:T.navyL, padding:"16px 20px",
                borderBottom:`1px solid rgba(255,255,255,.06)`,
                display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                <span style={{ fontFamily:"'Courier New',monospace",
                  color:T.tealXL, fontSize:16, fontWeight:700 }}>
                  {selected.reportId}
                </span>
                <button onClick={()=>setSelected(null)}
                  style={{ background:"none", border:"none", cursor:"pointer",
                    color:T.mist, fontSize:22, lineHeight:1, padding:"0 4px" }}>×</button>
              </div>

              <div style={{ padding:"20px", display:"flex", flexDirection:"column", gap:16 }}>
                {/* Key Info Grid */}
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
                  {[
                    ["Type",       selected.incidentType],
                    ["Dept",       selected.department],
                    ["Location",   selected.location],
                    ["Date",       selected.date+(selected.time?` · ${selected.time}`:"")],
                    ["Submitted",  fmtDate(selected.createdAt)],
                    ["Updated",    fmtDate(selected.updatedAt)],
                  ].map(([k,v]) => (
                    <div key={k} style={{ background:T.navy, borderRadius:7, padding:"10px 13px" }}>
                      <p style={{ color:T.ghost, fontSize:11, textTransform:"uppercase",
                        letterSpacing:".06em", marginBottom:3 }}>{k}</p>
                      <p style={{ color:T.fog, fontSize:13, wordBreak:"break-word" }}>{v}</p>
                    </div>
                  ))}
                </div>

                {/* Badges Row */}
                <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
                  <PriorityBadge priority={selected.priority}/>
                  <StatusBadge status={selected.status}/>
                  {selected.evidenceFiles?.length>0 &&
                    <span className="badge" style={{ background:"rgba(99,102,241,.15)", color:"#818cf8" }}>
                      📎 {selected.evidenceFiles.length} file{selected.evidenceFiles.length>1?"s":""}
                    </span>}
                </div>

                {/* Description */}
                <div>
                  <p style={{ color:T.ghost, fontSize:11, fontWeight:600,
                    textTransform:"uppercase", letterSpacing:".06em", marginBottom:8 }}>
                    Description
                  </p>
                  <div style={{ background:T.navy, borderRadius:8,
                    padding:"14px 16px", maxHeight:140, overflowY:"auto" }}>
                    <p style={{ color:T.fog, fontSize:13.5, lineHeight:1.65, margin:0 }}>
                      {selected.description}
                    </p>
                  </div>
                </div>

                {/* Additional Context */}
                {selected.additionalContext && (
                  <div>
                    <p style={{ color:T.ghost, fontSize:11, fontWeight:600,
                      textTransform:"uppercase", letterSpacing:".06em", marginBottom:8 }}>
                      Additional Context
                    </p>
                    <div style={{ background:T.navy, borderRadius:8, padding:"12px 16px" }}>
                      <p style={{ color:T.mist, fontSize:13, lineHeight:1.6, margin:0 }}>
                        {selected.additionalContext}
                      </p>
                    </div>
                  </div>
                )}

                {/* Evidence Files */}
                {selected.evidenceFiles?.length > 0 && (
                  <div>
                    <p style={{ color:T.ghost, fontSize:11, fontWeight:600,
                      textTransform:"uppercase", letterSpacing:".06em", marginBottom:8 }}>
                      Attached Evidence
                    </p>
                    {selected.evidenceFiles.map((f,i) => (
                      <div key={i} style={{ display:"flex", alignItems:"center", gap:10,
                        background:T.navy, borderRadius:7, padding:"9px 12px", marginBottom:6 }}>
                        <span style={{ fontSize:18 }}>📎</span>
                        <div style={{ flex:1 }}>
                          <p style={{ color:T.fog, fontSize:13, margin:0 }}>{f.name}</p>
                          <p style={{ color:T.ghost, fontSize:11, margin:0 }}>{f.size}</p>
                        </div>
                        <button className="btn-ghost" style={{ fontSize:12, padding:"4px 8px",
                          color:T.tealXL, border:`1px solid ${T.glassBorder}`, borderRadius:5 }}>
                          View
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Update Status */}
                <div>
                  <label className="label">Update Status</label>
                  <select className="input-field" value={selected.status}
                    onChange={e=>updateStatus(selected.reportId,e.target.value)}>
                    {STATUSES.map(s=><option key={s} value={s}>{s}</option>)}
                  </select>
                </div>

                {/* Investigation Notes */}
                <div>
                  <label className="label">Investigation Notes</label>
                  <textarea className="input-field" rows={4}
                    value={noteText} onChange={e=>setNoteText(e.target.value)}
                    placeholder="Add internal investigation notes, findings, or updates visible to the reporter…"
                    style={{ resize:"vertical" }}/>
                  <button className="btn-primary" onClick={saveNote}
                    style={{ marginTop:10, width:"100%", justifyContent:"center" }}>
                    {noteSaved ? "✓ Note Saved" : "Save Note"}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────
   ANALYTICS DASHBOARD
───────────────────────────────────────────────────────────────── */
function AnalyticsDashboard({ reports }) {
  // Chart Data Computations
  const byType = INCIDENT_TYPES.map(t => ({
    name: t.length > 22 ? t.slice(0,20)+"…" : t,
    fullName: t,
    count: reports.filter(r=>r.incidentType===t).length
  })).filter(d=>d.count>0).sort((a,b)=>b.count-a.count);

  const byDept = DEPARTMENTS.map(d => ({
    dept: d, count: reports.filter(r=>r.department===d).length
  })).filter(d=>d.count>0).sort((a,b)=>b.count-a.count);

  const byStatus = STATUSES.map(s => ({
    name: s, value: reports.filter(r=>r.status===s).length
  })).filter(d=>d.value>0);

  const byPriority = PRIORITIES.map(p => ({
    name:p, value:reports.filter(r=>r.priority===p).length,
    fill:priorityColor(p)
  })).filter(d=>d.value>0);

  const total = reports.length || 1;

  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
      <div style={{ background:T.navyL, border:`1px solid ${T.glassBorder}`,
        borderRadius:8, padding:"10px 14px" }}>
        <p style={{ color:T.snow, fontSize:14, fontWeight:600, marginBottom:4 }}>
          {label || payload[0].name}
        </p>
        {payload.map((p,i) => (
          <p key={i} style={{ color:p.color||T.tealXL, fontSize:13, margin:0 }}>
            {p.value} report{p.value!==1?"s":""}
          </p>
        ))}
      </div>
    );
  };

  return (
    <div style={{ background:T.navy, minHeight:"100vh" }}>
      {/* Header */}
      <div style={{ background:T.navyM, borderBottom:`1px solid rgba(255,255,255,.05)`,
        padding:"24px 32px" }}>
        <div style={{ maxWidth:1300, margin:"0 auto" }}>
          <h1 style={{ fontFamily:FONT_HEADING, fontSize:28, color:T.snow,
            letterSpacing:"-0.5px", margin:0 }}>Analytics Dashboard</h1>
          <p style={{ color:T.ghost, fontSize:14, marginTop:4 }}>
            Visual insights from {reports.length} reports across all departments
          </p>
        </div>
      </div>

      <div style={{ maxWidth:1300, margin:"0 auto", padding:"24px 32px" }}>

        {/* Summary KPIs */}
        <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:16, marginBottom:24 }}>
          {[
            { label:"Total Reports",       val:reports.length, sub:"all time", color:T.tealL },
            { label:"Avg. Resolution Time", val:"6.2 days",    sub:"median", color:T.amberL },
            { label:"Resolution Rate",      val:`${Math.round((reports.filter(r=>["Resolved","Action Taken","Closed"].includes(r.status)).length/total)*100)}%`, sub:"resolved or closed", color:"#818cf8" },
            { label:"Critical Open",        val:reports.filter(r=>r.priority==="Critical"&&!["Resolved","Closed"].includes(r.status)).length, sub:"need immediate action", color:T.roseL },
          ].map((c,i) => (
            <div key={i} className="stat-card">
              <p style={{ color:T.ghost, fontSize:11, textTransform:"uppercase",
                letterSpacing:".06em", marginBottom:8 }}>{c.label}</p>
              <p style={{ fontFamily:FONT_HEADING, fontSize:36, fontWeight:800,
                color:c.color, letterSpacing:"-1px", lineHeight:1, margin:0 }}>{c.val}</p>
              <p style={{ color:T.ghost, fontSize:12, marginTop:6 }}>{c.sub}</p>
            </div>
          ))}
        </div>

        {/* Row 1: Trend + By Type */}
        <div style={{ display:"grid", gridTemplateColumns:"1.4fr 1fr", gap:20, marginBottom:20 }}>

          {/* Monthly Trend */}
          <div className="card" style={{ padding:"24px 28px" }}>
            <h3 style={{ fontFamily:FONT_HEADING, fontSize:20, color:T.snow,
              marginBottom:6, letterSpacing:"-0.3px" }}>Monthly Report Trend</h3>
            <p style={{ color:T.ghost, fontSize:13, marginBottom:20 }}>
              Incidents submitted over the past 8 months
            </p>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={TREND_DATA}>
                <defs>
                  <linearGradient id="lineGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor={T.teal} stopOpacity={0.3}/>
                    <stop offset="95%" stopColor={T.teal} stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,.04)"/>
                <XAxis dataKey="month" tick={{ fill:T.ghost, fontSize:12 }} axisLine={false} tickLine={false}/>
                <YAxis tick={{ fill:T.ghost, fontSize:12 }} axisLine={false} tickLine={false}/>
                <Tooltip content={<CustomTooltip/>}/>
                <Line type="monotone" dataKey="reports" stroke={T.tealL} strokeWidth={2.5}
                  dot={{ fill:T.teal, r:4, strokeWidth:2, stroke:T.tealXL }}
                  activeDot={{ r:6, fill:T.tealXL }}/>
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* By Status (Pie) */}
          <div className="card" style={{ padding:"24px 28px" }}>
            <h3 style={{ fontFamily:FONT_HEADING, fontSize:20, color:T.snow,
              marginBottom:6, letterSpacing:"-0.3px" }}>Status Distribution</h3>
            <p style={{ color:T.ghost, fontSize:13, marginBottom:16 }}>
              Current resolution pipeline
            </p>
            <ResponsiveContainer width="100%" height={170}>
              <PieChart>
                <Pie data={byStatus} cx="50%" cy="50%" outerRadius={70}
                  innerRadius={40} dataKey="value" nameKey="name"
                  paddingAngle={3}>
                  {byStatus.map((_,i)=><Cell key={i} fill={PIE_PALETTE[i%PIE_PALETTE.length]}/>)}
                </Pie>
                <Tooltip content={<CustomTooltip/>}/>
                <Legend iconType="circle" iconSize={8}
                  formatter={v=><span style={{color:T.fog,fontSize:12}}>{v}</span>}/>
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Row 2: By Dept + By Type bars */}
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:20, marginBottom:20 }}>

          {/* By Department */}
          <div className="card" style={{ padding:"24px 28px" }}>
            <h3 style={{ fontFamily:FONT_HEADING, fontSize:20, color:T.snow,
              marginBottom:6, letterSpacing:"-0.3px" }}>Reports by Department</h3>
            <p style={{ color:T.ghost, fontSize:13, marginBottom:20 }}>
              Incident volume per team
            </p>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={byDept} layout="vertical" barSize={14}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,.04)" horizontal={false}/>
                <XAxis type="number" tick={{ fill:T.ghost, fontSize:11 }} axisLine={false} tickLine={false}/>
                <YAxis type="category" dataKey="dept" width={100}
                  tick={{ fill:T.mist, fontSize:12 }} axisLine={false} tickLine={false}/>
                <Tooltip content={<CustomTooltip/>}/>
                <Bar dataKey="count" radius={[0,4,4,0]}>
                  {byDept.map((_,i)=><Cell key={i} fill={PIE_PALETTE[i%PIE_PALETTE.length]}/>)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* By Incident Type */}
          <div className="card" style={{ padding:"24px 28px" }}>
            <h3 style={{ fontFamily:FONT_HEADING, fontSize:20, color:T.snow,
              marginBottom:6, letterSpacing:"-0.3px" }}>Reports by Incident Type</h3>
            <p style={{ color:T.ghost, fontSize:13, marginBottom:20 }}>
              Breakdown of issue categories
            </p>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={byType} barSize={20}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,.04)" vertical={false}/>
                <XAxis dataKey="name" tick={{ fill:T.ghost, fontSize:11 }}
                  axisLine={false} tickLine={false}/>
                <YAxis tick={{ fill:T.ghost, fontSize:11 }} axisLine={false} tickLine={false}/>
                <Tooltip content={<CustomTooltip/>}/>
                <Bar dataKey="count" radius={[4,4,0,0]}>
                  {byType.map((_,i)=><Cell key={i} fill={PIE_PALETTE[i%PIE_PALETTE.length]}/>)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Row 3: Priority Summary + Top Metrics */}
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:20 }}>

          {/* Priority Breakdown */}
          <div className="card" style={{ padding:"24px 28px" }}>
            <h3 style={{ fontFamily:FONT_HEADING, fontSize:20, color:T.snow,
              marginBottom:20, letterSpacing:"-0.3px" }}>Priority Level Summary</h3>
            {PRIORITIES.map(p => {
              const count = reports.filter(r=>r.priority===p).length;
              const pct   = Math.round((count/total)*100);
              return (
                <div key={p} style={{ marginBottom:18 }}>
                  <div style={{ display:"flex", justifyContent:"space-between", marginBottom:7 }}>
                    <span style={{ display:"flex", alignItems:"center", gap:8 }}>
                      <Dot color={priorityColor(p)} size={9}/>
                      <span style={{ color:T.fog, fontSize:14, fontWeight:500 }}>{p}</span>
                    </span>
                    <span style={{ color:T.mist, fontSize:13 }}>
                      {count} report{count!==1?"s":""} · {pct}%
                    </span>
                  </div>
                  <div className="progress-bar-track">
                    <div className="progress-bar-fill"
                      style={{ width:`${pct}%`, background:priorityColor(p) }}/>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Department Risk Matrix */}
          <div className="card" style={{ padding:"24px 28px" }}>
            <h3 style={{ fontFamily:FONT_HEADING, fontSize:20, color:T.snow,
              marginBottom:6, letterSpacing:"-0.3px" }}>Department Risk Overview</h3>
            <p style={{ color:T.ghost, fontSize:13, marginBottom:18 }}>
              Departments by critical + high priority incidents
            </p>
            <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
              {DEPARTMENTS
                .map(d => ({
                  dept:d,
                  critical:reports.filter(r=>r.department===d&&r.priority==="Critical").length,
                  high:reports.filter(r=>r.department===d&&r.priority==="High").length,
                  total:reports.filter(r=>r.department===d).length,
                }))
                .filter(d=>d.total>0)
                .sort((a,b)=>(b.critical*3+b.high)-(a.critical*3+a.high))
                .slice(0,6)
                .map(d => (
                  <div key={d.dept} style={{ display:"flex", alignItems:"center",
                    gap:12, background:T.navy, borderRadius:8, padding:"10px 14px" }}>
                    <div style={{ flex:1 }}>
                      <span style={{ color:T.fog, fontSize:14, fontWeight:500 }}>{d.dept}</span>
                    </div>
                    <div style={{ display:"flex", gap:6 }}>
                      {d.critical > 0 && (
                        <span className="badge"
                          style={{ background:"rgba(225,29,72,.15)", color:T.roseL, padding:"3px 10px", fontSize:12 }}>
                          {d.critical} critical
                        </span>
                      )}
                      {d.high > 0 && (
                        <span className="badge"
                          style={{ background:"rgba(217,119,6,.15)", color:T.amberL, padding:"3px 10px", fontSize:12 }}>
                          {d.high} high
                        </span>
                      )}
                      <span style={{ color:T.ghost, fontSize:12, display:"flex", alignItems:"center" }}>
                        {d.total} total
                      </span>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────
   ROOT APP
───────────────────────────────────────────────────────────────── */
export default function App() {
  const [page, setPage]       = useState("home");
  const [isAdmin, setIsAdmin] = useState(false);
  const [reports, setReports] = useState(SEED_REPORTS);

  // Inject global CSS once
  useEffect(() => {
    const el = document.createElement("style");
    el.textContent = GLOBAL_CSS;
    document.head.appendChild(el);
    return () => document.head.removeChild(el);
  }, []);

  const handleAdminLogin = () => { setIsAdmin(true); setPage("dashboard"); };
  const handleAdminLogout = () => { setIsAdmin(false); setPage("home"); };

  const addReport = (r) => setReports(prev => [r, ...prev]);

  const updateReport = (id, patch) => {
    setReports(prev => prev.map(r => r.reportId===id ? {...r,...patch} : r));
  };

  const navigate = (p) => {
    // Guard: admin pages only when logged in
    if ((p==="dashboard"||p==="analytics") && !isAdmin) { setPage("admin-login"); return; }
    setPage(p);
    window.scrollTo({top:0,behavior:"smooth"});
  };

  return (
    <div style={{ fontFamily:FONT_BODY, background:T.navy, minHeight:"100vh" }}>
      <Navbar page={page} setPage={navigate} isAdmin={isAdmin} onAdminLogout={handleAdminLogout}/>

      {page==="home"        && <HomePage setPage={navigate} reports={reports}/>}
      {page==="report"      && <ReportPage onSubmit={r=>{addReport(r);}}/>}
      {page==="track"       && <TrackPage reports={reports}/>}
      {page==="admin-login" && <AdminLogin onLogin={handleAdminLogin}/>}
      {page==="dashboard"   && isAdmin && <AdminDashboard reports={reports} onUpdateReport={updateReport}/>}
      {page==="analytics"   && isAdmin && <AnalyticsDashboard reports={reports}/>}
    </div>
  );
}
