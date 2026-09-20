import { MonthlyReportExport } from '../components/MonthlyReportExport';

function Settings() {
  return (
    <div className="space-y-6">
      <MonthlyReportExport />

      <div className="rounded-[28px] border border-white/10 bg-slate-900/80 p-6 text-white">
        <h2 className="text-xl font-semibold">Household settings</h2>
        <div className="mt-4 space-y-3 text-sm text-slate-300">
          <div>Members: Janhavi, Aditya</div>
          <div>Currency: INR</div>
          <div>Theme: Dark</div>
        </div>
      </div>
    </div>
  );
}

export default Settings;
