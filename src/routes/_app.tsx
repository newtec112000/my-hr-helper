import { createFileRoute, Outlet, Link, redirect, useRouter } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { getGateStatus, lockSite } from "@/lib/gate.functions";

export const Route = createFileRoute("/_app")({
  beforeLoad: async () => {
    const { unlocked } = await getGateStatus();
    if (!unlocked) throw redirect({ to: "/unlock" });
  },
  component: AppLayout,
});

const NAV = [
  { to: "/", label: "لوحة التحكم" },
  { to: "/employees", label: "الموظفون" },
  { to: "/attendance", label: "الحضور" },
  { to: "/penalties", label: "الجزاءات" },
  { to: "/advances", label: "السلف" },
  { to: "/bonuses", label: "المكافآت" },
  { to: "/payroll", label: "الرواتب" },
];

function AppLayout() {
  const router = useRouter();
  const lock = useServerFn(lockSite);

  async function handleLogout() {
    await lock();
    await router.navigate({ to: "/unlock" });
    router.invalidate();
  }

  return (
    <div dir="rtl" className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-border sticky top-0 z-40">
        <div className="max-w-[1400px] mx-auto px-4 h-14 flex items-center justify-between gap-4">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">HR</div>
              <span className="font-bold text-foreground hidden sm:inline">نظام الموارد البشرية</span>
            </div>
            <nav className="flex items-center gap-1">
              {NAV.map((n) => (
                <Link
                  key={n.to}
                  to={n.to}
                  className="px-3 py-1.5 rounded-md text-sm text-muted-foreground hover:text-foreground hover:bg-accent transition"
                  activeProps={{ className: "px-3 py-1.5 rounded-md text-sm bg-primary text-primary-foreground" }}
                >
                  {n.label}
                </Link>
              ))}
            </nav>
          </div>
          <button
            onClick={handleLogout}
            className="text-sm text-muted-foreground hover:text-destructive transition"
          >
            خروج
          </button>
        </div>
      </header>
      <main className="max-w-[1400px] mx-auto p-4 md:p-6">
        <Outlet />
      </main>
    </div>
  );
}
