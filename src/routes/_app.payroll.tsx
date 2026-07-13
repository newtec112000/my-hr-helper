import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery, queryOptions } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import * as XLSX from "xlsx";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  horizontalListSortingStrategy,
  useSortable,
  sortableKeyboardCoordinates,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
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

const fmt = (v: unknown) => {
  const n = Number(v ?? 0);
  if (!isFinite(n)) return "";
  return n.toLocaleString("ar-EG", { minimumFractionDigits: 0, maximumFractionDigits: 2 });
};
const asText = (v: unknown) => (v == null || v === "" ? "—" : String(v));

type ColKind = "seq" | "text" | "number" | "money";
type Section = "info" | "earn" | "sum-earn" | "days" | "deduct" | "sum-deduct" | "net" | "notes";

type ColDef = {
  key: string;
  label: string;
  kind: ColKind;
  section: Section;
  get: (r: PayrollRow, i: number) => unknown;
};

const COLUMNS: ColDef[] = [
  { key: "seq", label: "م", kind: "seq", section: "info", get: (_r, i) => i + 1 },
  { key: "code", label: "الكود الوظيفي", kind: "text", section: "info", get: (r) => r.code },
  { key: "name", label: "الاسم", kind: "text", section: "info", get: (r) => r.name },
  { key: "job_title", label: "الوظيفة", kind: "text", section: "info", get: (r) => r.job_title },
  { key: "shift", label: "الوردية", kind: "text", section: "info", get: (r) => r.shift },
  { key: "company", label: "الشركة", kind: "text", section: "info", get: (r) => r.company },
  { key: "hire_date", label: "تاريخ التعيين", kind: "text", section: "info", get: (r) => r.hire_date },
  { key: "last_work_day", label: "اخر يوم عمل", kind: "text", section: "info", get: (r) => r.last_work_day },
  { key: "employment_type", label: "نوع التعيين", kind: "text", section: "info", get: (r) => r.employment_type },
  { key: "payment_type", label: "نوع القبض", kind: "text", section: "info", get: (r) => r.payment_type },
  { key: "insurance_wage", label: "الأجر التأمينى", kind: "money", section: "info", get: (r) => r.insurance_wage },

  { key: "base_salary", label: "الراتب", kind: "money", section: "earn", get: (r) => r.base_salary },
  { key: "daily_wage", label: "اجر اليوم الواحد", kind: "money", section: "earn", get: (r) => r.daily_wage },
  { key: "incentive_regularity", label: "قيمة حافز انتظام", kind: "money", section: "earn", get: (r) => r.incentive_regularity },
  { key: "incentive_production", label: "قيمة حافز انتاج", kind: "money", section: "earn", get: (r) => r.incentive_production },
  { key: "allowance_work_nature", label: "بدل طبيعة عمل", kind: "money", section: "earn", get: (r) => r.allowance_work_nature },
  { key: "extra_injections", label: "قيمة عدد الحقنات الإضافية", kind: "money", section: "earn", get: (r) => r.extra_injections },
  { key: "transport_value", label: "قيمة بدل انتقال", kind: "money", section: "earn", get: (r) => r.transport_value },
  { key: "allowance_food", label: "بدل غذاء", kind: "money", section: "earn", get: (r) => r.allowance_food },
  { key: "gross", label: "إجمالى الاستحقاقات", kind: "money", section: "sum-earn", get: (r) => r.gross },

  { key: "absent_excused_days", label: "أيام غياب بأذن", kind: "number", section: "days", get: (r) => r.absent_excused_days },
  { key: "absent_unexcused_days", label: "أيام غياب بدون إذن", kind: "number", section: "days", get: (r) => r.absent_unexcused_days },
  { key: "absent_unexcused_penalty_days", label: "جزاء غياب بدون إذن", kind: "number", section: "days", get: (r) => r.absent_unexcused_penalty_days },
  { key: "admin_penalty_days", label: "أيام جزاء إدارى", kind: "number", section: "days", get: (r) => r.admin_penalty_days },

  { key: "absent_excused_value", label: "قيمة غياب بأذن", kind: "money", section: "deduct", get: (r) => r.absent_excused_value },
  { key: "absent_unexcused_value", label: "قيمة غياب بدون اذن", kind: "money", section: "deduct", get: (r) => r.absent_unexcused_value },
  { key: "absent_unexcused_penalty_value", label: "قيمة جزاء غياب بدون اذن", kind: "money", section: "deduct", get: (r) => r.absent_unexcused_penalty_value },
  { key: "admin_penalty_value", label: "قيمة جزاء ادارى", kind: "money", section: "deduct", get: (r) => r.admin_penalty_value },
  { key: "monthly_advance", label: "سلف شهرية", kind: "money", section: "deduct", get: (r) => r.monthly_advance },
  { key: "phased_advance", label: "أقساط سلف مرحلة", kind: "money", section: "deduct", get: (r) => r.phased_advance },
  { key: "insurance_deduction", label: "ح تامينات الموظف", kind: "money", section: "deduct", get: (r) => r.insurance_deduction },
  { key: "total_deductions", label: "اجمالى الاستقطاعات", kind: "money", section: "sum-deduct", get: (r) => r.total_deductions },

  { key: "net", label: "صافى الراتب", kind: "money", section: "net", get: (r) => r.net },
  { key: "notes", label: "ملاحظات", kind: "text", section: "notes", get: (r) => r.notes },
];

const COL_MAP = new Map(COLUMNS.map((c) => [c.key, c]));
const DEFAULT_ORDER = COLUMNS.map((c) => c.key);
const STORAGE_KEY = "payroll-cols-v1";

const SECTION_BG: Record<Section, string> = {
  info: "bg-slate-50",
  earn: "bg-amber-50",
  "sum-earn": "bg-orange-100",
  days: "bg-rose-50",
  deduct: "bg-emerald-50",
  "sum-deduct": "bg-emerald-100",
  net: "bg-sky-100",
  notes: "bg-violet-50",
};

type Pref = { order: string[]; hidden: string[] };

function loadPref(): Pref {
  if (typeof window === "undefined") return { order: DEFAULT_ORDER, hidden: [] };
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { order: DEFAULT_ORDER, hidden: [] };
    const p = JSON.parse(raw) as Pref;
    const known = new Set(DEFAULT_ORDER);
    const order = [
      ...(p.order ?? []).filter((k) => known.has(k)),
      ...DEFAULT_ORDER.filter((k) => !(p.order ?? []).includes(k)),
    ];
    return { order, hidden: (p.hidden ?? []).filter((k) => known.has(k)) };
  } catch {
    return { order: DEFAULT_ORDER, hidden: [] };
  }
}

function PayrollPage() {
  const [month, setMonth] = useState(currentMonth());
  const [search, setSearch] = useState("");
  const [pref, setPref] = useState<Pref>({ order: DEFAULT_ORDER, hidden: [] });
  const [showCols, setShowCols] = useState(false);
  const { data: rows } = useSuspenseQuery(payrollQuery(month));

  useEffect(() => setPref(loadPref()), []);
  useEffect(() => {
    if (typeof window !== "undefined") localStorage.setItem(STORAGE_KEY, JSON.stringify(pref));
  }, [pref]);

  const visibleCols = useMemo(
    () => pref.order.map((k) => COL_MAP.get(k)!).filter((c) => c && !pref.hidden.includes(c.key)),
    [pref],
  );

  const filtered = useMemo(() => {
    const s = search.trim();
    if (!s) return rows;
    return rows.filter((r) => r.name.includes(s) || String(r.code).includes(s));
  }, [rows, search]);

  const totals = useMemo(() => {
    return filtered.reduce(
      (a, r) => ({ gross: a.gross + r.gross, deductions: a.deductions + r.total_deductions, net: a.net + r.net }),
      { gross: 0, deductions: 0, net: 0 },
    );
  }, [filtered]);

  function exportExcel() {
    const data = filtered.map((r, i) => {
      const obj: Record<string, unknown> = {};
      for (const c of visibleCols) obj[c.label] = c.get(r, i);
      return obj;
    });
    const ws = XLSX.utils.json_to_sheet(data);
    ws["!rtl"] = true as never;
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, `رواتب ${month}`);
    XLSX.writeFile(wb, `رواتب-${month}.xlsx`);
  }

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  function onDragEnd(e: DragEndEvent) {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    const visKeys = visibleCols.map((c) => c.key);
    const oldIdx = visKeys.indexOf(String(active.id));
    const newIdx = visKeys.indexOf(String(over.id));
    if (oldIdx < 0 || newIdx < 0) return;
    const newVisOrder = arrayMove(visKeys, oldIdx, newIdx);
    // rebuild full order: hidden keys keep their positions relative to remaining
    const hidden = pref.order.filter((k) => pref.hidden.includes(k));
    setPref({ ...pref, order: [...newVisOrder, ...hidden] });
  }

  function toggleHidden(key: string) {
    const hidden = pref.hidden.includes(key) ? pref.hidden.filter((k) => k !== key) : [...pref.hidden, key];
    setPref({ ...pref, hidden });
  }

  function resetCols() {
    setPref({ order: DEFAULT_ORDER, hidden: [] });
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">كشف الرواتب</h1>
          <p className="text-sm text-muted-foreground mt-1">{filtered.length} موظف — {visibleCols.length} عمود</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <input
            type="month"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            className="px-3 py-2 rounded-lg border border-input bg-background text-sm"
          />
          <button
            onClick={() => setShowCols((s) => !s)}
            className="px-3 py-2 rounded-lg border border-input bg-background text-sm hover:bg-accent"
          >
            الأعمدة ({visibleCols.length}/{COLUMNS.length})
          </button>
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

      {showCols && (
        <div className="bg-card rounded-xl border border-border p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="text-sm font-medium">إظهار / إخفاء الأعمدة</div>
            <button onClick={resetCols} className="text-xs text-primary hover:underline">إعادة تعيين</button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
            {COLUMNS.map((c) => {
              const shown = !pref.hidden.includes(c.key);
              return (
                <label key={c.key} className={`flex items-center gap-2 text-xs px-2 py-1.5 rounded border cursor-pointer ${shown ? "border-primary/40 bg-primary/5" : "border-input"}`}>
                  <input type="checkbox" checked={shown} onChange={() => toggleHidden(c.key)} />
                  <span>{c.label}</span>
                </label>
              );
            })}
          </div>
          <p className="text-xs text-muted-foreground">اسحب رأس العمود في الجدول لتغيير ترتيبه.</p>
        </div>
      )}

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
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
            <table className="text-xs" style={{ minWidth: "100%" }}>
              <thead>
                <SortableContext items={visibleCols.map((c) => c.key)} strategy={horizontalListSortingStrategy}>
                  <tr>
                    {visibleCols.map((c) => (
                      <HeaderCell key={c.key} col={c} />
                    ))}
                  </tr>
                </SortableContext>
              </thead>
              <tbody>
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={visibleCols.length} className="text-center py-12 text-muted-foreground">لا يوجد بيانات.</td>
                  </tr>
                )}
                {filtered.map((r, i) => (
                  <tr key={r.employee_id} className="border-t border-border hover:bg-accent/40">
                    {visibleCols.map((c) => (
                      <td
                        key={c.key}
                        className={`px-2 py-1.5 whitespace-nowrap ${SECTION_BG[c.section]} ${c.kind === "money" || c.kind === "number" ? "font-mono text-right" : "text-right"} ${c.key === "net" ? "font-bold text-primary" : ""}`}
                      >
                        {c.kind === "money" ? fmt(c.get(r, i)) : c.kind === "number" || c.kind === "seq" ? String(c.get(r, i) ?? 0) : asText(c.get(r, i))}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </DndContext>
        </div>
      </div>
    </div>
  );
}

function HeaderCell({ col }: { col: ColDef }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: col.key });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };
  return (
    <th
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`px-2 py-2 text-right text-xs font-semibold border border-border cursor-grab active:cursor-grabbing whitespace-nowrap ${SECTION_BG[col.section]}`}
      title="اسحب لإعادة الترتيب"
    >
      {col.label}
    </th>
  );
}

function StatCard({ label, value, tone }: { label: string; value: string; tone?: "success" | "danger" }) {
  const color = tone === "success" ? "text-emerald-600" : tone === "danger" ? "text-destructive" : "text-foreground";
  return (
    <div className="bg-card rounded-xl border border-border p-4">
      <div className="text-xs text-muted-foreground mb-1">{label}</div>
      <div className={`text-2xl font-bold font-mono ${color}`}>{value}</div>
    </div>
  );
}
