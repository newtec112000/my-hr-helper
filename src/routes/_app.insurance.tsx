import { createFileRoute } from "@tanstack/react-router";
import { queryOptions } from "@tanstack/react-query";
import { listRows, listEmployeesLite } from "@/lib/hr.functions";
import { RecordsPage, type RecordsPageConfig } from "@/components/hr/RecordsPage";

const fmtMoney = (v: unknown) => Number(v ?? 0).toLocaleString("ar-EG");
const fmtRate = (v: unknown) => `${(Number(v ?? 0) * 100).toFixed(2)}%`;

const config: RecordsPageConfig = {
  table: "insurance",
  title: "تأمينات الموظفين",
  dateKey: "insurance_date",
  fields: [
    { key: "insurance_date", label: "الشهر (اختر أول يوم)", type: "date", required: true },
    { key: "basis", label: "الأجر التأميني", type: "number", required: true },
    { key: "rate", label: "نسبة الاستقطاع (مثال 0.11)", type: "number" },
    { key: "amount", label: "قيمة الاستقطاع (اختياري — تُحسب تلقائياً من الأجر × النسبة)", type: "number" },
    { key: "notes", label: "ملاحظات", type: "text" },
  ],
  columns: [
    { key: "insurance_date", label: "التاريخ" },
    { key: "basis", label: "الأجر التأميني", format: fmtMoney },
    { key: "rate", label: "النسبة", format: fmtRate },
    { key: "amount", label: "قيمة الاستقطاع", format: fmtMoney },
    { key: "notes", label: "ملاحظات" },
  ],
};

export const Route = createFileRoute("/_app/insurance")({
  head: () => ({ meta: [{ title: "تأمينات الموظفين" }] }),
  loader: ({ context }) => {
    context.queryClient.ensureQueryData(
      queryOptions({
        queryKey: ["hr-rows", "insurance"],
        queryFn: () => listRows({ data: { table: "insurance" } }),
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
