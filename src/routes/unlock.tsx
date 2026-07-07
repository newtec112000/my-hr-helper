import { createFileRoute, useRouter, redirect } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { getGateStatus, unlockSite } from "@/lib/gate.functions";

export const Route = createFileRoute("/unlock")({
  head: () => ({
    meta: [
      { title: "تسجيل الدخول — نظام الموارد البشرية" },
      { name: "description", content: "الدخول لنظام إدارة الموارد البشرية" },
    ],
  }),
  beforeLoad: async () => {
    const { unlocked } = await getGateStatus();
    if (unlocked) throw redirect({ to: "/" });
  },
  component: UnlockPage,
});

function UnlockPage() {
  const router = useRouter();
  const unlock = useServerFn(unlockSite);
  const [pw, setPw] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(false);
    const res = await unlock({ data: { password: pw } });
    setLoading(false);
    if (res.ok) {
      await router.navigate({ to: "/" });
      router.invalidate();
    } else {
      setError(true);
    }
  }

  return (
    <div dir="rtl" className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary text-primary-foreground text-2xl font-bold mb-4">
            HR
          </div>
          <h1 className="text-2xl font-bold text-foreground">نظام الموارد البشرية</h1>
          <p className="mt-2 text-sm text-muted-foreground">أدخل كلمة السر للدخول</p>
        </div>
        <form onSubmit={onSubmit} className="bg-card rounded-2xl shadow-sm border border-border p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2 text-foreground">كلمة السر</label>
            <input
              type="password"
              value={pw}
              onChange={(e) => setPw(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring text-base"
              autoFocus
              autoComplete="current-password"
              required
            />
          </div>
          {error && (
            <p className="text-sm text-destructive text-center">كلمة السر غير صحيحة</p>
          )}
          <button
            type="submit"
            disabled={loading || !pw}
            className="w-full py-3 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 disabled:opacity-50 transition"
          >
            {loading ? "جاري التحقق..." : "دخول"}
          </button>
        </form>
      </div>
    </div>
  );
}
