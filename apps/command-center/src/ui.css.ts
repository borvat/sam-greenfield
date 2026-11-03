/** Command Center 2.0 — visual system. Logical properties only, so RTL and LTR share one sheet. */
export const commandCenterCss = `
:root{
  --ink:#0e1116;--ink-soft:#171c23;--paper:#f5f4f1;--surface:#ffffff;--surface-2:#fbfaf8;
  --line:#e6e2db;--line-strong:#d6d1c7;--muted:#6b675f;--muted-2:#8d887f;
  --accent:#b45309;--accent-ink:#7c3a06;--accent-soft:#fdf2e7;
  --ok:#0f766e;--ok-soft:#e8f4f2;--warn:#b45309;--warn-soft:#fdf2e7;--bad:#b42318;--bad-soft:#fdeceb;--info:#1d4ed8;--info-soft:#eaeffd;
  --radius:16px;--radius-sm:10px;--shadow:0 1px 2px rgba(15,17,22,.05),0 8px 24px -18px rgba(15,17,22,.25);
  --font:"Dubai","Sakkal Majalla","Segoe UI","Noto Sans Arabic",Tahoma,system-ui,-apple-system,sans-serif;
}
*{box-sizing:border-box}
html,body{margin:0;padding:0;background:var(--paper);color:var(--ink);font-family:var(--font);font-size:14.5px;line-height:1.62;font-feature-settings:"tnum" 1,"kern" 1}
h1,h2,h3,h4{letter-spacing:-.2px;line-height:1.35}
body{-webkit-font-smoothing:antialiased}
button{font-family:inherit}
a{color:inherit}
.shell{display:flex;flex-direction:column;min-height:100vh}
.app{display:grid;grid-template-columns:264px minmax(0,1fr);min-height:100vh;flex:1}
.sidebar{background:var(--ink);color:#cfcbc4;position:sticky;top:0;height:100vh;display:flex;flex-direction:column;padding:22px 16px;gap:18px;z-index:40}
.brand{display:flex;align-items:center;gap:10px;padding:0 6px 6px}
.brand .mark{width:34px;height:34px;border-radius:10px;background:linear-gradient(145deg,#f0b27a,#b45309);display:grid;place-items:center;color:#1b1206;font-weight:800;font-size:15px;letter-spacing:-.5px}
.brand h1{font-size:15px;margin:0;color:#fff;font-weight:650;letter-spacing:.1px}
.brand span{display:block;font-size:11px;color:#8d887f;font-weight:400}
.nav{display:flex;flex-direction:column;gap:2px;margin-top:6px}
.nav-item{display:flex;align-items:center;gap:10px;padding:10px 12px;border-radius:10px;color:#b8b3ab;background:none;border:0;width:100%;text-align:start;cursor:pointer;font-size:14px;position:relative}
.nav-item:hover{background:#1b212a;color:#fff}
.nav-item.is-active{background:#1e242d;color:#fff}
.nav-item.is-active:before{content:"";position:absolute;inset-inline-start:0;top:9px;bottom:9px;width:3px;border-radius:3px;background:var(--accent)}
.nav-item svg{width:17px;height:17px;flex:0 0 17px;opacity:.85}
.nav-item .count{margin-inline-start:auto;font-size:11px;background:var(--accent);color:#fff;border-radius:999px;padding:1px 7px;font-weight:600}
.side-foot{margin-top:auto;font-size:11px;color:#a39d94;border-top:1px solid #232932;padding-top:14px;display:flex;flex-direction:column;gap:6px}
.side-foot code{font-size:10.5px;color:#b3ada3}
.side-foot small{color:#b3ada3;font-size:10.5px;letter-spacing:.02em}
.main{min-width:0;display:flex;flex-direction:column}
.topbar{position:sticky;top:0;z-index:30;background:rgba(245,244,241,.92);backdrop-filter:blur(8px);border-bottom:1px solid var(--line);display:flex;align-items:center;gap:14px;padding:14px 28px}
.topbar h2{font-size:17px;margin:0;font-weight:650}
.topbar .sub{font-size:12px;color:var(--muted);margin-top:1px}
.top-actions{margin-inline-start:auto;display:flex;align-items:center;gap:10px}
.pill{display:inline-flex;align-items:center;gap:7px;border-radius:999px;padding:5px 11px;font-size:12px;border:1px solid var(--line);background:var(--surface);color:var(--muted)}
.pill .dot{width:7px;height:7px;border-radius:50%;background:var(--muted-2)}
.pill.live{color:var(--ok);border-color:#cfe6e2;background:var(--ok-soft)}
.pill.live .dot{background:var(--ok);box-shadow:0 0 0 3px rgba(15,118,110,.14)}
.pill.bad{color:var(--bad);border-color:#f3cdc9;background:var(--bad-soft)}
.pill.bad .dot{background:var(--bad)}
.pill.warn{color:var(--warn);border-color:#f0d6bd;background:var(--warn-soft)}
.pill.warn .dot{background:var(--warn)}
.pill.muted{color:var(--muted)}
.btn{border:1px solid var(--line-strong);background:var(--surface);color:var(--ink);border-radius:10px;padding:8px 14px;font-size:13px;cursor:pointer;font-weight:550;display:inline-flex;align-items:center;gap:6px}
.btn svg{width:15px;height:15px;flex:0 0 15px}
.btn:hover{border-color:#bcb6aa}
.btn.primary{background:var(--ink);border-color:var(--ink);color:#fff}
.btn.primary:hover{background:#000}
.btn.ghost{background:none;border-color:transparent;color:var(--muted)}
.btn.small{padding:5px 10px;font-size:12px;border-radius:8px}
.lang{display:inline-flex;border:1px solid var(--line-strong);border-radius:10px;overflow:hidden;background:var(--surface)}
.lang button{border:0;background:none;padding:6px 10px;font-size:12px;cursor:pointer;color:var(--muted)}
.lang button.is-active{background:var(--ink);color:#fff}
.content{padding:26px 28px 56px;max-width:1360px;width:100%;margin:0 auto}
.view{display:none;animation:fade .18s ease}
.view.is-active{display:block}
@keyframes fade{from{opacity:0;transform:translateY(3px)}to{opacity:1;transform:none}}
.brief-grid{display:grid;grid-template-columns:minmax(0,1.7fr) minmax(0,1fr);gap:16px;margin-bottom:16px}
.brief-main{padding:20px 22px}
.brief-head{display:flex;align-items:center;gap:10px;margin-bottom:6px}
.brief-kicker{font-size:11px;letter-spacing:.06em;color:var(--muted);text-transform:uppercase}
.brief-head .btn{margin-inline-start:auto}
.brief-headline{font-size:23px;line-height:1.38;margin:10px 0 12px;font-weight:700;letter-spacing:-.3px}
.brief-cols{display:grid;grid-template-columns:1fr 1fr;gap:18px;margin:6px 0 2px}
.brief-cols p{margin:5px 0 0;font-size:13.5px;line-height:1.68}
.brief-cols ul{margin:6px 0 0;padding-inline-start:18px;font-size:13px;line-height:1.6}
.brief-label{font-size:11px;letter-spacing:.06em;color:var(--muted);margin-top:14px}
.chips{display:flex;gap:6px;flex-wrap:wrap;margin-top:7px}
.chip{border:1px solid var(--line-strong);background:var(--surface-2);border-radius:999px;padding:3px 10px;font-size:11.5px;cursor:pointer;font-family:inherit;color:var(--ink)}
.chip:hover{border-color:var(--ink)}
.opts{display:flex;flex-direction:column;gap:8px;margin-top:7px}
.opt{display:flex;gap:10px;align-items:flex-start;border:1px solid var(--line);border-radius:10px;padding:10px 12px;background:var(--surface-2)}
.opt b{font-size:13px;font-weight:650}
.brief-next{display:flex;align-items:center;gap:12px;margin-top:16px;padding-top:14px;border-top:1px solid var(--line)}
.brief-next span{font-size:13.5px;line-height:1.6}
.brief-next .btn{margin-inline-start:auto;flex:0 0 auto}
.brief-disclaimer{margin-top:12px;font-size:11.5px;color:var(--muted-2);line-height:1.6}
.situation{display:grid;grid-template-columns:1.1fr 1.25fr .95fr;gap:12px;margin-bottom:16px}
.sit{background:var(--surface);border:1px solid var(--line);border-radius:var(--radius);padding:16px 18px;box-shadow:var(--shadow);display:flex;flex-direction:column;gap:8px}
.sit.accent{background:linear-gradient(180deg,#fffdf9,#fdf4ea);border-color:#f0d6bd}
.sit-label{font-size:11px;letter-spacing:.06em;color:var(--muted);text-transform:uppercase}
.sit-body{font-size:14px;line-height:1.65}
.sit-body strong{font-weight:700}
.sit-foot{margin-top:auto;display:flex;gap:8px;align-items:center}
.sit-nums{display:flex;gap:14px;flex-wrap:wrap;margin-top:2px}
.sit-nums b{display:block;font-size:20px;font-weight:700;font-variant-numeric:tabular-nums;line-height:1.1}
.sit-nums span{font-size:11.5px;color:var(--muted)}
.grid-kpi{display:grid;grid-template-columns:repeat(auto-fit,minmax(172px,1fr));gap:12px;margin-bottom:18px}
.kpi{background:var(--surface);border:1px solid var(--line);border-radius:var(--radius);padding:16px 18px;box-shadow:var(--shadow)}
.kpi .label{font-size:12px;color:var(--muted);display:flex;align-items:center;gap:6px}
.kpi .value{font-size:32px;font-weight:700;letter-spacing:-.8px;margin-top:6px;font-variant-numeric:tabular-nums}
.kpi .hint{font-size:11.5px;color:var(--muted-2);margin-top:2px}
.kpi.accent{border-color:#f0d6bd;background:linear-gradient(180deg,#fffdfa,#fdf5ec)}
.kpi.accent .value{color:var(--accent-ink)}
.kpi.bad{border-color:#f3cdc9}
.kpi.bad .value{color:var(--bad)}
.grid-2{display:grid;grid-template-columns:minmax(0,1.55fr) minmax(0,1fr);gap:16px}
.grid-3{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:16px}
.card{background:var(--surface);border:1px solid var(--line);border-radius:var(--radius);box-shadow:var(--shadow);padding:18px}
.card.form{padding:18px}
.card-head{display:flex;align-items:center;gap:10px;margin-bottom:14px}
.card-head h3{margin:0;font-size:15px;font-weight:650}
.card-head .meta{font-size:11.5px;color:var(--muted-2);margin-inline-start:auto}
.card-head a{font-size:12px;color:var(--accent-ink);text-decoration:none;margin-inline-start:auto}
.card-head a:hover{text-decoration:underline}
.stack{display:flex;flex-direction:column;gap:10px}
.empty{padding:26px 12px;text-align:center;color:var(--muted-2);font-size:13px;border:1px dashed var(--line-strong);border-radius:var(--radius-sm);background:var(--surface-2)}
.skeleton{height:14px;border-radius:6px;background:linear-gradient(90deg,#efece6,#f7f5f1,#efece6);background-size:200% 100%;animation:shimmer 1.2s infinite}
@keyframes shimmer{0%{background-position:0% 0}100%{background-position:-200% 0}}
.row-item{display:flex;gap:12px;align-items:flex-start;padding:12px;border:1px solid var(--line);border-radius:12px;background:var(--surface);cursor:pointer;transition:border-color .15s,background .15s}
.row-item:hover{border-color:var(--line-strong);background:var(--surface-2)}
.row-item.is-selected{border-color:var(--ink);background:#fcfbf9;box-shadow:inset 0 0 0 1px var(--ink)}
.row-main{min-width:0;flex:1}
.row-title{font-size:14px;font-weight:650;display:flex;gap:8px;align-items:center;flex-wrap:wrap}
.row-sub{font-size:12px;color:var(--muted);margin-top:3px;overflow:hidden;text-overflow:ellipsis;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical}
.row-meta{font-size:11.5px;color:var(--muted-2);margin-top:6px;display:flex;gap:10px;flex-wrap:wrap}
.badge{font-size:11px;border-radius:999px;padding:2px 9px;border:1px solid var(--line);color:var(--muted);background:var(--surface-2);white-space:nowrap}
.badge.ok{color:var(--ok);border-color:#cfe6e2;background:var(--ok-soft)}
.badge.bad{color:var(--bad);border-color:#f3cdc9;background:var(--bad-soft)}
.badge.warn{color:var(--warn);border-color:#f0d6bd;background:var(--warn-soft)}
.badge.info{color:var(--info);border-color:#d5dffb;background:var(--info-soft)}
.badge.ink{color:#fff;background:var(--ink);border-color:var(--ink)}
.prov{font-size:10.5px;border-radius:999px;padding:2px 8px;border:1px solid var(--line-strong);color:var(--muted);white-space:nowrap}
.prov.real{border-color:#cfe6e2;background:var(--ok-soft);color:var(--ok)}
.prov.derived{border-color:#f0d6bd;background:var(--warn-soft);color:var(--warn)}
.prov.unavailable{background:#f2f0ec;color:#6b675f}
.why{font-size:12.5px;color:var(--muted);margin-top:8px;display:grid;grid-template-columns:auto 1fr;gap:4px 10px}
.why b{font-weight:600;color:var(--ink);font-size:12px}
.decision{border:1px solid var(--line);border-inline-start:3px solid var(--line-strong);border-radius:12px;padding:14px 16px;background:var(--surface)}
.decision.sev-high{border-color:#f0c9c5;border-inline-start-color:var(--bad);background:linear-gradient(180deg,#fffdfc,#fdf3f2)}
.decision.sev-wait{border-inline-start-color:var(--warn)}
.decision-head{display:flex;gap:8px;align-items:center;flex-wrap:wrap}
.decision-title{font-weight:650;font-size:14px;line-height:1.4}
.decision-actions{display:flex;gap:8px;margin-top:10px}
.chart-wrap{position:relative;padding-top:14px}
.chart-max{position:absolute;inset-inline-end:0;top:0;font-size:10.5px;color:var(--muted-2);font-variant-numeric:tabular-nums}
.chart-grid{position:absolute;inset:14px 0 0;display:flex;flex-direction:column;justify-content:space-between;pointer-events:none}
.chart-grid i{display:block;border-top:1px dashed #ece8e0}
.chart{display:flex;align-items:flex-end;gap:6px;height:132px;padding-top:6px;position:relative}
.chart .bar{flex:1;min-width:6px;display:flex;align-items:flex-end;gap:2px;height:100%}
.chart .b1{flex:1;background:var(--accent);border-radius:3px 3px 1px 1px;opacity:.92}
.chart .b2{flex:1;background:#c9c2b6;border-radius:3px 3px 1px 1px}
.chart-x{display:flex;gap:6px;margin-top:8px;padding-bottom:2px}
.chart-x span{flex:1;text-align:center;font-size:10px;line-height:1.5;color:var(--muted-2);white-space:nowrap;overflow:visible}
.legend{display:flex;gap:14px;font-size:11.5px;color:var(--muted);margin-top:10px}
.legend i{display:inline-block;width:9px;height:9px;border-radius:3px;margin-inline-end:5px}
.legend .l1 i{background:var(--accent)}.legend .l2 i{background:#c9c2b6}
.agent{display:grid;grid-template-columns:34px 1fr auto;gap:12px;align-items:center;padding:11px 4px;border-bottom:1px solid var(--line)}
.agent:last-child{border-bottom:0}
.agent .avatar{width:34px;height:34px;border-radius:10px;background:#f1ede7;display:grid;place-items:center;font-weight:700;font-size:12px;color:var(--ink)}
.agent .name{font-size:13px;font-weight:600}
.agent .meta{font-size:11.5px;color:var(--muted-2)}
table.tbl{width:100%;border-collapse:collapse}
.tbl th{font-size:11.5px;color:var(--muted);text-align:start;font-weight:600;padding:8px 10px;border-bottom:1px solid var(--line)}
.tbl td{padding:11px 10px;border-bottom:1px solid #f0ede7;font-size:13px;vertical-align:middle}
.tbl tr:last-child td{border-bottom:0}
.tbl tr.clickable{cursor:pointer}
.tbl tr.clickable:hover td{background:var(--surface-2)}
.num{font-variant-numeric:tabular-nums}
.filters{display:flex;gap:8px;flex-wrap:wrap;align-items:center;margin-bottom:12px}
.input,select.input{background:var(--surface);border:1px solid var(--line-strong);border-radius:10px;padding:8px 12px;font-size:13px;color:var(--ink);font-family:inherit}
.input:focus,textarea:focus,select:focus{outline:2px solid #f0d6bd;outline-offset:1px}
.search{min-width:240px;flex:1}
textarea,.form input,.form select{width:100%;padding:9px 11px;border:1px solid var(--line-strong);border-radius:10px;margin:4px 0 12px;background:var(--surface);font-family:inherit;font-size:13px;color:var(--ink)}
textarea{min-height:84px;resize:vertical}
label{font-size:12px;color:var(--muted);font-weight:550}
.detail-grid{display:grid;grid-template-columns:minmax(0,1.6fr) minmax(0,1fr);gap:16px}
.timeline-list{position:relative;padding-inline-start:18px}
.timeline-list:before{content:"";position:absolute;inset-inline-start:5px;top:6px;bottom:6px;width:1px;background:var(--line-strong)}
.tl-item{position:relative;padding:0 0 14px}
.tl-item:before{content:"";position:absolute;inset-inline-start:-17px;top:6px;width:9px;height:9px;border-radius:50%;background:var(--surface);border:2px solid var(--line-strong)}
.tl-item.ok:before{border-color:var(--ok);background:var(--ok)}
.tl-item.bad:before{border-color:var(--bad);background:var(--bad)}
.tl-when{font-size:11px;color:var(--muted-2)}
.tl-what{font-size:13px;font-weight:600}
.tl-detail{font-size:12px;color:var(--muted)}
.report{border:1px solid var(--line);border-radius:12px;padding:14px;background:var(--surface-2)}
.report h4{margin:0 0 6px;font-size:13.5px}
.kv{display:grid;grid-template-columns:max-content minmax(0,1fr);gap:4px 18px;font-size:12.5px;margin-top:8px;align-items:baseline}
.kv dt{color:var(--muted)}
.kv dd{margin:0;font-variant-numeric:tabular-nums;overflow-wrap:anywhere}
details{margin-top:10px}
summary{cursor:pointer;font-size:12px;color:var(--accent-ink);font-weight:550}
pre{white-space:pre-wrap;overflow:auto;background:var(--ink);color:#e9e5de;padding:12px;border-radius:10px;font-size:11px;max-height:420px;margin:8px 0 0}
.err{color:var(--bad);font-size:12.5px}
.muted{color:var(--muted-2);font-size:12px}
.gate{max-width:460px;margin:12vh auto;background:var(--surface);border:1px solid var(--line);border-radius:20px;padding:28px;box-shadow:var(--shadow)}
.gate h2{margin:0 0 4px;font-size:19px}
.gate p{color:var(--muted);font-size:13px;margin:0 0 18px}
.gate .field{display:flex;gap:8px}
.gate input{flex:1}
.mobile-nav{display:none}
.hamburger{display:none}
@media(max-width:1080px){.grid-2,.detail-grid{grid-template-columns:1fr}.grid-3{grid-template-columns:1fr 1fr}.situation{grid-template-columns:1fr}.brief-grid{grid-template-columns:1fr}.brief-cols{grid-template-columns:1fr}.brief-headline{font-size:19px}}
@media(max-width:880px){
  .app{grid-template-columns:1fr}
  .sidebar{position:fixed;inset-block:0;inset-inline-start:0;width:270px;transform:translateX(-105%);transition:transform .22s ease}
  html[dir="rtl"] .sidebar{transform:translateX(105%)}
  .sidebar.is-open{transform:none!important}
  .hamburger{display:inline-flex;align-items:center;justify-content:center;width:36px;height:36px;border-radius:10px;border:1px solid var(--line-strong);background:var(--surface);cursor:pointer}
  .topbar{padding:12px 16px;gap:10px}
  .topbar h2{font-size:15px}
  .content{padding:16px 14px 72px}
  .grid-kpi{grid-template-columns:1fr 1fr;gap:10px}
  .kpi .value{font-size:24px}
  .grid-3{grid-template-columns:1fr}
  .top-actions .pill{display:none}
  .topbar .sub{display:none}
  .mobile-nav{display:flex;position:fixed;inset-inline:0;bottom:0;background:var(--surface);border-top:1px solid var(--line);z-index:35;padding:6px 4px calc(6px + env(safe-area-inset-bottom))}
  .mobile-nav button{flex:1;border:0;background:none;display:flex;flex-direction:column;align-items:center;gap:3px;font-size:10px;color:var(--muted);padding:4px 0}
  .mobile-nav button.is-active{color:var(--ink)}
  .mobile-nav svg{width:18px;height:18px}
}
`;
