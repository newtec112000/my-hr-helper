import { createFileRoute } from "@tanstack/react-router";
import { queryOptions } from "@tanstack/react-query";
import { listRows, listEmployeesLite } from "@/lib/hr.functions";
import { RecordsPage, type RecordsPageConfig } from "@/components/hr/RecordsPage";

const fmtMoney = (v: unknown) => Number(v ?? 0).toLocaleString("ar-EG");

const config: RecordsPageConfig = {
  table: "advances",
  title: "السلف",
  dateKey: "advance_date",
  fields: [
    { key: "advance_date", label: "التاريخ", type: "date", required: true },
    { key: "amount", label: "قيمة السلفة", type: "number", required: true },
    { key: "installments", label: "عدد الأقساط", type: "number" },
    { key: "monthly_deduction", label: "القسط الشهري", type: "number" },
    { key: "remaining", label: "المتبقي", type: "number" },
    { key: "status", label: "الحالة", type: "select", options: ["active", "paid", "cancelled"] },
    { key: "notes", label: "ملاحظات", type: "text" },
  ],
  columns: [
    { key: "advance_date", label: "التاريخ" },
    { key: "amount", label: "القيمة", format: fmtMoney },
    { key: "installments", label: "أقساط" },
    { key: "monthly_deduction", label: "قسط شهري", format: fmtMoney },
    { key: "remaining", label: "المتبقي", format: fmtMoney },
    { key: "status", label: "الحالة" },
  ],
};

export const Route = createFileRoute("/_app/advances")({
  head: () => ({ meta: [{ title: "السلف" }] }),
  loader: ({ context }) => {
    context.queryClient.ensureQueryData(queryOptions({
      queryKey: ["hr-rows", "advances"],
      queryFn: () => listRows({ data: { table: "advances" } }),
    }));
    context.queryClient.ensureQueryData(queryOptions({
      queryKey: ["employees-lite"],
      queryFn: () => listEmployeesLite(),
    }));
  },
  component: () => <RecordsPage config={config} />,
});
