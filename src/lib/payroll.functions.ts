import { createServerFn } from "@tanstack/react-start";

async function admin() {
  const { assertUnlocked } = await import("./gate.functions");
  await assertUnlocked();
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  return supabaseAdmin;
}

export type PayrollRow = {
  employee_id: string;
  code: number;
  name: string;
  job_title: string | null;
  company: string | null;
  base_salary: number;
  allowances_regularity: number;
  allowances_transport: number;
  allowances_production: number;
  allowances_work_nature: number;
  allowances_food: number;
  allowances_total: number;
  incentive_regularity: number;
  incentive_production: number;
  incentive_transport: number;
  incentive_work_nature: number;
  incentives_total: number;
  bonuses_total: number;
  penalties_total: number;
  advance_deduction: number;
  absent_days: number;
  absent_deduction: number;
  gross: number;
  total_deductions: number;
  net: number;
};

const num = (v: unknown) => (v == null ? 0 : Number(v) || 0);

export const computePayroll = createServerFn({ method: "GET" })
  .inputValidator((i: { month: string }) => i) // YYYY-MM
  .handler(async ({ data }): Promise<PayrollRow[]> => {
    const sb = await admin();
    const [y, m] = data.month.split("-").map(Number);
    const from = `${data.month}-01`;
    const to = new Date(y, m, 0).toISOString().slice(0, 10);
    const workDays = new Date(y, m, 0).getDate();

    const [empRes, attRes, penRes, advRes, bonRes, incRes] = await Promise.all([
      sb.from("employees").select("*").order("code"),
      sb.from("attendance").select("employee_id,status,work_date").gte("work_date", from).lte("work_date", to),
      sb.from("penalties").select("employee_id,amount,penalty_date").gte("penalty_date", from).lte("penalty_date", to),
      sb.from("advances").select("employee_id,monthly_deduction,status"),
      sb.from("bonuses").select("employee_id,amount,bonus_date").gte("bonus_date", from).lte("bonus_date", to),
      sb.from("incentives" as never).select("employee_id,amount,incentive_type,incentive_date").gte("incentive_date", from).lte("incentive_date", to),
    ]);
    if (empRes.error) throw new Error(empRes.error.message);

    const sumBy = (rows: { employee_id: string; amount?: unknown }[] | null, field = "amount") => {
      const m = new Map<string, number>();
      for (const r of rows ?? []) m.set(r.employee_id, (m.get(r.employee_id) ?? 0) + num((r as never)[field]));
      return m;
    };

    const penMap = sumBy(penRes.data as never);
    const bonMap = sumBy(bonRes.data as never);
    const advMap = new Map<string, number>();
    for (const a of advRes.data ?? []) {
      if ((a as never as { status: string }).status !== "active") continue;
      const id = (a as never as { employee_id: string }).employee_id;
      advMap.set(id, (advMap.get(id) ?? 0) + num((a as never as { monthly_deduction: unknown }).monthly_deduction));
    }
    const absMap = new Map<string, number>();
    for (const a of attRes.data ?? []) {
      const rec = a as never as { employee_id: string; status: string };
      if (rec.status === "غائب") absMap.set(rec.employee_id, (absMap.get(rec.employee_id) ?? 0) + 1);
    }

    const incByEmp = new Map<string, { regularity: number; production: number; transport: number; work_nature: number }>();
    for (const r of (incRes.data ?? []) as Array<{ employee_id: string; amount: unknown; incentive_type: string }>) {
      const cur = incByEmp.get(r.employee_id) ?? { regularity: 0, production: 0, transport: 0, work_nature: 0 };
      const v = num(r.amount);
      const t = (r.incentive_type ?? "").trim();
      if (t === "انتظام") cur.regularity += v;
      else if (t === "إنتاج" || t === "انتاج") cur.production += v;
      else if (t === "انتقال") cur.transport += v;
      else if (t === "بدل طبيعة عمل") cur.work_nature += v;
      incByEmp.set(r.employee_id, cur);
    }

    const out: PayrollRow[] = [];
    for (const e of empRes.data ?? []) {
      const emp = e as never as Record<string, unknown> & { id: string; code: number; name: string };
      const base = num(emp.salary);
      const a1 = num(emp.allowance_regularity);
      const a2 = num(emp.allowance_transport);
      const a3 = num(emp.allowance_production);
      const a4 = num(emp.allowance_work_nature);
      const a5 = num(emp.allowance_food);
      const allowances = a1 + a2 + a3 + a4 + a5;
      const inc = incByEmp.get(emp.id) ?? { regularity: 0, production: 0, transport: 0, work_nature: 0 };
      const incTotal = inc.regularity + inc.production + inc.transport + inc.work_nature;
      const bonuses = bonMap.get(emp.id) ?? 0;
      const penalties = penMap.get(emp.id) ?? 0;
      const adv = advMap.get(emp.id) ?? 0;
      const absentDays = absMap.get(emp.id) ?? 0;
      const daily = base > 0 && workDays > 0 ? base / workDays : 0;
      const absentDed = daily * absentDays;
      const gross = base + allowances + incTotal + bonuses;
      const deductions = penalties + adv + absentDed;
      out.push({
        employee_id: emp.id,
        code: emp.code,
        name: emp.name,
        job_title: (emp.job_title as string) ?? null,
        company: (emp.company as string) ?? null,
        base_salary: base,
        allowances_regularity: a1,
        allowances_transport: a2,
        allowances_production: a3,
        allowances_work_nature: a4,
        allowances_food: a5,
        allowances_total: allowances,
        incentive_regularity: inc.regularity,
        incentive_production: inc.production,
        incentive_transport: inc.transport,
        incentive_work_nature: inc.work_nature,
        incentives_total: incTotal,
        bonuses_total: bonuses,
        penalties_total: penalties,
        advance_deduction: adv,
        absent_days: absentDays,
        absent_deduction: Math.round(absentDed * 100) / 100,
        gross: Math.round(gross * 100) / 100,
        total_deductions: Math.round(deductions * 100) / 100,
        net: Math.round((gross - deductions) * 100) / 100,
      });
    }
    return out;
  });
