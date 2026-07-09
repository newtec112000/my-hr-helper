import { createServerFn } from "@tanstack/react-start";

type TableName = "attendance" | "penalties" | "advances" | "bonuses";

async function admin() {
  const { assertUnlocked } = await import("./gate.functions");
  await assertUnlocked();
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  return supabaseAdmin;
}

function clean(input: Record<string, unknown>) {
  const c: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(input)) {
    if (v === "" || v === undefined) continue;
    c[k] = v;
  }
  return c;
}

// ---- Attendance ----
export const listAttendance = createServerFn({ method: "GET" })
  .inputValidator((i: { from?: string; to?: string; employee_id?: string }) => i)
  .handler(async ({ data }) => {
    const sb = await admin();
    let q = sb.from("attendance").select("*, employees(code,name)").order("work_date", { ascending: false });
    if (data.from) q = q.gte("work_date", data.from);
    if (data.to) q = q.lte("work_date", data.to);
    if (data.employee_id) q = q.eq("employee_id", data.employee_id);
    const { data: rows, error } = await q.limit(2000);
    if (error) throw new Error(error.message);
    return rows ?? [];
  });

export const upsertAttendance = createServerFn({ method: "POST" })
  .inputValidator((i: Record<string, unknown>) => i)
  .handler(async ({ data }) => {
    const sb = await admin();
    const { data: row, error } = await sb
      .from("attendance")
      .upsert(clean(data) as never, { onConflict: "employee_id,work_date" })
      .select()
      .single();
    if (error) throw new Error(error.message);
    return row;
  });

// ---- Generic CRUD ----
export const listRows = createServerFn({ method: "GET" })
  .inputValidator((i: { table: TableName; from?: string; to?: string; employee_id?: string }) => i)
  .handler(async ({ data }) => {
    const sb = await admin();
    const dateCol =
      data.table === "penalties" ? "penalty_date" :
      data.table === "advances" ? "advance_date" :
      data.table === "bonuses" ? "bonus_date" : "work_date";
    let q = sb.from(data.table).select("*, employees(code,name)").order(dateCol, { ascending: false });
    if (data.from) q = q.gte(dateCol, data.from);
    if (data.to) q = q.lte(dateCol, data.to);
    if (data.employee_id) q = q.eq("employee_id", data.employee_id);
    const { data: rows, error } = await q.limit(2000);
    if (error) throw new Error(error.message);
    return rows ?? [];
  });

export const upsertRow = createServerFn({ method: "POST" })
  .inputValidator((i: { table: TableName; values: Record<string, unknown> }) => i)
  .handler(async ({ data }) => {
    const sb = await admin();
    const values = clean(data.values);
    const q = values.id
      ? sb.from(data.table).update(values as never).eq("id", values.id as string).select().single()
      : sb.from(data.table).insert(values as never).select().single();
    const { data: row, error } = await q;
    if (error) throw new Error(error.message);
    return row;
  });

export const deleteRow = createServerFn({ method: "POST" })
  .inputValidator((i: { table: TableName; id: string }) => i)
  .handler(async ({ data }) => {
    const sb = await admin();
    const { error } = await sb.from(data.table).delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true as const };
  });

export const listEmployeesLite = createServerFn({ method: "GET" }).handler(async () => {
  const sb = await admin();
  const { data, error } = await sb.from("employees").select("id,code,name").order("code");
  if (error) throw new Error(error.message);
  return data ?? [];
});
