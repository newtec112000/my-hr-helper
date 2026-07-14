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
  shift: string | null;
  company: string | null;
  hire_date: string | null;
  last_work_day: string | null;
  employment_type: string | null;
  payment_type: string | null;
  insurance_wage: number;
  base_salary: number;
  daily_wage: number;
  // earnings
  incentive_regularity: number;
  incentive_production: number;
  allowance_work_nature: number;
  extra_injections: number;
  transport_value: number;
  allowance_food: number;
  gross: number;
  // absences (days + values)
  absent_excused_days: number;
  absent_unexcused_days: number;
  absent_unexcused_penalty_days: number;
  admin_penalty_days: number;
  absent_excused_value: number;
  absent_unexcused_value: number;
  absent_unexcused_penalty_value: number;
  admin_penalty_value: number;
  // deductions
  monthly_advance: number;
  phased_advance: number;
  insurance_deduction: number;
  insurance_rate: number;
  insurance_source_date: string | null;
  insurance_source: "record" | "employee";
  total_deductions: number;
  net: number;
  notes: string | null;
};

const num = (v: unknown) => (v == null ? 0 : Number(v) || 0);
const r2 = (n: number) => Math.round(n * 100) / 100;

export const computePayroll = createServerFn({ method: "GET" })
  .inputValidator((i: { month: string }) => i) // YYYY-MM
  .handler(async ({ data }): Promise<PayrollRow[]> => {
    const sb = await admin();
    const [y, m] = data.month.split("-").map(Number);
    const from = `${data.month}-01`;
    const to = new Date(y, m, 0).toISOString().slice(0, 10);

    const [empRes, attRes, penRes, advRes, incRes, insRes] = await Promise.all([
      sb.from("employees").select("*").order("code"),
      sb.from("attendance").select("employee_id,status,work_date").gte("work_date", from).lte("work_date", to),
      sb.from("penalties").select("employee_id,amount,days,reason,penalty_date").gte("penalty_date", from).lte("penalty_date", to),
      sb.from("advances").select("employee_id,amount,monthly_deduction,installments,status,advance_date"),
      sb.from("incentives" as never).select("employee_id,amount,incentive_type,incentive_date").gte("incentive_date", from).lte("incentive_date", to),
      sb.from("insurance" as never).select("employee_id,basis,rate,amount,insurance_date").lte("insurance_date", to).order("insurance_date", { ascending: false }),
    ]);
    if (empRes.error) throw new Error(empRes.error.message);

    // ---- attendance days by category ----
    type DayCats = { excused: number; unexcused: number; unexcusedPenalty: number; admin: number };
    const dayMap = new Map<string, DayCats>();
    const cats = (id: string) => {
      let c = dayMap.get(id);
      if (!c) { c = { excused: 0, unexcused: 0, unexcusedPenalty: 0, admin: 0 }; dayMap.set(id, c); }
      return c;
    };
    for (const a of (attRes.data ?? []) as Array<{ employee_id: string; status: string }>) {
      const s = (a.status ?? "").trim();
      const c = cats(a.employee_id);
      if (s === "غياب بأذن" || s === "غياب بإذن") c.excused += 1;
      else if (s === "غائب" || s === "غياب بدون إذن" || s === "غياب بدون اذن") c.unexcused += 1;
      else if (s.includes("جزاء") && s.includes("إدار")) c.admin += 1;
    }

    // ---- penalties split by reason ----
    type PenCats = { unexcusedPenaltyDays: number; unexcusedPenaltyValue: number; adminValue: number; adminDays: number };
    const penMap = new Map<string, PenCats>();
    const pcats = (id: string) => {
      let c = penMap.get(id);
      if (!c) { c = { unexcusedPenaltyDays: 0, unexcusedPenaltyValue: 0, adminValue: 0, adminDays: 0 }; penMap.set(id, c); }
      return c;
    };
    for (const p of (penRes.data ?? []) as Array<{ employee_id: string; amount: unknown; days: unknown; reason: string | null }>) {
      const c = pcats(p.employee_id);
      const amt = num(p.amount);
      const dys = num(p.days);
      const reason = (p.reason ?? "").trim();
      if (reason.includes("غياب")) {
        c.unexcusedPenaltyValue += amt;
        c.unexcusedPenaltyDays += dys;
      } else {
        c.adminValue += amt;
        c.adminDays += dys;
      }
    }

    // ---- advances split ----
    type AdvCats = { monthly: number; phased: number };
    const advMap = new Map<string, AdvCats>();
    for (const a of (advRes.data ?? []) as Array<{ employee_id: string; amount: unknown; monthly_deduction: unknown; installments: unknown; status: string; advance_date: string }>) {
      if (a.status !== "active") continue;
      const id = a.employee_id;
      let c = advMap.get(id);
      if (!c) { c = { monthly: 0, phased: 0 }; advMap.set(id, c); }
      const inst = num(a.installments);
      const md = num(a.monthly_deduction);
      if (inst > 1) c.phased += md;
      else if ((a.advance_date ?? "").slice(0, 7) === data.month) c.monthly += num(a.amount);
      else c.monthly += md;
    }

    // ---- incentives by type ----
    type IncCats = { regularity: number; production: number; transport: number; work_nature: number };
    const incMap = new Map<string, IncCats>();
    for (const r of (incRes.data ?? []) as Array<{ employee_id: string; amount: unknown; incentive_type: string }>) {
      let c = incMap.get(r.employee_id);
      if (!c) { c = { regularity: 0, production: 0, transport: 0, work_nature: 0 }; incMap.set(r.employee_id, c); }
      const v = num(r.amount);
      const t = (r.incentive_type ?? "").trim();
      if (t === "انتظام") c.regularity += v;
      else if (t === "إنتاج" || t === "انتاج") c.production += v;
      else if (t === "انتقال") c.transport += v;
      else if (t === "بدل طبيعة عمل") c.work_nature += v;
    }

    // ---- insurance: pick latest record per employee up to end of month ----
    type InsRec = { basis: number; rate: number; amount: number | null; date: string };
    const insMap = new Map<string, InsRec>();
    for (const r of (insRes.data ?? []) as Array<{ employee_id: string; basis: unknown; rate: unknown; amount: unknown; insurance_date: string }>) {
      if (insMap.has(r.employee_id)) continue;
      insMap.set(r.employee_id, { basis: num(r.basis), rate: num(r.rate), amount: r.amount == null ? null : num(r.amount), date: r.insurance_date });
    }

    const out: PayrollRow[] = [];
    for (const e of empRes.data ?? []) {
      const emp = e as never as Record<string, unknown> & { id: string; code: number; name: string };
      const base = num(emp.salary);
      const daily = base / 30;
      const insWage = num(emp.insurance_wage);

      const inc = incMap.get(emp.id) ?? { regularity: 0, production: 0, transport: 0, work_nature: 0 };
      const workNature = num(emp.allowance_work_nature) + inc.work_nature;
      const transport = num(emp.allowance_transport) + inc.transport;
      const food = num(emp.allowance_food);
      const extraInj = 0;

      const gross = base + inc.regularity + inc.production + workNature + extraInj + transport + food;

      const d = dayMap.get(emp.id) ?? { excused: 0, unexcused: 0, unexcusedPenalty: 0, admin: 0 };
      const p = penMap.get(emp.id) ?? { unexcusedPenaltyDays: 0, unexcusedPenaltyValue: 0, adminValue: 0, adminDays: 0 };
      const excusedVal = daily * d.excused;
      const unexcusedVal = daily * d.unexcused;
      const penDays = p.unexcusedPenaltyDays || d.unexcused;
      const penVal = p.unexcusedPenaltyValue || daily * d.unexcused;
      const adminDays = p.adminDays || d.admin;
      const adminVal = p.adminValue || daily * d.admin;

      const adv = advMap.get(emp.id) ?? { monthly: 0, phased: 0 };
      const insRec = insMap.get(emp.id);
      const effectiveInsWage = insRec?.basis || insWage;
      const effectiveRate = insRec?.rate ?? 0.11;
      const insDed = insRec?.amount != null
        ? r2(insRec.amount)
        : r2(effectiveInsWage * effectiveRate);

      const totalDed = excusedVal + unexcusedVal + penVal + adminVal + adv.monthly + adv.phased + insDed;
      const net = gross - totalDed;

      out.push({
        employee_id: emp.id,
        code: emp.code,
        name: emp.name,
        job_title: (emp.job_title as string) ?? null,
        shift: (emp.shift as string) ?? null,
        company: (emp.company as string) ?? null,
        hire_date: (emp.hire_date as string) ?? null,
        last_work_day: (emp.last_work_day as string) ?? null,
        employment_type: (emp.employment_type as string) ?? null,
        payment_type: (emp.payment_type as string) ?? null,
        insurance_wage: effectiveInsWage,
        base_salary: base,
        daily_wage: r2(daily),
        incentive_regularity: inc.regularity,
        incentive_production: inc.production,
        allowance_work_nature: workNature,
        extra_injections: extraInj,
        transport_value: transport,
        allowance_food: food,
        gross: r2(gross),
        absent_excused_days: d.excused,
        absent_unexcused_days: d.unexcused,
        absent_unexcused_penalty_days: penDays,
        admin_penalty_days: adminDays,
        absent_excused_value: r2(excusedVal),
        absent_unexcused_value: r2(unexcusedVal),
        absent_unexcused_penalty_value: r2(penVal),
        admin_penalty_value: r2(adminVal),
        monthly_advance: r2(adv.monthly),
        phased_advance: r2(adv.phased),
        insurance_deduction: insDed,
        total_deductions: r2(totalDed),
        net: r2(net),
        notes: (emp.notes as string) ?? null,
      });
    }
    return out;
  });
