import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { queryOptions } from "@tanstack/react-query";
import { listEmployees } from "@/lib/employees.functions";

const employeesQuery = () =>
  queryOptions({
    queryKey: ["employees"],
    queryFn: () => listEmployees(),
  });

export const Route = createFileRoute("/_app/")({
  loader: ({ context }) => {
    context.queryClient.ensureQueryData(employeesQuery());
  },
  component: Dashboard,
});

function Dashboard() {
  const { data: employees } = useSuspenseQuery(employeesQuery());

  const active = employees.filter((e) => e.is_active !== false).length;
  const bySalary = employees.reduce((sum, e) => sum + Number(e.salary ?? 0), 0);
  const companies = new Set(employees.map((e) => e.company).filter(Boolean)).size;
  const shifts = new Set(employees.map((e) => e.shift).filter(Boolean)).size;

  const stats = [
    { label: "إجمالي الموظفين", value: employees.length },
    { label: "الموظفون النشطون", value: active },
    { label: "الشركات", value: companies },
    { label: "الورديات", value: shifts },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">لوحة التحكم</h1>
        <p className="text-sm text-muted-foreground mt-1">نظرة عامة على بيانات الموارد البشرية</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {stats.map((s) => (
          <div key={s.label} className="bg-card rounded-xl border border-border p-4">
            <div className="text-xs text-muted-foreground">{s.label}</div>
            <div className="text-2xl font-bold text-foreground mt-1">{s.value.toLocaleString("ar-EG")}</div>
          </div>
        ))}
      </div>

      <div className="bg-card rounded-xl border border-border p-4">
        <div className="text-xs text-muted-foreground">إجمالي الرواتب الأساسية</div>
        <div className="text-3xl font-bold text-foreground mt-1">
          {bySalary.toLocaleString("ar-EG")} <span className="text-base font-normal text-muted-foreground">ج.م</span>
        </div>
      </div>

      <div className="bg-card rounded-xl border border-border p-6">
        <h2 className="font-semibold text-foreground mb-3">ابدأ من هنا</h2>
        <div className="grid sm:grid-cols-2 gap-3">
          <Link to="/employees" className="block p-4 rounded-lg border border-border hover:bg-accent transition">
            <div className="font-medium">إدارة الموظفين</div>
            <div className="text-xs text-muted-foreground mt-1">إضافة، تعديل، وحذف بيانات الموظفين</div>
          </Link>
          {employees.length === 0 && (
            <Link to="/employees" className="block p-4 rounded-lg border border-primary bg-primary/5 hover:bg-primary/10 transition">
              <div className="font-medium text-primary">استيراد من ملف Excel</div>
              <div className="text-xs text-muted-foreground mt-1">اضغط لرفع ملف "متغيرات" وتعبئة البيانات</div>
            </Link>
          )}
        </div>
      </div>

      <p className="text-xs text-muted-foreground text-center">
        المرحلة 2 (الحضور، الجزاءات، السلف) والمرحلة 3 (الرواتب) قيد التطوير.
      </p>
    </div>
  );
}
