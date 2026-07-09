import { createFileRoute } from "@tanstack/react-router";
import { queryOptions } from "@tanstack/react-query";
import { listRows, listEmployeesLite } from "@/lib/hr.functions";
import { RecordsPage, type RecordsPageConfig } from "@/components/hr/RecordsPage";

const fmtMoney = (v: unknown) => Number(v ?? 0).toLocaleString("ar-EG");

const config: RecordsPageConfig = {
  table: "penalties",
  title: "الجزاءات",
  dateKey: "penalty_date",
  fields: [
    { key: "penalty_date", label: "التاريخ", type: "date", required: true },
    { key: "reason", label: "السبب", type: "text" },
    { key: "days", label: "عدد الأيام", type: "number" },
    { key: "amount", label: "قيمة الخصم", type: "number" },
    { key: "notes", label: "ملاحظات", type: "text" },
  ],
  columns: [
    { key: "penalty_date", label: "التاريخ" },
    { key: "reason", label: "السبب" },
    { key: "days", label: "أيام" },
    { key: "amount", label: "المبلغ", format: fmtMoney },
    { key: "notes", label: "ملاحظات" },
  ],
};

export const Route = createFileRoute("/_app/penalties")({
  head: () => ({ meta: [{ title: "الجزاءات" }] }),
  loader: ({ context }) => {
    context.queryClient.ensureQueryData(queryOptions({
      queryKey: ["hr-rows", "penalties"],
      queryFn: () => listRows({ data: { table: "penalties" } }),
    }));
    context.queryClient.ensureQueryData(queryOptions({
      queryKey: ["employees-lite"],
      queryFn: () => listEmployeesLite(),
    }));
  },
  component: () => <RecordsPage config={config} />,
});
