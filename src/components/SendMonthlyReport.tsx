import { Mail, Send } from 'lucide-react';
import { useState } from 'react';
import * as XLSX from 'xlsx';
import { buildMonthlyReport } from '../services/reportExport';
import { sendMonthlyReportEmail } from '../services/emailReportService';

const REPORT_MONTH = '2026-09';

export function SendMonthlyReport() {
  const [email, setEmail] = useState('hello@janhaviaditya.in');
  const [status, setStatus] = useState('');
  const [isSending, setIsSending] = useState(false);

  async function handleSend() {
    try {
      setIsSending(true);
      setStatus('Preparing report...');

      const report = buildMonthlyReport(REPORT_MONTH);
      const workbook = XLSX.utils.book_new();
      const summarySheet = XLSX.utils.json_to_sheet([
        { Label: 'Month', Value: report.summary.month },
        { Label: 'Total Income', Value: report.summary.totalIncome },
        { Label: 'Total Expenses', Value: report.summary.totalExpenses },
        { Label: 'Savings', Value: report.summary.savings },
        { Label: 'Shared Expenses', Value: report.summary.sharedExpenses },
        { Label: 'Janhavi Paid', Value: report.summary.janhaviPaid },
        { Label: 'Aditya Paid', Value: report.summary.adityaPaid },
      ]);

      const categorySheet = XLSX.utils.json_to_sheet(
        report.summary.categoryBreakdown.map((row) => ({
          Category: row.category,
          Total: row.total,
        })),
      );

      const expenseSheet = XLSX.utils.json_to_sheet(report.expenses);
      XLSX.utils.book_append_sheet(workbook, summarySheet, 'Summary');
      XLSX.utils.book_append_sheet(workbook, categorySheet, 'Category Breakdown');
      XLSX.utils.book_append_sheet(workbook, expenseSheet, 'Expenses');

      const workbookBuffer = XLSX.write(workbook, {
        type: 'array',
        bookType: 'xlsx',
      });

      await sendMonthlyReportEmail({
        month: REPORT_MONTH,
        email,
        workbookBuffer: workbookBuffer.buffer,
      });

      setStatus('Monthly report emailed successfully.');
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Unable to send the report.');
    } finally {
      setIsSending(false);
    }
  }

  return (
    <div className="rounded-[28px] border border-white/10 bg-slate-900/80 p-5 text-white shadow-[0_20px_40px_rgba(15,23,42,0.25)]">
      <div className="flex items-center gap-3">
        <div className="rounded-2xl bg-sky-500/10 p-2 text-sky-300">
          <Mail size={20} />
        </div>
        <div>
          <div className="text-xs uppercase tracking-[0.18em] text-slate-400">Email report</div>
          <h3 className="mt-1 text-xl font-semibold">Send monthly summary</h3>
        </div>
      </div>

      <div className="mt-4">
        <label htmlFor="report-email" className="mb-2 block text-sm text-slate-300">
          Recipient email
        </label>
        <input
          id="report-email"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className="w-full rounded-2xl border border-white/10 bg-slate-950/60 px-3 py-3 text-white outline-none transition focus:border-sky-400"
        />
      </div>

      <button
        type="button"
        onClick={handleSend}
        disabled={isSending}
        className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-sky-500 to-emerald-400 px-4 py-3 text-sm font-semibold text-slate-950 disabled:cursor-not-allowed disabled:opacity-70"
      >
        <Send size={16} />
        {isSending ? 'Sending...' : 'Send monthly report'}
      </button>

      {status ? <div className="mt-4 text-sm text-slate-200">{status}</div> : null}
    </div>
  );
}
