import { createFileRoute } from "@tanstack/react-router";
import { queryOptions } from "@tanstack/react-query";
import { listRows, listEmployeesLite } from "@/lib/hr.functions";
import { RecordsPage, type RecordsPageConfig } from "@/components/hr/RecordsPage";

const fmtMoney = (v: unknown) => Number(v ?? 0).toLocaleString("ar-EG");

const config: RecordsPageConfig = {
  table: "bonuses",
  title: "المكافآت والبدلات الإضافية",
  dateKey: "bonus_date",
  fields: [
    { key: "bonus_date", label: "التاريخ", type: "date", required: true },
    { key: "bonus_type", label: "النوع", type: "select", options: ["مكافأة", "حافز إنتاج", "بدل انتقال", "بدل طعام", "بدل طبيعة عمل", "أخرى"] },
    { key: "amount", label: "القيمة", type: "number", required: true },
    { key: "notes", label: "ملاحظات", type: "text" },
  ],
  columns: [
    { key: "bonus_date", label: "التاريخ" },
    { key: "bonus_type", label: "النوع" },
    { key: "amount", label: "القيمة", format: fmtMoney },
    { key: "notes", label: "ملاحظات" },
  ],
};

export const Route = createFileRoute("/_app/bonuses")({
  head: () => ({ meta: [{ title: "المكافآت والبدلات" }] }),
  loader: ({ context }) => {
    context.queryClient.ensureQueryData(queryOptions({
      queryKey: ["hr-rows", "bonuses"],
      queryFn: () => listRows({ data: { table: "bonuses" } }),
    }));
    context.queryClient.ensureQueryData(queryOptions({
      queryKey: ["employees-lite"],
      queryFn: () => listEmployeesLite(),
    }));
  },
  component: () => <RecordsPage config={config} />,
});
