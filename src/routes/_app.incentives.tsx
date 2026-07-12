import { createFileRoute } from "@tanstack/react-router";
import { queryOptions } from "@tanstack/react-query";
import { listRows, listEmployeesLite } from "@/lib/hr.functions";
import { RecordsPage, type RecordsPageConfig } from "@/components/hr/RecordsPage";

const fmtMoney = (v: unknown) => Number(v ?? 0).toLocaleString("ar-EG");

const config: RecordsPageConfig = {
  table: "incentives",
  title: "الحوافز والبدلات",
  dateKey: "incentive_date",
  fields: [
    { key: "incentive_date", label: "التاريخ", type: "date", required: true },
    {
      key: "incentive_type",
      label: "نوع الحافز",
      type: "select",
      required: true,
      options: ["انتظام", "إنتاج", "انتقال", "بدل طبيعة عمل"],
    },
    { key: "amount", label: "القيمة", type: "number", required: true },
    { key: "notes", label: "ملاحظات", type: "text" },
  ],
  columns: [
    { key: "incentive_date", label: "التاريخ" },
    { key: "incentive_type", label: "نوع الحافز" },
    { key: "amount", label: "القيمة", format: fmtMoney },
    { key: "notes", label: "ملاحظات" },
  ],
};

export const Route = createFileRoute("/_app/incentives")({
  head: () => ({ meta: [{ title: "الحوافز والبدلات" }] }),
  loader: ({ context }) => {
    context.queryClient.ensureQueryData(
      queryOptions({
        queryKey: ["hr-rows", "incentives"],
        queryFn: () => listRows({ data: { table: "incentives" } }),
      }),
    );
    context.queryClient.ensureQueryData(
      queryOptions({
        queryKey: ["employees-lite"],
        queryFn: () => listEmployeesLite(),
      }),
    );
  },
  component: () => <RecordsPage config={config} />,
});
