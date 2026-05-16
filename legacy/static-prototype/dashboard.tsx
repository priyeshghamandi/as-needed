// Hero dashboard mockup — feels like a real operations console
(() => {
const { useState: useStateD, useEffect: useEffectD, useRef: useRefD, useMemo: useMemoD } = React;

function HeroDashboard() {
  // Tiny live timer to add subtle motion
  const [tick, setTick] = useStateD(0);
  useEffectD(() => {
    const id = setInterval(() => setTick(t => t + 1), 2000);
    return () => clearInterval(id);
  }, []);

  const requests = [
    { id: "REQ-2841", facility: "Mercy Mt. Sinai · ICU",     shift: "Tonight · 19:00–07:00", role: "RN",  need: 3, filled: 2, urgency: "critical" },
    { id: "REQ-2840", facility: "Bayview Care · Med-Surg",    shift: "Tomorrow · 07:00–19:00", role: "RN",  need: 4, filled: 4, urgency: "filled"   },
    { id: "REQ-2839", facility: "Pinegrove SNF · Floor 2",   shift: "Tomorrow · 23:00–07:00", role: "CNA", need: 2, filled: 1, urgency: "warning"  },
    { id: "REQ-2838", facility: "Northridge Hospital · ER",   shift: "Sat · 07:00–19:00",      role: "RN",  need: 5, filled: 3, urgency: "open"     },
  ];

  const rns = [
    { initials: "AM", name: "A. Martinez", role: "RN · ICU",       status: "Available",  miles: "3.2 mi", tone: "teal",   dot: "green" },
    { initials: "JR", name: "J. Reyes",    role: "RN · Med-Surg",  status: "On shift",   miles: "—",      tone: "sky",    dot: "teal"  },
    { initials: "KP", name: "K. Park",     role: "CNA",            status: "Available",  miles: "5.8 mi", tone: "amber",  dot: "green" },
    { initials: "DO", name: "D. Okafor",   role: "RN · ER",        status: "Tentative",  miles: "1.4 mi", tone: "rose",   dot: "amber" },
    { initials: "SN", name: "S. Nguyen",   role: "RN · ICU",       status: "Available",  miles: "7.1 mi", tone: "violet", dot: "green" },
  ];

  // Fulfillment numbers — drift over time
  const fillRate = 92 + (tick % 3); // 92–94
  const openCount = 18 - (tick % 4);
  const ttFill = (11 + (tick % 5)).toFixed(0); // minutes
  const recovered = 7;

  return (
    <div className="relative">
      {/* Soft glow underlay */}
      <div className="pointer-events-none absolute -inset-12 bg-gradient-to-br from-teal-200/40 via-paper to-paper rounded-[40px] blur-2xl" />

      <div className="relative rounded-2xl bg-white shadow-deep ring-1 ring-ink-900/5 overflow-hidden">
        {/* App chrome */}
        <div className="flex items-center gap-2 px-4 h-9 border-b border-ink-100 bg-ink-50/60">
          <div className="flex gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-ink-200" />
            <span className="w-2.5 h-2.5 rounded-full bg-ink-200" />
            <span className="w-2.5 h-2.5 rounded-full bg-ink-200" />
          </div>
          <div className="ml-3 flex items-center gap-2 text-[11px] font-mono text-ink-500">
            <Icon name="lock" className="w-3 h-3" />
            <span>app.asneeded.health / operations / live</span>
          </div>
          <div className="ml-auto flex items-center gap-3 text-[11px] font-mono text-ink-500">
            <span className="inline-flex items-center gap-1.5"><Dot tone="green" pulse /> live</span>
            <span>{new Date().toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}</span>
          </div>
        </div>

        {/* Body grid */}
        <div className="grid grid-cols-12 grid-rows-[auto_auto] gap-px bg-ink-100">
          {/* Sidebar */}
          <aside className="col-span-2 row-span-2 bg-white p-3">
            <div className="flex items-center gap-2 px-1 py-1.5 mb-3">
              <span className="w-6 h-6 rounded bg-ink-900 text-paper inline-flex items-center justify-center font-mono text-[11px]">A</span>
              <div className="leading-tight">
                <div className="text-[12px] font-semibold tracking-tight">Apex Staffing</div>
                <div className="text-[10px] font-mono text-ink-500">Region · Pacific</div>
              </div>
            </div>
            <NavItem icon="layout-dashboard" label="Operations" active />
            <NavItem icon="inbox" label="Requests" badge="18" />
            <NavItem icon="users" label="Workforce" />
            <NavItem icon="calendar-clock" label="Schedule" />
            <NavItem icon="shield-check" label="Compliance" badge="3" tone="amber" />
            <NavItem icon="building-2" label="Facilities" />
            <NavItem icon="message-square" label="Comms" />
            <NavItem icon="bar-chart-3" label="Reports" />

            <div className="mt-4 pt-3 border-t border-ink-100">
              <div className="text-[10px] font-mono uppercase tracking-wider text-ink-400 px-1 mb-1.5">Coordinators</div>
              <CoordItem initials="LM" name="L. Mahoney" stat="6 open" tone="teal" />
              <CoordItem initials="RT" name="R. Tan"      stat="2 open" tone="amber" />
              <CoordItem initials="EV" name="E. Vargas"   stat="0 open" tone="ink" />
            </div>
          </aside>

          {/* Top KPI strip */}
          <section className="col-span-10 bg-white px-5 py-4">
            <div className="flex items-center justify-between mb-3">
              <div>
                <div className="text-[11px] font-mono uppercase tracking-wider text-ink-500">Today · Operations</div>
                <h3 className="text-[18px] font-semibold tracking-tight">Live staffing board</h3>
              </div>
              <div className="flex items-center gap-2">
                <Badge tone="teal"><Dot tone="green" pulse /> 14 coordinators online</Badge>
                <button className="h-8 px-3 rounded-full border border-ink-200 text-[12px] font-medium hover:bg-ink-50 inline-flex items-center gap-1.5">
                  <Icon name="filter" className="w-3.5 h-3.5" /> Filter
                </button>
                <button className="h-8 w-8 rounded-full border border-ink-200 inline-flex items-center justify-center hover:bg-ink-50">
                  <Icon name="more-horizontal" className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-3">
              <Kpi label="Open requests" value={openCount} delta="−4 vs avg" tone="teal" icon="inbox" sub="across 9 facilities" />
              <Kpi label="Fill rate · 24h" value={`${fillRate}%`} delta="+6 pts WoW" tone="green" icon="check-circle-2" sub="goal 88%" />
              <Kpi label="Avg time to fill" value={`${ttFill}m`} delta="−42% vs phone" tone="teal" icon="timer" sub="median, this week" />
              <Kpi label="Recoveries · today" value={recovered} delta="from cancellations" tone="amber" icon="rotate-ccw" sub="auto-rebooked" />
            </div>
          </section>

          {/* Requests table */}
          <section className="col-span-7 bg-white px-5 py-4 border-t border-ink-100">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <h4 className="text-[13px] font-semibold tracking-tight">Open staffing requests</h4>
                <Badge>4 of 18</Badge>
              </div>
              <div className="flex items-center gap-1 text-[11px] font-mono text-ink-500">
                <button className="px-2 py-1 rounded bg-ink-100 text-ink-800">All</button>
                <button className="px-2 py-1 rounded hover:bg-ink-50">Critical</button>
                <button className="px-2 py-1 rounded hover:bg-ink-50">Today</button>
                <button className="px-2 py-1 rounded hover:bg-ink-50">Tomorrow</button>
              </div>
            </div>

            <div className="rounded-lg border border-ink-100 overflow-hidden">
              <div className="grid grid-cols-12 px-3 py-2 bg-ink-50/60 text-[10px] font-mono uppercase tracking-wider text-ink-500">
                <div className="col-span-4">Facility · unit</div>
                <div className="col-span-3">Shift</div>
                <div className="col-span-1">Role</div>
                <div className="col-span-3">Fulfillment</div>
                <div className="col-span-1 text-right">State</div>
              </div>
              {requests.map((r, i) => (
                <RequestRow key={r.id} r={r} odd={i % 2 === 1} highlight={i === 0} />
              ))}
            </div>

            <div className="mt-3 flex items-center justify-between">
              <div className="flex items-center gap-2 text-[11px] font-mono text-ink-500">
                <Icon name="activity" className="w-3.5 h-3.5 text-teal-700" />
                <span>3 requests auto-matched in last 5m</span>
              </div>
              <a className="text-[11px] font-mono text-teal-700 hover:underline inline-flex items-center gap-1">
                Open queue <Icon name="arrow-up-right" className="w-3 h-3" />
              </a>
            </div>
          </section>

          {/* Workforce availability */}
          <section className="col-span-5 bg-white px-5 py-4 border-t border-l border-ink-100">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <h4 className="text-[13px] font-semibold tracking-tight">Available now</h4>
                <Badge tone="green"><Dot tone="green" pulse /> {rns.filter(r => r.dot === "green").length} live</Badge>
              </div>
              <span className="text-[11px] font-mono text-ink-500">w/in 10 mi</span>
            </div>

            <ul className="divide-y divide-ink-100 rounded-lg border border-ink-100">
              {rns.map((p, i) => (
                <li key={i} className="px-3 py-2 flex items-center gap-3">
                  <Avatar initials={p.initials} tone={p.tone} size={26} />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline gap-2">
                      <div className="text-[12px] font-medium tracking-tight truncate">{p.name}</div>
                      <div className="text-[10px] font-mono text-ink-500 truncate">{p.role}</div>
                    </div>
                    <div className="flex items-center gap-2 text-[10px] font-mono text-ink-500">
                      <Dot tone={p.dot} pulse={p.dot === "green"} />
                      <span>{p.status}</span>
                      <span>·</span>
                      <span>{p.miles}</span>
                      <span>·</span>
                      <Icon name="shield-check" className="w-3 h-3 text-teal-700" />
                      <span>credentials current</span>
                    </div>
                  </div>
                  <button className="text-[11px] font-mono text-teal-700 hover:bg-teal-50 px-2 py-1 rounded">Offer →</button>
                </li>
              ))}
            </ul>
          </section>

          {/* Coordination flow / compliance / activity */}
          <section className="col-span-7 bg-white px-5 py-4 border-t border-ink-100">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-[13px] font-semibold tracking-tight">Coordination flow</h4>
              <span className="text-[11px] font-mono text-ink-500">REQ-2841 · ICU · Mercy Mt. Sinai</span>
            </div>
            <CoordFlow />
          </section>

          <aside className="col-span-3 bg-white px-5 py-4 border-t border-l border-ink-100">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-[13px] font-semibold tracking-tight">Compliance</h4>
              <Badge tone="amber">3 due</Badge>
            </div>
            <ComplianceItem name="A. Martinez · BLS"     status="renews in 8d"  tone="amber" />
            <ComplianceItem name="J. Reyes · TB"          status="renews in 21d" tone="teal" />
            <ComplianceItem name="K. Park · I-9"          status="all current"   tone="green" />
            <ComplianceItem name="D. Okafor · State Lic." status="expiring 3d"   tone="red" />
          </aside>
        </div>
      </div>

      {/* Floating chips: connection between roles */}
      <FloatingChip className="absolute -top-3 left-10 hidden md:flex">
        <Icon name="building-2" className="w-3.5 h-3.5 text-teal-700" /> Facility submitted REQ-2841
      </FloatingChip>
      <FloatingChip className="absolute -bottom-3 right-12 hidden md:flex">
        <Icon name="user-round-check" className="w-3.5 h-3.5 text-emerald-700" /> A. Martinez accepted shift · 12s ago
      </FloatingChip>
    </div>
  );
}

function FloatingChip({ children, className = "" }) {
  return (
    <div className={`flex items-center gap-2 bg-white shadow-lifted rounded-full pl-2 pr-3 h-8 text-[11px] font-mono ${className}`}>
      {children}
    </div>
  );
}

function NavItem({ icon, label, active = false, badge, tone = "teal" }) {
  return (
    <button
      className={`w-full flex items-center gap-2 px-2 h-8 rounded-md text-[12px] tracking-tight ${active ? "bg-ink-900 text-paper" : "text-ink-700 hover:bg-ink-50"}`}
    >
      <Icon name={icon} className="w-4 h-4" />
      <span className="flex-1 text-left">{label}</span>
      {badge && (
        <span className={`text-[10px] font-mono px-1.5 h-4 inline-flex items-center rounded ${tone === "amber" ? "bg-amber-100 text-amber-800" : active ? "bg-paper/10 text-paper" : "bg-ink-100 text-ink-700"}`}>{badge}</span>
      )}
    </button>
  );
}

function CoordItem({ initials, name, stat, tone }) {
  return (
    <div className="flex items-center gap-2 px-1 py-1.5 rounded hover:bg-ink-50">
      <Avatar initials={initials} tone={tone} size={20} />
      <div className="text-[11px] tracking-tight flex-1 truncate">{name}</div>
      <div className="text-[10px] font-mono text-ink-500">{stat}</div>
    </div>
  );
}

function Kpi({ label, value, delta, sub, tone, icon }) {
  const tones = {
    teal: "text-teal-700",
    green: "text-emerald-700",
    amber: "text-amber-700",
  };
  return (
    <div className="rounded-lg border border-ink-100 bg-paper/40 p-3">
      <div className="flex items-center justify-between">
        <div className="text-[11px] font-mono uppercase tracking-wider text-ink-500">{label}</div>
        <Icon name={icon} className={`w-4 h-4 ${tones[tone]}`} />
      </div>
      <div className="flex items-baseline gap-2 mt-1">
        <div className="text-[24px] font-semibold tracking-tight tabular-nums">{value}</div>
        <div className={`text-[11px] font-mono ${tones[tone]}`}>{delta}</div>
      </div>
      <div className="text-[10px] font-mono text-ink-500 mt-0.5">{sub}</div>
    </div>
  );
}

function RequestRow({ r, odd, highlight }) {
  const pct = Math.round((r.filled / r.need) * 100);
  const tone = r.urgency === "critical" ? "red" : r.urgency === "filled" ? "green" : r.urgency === "warning" ? "amber" : "teal";
  const stateLabel = { critical: "Critical", filled: "Filled", warning: "At risk", open: "Open" }[r.urgency];
  return (
    <div className={`grid grid-cols-12 items-center px-3 py-2.5 text-[12px] ${odd ? "bg-paper/30" : "bg-white"} ${highlight ? "ring-1 ring-rose-200/60" : ""}`}>
      <div className="col-span-4 flex items-center gap-2 min-w-0">
        <span className="text-[10px] font-mono text-ink-400">{r.id}</span>
        <span className="font-medium tracking-tight truncate">{r.facility}</span>
      </div>
      <div className="col-span-3 font-mono text-[11px] text-ink-600">{r.shift}</div>
      <div className="col-span-1"><Badge>{r.role}</Badge></div>
      <div className="col-span-3 flex items-center gap-2">
        <div className="flex-1 h-1.5 bg-ink-100 rounded-full overflow-hidden">
          <div
            className={`h-full ${tone === "green" ? "bg-emerald-500" : tone === "red" ? "bg-rose-500" : tone === "amber" ? "bg-amber-500" : "bg-teal-500"}`}
            style={{ width: `${pct}%` }}
          />
        </div>
        <span className="font-mono text-[11px] tabular-nums text-ink-700 w-10 text-right">{r.filled}/{r.need}</span>
      </div>
      <div className="col-span-1 text-right">
        <Badge tone={tone}>{tone === "red" && <Dot tone="red" pulse />}{stateLabel}</Badge>
      </div>
    </div>
  );
}

function CoordFlow() {
  const steps = [
    { label: "Request received",   sub: "Facility · 18:42",  icon: "building-2",       tone: "teal",  done: true },
    { label: "Auto-matched 7 RNs", sub: "Compliance ✓",       icon: "wand-2",           tone: "teal",  done: true },
    { label: "Offers sent",        sub: "5 push · 2 SMS",     icon: "send",             tone: "teal",  done: true },
    { label: "Accepted",           sub: "A. Martinez · 18:54",icon: "user-round-check", tone: "green", done: true, active: true },
    { label: "Confirmed",          sub: "ETA 19:00",          icon: "calendar-check",   tone: "ink",   done: false },
  ];
  return (
    <div className="relative">
      <div className="absolute left-3 top-3 right-3 h-px border-t border-dashed border-ink-200" />
      <ol className="relative grid grid-cols-5 gap-2">
        {steps.map((s, i) => (
          <li key={i} className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className={`w-6 h-6 rounded-full inline-flex items-center justify-center border ${
                s.done ? "bg-teal-700 border-teal-700 text-white" : "bg-white border-ink-200 text-ink-500"
              } ${s.active ? "ring-4 ring-teal-100" : ""}`}>
                <Icon name={s.icon} className="w-3 h-3" />
              </span>
              {i < steps.length - 1 && <span className={`flex-1 h-px ${s.done && steps[i+1].done ? "bg-teal-700" : "bg-ink-200"}`} />}
            </div>
            <div className="mt-2 text-[12px] font-medium tracking-tight">{s.label}</div>
            <div className="text-[10px] font-mono text-ink-500">{s.sub}</div>
          </li>
        ))}
      </ol>
    </div>
  );
}

function ComplianceItem({ name, status, tone }) {
  const tones = {
    amber: "text-amber-700",
    teal:  "text-teal-700",
    green: "text-emerald-700",
    red:   "text-rose-700",
  };
  return (
    <div className="flex items-center gap-2 py-1.5 border-b last:border-0 border-ink-100">
      <Icon name="shield-check" className={`w-3.5 h-3.5 ${tones[tone]}`} />
      <div className="flex-1 min-w-0">
        <div className="text-[12px] tracking-tight truncate">{name}</div>
        <div className="text-[10px] font-mono text-ink-500">{status}</div>
      </div>
      <Dot tone={tone === "red" ? "red" : tone === "amber" ? "amber" : tone === "green" ? "green" : "teal"} pulse={tone === "red"} />
    </div>
  );
}

window.HeroDashboard = HeroDashboard;
})();
