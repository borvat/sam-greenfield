import {commandCenterStrings, t} from "./ui.i18n";

const icon = (path: string) =>
  `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${path}</svg>`;

const ICONS = {
  overview: icon('<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>'),
  decisions: icon('<path d="M12 3v4"/><path d="M12 17v4"/><circle cx="12" cy="12" r="4"/><path d="M4 12h1"/><path d="M19 12h1"/>'),
  goals: icon('<path d="M4 6h16"/><path d="M4 12h10"/><path d="M4 18h7"/><circle cx="18" cy="15" r="3"/>'),
  agents: icon('<circle cx="9" cy="8" r="3"/><path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6"/><path d="M17 11a2.5 2.5 0 1 0 0-5"/><path d="M21 20c0-2.4-1.3-4.4-3.2-5.4"/>'),
  reports: icon('<path d="M6 3h8l4 4v14H6z"/><path d="M14 3v5h5"/><path d="M9 13h6"/><path d="M9 17h4"/>'),
  finance: icon('<path d="M4 19V5"/><path d="M4 19h16"/><rect x="7" y="11" width="3" height="5"/><rect x="12" y="7" width="3" height="9"/><rect x="17" y="13" width="3" height="3"/>')
};

const navItem = (view: string, key: keyof typeof commandCenterStrings["ar"], badge = "") =>
  `<button class="nav-item" data-view="${view}" type="button">${(ICONS as any)[view]}<span data-i18n="${key}">${t("ar", key)}</span>${badge ? `<span class="count" data-badge="${view}" hidden></span>` : ""}</button>`;

export function renderShell(build: string): string {
  return `<div class="shell">
<div class="app">
  <aside class="sidebar" id="sidebar">
    <div class="brand"><div class="mark">S</div><div><h1 data-i18n="brand.name">SAM</h1><span data-i18n="brand.sub">${t("ar", "brand.sub")}</span></div></div>
    <nav class="nav" id="nav">
      ${navItem("overview", "nav.overview")}
      ${navItem("decisions", "nav.decisions", "1")}
      ${navItem("goals", "nav.goals")}
      ${navItem("agents", "nav.agents")}
      ${navItem("reports", "nav.reports")}
      ${navItem("finance", "nav.finance")}
    </nav>
    <div class="side-foot">
      <span data-i18n="top.sub">${t("ar", "top.sub")}</span>
      <small title="${build}">Build ${build.slice(0, 7)}</small>
    </div>
  </aside>

  <div class="main">
    <header class="topbar">
      <button class="hamburger" id="menuBtn" type="button" aria-label="menu">${icon('<path d="M4 7h16"/><path d="M4 12h16"/><path d="M4 17h16"/>')}</button>
      <div><h2 id="pageTitle" data-i18n="nav.overview">${t("ar", "nav.overview")}</h2><div class="sub" id="pageSub" data-i18n="top.sub">${t("ar", "top.sub")}</div></div>
      <div class="top-actions">
        <div class="lang" role="group" aria-label="language"><button type="button" data-lang="ar">ع</button><button type="button" data-lang="en">EN</button></div>
        <div class="pill" id="status">AUTH REQUIRED</div>
        <button class="btn small" id="reloadBtn" type="button" data-i18n="misc.reload">${t("ar", "misc.reload")}</button>
      </div>
    </header>

    <main class="content">
      <div id="gateWrap">
        <div class="gate" id="authPanel">
          <h2 data-i18n="gate.title">${t("ar", "gate.title")}</h2>
          <p data-i18n="gate.body">${t("ar", "gate.body")}</p>
          <div class="field">
            <input class="input" id="bearerToken" type="password" autocomplete="off" data-i18n-ph="gate.field" placeholder="${t("ar", "gate.field")}"/>
            <button class="btn primary" type="button" onclick="connect()" data-i18n="gate.connect">${t("ar", "gate.connect")}</button>
          </div>
          <div id="authError" class="err" role="status"></div>
        </div>
      </div>

      <div id="dashboard" hidden>
        <section class="view is-active" id="view-overview">
          <div class="situation">
            <div class="sit">
              <div class="sit-label" data-i18n="sit.what">${t("ar", "sit.what")}</div>
              <div class="sit-body" id="sit-what"></div>
            </div>
            <div class="sit accent">
              <div class="sit-label" data-i18n="sit.focus">${t("ar", "sit.focus")}</div>
              <div class="sit-body" id="sit-focus"></div>
              <div class="sit-foot" id="sit-focus-action"></div>
            </div>
            <div class="sit">
              <div class="sit-label" data-i18n="sit.next">${t("ar", "sit.next")}</div>
              <div class="sit-body" id="sit-next"></div>
            </div>
          </div>
          <div class="grid-kpi" id="metrics"></div>
          <div class="grid-2">
            <div class="stack">
              <div class="card">
                <div class="card-head"><h3 data-i18n="sec.decisions">${t("ar", "sec.decisions")}</h3><span class="prov real" data-i18n="prov.real">${t("ar", "prov.real")}</span><a href="#/decisions" data-nav="decisions" data-i18n="nav.decisions">${t("ar", "nav.decisions")}</a></div>
                <div class="stack" id="overview-decisions"></div>
              </div>
              <div class="card">
                <div class="card-head"><h3 data-i18n="sec.goals">${t("ar", "sec.goals")}</h3><span class="prov real" data-i18n="prov.real">${t("ar", "prov.real")}</span><a href="#/goals" data-nav="goals" data-i18n="nav.goals">${t("ar", "nav.goals")}</a></div>
                <div class="stack" id="goals"></div>
              </div>
            </div>
            <div class="stack">
              <div class="card">
                <div class="card-head"><h3 data-i18n="sec.trend">${t("ar", "sec.trend")}</h3><span class="prov derived" data-i18n="prov.derived">${t("ar", "prov.derived")}</span></div>
                <div id="trend"></div>
              </div>
              <div class="card">
                <div class="card-head"><h3 data-i18n="sec.agents">${t("ar", "sec.agents")}</h3><span class="prov real" data-i18n="prov.real">${t("ar", "prov.real")}</span></div>
                <div id="agents-mini"></div>
              </div>
              <div class="card">
                <div class="card-head"><h3 data-i18n="sec.alerts">${t("ar", "sec.alerts")}</h3><span class="prov derived" data-i18n="prov.derived">${t("ar", "prov.derived")}</span></div>
                <div id="alerts"></div>
              </div>
            </div>
          </div>
          <div class="card" style="margin-top:16px">
            <div class="card-head"><h3 data-i18n="sec.reports">${t("ar", "sec.reports")}</h3><span class="prov real" data-i18n="prov.real">${t("ar", "prov.real")}</span><a href="#/reports" data-nav="reports" data-i18n="nav.reports">${t("ar", "nav.reports")}</a></div>
            <div class="stack" id="latest-reports"></div>
          </div>
        </section>

        <section class="view" id="view-decisions">
          <p class="muted" data-i18n="view.decisions.sub">${t("ar", "view.decisions.sub")}</p>
          <div class="stack" id="decisions-list" style="margin-top:12px"></div>
          <div class="grid-2" style="margin-top:16px">
            <div class="card">
              <div class="card-head"><h3 data-i18n="sec.reports">${t("ar", "sec.reports")}</h3></div>
              <div class="stack" id="decisions-reports"></div>
            </div>
            <div class="stack">
              <div class="card form">
                <div class="card-head"><h3>ذاكرة المالك المعتمدة</h3></div>
                <label for="memory-query">مهمة لاسترجاع القرارات المتعلقة بها</label>
                <input id="memory-query" placeholder="تحضير عروض الشراء"/>
                <button class="btn secondary small" type="button" onclick="recallOwnerMemory()">استرجاع القرارات</button>
                <pre id="owner-memory-results">أدخل مهمة لعرض القرارات المعتمدة.</pre>
                <div data-owner-mutation>
                  <label for="memory-statement">قرار المالك</label><textarea id="memory-statement"></textarea>
                  <label for="memory-context">كلمة سياق المهمة</label><input id="memory-context" placeholder="procurement"/>
                  <label for="memory-source">مرجع المصدر</label><input id="memory-source" value="command-center-owner-entry"/>
                  <label for="memory-date">تاريخ ووقت المصدر (UTC)</label><input id="memory-date" type="text" placeholder="2026-10-28T10:00:00.000Z"/>
                  <label><input id="memory-approved" type="checkbox" style="width:auto"/> أعتمد هذا القرار صراحةً لهذه الشركة.</label>
                  <button class="btn primary small" type="button" onclick="saveOwnerMemory()">حفظ القرار</button>
                  <div id="memory-error" class="err" role="status"></div>
                </div>
              </div>
              <div class="card">
                <div class="card-head"><h3>الإشعارات الداخلية</h3></div>
                <p class="muted">استطلاع داخلي فقط، وليس دليلاً على وصول خارجي.</p>
                <button data-owner-mutation class="btn secondary small" type="button" onclick="pollInternalNotifications()">تمكين واستطلاع</button>
                <div id="notifications-results" style="margin-top:10px">اتصل لعرض الإشعارات الداخلية.</div>
                <div id="notifications-error" class="err" role="status"></div>
              </div>
            </div>
          </div>
        </section>

        <section class="view" id="view-goals">
          <p class="muted" data-i18n="view.goals.sub">${t("ar", "view.goals.sub")}</p>
          <div class="filters" style="margin-top:12px">
            <input class="input search" id="goalSearch" data-i18n-ph="filter.search" placeholder="${t("ar", "filter.search")}"/>
            <select class="input" id="goalFilter">
              <option value="all" data-i18n="filter.all">${t("ar", "filter.all")}</option>
              <option value="active" data-i18n="filter.active">${t("ar", "filter.active")}</option>
              <option value="waiting" data-i18n="filter.waiting">${t("ar", "filter.waiting")}</option>
              <option value="completed" data-i18n="filter.completed">${t("ar", "filter.completed")}</option>
              <option value="failed" data-i18n="filter.failed">${t("ar", "filter.failed")}</option>
            </select>
            <button class="btn" type="button" data-toggle-create="1" data-i18n="goal.new">${t("ar", "goal.new")}</button>
          </div>
          <div class="stack" id="goal-list"></div>
          <div id="create-wrap" hidden style="margin-top:16px">
            <div class="card form">
              <div class="card-head"><h3 data-i18n="goal.new.title">${t("ar", "goal.new.title")}</h3></div>
              <label for="objective" data-i18n="goal.objective">${t("ar", "goal.objective")}</label>
              <textarea id="objective" data-i18n-ph="goal.objective.ph" placeholder="Example: Review current bol sales and accounting differences and produce a verified owner brief."></textarea>
              <label for="domain" data-i18n="goal.domain">${t("ar", "goal.domain")}</label>
              <input id="domain" value="owner_command" placeholder="owner_command"/>
              <label for="authority" data-i18n="goal.authority">${t("ar", "goal.authority")}</label>
              <select id="authority"><option>YELLOW</option><option>GREEN</option></select>
              <label for="priority" data-i18n="goal.priority">${t("ar", "goal.priority")}</label>
              <input id="priority" type="number" min="0" max="100" value="70"/>
              <label for="acceptance" data-i18n="goal.contract">${t("ar", "goal.contract")}</label>
              <textarea id="acceptance" placeholder='{"version":1,"constraints":[{"capabilityId":"local.calculate","params":{"operation":"max"},"result":{"field":"value","equals":8}}]}'></textarea>
              <button class="btn primary" type="button" onclick="createGoal()" data-owner-mutation data-i18n="goal.create">${t("ar", "goal.create")}</button>
              <div id="formError" class="err" role="status"></div>
            </div>
          </div>
        </section>

        <section class="view" id="view-agents">
          <p class="muted" data-i18n="view.agents.sub">${t("ar", "view.agents.sub")}</p>
          <div class="card" style="margin-top:12px">
            <table class="tbl"><thead><tr>
              <th data-i18n="agent.actor">${t("ar", "agent.actor")}</th>
              <th data-i18n="agent.state">${t("ar", "agent.state")}</th>
              <th data-i18n="agent.executions">${t("ar", "agent.executions")}</th>
              <th data-i18n="agent.verified">${t("ar", "agent.verified")}</th>
              <th data-i18n="agent.failed">${t("ar", "agent.failed")}</th>
              <th data-i18n="agent.last">${t("ar", "agent.last")}</th>
            </tr></thead><tbody id="agents-body"></tbody></table>
          </div>
        </section>

        <section class="view" id="view-reports">
          <p class="muted" data-i18n="view.reports.sub">${t("ar", "view.reports.sub")}</p>
          <div class="stack" id="reports-list" style="margin-top:12px"></div>
        </section>

        <section class="view" id="view-finance">
          <p class="muted" data-i18n="view.finance.sub">${t("ar", "view.finance.sub")}</p>
          <div class="grid-2" style="margin-top:12px">
            <div class="card" id="finance-brief"></div>
            <div class="card" id="finance-usage"></div>
          </div>
          <div class="card" id="finance-history" style="margin-top:16px"></div>
        </section>

        <section class="view" id="view-goal">
          <button class="btn ghost small" type="button" data-nav="goals">${icon('<path d="M15 18l-6-6 6-6"/>')} <span data-i18n="nav.goals">${t("ar", "nav.goals")}</span></button>
          <div class="card" id="goal-detail-head" style="margin-top:10px"></div>
          <div class="detail-grid" style="margin-top:16px">
            <div class="card" id="timeline-section">
              <div class="card-head"><h3 data-i18n="timeline.title">${t("ar", "timeline.title")}</h3><span class="muted" id="timeline-status" data-i18n="misc.savedOnly">${t("ar", "misc.savedOnly")}</span></div>
              <div id="report-result"></div>
              <details id="raw-timeline" hidden><summary data-i18n="report.raw">${t("ar", "report.raw")}</summary><pre id="timeline">Select a goal.</pre></details>
            </div>
            <div class="card" id="goal-evidence"></div>
          </div>
        </section>
      </div>
    </main>
  </div>
</div>

<nav class="mobile-nav" id="mobileNav" aria-label="sections">
  <button type="button" data-view="overview">${ICONS.overview}<span data-i18n="nav.overview">${t("ar", "nav.overview")}</span></button>
  <button type="button" data-view="decisions">${ICONS.decisions}<span data-i18n="nav.decisions">${t("ar", "nav.decisions")}</span></button>
  <button type="button" data-view="goals">${ICONS.goals}<span data-i18n="nav.goals">${t("ar", "nav.goals")}</span></button>
  <button type="button" data-view="agents">${ICONS.agents}<span data-i18n="nav.agents">${t("ar", "nav.agents")}</span></button>
  <button type="button" data-view="finance">${ICONS.finance}<span data-i18n="nav.finance">${t("ar", "nav.finance")}</span></button>
</nav>
</div>`;
}
