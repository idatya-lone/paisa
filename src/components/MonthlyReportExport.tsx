import { Download, Mail, Send } from 'lucide-react';
import { useState } from 'react';
import { sendMonthlyReportEmail } from '../services/emailReportService';
import { buildMonthlyReport, buildMonthlyReportWorkbookBuffer, exportMonthlyReport } from '../services/reportExport';

const REPORT_MONTH = '2026-09';

export function MonthlyReportExport() {
  const [status, setStatus] = useState('');
  const [email, setEmail] = useState('hello@janhaviaditya.in');
  const [isSending, setIsSending] = useState(false);

  const report = buildMonthlyReport(REPORT_MONTH);

  function handleExport() {
    try {
      exportMonthlyReport(REPORT_MONTH);
      setStatus('Monthly Excel report downloaded successfully.');
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Could not export report.');
    }
  }

  async function handleEmailReport() {
    try {
      if (!email.trim()) {
        setStatus('Enter an email address first.');
        return;
      }

      setIsSending(true);
      setStatus('Preparing Excel report...');
      await sendMonthlyReportEmail({ month: REPORT_MONTH, email: email.trim(), workbookBuffer: buildMonthlyReportWorkbookBuffer(REPORT_MONTH) });
      setStatus(`Excel report sent to ${email.trim()}.`);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Could not send report.');
    } finally {
      setIsSending(false);
    }
  }

  return (
    <div className="rounded-[28px] border border-white/10 bg-slate-900/80 p-5 text-white shadow-[0_20px_40px_rgba(15,23,42,0.25)]">
      <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="text-xs uppercase tracking-[0.18em] text-slate-400">Monthly report</div>
          <h3 className="mt-1 text-xl font-semibold">September 2026</h3>
        </div>
        <div className="flex w-full flex-wrap gap-2 sm:w-auto">
          <button type="button" onClick={handleExport} className="inline-flex min-w-0 flex-1 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-sky-500 to-emerald-400 px-3 py-2.5 text-sm font-semibold text-slate-950 sm:flex-none sm:px-4">
            <Download size={16} /> Download Excel
          </button>
          <button type="button" onClick={handleEmailReport} disabled={isSending} className="inline-flex min-w-0 flex-1 items-center justify-center gap-2 rounded-2xl border border-white/15 bg-white/5 px-3 py-2.5 text-sm font-semibold text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-60 sm:flex-none sm:px-4">
            <Send size={16} /> {isSending ? 'Sending...' : 'Email Excel'}
          </button>
        </div>
      </div>

      <div className="mt-4 flex items-center gap-3 rounded-2xl border border-white/10 bg-slate-950/50 p-3">
        <Mail size={17} className="shrink-0 text-sky-300" />
        <input aria-label="Report recipient email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} className="min-w-0 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-slate-500" placeholder="Recipient email" />
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        <div className="rounded-2xl border border-white/10 bg-slate-950/50 p-3">
          <div className="text-xs uppercase tracking-[0.18em] text-slate-400">Income</div>
          <div className="mt-2 text-lg font-semibold">₹{report.summary.totalIncome.toLocaleString('en-IN')}</div>
        </div>
        <div className="rounded-2xl border border-white/10 bg-slate-950/50 p-3">
          <div className="text-xs uppercase tracking-[0.18em] text-slate-400">Expenses</div>
          <div className="mt-2 text-lg font-semibold">₹{report.summary.totalExpenses.toLocaleString('en-IN')}</div>
        </div>
        <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-3">
          <div className="text-xs uppercase tracking-[0.18em] text-emerald-200">Savings</div>
          <div className="mt-2 text-lg font-semibold">₹{report.summary.savings.toLocaleString('en-IN')}</div>
        </div>
      </div>

      {status ? <div className="mt-4 text-sm text-emerald-300">{status}</div> : null}
    </div>
  );
}
