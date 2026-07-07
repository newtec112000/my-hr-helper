import { createServerFn } from "@tanstack/react-start";

export type EmployeeInput = Record<string, unknown> & {
  code: number;
  name: string;
};

export const listEmployees = createServerFn({ method: "GET" }).handler(async () => {
  const { assertUnlocked } = await import("./gate.functions");
  await assertUnlocked();
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data, error } = await supabaseAdmin
    .from("employees")
    .select("*")
    .order("code", { ascending: true });
  if (error) throw new Error(error.message);
  return data ?? [];
});

export const upsertEmployee = createServerFn({ method: "POST" })
  .inputValidator((input: EmployeeInput) => input)
  .handler(async ({ data }) => {
    const { assertUnlocked } = await import("./gate.functions");
    await assertUnlocked();
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    // Sanitize: strip undefined / empty-string dates
    const clean: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(data)) {
      if (v === "" || v === undefined) continue;
      clean[k] = v;
    }
    const { data: row, error } = await supabaseAdmin
      .from("employees")
      .upsert(clean as never, { onConflict: "code" })
      .select()
      .single();
    if (error) throw new Error(error.message);
    return row;
  });

export const deleteEmployee = createServerFn({ method: "POST" })
  .inputValidator((input: { id: string }) => input)
  .handler(async ({ data }) => {
    const { assertUnlocked } = await import("./gate.functions");
    await assertUnlocked();
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.from("employees").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true as const };
  });

export const bulkImportEmployees = createServerFn({ method: "POST" })
  .inputValidator((input: { rows: EmployeeInput[] }) => input)
  .handler(async ({ data }) => {
    const { assertUnlocked } = await import("./gate.functions");
    await assertUnlocked();
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    // Sanitize each row
    const cleaned = data.rows.map((row) => {
      const c: Record<string, unknown> = {};
      for (const [k, v] of Object.entries(row)) {
        if (v === "" || v === undefined || v === null) continue;
        c[k] = v;
      }
      return c;
    });
    // Chunk to avoid payload limits
    let inserted = 0;
    const chunkSize = 100;
    for (let i = 0; i < cleaned.length; i += chunkSize) {
      const chunk = cleaned.slice(i, i + chunkSize);
      const { error, count } = await supabaseAdmin
        .from("employees")
        .upsert(chunk as never, { onConflict: "code", count: "exact" });
      if (error) throw new Error(error.message);
      inserted += count ?? chunk.length;
    }
    return { inserted };
  });
