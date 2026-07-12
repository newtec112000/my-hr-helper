import { useMemo, useState } from "react";
import { useSuspenseQuery, useQueryClient, queryOptions } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { listRows, upsertRow, deleteRow, listEmployeesLite } from "@/lib/hr.functions";

export type FieldDef = {
  key: string;
  label: string;
  type: "text" | "number" | "date" | "select";
  options?: string[];
  required?: boolean;
};

export type RecordsPageConfig = {
  table: "attendance" | "penalties" | "advances" | "bonuses" | "incentives";
  title: string;
  dateKey: string;
  fields: FieldDef[];
  columns: { key: string; label: string; format?: (v: unknown) => string }[];
};

type Row = Record<string, unknown> & {
  id: string;
  employee_id: string;
  employees?: { code: number; name: string } | null;
};

const rowsQuery = (table: RecordsPageConfig["table"]) =>
  queryOptions({
    queryKey: ["hr-rows", table],
    queryFn: () => listRows({ data: { table } }),
  });

const employeesLiteQuery = () =>
  queryOptions({
    queryKey: ["employees-lite"],
    queryFn: () => listEmployeesLite(),
  });

export function RecordsPage({ config }: { config: RecordsPageConfig }) {
  const { data: rows } = useSuspenseQuery(rowsQuery(config.table));
  const { data: employees } = useSuspenseQuery(employeesLiteQuery());
  const qc = useQueryClient();
  const upsert = useServerFn(upsertRow);
  const del = useServerFn(deleteRow);

  const [editing, setEditing] = useState<Partial<Row> | null>(null);
  const [search, setSearch] = useState("");
  const [busy, setBusy] = useState(false);
  const [flash, setFlash] = useState<string | null>(null);

  const empMap = useMemo(() => {
    const m = new Map<string, { code: number; name: string }>();
    for (const e of employees) m.set(e.id, { code: e.code, name: e.name });
    return m;
  }, [employees]);

  const filtered = useMemo(() => {
    const s = search.trim();
    if (!s) return rows as Row[];
    return (rows as Row[]).filter((r) => {
      const emp = r.employees ?? empMap.get(r.employee_id);
      return (
        (emp?.name ?? "").includes(s) ||
        String(emp?.code ?? "").includes(s)
      );
    });
  }, [rows, search, empMap]);

  async function save() {
    if (!editing) return;
    setBusy(true);
    try {
      await upsert({ data: { table: config.table, values: editing as Record<string, unknown> } });
      qc.invalidateQueries({ queryKey: ["hr-rows", config.table] });
      setEditing(null);
      setFlash("تم الحفظ.");
    } catch (e) {
      setFlash("خطأ: " + (e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  async function remove(id: string) {
    if (!confirm("تأكيد الحذف؟")) return;
    setBusy(true);
    try {
      await del({ data: { table: config.table, id } });
      qc.invalidateQueries({ queryKey: ["hr-rows", config.table] });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">{config.title}</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {rows.length} سجل — يعرض {filtered.length}
          </p>
        </div>
        <button
          onClick={() => setEditing({ [config.dateKey]: new Date().toISOString().slice(0, 10) })}
          className="px-3 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90"
        >
          + إضافة جديد
        </button>
      </div>

      {flash && (
        <div className="bg-primary/10 border border-primary/30 text-primary text-sm rounded-lg px-4 py-3">
          {flash}
        </div>
      )}

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
                <th className="px-3 py-2 text-right font-medium">الموظف</th>
                {config.columns.map((c) => (
                  <th key={c.key} className="px-3 py-2 text-right font-medium">{c.label}</th>
                ))}
                <th className="px-3 py-2"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={config.columns.length + 2} className="text-center py-12 text-muted-foreground">
                    لا توجد سجلات.
                  </td>
                </tr>
              )}
              {filtered.map((r) => {
                const emp = r.employees ?? empMap.get(r.employee_id);
                return (
                  <tr key={r.id} className="border-t border-border hover:bg-accent/50">
                    <td className="px-3 py-2">
                      <div className="font-medium">{emp?.name ?? "—"}</div>
                      <div className="text-xs text-muted-foreground font-mono">{emp?.code}</div>
                    </td>
                    {config.columns.map((c) => (
                      <td key={c.key} className="px-3 py-2">
                        {c.format ? c.format(r[c.key]) : String(r[c.key] ?? "—")}
                      </td>
                    ))}
                    <td className="px-3 py-2 text-left whitespace-nowrap">
                      <button onClick={() => setEditing(r)} className="text-xs text-primary hover:underline ml-2">تعديل</button>
                      <button onClick={() => remove(r.id)} className="text-xs text-destructive hover:underline">حذف</button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {editing && (
        <RecordModal
          config={config}
          employees={employees}
          value={editing}
          onChange={setEditing}
          onSave={save}
          onClose={() => setEditing(null)}
          busy={busy}
        />
      )}
    </div>
  );
}

function RecordModal({
  config,
  employees,
  value,
  onChange,
  onSave,
  onClose,
  busy,
}: {
  config: RecordsPageConfig;
  employees: { id: string; code: number; name: string }[];
  value: Partial<Row>;
  onChange: (v: Partial<Row>) => void;
  onSave: () => void;
  onClose: () => void;
  busy: boolean;
}) {
  const canSave = value.employee_id && value[config.dateKey];
  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-card rounded-2xl border border-border w-full max-w-lg" onClick={(e) => e.stopPropagation()}>
        <div className="p-4 border-b border-border flex items-center justify-between">
          <h2 className="text-lg font-bold">{value.id ? "تعديل سجل" : "سجل جديد"}</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">✕</button>
        </div>
        <div className="p-4 space-y-3">
          <div>
            <label className="block text-xs text-muted-foreground mb-1">الموظف *</label>
            <select
              value={(value.employee_id as string) ?? ""}
              onChange={(e) => onChange({ ...value, employee_id: e.target.value })}
              className="w-full px-3 py-2 rounded-md border border-input bg-background text-sm"
            >
              <option value="">— اختر —</option>
              {employees.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.code} — {e.name}
                </option>
              ))}
            </select>
          </div>
          {config.fields.map((f) => (
            <div key={f.key}>
              <label className="block text-xs text-muted-foreground mb-1">
                {f.label}{f.required && " *"}
              </label>
              {f.type === "select" ? (
                <select
                  value={(value[f.key] as string) ?? ""}
                  onChange={(e) => onChange({ ...value, [f.key]: e.target.value })}
                  className="w-full px-3 py-2 rounded-md border border-input bg-background text-sm"
                >
                  <option value="">—</option>
                  {f.options?.map((o) => <option key={o} value={o}>{o}</option>)}
                </select>
              ) : (
                <input
                  type={f.type}
                  value={(value[f.key] as string | number) ?? ""}
                  onChange={(e) => {
                    const v = e.target.value;
                    onChange({
                      ...value,
                      [f.key]: v === "" ? null : f.type === "number" ? Number(v) : v,
                    });
                  }}
                  className="w-full px-3 py-2 rounded-md border border-input bg-background text-sm"
                />
              )}
            </div>
          ))}
        </div>
        <div className="p-4 border-t border-border flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 rounded-lg border border-input text-sm hover:bg-accent">إلغاء</button>
          <button
            onClick={onSave}
            disabled={busy || !canSave}
            className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm hover:bg-primary/90 disabled:opacity-50"
          >
            {busy ? "جاري الحفظ..." : "حفظ"}
          </button>
        </div>
      </div>
    </div>
  );
}
