import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery, useQueryClient, queryOptions } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useMemo, useState, useRef } from "react";
import * as XLSX from "xlsx";
import {
  listEmployees,
  upsertEmployee,
  deleteEmployee,
  bulkImportEmployees,
} from "@/lib/employees.functions";
import { EMPLOYEE_FIELDS, headerToKey, coerce } from "@/lib/excel-mapping";

const employeesQuery = () =>
  queryOptions({
    queryKey: ["employees"],
    queryFn: () => listEmployees(),
  });

export const Route = createFileRoute("/_app/employees")({
  head: () => ({ meta: [{ title: "الموظفون — القوة" }] }),
  loader: ({ context }) => {
    context.queryClient.ensureQueryData(employeesQuery());
  },
  component: EmployeesPage,
});

type Employee = Awaited<ReturnType<typeof listEmployees>>[number];

function EmployeesPage() {
  const { data: employees } = useSuspenseQuery(employeesQuery());
  const qc = useQueryClient();
  const upsert = useServerFn(upsertEmployee);
  const del = useServerFn(deleteEmployee);
  const bulkImport = useServerFn(bulkImportEmployees);
  const fileRef = useRef<HTMLInputElement>(null);

  const [search, setSearch] = useState("");
  const [filterCompany, setFilterCompany] = useState("");
  const [filterShift, setFilterShift] = useState("");
  const [editing, setEditing] = useState<Partial<Employee> | null>(null);
  const [busy, setBusy] = useState(false);
  const [flash, setFlash] = useState<string | null>(null);

  const companies = useMemo(
    () => Array.from(new Set(employees.map((e) => e.company).filter(Boolean))) as string[],
    [employees],
  );
  const shifts = useMemo(
    () => Array.from(new Set(employees.map((e) => e.shift).filter(Boolean))) as string[],
    [employees],
  );

  const filtered = useMemo(() => {
    const s = search.trim();
    return employees.filter((e) => {
      if (filterCompany && e.company !== filterCompany) return false;
      if (filterShift && e.shift !== filterShift) return false;
      if (!s) return true;
      return (
        String(e.code).includes(s) ||
        (e.name ?? "").includes(s) ||
        (e.national_id ?? "").includes(s) ||
        (e.mobile ?? "").includes(s)
      );
    });
  }, [employees, search, filterCompany, filterShift]);

  async function handleImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setBusy(true);
    setFlash(null);
    try {
      const buf = await file.arrayBuffer();
      const wb = XLSX.read(buf, { cellDates: true });
      const sheetName = wb.SheetNames.find((n) => n.includes("القوة")) ?? wb.SheetNames[0];
      const ws = wb.Sheets[sheetName];
      const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(ws, { defval: null, raw: true });

      const mapped = rows
        .map((row) => {
          const out: Record<string, unknown> = {};
          for (const [header, value] of Object.entries(row)) {
            const key = headerToKey(header);
            if (!key) continue;
            const field = EMPLOYEE_FIELDS.find((f) => f.key === key)!;
            out[key] = coerce(value, field.type);
          }
          return out;
        })
        .filter((r) => r.code !== null && r.code !== undefined && r.name);

      if (mapped.length === 0) {
        setFlash("ماتم إيجاد صفوف صالحة. تأكد إن الشيت اسمه \"القوة\".");
      } else {
        const res = await bulkImport({ data: { rows: mapped as never } });
        setFlash(`تم استيراد ${res.inserted} موظف بنجاح.`);
        qc.invalidateQueries({ queryKey: ["employees"] });
      }
    } catch (err) {
      setFlash("فشل الاستيراد: " + (err as Error).message);
    } finally {
      setBusy(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  function handleExport() {
    const headerRow: Record<string, unknown> = { م: "م" };
    for (const f of EMPLOYEE_FIELDS) headerRow[f.labelAr] = f.labelAr;
    const rows = employees.map((e, i) => {
      const r: Record<string, unknown> = { م: i + 1 };
      for (const f of EMPLOYEE_FIELDS) r[f.labelAr] = (e as never)[f.key] ?? "";
      return r;
    });
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "القوة");
    XLSX.writeFile(wb, "الموظفون.xlsx");
  }

  async function handleSave() {
    if (!editing) return;
    setBusy(true);
    try {
      await upsert({ data: editing as never });
      qc.invalidateQueries({ queryKey: ["employees"] });
      setEditing(null);
    } catch (err) {
      setFlash("فشل الحفظ: " + (err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("تأكيد حذف الموظف؟")) return;
    setBusy(true);
    try {
      await del({ data: { id } });
      qc.invalidateQueries({ queryKey: ["employees"] });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground">الموظفون</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {employees.length} موظف — يعرض {filtered.length}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setEditing({})}
            className="px-3 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90"
          >
            + موظف جديد
          </button>
          <button
            onClick={() => fileRef.current?.click()}
            disabled={busy}
            className="px-3 py-2 rounded-lg border border-input bg-background text-sm hover:bg-accent disabled:opacity-50"
          >
            استيراد من Excel
          </button>
          <input
            ref={fileRef}
            type="file"
            accept=".xlsx,.xls"
            onChange={handleImport}
            className="hidden"
          />
          <button
            onClick={handleExport}
            className="px-3 py-2 rounded-lg border border-input bg-background text-sm hover:bg-accent"
          >
            تصدير Excel
          </button>
        </div>
      </div>

      {flash && (
        <div className="bg-primary/10 border border-primary/30 text-primary text-sm rounded-lg px-4 py-3">
          {flash}
        </div>
      )}

      <div className="bg-card rounded-xl border border-border p-3 flex flex-wrap gap-2">
        <input
          type="text"
          placeholder="بحث بالاسم أو الكود أو الرقم القومي..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 min-w-[200px] px-3 py-2 rounded-md border border-input bg-background text-sm"
        />
        <select
          value={filterCompany}
          onChange={(e) => setFilterCompany(e.target.value)}
          className="px-3 py-2 rounded-md border border-input bg-background text-sm"
        >
          <option value="">كل الشركات</option>
          {companies.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
        <select
          value={filterShift}
          onChange={(e) => setFilterShift(e.target.value)}
          className="px-3 py-2 rounded-md border border-input bg-background text-sm"
        >
          <option value="">كل الورديات</option>
          {shifts.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>

      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-muted-foreground text-xs">
              <tr>
                <th className="px-3 py-2 text-right font-medium">الكود</th>
                <th className="px-3 py-2 text-right font-medium">الاسم</th>
                <th className="px-3 py-2 text-right font-medium">الوظيفة</th>
                <th className="px-3 py-2 text-right font-medium">الوردية</th>
                <th className="px-3 py-2 text-right font-medium">الشركة</th>
                <th className="px-3 py-2 text-right font-medium">الراتب</th>
                <th className="px-3 py-2 text-right font-medium">المحمول</th>
                <th className="px-3 py-2 text-right font-medium"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={8} className="text-center py-12 text-muted-foreground">
                    {employees.length === 0 ? "لا يوجد موظفون بعد. ابدأ بالاستيراد من Excel." : "لا نتائج."}
                  </td>
                </tr>
              )}
              {filtered.map((e) => (
                <tr key={e.id} className="border-t border-border hover:bg-accent/50">
                  <td className="px-3 py-2 font-mono">{e.code}</td>
                  <td className="px-3 py-2 font-medium">{e.name}</td>
                  <td className="px-3 py-2 text-muted-foreground">{e.job_title}</td>
                  <td className="px-3 py-2 text-muted-foreground">{e.shift}</td>
                  <td className="px-3 py-2 text-muted-foreground">{e.company}</td>
                  <td className="px-3 py-2 font-mono">{Number(e.salary ?? 0).toLocaleString("ar-EG")}</td>
                  <td className="px-3 py-2 font-mono text-muted-foreground">{e.mobile}</td>
                  <td className="px-3 py-2 text-left">
                    <button
                      onClick={() => setEditing(e)}
                      className="text-xs text-primary hover:underline ml-2"
                    >
                      تعديل
                    </button>
                    <button
                      onClick={() => handleDelete(e.id)}
                      className="text-xs text-destructive hover:underline"
                    >
                      حذف
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {editing && (
        <EmployeeModal
          employee={editing}
          onChange={setEditing}
          onSave={handleSave}
          onClose={() => setEditing(null)}
          busy={busy}
        />
      )}
    </div>
  );
}

function EmployeeModal({
  employee,
  onChange,
  onSave,
  onClose,
  busy,
}: {
  employee: Partial<Employee>;
  onChange: (e: Partial<Employee>) => void;
  onSave: () => void;
  onClose: () => void;
  busy: boolean;
}) {
  const groups = Array.from(new Set(EMPLOYEE_FIELDS.map((f) => f.group)));
  const [activeGroup, setActiveGroup] = useState(groups[0]);

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="bg-card rounded-2xl border border-border w-full max-w-4xl max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4 border-b border-border flex items-center justify-between">
          <h2 className="text-lg font-bold">
            {employee.id ? `تعديل: ${employee.name}` : "موظف جديد"}
          </h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">✕</button>
        </div>
        <div className="border-b border-border overflow-x-auto">
          <div className="flex gap-1 p-2">
            {groups.map((g) => (
              <button
                key={g}
                onClick={() => setActiveGroup(g)}
                className={`px-3 py-1.5 rounded-md text-sm whitespace-nowrap ${
                  activeGroup === g
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-accent"
                }`}
              >
                {g}
              </button>
            ))}
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-4 grid sm:grid-cols-2 gap-3">
          {EMPLOYEE_FIELDS.filter((f) => f.group === activeGroup).map((f) => (
            <div key={f.key}>
              <label className="block text-xs text-muted-foreground mb-1">{f.labelAr}</label>
              <input
                type={f.type === "date" ? "date" : f.type === "number" || f.type === "integer" ? "number" : "text"}
                value={(employee as never)[f.key] ?? ""}
                onChange={(e) => {
                  const v = e.target.value;
                  onChange({
                    ...employee,
                    [f.key]:
                      v === ""
                        ? null
                        : f.type === "number"
                        ? Number(v)
                        : f.type === "integer"
                        ? parseInt(v, 10)
                        : v,
                  });
                }}
                className="w-full px-3 py-2 rounded-md border border-input bg-background text-sm"
              />
            </div>
          ))}
        </div>
        <div className="p-4 border-t border-border flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-input text-sm hover:bg-accent"
          >
            إلغاء
          </button>
          <button
            onClick={onSave}
            disabled={busy || !employee.code || !employee.name}
            className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm hover:bg-primary/90 disabled:opacity-50"
          >
            {busy ? "جاري الحفظ..." : "حفظ"}
          </button>
        </div>
      </div>
    </div>
  );
}
