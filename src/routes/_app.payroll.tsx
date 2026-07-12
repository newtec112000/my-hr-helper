import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery, queryOptions } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import * as XLSX from "xlsx";
import { computePayroll, type PayrollRow } from "@/lib/payroll.functions";

const currentMonth = () => new Date().toISOString().slice(0, 7);

const payrollQuery = (month: string) =>
  queryOptions({
    queryKey: ["payroll", month],
    queryFn: () => computePayroll({ data: { month } }),
  });

export const Route = createFileRoute("/_app/payroll")({
  head: () => ({ meta: [{ title: "الرواتب" }] }),
  loader: ({ context }) => {
    context.queryClient.ensureQueryData(payrollQuery(currentMonth()));
  },
  component: PayrollPage,
});

const fmt = (v: number) => Number(v ?? 0).toLocaleString("ar-EG", { minimumFractionDigits: 0, maximumFractionDigits: 2 });

function PayrollPage() {
  const [month, setMonth] = useState(currentMonth());
  const [search, setSearch] = useState("");
  const { data: rows } = useSuspenseQuery(payrollQuery(month));

  const filtered = useMemo(() => {
    const s = search.trim();
    if (!s) return rows;
    return rows.filter((r) => r.name.includes(s) || String(r.code).includes(s));
  }, [rows, search]);

  const totals = useMemo(() => {
    return filtered.reduce(
      (a, r) => ({
        gross: a.gross + r.gross,
        deductions: a.deductions + r.total_deductions,
        net: a.net + r.net,
      }),
      { gross: 0, deductions: 0, net: 0 },
    );
  }, [filtered]);

  function exportExcel() {
    const data = filtered.map((r, i) => ({
      م: i + 1,
      الكود: r.code,
      الاسم: r.name,
      الوظيفة: r.job_title ?? "",
      الشركة: r.company ?? "",
      "الراتب الأساسي": r.base_salary,
      انتظام: r.allowances_regularity,
      "بدل انتقال": r.allowances_transport,
      "حافز إنتاج": r.allowances_production,
      "بدل طبيعة": r.allowances_work_nature,
      "بدل غذاء": r.allowances_food,
      "إجمالي البدلات": r.allowances_total,
      "حافز انتظام": r.incentive_regularity,
      "حافز إنتاج (شهري)": r.incentive_production,
      "حافز انتقال (شهري)": r.incentive_transport,
      "بدل طبيعة عمل (شهري)": r.incentive_work_nature,
      "إجمالي الحوافز": r.incentives_total,
      المكافآت: r.bonuses_total,
      "أيام الغياب": r.absent_days,
      "خصم الغياب": r.absent_deduction,
      الجزاءات: r.penalties_total,
      "قسط السلفة": r.advance_deduction,
      "إجمالي المستحق": r.gross,
      "إجمالي الخصومات": r.total_deductions,
      "الصافي": r.net,
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, `رواتب ${month}`);
    XLSX.writeFile(wb, `رواتب-${month}.xlsx`);
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">كشف الرواتب</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {filtered.length} موظف
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <input
            type="month"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            className="px-3 py-2 rounded-lg border border-input bg-background text-sm"
          />
          <button
            onClick={exportExcel}
            className="px-3 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90"
          >
            تصدير Excel
          </button>
          <button
            onClick={() => window.print()}
            className="px-3 py-2 rounded-lg border border-input bg-background text-sm hover:bg-accent"
          >
            طباعة
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <StatCard label="إجمالي المستحق" value={fmt(totals.gross)} />
        <StatCard label="إجمالي الخصومات" value={fmt(totals.deductions)} tone="danger" />
        <StatCard label="إجمالي الصافي" value={fmt(totals.net)} tone="success" />
      </div>

      <div className="bg-card rounded-xl border border-border p-3">
        <input
          type="text"
          placeholder="بحث بالاسم أو الكود..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full px-3 py-2 rounded-md border border-input bg-background text-sm"
        />
      </div>

      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-muted-foreground text-xs">
              <tr>
                <th className="px-2 py-2 text-right font-medium">الكود</th>
                <th className="px-2 py-2 text-right font-medium">الاسم</th>
                <th className="px-2 py-2 text-right font-medium">أساسي</th>
                <th className="px-2 py-2 text-right font-medium">بدلات</th>
                <th className="px-2 py-2 text-right font-medium">حوافز</th>
                <th className="px-2 py-2 text-right font-medium">مكافآت</th>
                <th className="px-2 py-2 text-right font-medium">غياب</th>
                <th className="px-2 py-2 text-right font-medium">خصم غياب</th>
                <th className="px-2 py-2 text-right font-medium">جزاءات</th>
                <th className="px-2 py-2 text-right font-medium">قسط سلفة</th>
                <th className="px-2 py-2 text-right font-medium">مستحق</th>
                <th className="px-2 py-2 text-right font-medium">خصومات</th>
                <th className="px-2 py-2 text-right font-medium">الصافي</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={12} className="text-center py-12 text-muted-foreground">لا يوجد بيانات.</td>
                </tr>
              )}
              {filtered.map((r: PayrollRow) => (
                <tr key={r.employee_id} className="border-t border-border hover:bg-accent/50">
                  <td className="px-2 py-2 font-mono">{r.code}</td>
                  <td className="px-2 py-2 font-medium">{r.name}</td>
                  <td className="px-2 py-2 font-mono">{fmt(r.base_salary)}</td>
                  <td className="px-2 py-2 font-mono">{fmt(r.allowances_total)}</td>
                  <td className="px-2 py-2 font-mono text-emerald-600">{fmt(r.bonuses_total)}</td>
                  <td className="px-2 py-2 font-mono">{r.absent_days}</td>
                  <td className="px-2 py-2 font-mono text-destructive">{fmt(r.absent_deduction)}</td>
                  <td className="px-2 py-2 font-mono text-destructive">{fmt(r.penalties_total)}</td>
                  <td className="px-2 py-2 font-mono text-destructive">{fmt(r.advance_deduction)}</td>
                  <td className="px-2 py-2 font-mono">{fmt(r.gross)}</td>
                  <td className="px-2 py-2 font-mono text-destructive">{fmt(r.total_deductions)}</td>
                  <td className="px-2 py-2 font-mono font-bold text-primary">{fmt(r.net)}</td>
                </tr>
              ))}
            </tbody>
            {filtered.length > 0 && (
              <tfoot className="bg-muted/30 font-bold">
                <tr className="border-t-2 border-border">
                  <td colSpan={9} className="px-2 py-2 text-left">الإجمالي</td>
                  <td className="px-2 py-2 font-mono">{fmt(totals.gross)}</td>
                  <td className="px-2 py-2 font-mono text-destructive">{fmt(totals.deductions)}</td>
                  <td className="px-2 py-2 font-mono text-primary">{fmt(totals.net)}</td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, tone }: { label: string; value: string; tone?: "success" | "danger" }) {
  const color =
    tone === "success" ? "text-emerald-600" : tone === "danger" ? "text-destructive" : "text-foreground";
  return (
    <div className="bg-card rounded-xl border border-border p-4">
      <div className="text-xs text-muted-foreground mb-1">{label}</div>
      <div className={`text-2xl font-bold font-mono ${color}`}>{value}</div>
    </div>
  );
}
