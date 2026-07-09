import { createFileRoute } from "@tanstack/react-router";
import { queryOptions } from "@tanstack/react-query";
import { listRows, listEmployeesLite } from "@/lib/hr.functions";
import { RecordsPage, type RecordsPageConfig } from "@/components/hr/RecordsPage";

const config: RecordsPageConfig = {
  table: "attendance",
  title: "الحضور والانصراف",
  dateKey: "work_date",
  fields: [
    { key: "work_date", label: "التاريخ", type: "date", required: true },
    { key: "status", label: "الحالة", type: "select", options: ["حاضر", "غائب", "إجازة", "مرضي", "عطلة رسمية", "مأمورية"] },
    { key: "hours_worked", label: "ساعات العمل", type: "number" },
    { key: "overtime_hours", label: "ساعات إضافية", type: "number" },
    { key: "notes", label: "ملاحظات", type: "text" },
  ],
  columns: [
    { key: "work_date", label: "التاريخ" },
    { key: "status", label: "الحالة" },
    { key: "hours_worked", label: "ساعات" },
    { key: "overtime_hours", label: "إضافي" },
    { key: "notes", label: "ملاحظات" },
  ],
};

export const Route = createFileRoute("/_app/attendance")({
  head: () => ({ meta: [{ title: "الحضور والانصراف" }] }),
  loader: ({ context }) => {
    context.queryClient.ensureQueryData(queryOptions({
      queryKey: ["hr-rows", "attendance"],
      queryFn: () => listRows({ data: { table: "attendance" } }),
    }));
    context.queryClient.ensureQueryData(queryOptions({
      queryKey: ["employees-lite"],
      queryFn: () => listEmployeesLite(),
    }));
  },
  component: () => <RecordsPage config={config} />,
});
