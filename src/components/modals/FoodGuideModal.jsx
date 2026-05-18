import { X, Printer, UtensilsCrossed, CalendarX, CalendarOff, CalendarCheck, CalendarRange, Bell, BarChart2, Lock, Info } from "lucide-react";
import { useEscapeKey } from "../../hooks/useEscapeKey";

/* ── small helpers ── */
const Section = ({ title, icon: Icon, color = "indigo", children }) => {
  const colors = {
    indigo: "border-indigo-200 bg-indigo-50",
    amber:  "border-amber-200  bg-amber-50",
    red:    "border-red-200    bg-red-50",
    green:  "border-green-200  bg-green-50",
    violet: "border-violet-200 bg-violet-50",
    teal:   "border-teal-200   bg-teal-50",
    slate:  "border-slate-200  bg-slate-50",
  };
  const iconColors = {
    indigo: "text-indigo-600", amber: "text-amber-600", red: "text-red-600",
    green:  "text-green-600",  violet: "text-violet-600", teal: "text-teal-600",
    slate:  "text-slate-500",
  };
  return (
    <div className="mb-6 break-inside-avoid">
      <div className={`flex items-center gap-2 px-3 py-2 rounded-t-xl border-x border-t ${colors[color]}`}>
        {Icon && <Icon size={15} className={iconColors[color]} />}
        <h2 className="font-black text-slate-800 text-[13px] tracking-tight">{title}</h2>
      </div>
      <div className="border border-slate-200 rounded-b-xl px-4 py-3 space-y-2 bg-white">
        {children}
      </div>
    </div>
  );
};

const Row = ({ label, children, highlight }) => (
  <div className={`flex gap-3 py-1.5 border-b border-slate-50 last:border-0 ${highlight ? "bg-amber-50/50 -mx-4 px-4 rounded" : ""}`}>
    <div className="w-36 flex-shrink-0 text-[11px] font-black text-slate-500 pt-0.5">{label}</div>
    <div className="flex-1 text-[11px] text-slate-700 leading-relaxed">{children}</div>
  </div>
);

const Badge = ({ label, cls }) => (
  <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-black ${cls}`}>{label}</span>
);

const Btn = ({ icon: Icon, label, cls }) => (
  <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border text-[10px] font-black ${cls}`}>
    {Icon && <Icon size={11} />} {label}
  </span>
);

const Note = ({ children }) => (
  <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 mt-1">
    <Info size={13} className="text-amber-500 flex-shrink-0 mt-0.5" />
    <p className="text-[11px] text-amber-800 leading-relaxed">{children}</p>
  </div>
);

/* ═══════════════════════════════════════════════════════════════════════════ */

export default function FoodGuideModal({ onClose }) {
  useEscapeKey(onClose);

  const handlePrint = () => {
    const win = window.open("", "_blank", "width=900,height=700");
    if (!win) return;
    const css = `
      *{box-sizing:border-box;margin:0;padding:0}
      body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;font-size:11.5px;color:#1e293b;padding:14mm 18mm;background:#fff}
      .hdr{display:flex;align-items:center;gap:12px;border-bottom:3px solid #f97316;padding-bottom:10px;margin-bottom:16px}
      .hdr h1{font-size:18px;font-weight:900;color:#1e293b}
      .hdr p{color:#64748b;font-size:10.5px;margin-top:2px}
      section{margin-bottom:14px;break-inside:avoid;page-break-inside:avoid}
      .sh{background:#f8fafc;border:1px solid #e2e8f0;border-bottom:none;padding:6px 11px;border-radius:5px 5px 0 0;font-weight:900;font-size:11.5px;color:#334155}
      .sb{border:1px solid #e2e8f0;border-radius:0 0 5px 5px;padding:8px 12px;background:#fff}
      .row{display:grid;grid-template-columns:128px 1fr;gap:8px;padding:4px 0;border-bottom:1px solid #f1f5f9;align-items:start}
      .row:last-child{border:none}
      .lbl{font-weight:700;color:#64748b;font-size:10.5px;padding-top:1px}
      .val{color:#374151;line-height:1.55;font-size:11px}
      .hl{background:#fffbeb}
      .badge{display:inline-block;padding:1px 7px;border-radius:999px;font-size:9.5px;font-weight:900;margin:0 2px;vertical-align:middle}
      .g{background:#dcfce7;color:#15803d}
      .s{background:#e0f2fe;color:#0369a1}
      .a{background:#fef3c7;color:#92400e}
      .r{background:#fee2e2;color:#dc2626}
      .n{background:#e0e7ff;color:#4338ca}
      .o{background:#ffedd5;color:#c2410c}
      .btn{display:inline-flex;align-items:center;gap:3px;padding:2px 8px;border-radius:6px;font-size:9.5px;font-weight:900;border:1px solid;margin:1px}
      .ba{border-color:#fcd34d;background:#fffbeb;color:#92400e}
      .br{border-color:#fca5a5;background:#fff1f2;color:#dc2626}
      .bg{border-color:#86efac;background:#f0fdf4;color:#166534}
      .bi{border-color:#a5b4fc;background:#eef2ff;color:#4338ca}
      .note{background:#fffbeb;border:1px solid #fde68a;border-radius:5px;padding:6px 9px;font-size:10px;color:#78350f;margin-top:5px;line-height:1.5}
      .brow{display:flex;flex-wrap:wrap;gap:4px;align-items:center;margin-bottom:4px}
      .arr{color:#94a3b8;font-size:9px}
      .bdesc{color:#374141;font-size:10.5px;line-height:1.5;margin-bottom:4px}
      .bsep{border:none;border-top:1px solid #f1f5f9;margin:8px 0}
      table{width:100%;border-collapse:collapse;font-size:10.5px;margin-top:5px}
      th{background:#f1f5f9;padding:5px 9px;text-align:left;font-weight:900;color:#475569;border:1px solid #e2e8f0}
      td{padding:4px 9px;border:1px solid #e2e8f0;color:#475569;line-height:1.4}
      tr:nth-child(even) td{background:#f8fafc}
      .ft{text-align:center;color:#cbd5e1;font-size:9.5px;margin-top:14px;border-top:1px solid #f1f5f9;padding-top:8px}
      @page{size:A4;margin:12mm}
    `;
    const html = `<!DOCTYPE html><html><head><meta charset="utf-8"/><title>Food Service — User Guide</title>
<style>${css}</style></head><body>
<div class="hdr">
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#f97316" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink:0"><path d="M18 8h1a4 4 0 0 1 0 8h-1"/><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/><line x1="6" y1="1" x2="6" y2="4"/><line x1="10" y1="1" x2="10" y2="4"/><line x1="14" y1="1" x2="14" y2="4"/></svg>
  <div><h1>Food Service — User Guide</h1><p>telerts.com &middot; RTS Portal &middot; How to use the Food Request tab</p></div>
</div>

<section>
  <div class="sh">1. What is the Food Service?</div>
  <div class="sb">
    <div class="row"><div class="lbl">Purpose</div><div class="val">The Food tab lets you manage your weekly office lunch subscription. Once opted in,
food is provided every working day (Monday – Saturday except 2nd and 4th Saturday) at ₹30 per day.</b>.</div></div>
    <div class="row"><div class="lbl">Who can use it</div><div class="val">1) Any employee or Intern role in Bangalore Location.</br>2) HR and Food Committee DeptHODs also see reports and notification controls.</div></div>
    <div class="row"><div class="lbl">When it starts</div><div class="val">After opting in, your subscription begins from the <b>next Monday</b>. The system automatically counts working days and calculates the amount.</div></div>
  </div>
</section>

<section>
  <div class="sh">2. How to Opt In</div>
  <div class="sb">
    <div class="row"><div class="lbl">First time</div><div class="val">An <b>Opt In</b> prompt appears automatically when you first open the Food tab. Click <b>Opt In</b> to join, or close it and click the <b>Opt In</b> button in the subscription row later.</div></div>
    <div class="row"><div class="lbl">When it takes effect</div><div class="val">Subscription always starts from the <b>next Monday</b>. You will see a status badge Like <span class="badge s">Starts 5 Jan</span> until the start date arrives.</div></div>
    <div class="row hl"><div class="lbl">Cost</div><div class="val"><b>₹30 per working day.</b> HR / Food Committee can generate monthly or weekly reports with the exact count and amount for each employee for there reference.</div></div>
  </div>
</section>

<section>
  <div class="sh">3. Status Badges Explained</div>
  <div class="sb">
    <div class="row"><div class="lbl"><span class="badge g">Active</span></div><div class="val">Food subscription has started for the week and is running normally. Meals counted every working day.</div></div>
    <div class="row"><div class="lbl"><span class="badge s">Starts 5 Jan</span></div><div class="val">Newly opted in. Food counting begins on the shown date (next Monday).</div></div>
    <div class="row"><div class="lbl"><span class="badge a">Next Week Cancelled</span></div><div class="val">Food skipped for next week only. Resumes the following week automatically.</div></div>
    <div class="row"><div class="lbl"><span class="badge r">Cancelled from 10 Jun</span></div><div class="val">Year pause active — food suspended from the shown date through year end.</div></div>
    <div class="row"><div class="lbl"><span class="badge n">Next Week Enabled</span></div><div class="val">Year is paused, but you enabled food for just next week as a one-time exception.</div></div>
    <div class="row"><div class="lbl"><span class="badge o">Year Disabled</span></div><div class="val">Food disabled for the whole year.</div></div>
  </div>
</section>

<section>
  <div class="sh">4. The Four Action Buttons</div>
  <div class="sb">
    <div class="brow"><span class="btn ba">✕ Skip Next Week</span><span class="arr">→ when active</span><span class="btn bg">✓ Undo Skip</span><span class="arr">→ after skipping</span></div>
    <div class="bdesc"><b>Skip Next Week</b> — Cancels food for the upcoming week only (Mon–sat). Resumes automatically the week after. Use when on leave or not needing food for one week.</div>
    <hr class="bsep"/>
    <div class="brow"><span class="btn br">⊘ Pause for the Year</span><span class="arr">→ when active</span><span class="btn bg">✓ Undo Year Pause</span><span class="arr">→ after pausing</span></div>
    <div class="bdesc"><b>Pause for the Year</b> — Suspends your subscription from next Monday through year end. A confirmation prompt appears first. Use for extended leave.</div>
    <div class="note">This is the most impactful action — use "Skip Next Week" if you only need one week off.</div>
    <hr class="bsep"/>
    <div class="brow"><span class="btn bi">↻ Resume Next Week</span><span class="arr">→ when year is paused</span></div>
    <div class="bdesc"><b>Resume Next Week</b> — Enables food for next week only (one-time exception). Year pause continues the week after. Useful if back in office for just one week.</div>
    <hr class="bsep"/>
    <div class="brow"><span class="btn bg">▶ Resume for the Year</span><span class="arr">→ when year is paused or year-disabled</span></div>
    <div class="bdesc"><b>Resume for the Year</b> — Clears all pauses and re-enables food for the entire year from next Monday.</div>
  </div>
</section>

<section>
  <div class="sh">5. Deadline &amp; Locking</div>
  <div class="sb">
    <div class="row hl"><div class="lbl">Deadline</div><div class="val">Any changes for next week can be made only before<b/> Saturday 6:30 PM</b> of the current week..</div></div>
    <div class="row"><div class="lbl">After deadline</div><div class="val">After Saturday 6:30 PM, any action already taken is <b>locked</b>. The button is replaced by a grey <b>Locked</b> tile and cannot be undone. Food for that week is processed as-is.</div></div>
    <div class="row"><div class="lbl">Locked tile</div><div class="val">A grey "Locked" tile means the deadline has passed for that action — the decision is finalised, not failed.</div></div>
    <div class="note">Example: Click "Skip Next Week" on Thursday → you can undo any time before Saturday 6:30 PM. After that it is locked and next week's food will be skipped.</div>
  </div>
</section>

<section>
  <div class="sh">6. Food Calendar</div>
  <div class="sb">
    <div class="row"><div class="lbl">What it shows</div><div class="val">The calendar shows your food status for each day of the displayed month. Navigate months with the left and right arrows.</div></div>
    <div class="row"><div class="lbl">Colour meaning</div><div class="val"><b style="color:#22c55e">●</b> Green — food active that day. &nbsp;<b style="color:#f87171">●</b> Red / Grey — food cancelled, skipped, or suspended. Weekends and holidays are purple out automatically.</div></div>
    <div class="row"><div class="lbl">Navigation</div><div class="val">You can view one month back and one month forward from the current month.</div></div>
  </div>
</section>

<section>
  <div class="sh">7. Push Notifications</div>
  <div class="sb">
    <div class="row"><div class="lbl">Purpose</div><div class="val">Receive a browser push notification when the Saturday deadline is approaching so you don't forget to cancel next week's food.</div></div>
    <div class="row"><div class="lbl">How to enable</div><div class="val">Click the <b>Notify Me</b> bell button → browser asks for permission → click <b>Allow</b>. Button changes to <span class="btn bi">🔔 Notifications On</span> once enabled.</div></div>
    <div class="row"><div class="lbl">Per-device</div><div class="val">Push notifications are tied to the specific browser and device. If you use multiple devices, Enable on each device separately.</div></div>
    <div class="row"><div class="lbl">Auto Notifications</div><div class="val">Automatic reminders fire every <b>Monday, Wednesday and Saturday at 5:00 PM</b>. HR / Food Committee can also trigger a manual reminder any time.</div></div>
  </div>
</section>

<section>
  <div class="sh">8. Report Section — HR &amp; Food Committee Only</div>
  <div class="sb">
    <div class="row"><div class="lbl">Who sees this</div><div class="val">Only <b>DeptHOD users in the HR or Food Committee department</b> see the report and notification control sections.</div></div>
    <div class="row"><div class="lbl">View report</div><div class="val">Select <b>Monthly</b> (month + year) or <b>Weekly</b> (choose Monday start date) → click <b>Load Report</b>. Table shows name, Emp ID, department, working days, and total amount.</div></div>
    <div class="row"><div class="lbl">Download CSV</div><div class="val">Click <b>Download CSV</b> to export the loaded report as a spreadsheet file. Open in Excel or Google Sheets.</div></div>
    <div class="row"><div class="lbl">Send reminder</div><div class="val">Click <b><span class="btn bi">🔔 Send Reminder Now</span></b> to manually push a food reminder to all active subscribers outside the automatic schedule.</div></div>
  </div>
</section>

<section>
  <div class="sh">9. Quick Reference — What to Do in Each Situation</div>
  <div class="sb">
    <table>
      <thead><tr><th>Situation</th><th>Action to take</th><th>Deadline</th></tr></thead>
      <tbody>
        <tr><td>Going on leave for one week</td><td><b>Skip Next Week</b></td><td>Before Sat 6:30 PM</td></tr>
        <tr><td>If you have a plan to completely stop food service for a while</td><td><b>Pause for the Year</b></td><td>Before Sat 6:30 PM</td></tr>
        <tr><td>Back in office for one week only (year paused)</td><td><b>Resume Next Week</b></td><td>Before Sat 6:30 PM</td></tr>
        <tr><td>Want to resume your food service again after stopping it</td><td><b>Resume for the Year</b></td><td>Before Sat 6:30 PM</td></tr>
        <tr><td>Accidentally skipped or paused</td><td><b>Click the Undo button</b></td><td>Before Sat 6:30 PM</td></tr>
        <tr><td>First time using food service</td><td><b>Click Opt In</b></td><td>Any time</td></tr>
        <tr><td>Want a reminder about the deadline</td><td><b>Enable Notifications (bell icon)</b></td><td>Any time</td></tr>
      </tbody>
    </table>
  </div>
</section>

<p class="ft">RTS Portal &middot; Food Service Guide &middot; For support contact HR or Food Committee</p>
</body></html>`;
    win.document.write(html);
    win.document.close();
    setTimeout(() => { win.focus(); win.print(); win.close(); }, 500);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-[300] flex items-center justify-center p-4 print:p-0 print:bg-white print:inset-auto">
      <div
        className="bg-white rounded-2xl shadow-2xl border border-slate-200 flex flex-col w-full max-w-4xl print:rounded-none print:shadow-none print:border-none"
        style={{ height: "93vh" }}
      >

        {/* ── Top bar (hidden when printing) ── */}
        <div className="flex items-center justify-between px-5 py-3 bg-gradient-to-r from-orange-500 to-amber-500 rounded-t-2xl flex-shrink-0 print:hidden">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-white/20 rounded-xl flex items-center justify-center">
              <UtensilsCrossed size={16} className="text-white" />
            </div>
            <div>
              <h1 className="text-sm font-black text-white tracking-tight">Food Service — User Guide</h1>
              <p className="text-white/70 text-[10px] font-medium">How to use the Food Request tab</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 bg-white/20 hover:bg-white/30 text-white px-3 py-1.5 rounded-lg text-[11px] font-black transition-all active:scale-95"
            >
              <Printer size={12} /> Save as PDF
            </button>
            <button
              onClick={onClose}
              className="p-1.5 bg-white/20 hover:bg-white/30 text-white rounded-lg transition-colors"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* ── Scrollable content ── */}
        <div className="flex-1 overflow-y-auto p-6">

          <div id="food-guide-body">
          {/* ── 1. Overview ── */}
          <Section title="1. What is the Food Service?" icon={UtensilsCrossed} color="teal">
            <Row label="Purpose">
              The Food tab lets you manage your weekly office lunch subscription. Once opted in,
              food is provided every working day (Monday – Saturday except 2nd and 4th Saturday) at <strong>₹30 per day</strong>.
            </Row>
            <Row label="Who can use it">
              1) Any employee or Intern role in Bangalore Location.<br />
              2) HR and Food Committee DeptHODs also see reports and notification controls.
            </Row>
            <Row label="When it starts">
              After opting in, your food subscription begins from the <strong>next Monday</strong>.
              The system automatically counts your working days and calculates the amount.
            </Row>
          </Section>

          {/* ── 2. Opt In ── */}
          <Section title="2. How to Opt In" icon={CalendarCheck} color="green">
            <Row label="First time">
              When you open the Food tab for the first time, an <strong>Opt In</strong> prompt appears
              automatically. Click <strong>Opt In</strong> to join, or close it and click the
              <strong> Opt In</strong> button that appears in the subscription row later.
            </Row>
            <Row label="When it takes effect">
              Your subscription always starts from the <strong>next Monday</strong>, regardless of
              which day you opt in. You will see a status badge showing
              <span className="mx-1"><Badge label="Starts 5 Jan" cls="bg-sky-100 text-sky-700" /></span>
              until the start date arrives.
            </Row>
            <Row label="Cost" highlight>
              <strong>₹30 per working day.</strong> HR / Food Committee can generate monthly or weekly reports
              with the exact count and amount for each employee for their reference.
            </Row>
          </Section>

          {/* ── 3. Status Badges ── */}
          <Section title="3. Status Badges Explained" icon={Info} color="slate">
            <p className="text-[11px] text-slate-500 mb-2">
              A coloured badge next to "Food Subscription" shows your current state at a glance:
            </p>
            <div className="space-y-2">
              <Row label={<Badge label="Active" cls="bg-green-100 text-green-700" />}>
                Food subscription has started for the week and is running normally. Meals counted every working day.
              </Row>
              <Row label={<Badge label="Starts 5 Jan" cls="bg-sky-100 text-sky-700" />}>
                You just opted in. Food counting begins on the shown date (next Monday).
              </Row>
              <Row label={<Badge label="Next Week Cancelled" cls="bg-amber-100 text-amber-700" />}>
                You have skipped food for next week only. Food resumes the week after automatically.
              </Row>
              <Row label={<Badge label="Cancelled from 10 Jun" cls="bg-red-100 text-red-600" />}>
                Year pause is active — food is suspended from the shown date through the end of the year.
              </Row>
              <Row label={<Badge label="Next Week Enabled" cls="bg-indigo-100 text-indigo-700" />}>
                Year is paused, but you have enabled food for just next week as a one-time exception.
              </Row>
              <Row label={<Badge label="Year Disabled" cls="bg-orange-100 text-orange-600" />}>
                Food disabled for the whole year.
              </Row>
            </div>
          </Section>

          {/* ── 4. Action Buttons ── */}
          <Section title="4. The Four Action Buttons" icon={CalendarX} color="amber">
            <p className="text-[11px] text-slate-500 mb-3">
              Once subscribed, up to four action buttons appear depending on your current state.
              Only the buttons relevant to your situation are shown.
            </p>

            {/* Button 1 */}
            <div className="mb-4 pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2 mb-1.5">
                <Btn icon={CalendarX} label="Skip Next Week" cls="border-amber-300 bg-amber-50 text-amber-700" />
                <span className="text-[10px] text-slate-400">→ when active</span>
                <Btn icon={CalendarCheck} label="Undo Skip" cls="border-green-300 bg-green-50 text-green-700" />
                <span className="text-[10px] text-slate-400">→ after skipping</span>
              </div>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                <strong>Skip Next Week</strong> — Cancels food for the upcoming week only (Mon – Sat).
                Food automatically resumes the week after. Use this when you are on leave, travelling,
                or do not need food for just one week.
              </p>
              <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">
                After skipping, the button changes to <strong>Undo Skip</strong> so you can reverse
                the decision before the deadline. Once locked, you cannot undo.
              </p>
            </div>

            {/* Button 2 */}
            <div className="mb-4 pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2 mb-1.5">
                <Btn icon={CalendarOff} label="Pause for the Year" cls="border-red-300 bg-red-50 text-red-600" />
                <span className="text-[10px] text-slate-400">→ when active</span>
                <Btn icon={CalendarCheck} label="Undo Year Pause" cls="border-green-300 bg-green-50 text-green-700" />
                <span className="text-[10px] text-slate-400">→ after pausing</span>
              </div>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                <strong>Pause for the Year</strong> — Suspends your food subscription from next Monday
                through the end of the current year. No meals are counted during this period.
                Use this if you are going on extended leave or will not need food for several months.
              </p>
              <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">
                A confirmation prompt appears before this action is applied. After confirming,
                use <strong>Undo Year Pause</strong> to reverse it before the Saturday deadline.
              </p>
              <Note>This is the most impactful action — it pauses food until the end of the year.
                Use "Skip Next Week" if you only need one week off.</Note>
            </div>

            {/* Button 3 */}
            <div className="mb-4 pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2 mb-1.5">
                <Btn icon={CalendarCheck} label="Resume Next Week" cls="border-indigo-300 bg-indigo-50 text-indigo-700" />
                <span className="text-[10px] text-slate-400">→ when year is paused</span>
              </div>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                <strong>Resume Next Week</strong> — Appears only when the year is paused. Enables food
                for next week as a one-time exception. The year pause resumes from the week after.
                Useful if you are back in office for just one week during a long pause.
              </p>
              <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">
                After enabling, the button changes to <strong>Undo Resume</strong> so you can cancel
                the one-week exception before the deadline.
              </p>
            </div>

            {/* Button 4 */}
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <Btn icon={CalendarRange} label="Resume for the Year" cls="border-green-300 bg-green-50 text-green-700" />
                <span className="text-[10px] text-slate-400">→ when year is paused or year-disabled</span>
              </div>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                <strong>Resume for the Year</strong> — Clears all pauses and re-enables food for the
                entire year from next Monday. Use this when you are back from a long leave and want
                to fully restart your food subscription.
              </p>
            </div>
          </Section>

          {/* ── 5. Deadline & Locking ── */}
          <Section title="5. Deadline & Locking" icon={Lock} color="red">
            <Row label="Deadline" highlight>
              Any changes for next week can be made only before{" "}
              <strong>Saturday 6:30 PM</strong> of the current week.
            </Row>
            <Row label="What happens after">
              After Saturday 6:30 PM, any action you already took (skip, pause, resume) is <strong>locked</strong>.
              The button is replaced by a grey <strong>Locked</strong> slot and cannot be undone.
              Food for that week is processed as-is.
            </Row>
            <Row label="Locked slot">
              A grey "Locked" tile in the button row means the deadline has passed for that action.
              It does not mean the action failed — it means the decision is finalised.
            </Row>
            <Note>
              Example: If you click "Skip Next Week" on Thursday, you can undo it any time before
              Saturday 6:30 PM. After that it is locked and next week's food will be skipped.
            </Note>
          </Section>

          {/* ── 6. Food Calendar ── */}
          <Section title="6. Food Calendar" icon={CalendarRange} color="indigo">
            <Row label="What it shows">
              The calendar below the action buttons shows your food status for each day of the
              displayed month. Navigate between months using the left and right arrows.
            </Row>
            <Row label="Colour meaning">
              <span className="inline-block w-3 h-3 rounded-full bg-green-400 mr-1 align-middle" />
              <strong>Green</strong> — food active that day.{" "}
              <span className="inline-block w-3 h-3 rounded-full bg-red-300 mr-1 ml-2 align-middle" />
              <strong>Red / Grey</strong> — food cancelled, skipped, or suspended.
              Weekends and public holidays are greyed out automatically.
            </Row>
            <Row label="Navigation range">
              You can view one month back and one month forward from the current month.
              Past months beyond that range are not accessible.
            </Row>
          </Section>

          {/* ── 7. Push Notifications ── */}
          <Section title="7. Push Notifications" icon={Bell} color="violet">
            <Row label="Purpose">
              Enable browser push notifications to receive a reminder when the Saturday deadline
              is approaching, so you do not forget to cancel next week's food if needed.
            </Row>
            <Row label="How to enable">
              Click the <strong>Notify Me</strong> bell button in the subscription row.
              Your browser will ask for permission — click <strong>Allow</strong>.
              The button will change to{" "}
              <Btn icon={Bell} label="Notifications On" cls="border-indigo-200 bg-indigo-50 text-indigo-600" />
              {" "}once enabled.
            </Row>
            <Row label="Per-device setting">
              Push notifications are tied to the specific browser and device you are using.
              If you use multiple devices, enable notifications on each one separately.
            </Row>
            <Row label="Auto Notifications">
              The system sends automatic food reminders every{" "}
              <strong>Monday, Wednesday and Saturday at 5:00 PM</strong>. HR / Food Committee
              can also trigger a manual reminder at any time.
            </Row>
          </Section>

          {/* ── 8. HR / Food Committee Report ── */}
          <Section title="8. Report Section (HR & Food Committee Only)" icon={BarChart2} color="violet">
            <p className="text-[11px] text-slate-500 mb-2">
              This section is only visible to <strong>DeptHOD users in the HR or Food Committee department</strong>.
            </p>
            <Row label="View report">
              Select a report type — <strong>Monthly</strong> (choose month and year) or{" "}
              <strong>Weekly</strong> (choose the Monday start date of the week) — then click
              <strong> Load Report</strong>. The table shows each employee's name, Emp ID,
              department, working days counted, and total amount (₹30 × days).
            </Row>
            <Row label="Download CSV">
              Click the <strong>Download CSV</strong> button to export the loaded report as a
              comma-separated file. Open it in Excel or Google Sheets for further processing.
            </Row>
            <Row label="Notification control">
              Click{" "}
              <Btn icon={Bell} label="Send Reminder Now" cls="border-indigo-200 bg-indigo-50 text-indigo-600" />
              {" "}to manually push a food reminder to all active subscribers outside the automatic schedule.
            </Row>
          </Section>

          {/* ── 9. Quick Reference ── */}
          <Section title="9. Quick Reference — Decision Guide" icon={Info} color="slate">
            <div className="overflow-x-auto">
              <table className="w-full text-[11px] border-collapse">
                <thead>
                  <tr className="bg-slate-100">
                    <th className="text-left px-3 py-2 font-black text-slate-600 border border-slate-200 rounded-tl-lg">Situation</th>
                    <th className="text-left px-3 py-2 font-black text-slate-600 border border-slate-200">Action to take</th>
                    <th className="text-left px-3 py-2 font-black text-slate-600 border border-slate-200 rounded-tr-lg">Deadline</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ["Going on leave for one week", "Skip Next Week", "Before Sat 6:30 PM"],
                    ["If you have a plan to completely stop food service for a while", "Pause for the Year", "Before Sat 6:30 PM"],
                    ["Back in office for one week only (year paused)", "Resume Next Week", "Before Sat 6:30 PM"],
                    ["Want to resume your food service again after stopping it", "Resume for the Year", "Before Sat 6:30 PM"],
                    ["Accidentally skipped / paused", "Click the Undo button", "Before Sat 6:30 PM"],
                    ["First time using food service", "Click Opt In", "Any time"],
                    ["Want a reminder about the deadline", "Enable Notifications (bell icon)", "Any time"],
                  ].map(([sit, act, dead], i) => (
                    <tr key={i} className={i % 2 === 0 ? "bg-white" : "bg-slate-50"}>
                      <td className="px-3 py-2 border border-slate-200 text-slate-700">{sit}</td>
                      <td className="px-3 py-2 border border-slate-200 font-black text-indigo-700">{act}</td>
                      <td className="px-3 py-2 border border-slate-200 text-slate-500">{dead}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Section>

          </div>{/* end food-guide-body */}
        </div>{/* end scrollable */}
      </div>{/* end modal card */}
    </div>
  );
}
