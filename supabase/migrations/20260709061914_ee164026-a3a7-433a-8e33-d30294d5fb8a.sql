
-- Attendance
CREATE TABLE public.attendance (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id uuid NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  work_date date NOT NULL,
  status text NOT NULL DEFAULT 'present',
  hours_worked numeric DEFAULT 0,
  overtime_hours numeric DEFAULT 0,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (employee_id, work_date)
);
GRANT ALL ON public.attendance TO service_role;
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;
CREATE POLICY "no_client_access_attendance" ON public.attendance FOR ALL USING (false) WITH CHECK (false);
CREATE TRIGGER trg_attendance_updated BEFORE UPDATE ON public.attendance FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE INDEX idx_attendance_emp_date ON public.attendance(employee_id, work_date);

-- Penalties
CREATE TABLE public.penalties (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id uuid NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  penalty_date date NOT NULL,
  reason text,
  days numeric DEFAULT 0,
  amount numeric NOT NULL DEFAULT 0,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.penalties TO service_role;
ALTER TABLE public.penalties ENABLE ROW LEVEL SECURITY;
CREATE POLICY "no_client_access_penalties" ON public.penalties FOR ALL USING (false) WITH CHECK (false);
CREATE TRIGGER trg_penalties_updated BEFORE UPDATE ON public.penalties FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE INDEX idx_penalties_emp ON public.penalties(employee_id, penalty_date);

-- Advances (loans)
CREATE TABLE public.advances (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id uuid NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  advance_date date NOT NULL,
  amount numeric NOT NULL DEFAULT 0,
  installments integer DEFAULT 1,
  monthly_deduction numeric DEFAULT 0,
  remaining numeric DEFAULT 0,
  status text NOT NULL DEFAULT 'active',
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.advances TO service_role;
ALTER TABLE public.advances ENABLE ROW LEVEL SECURITY;
CREATE POLICY "no_client_access_advances" ON public.advances FOR ALL USING (false) WITH CHECK (false);
CREATE TRIGGER trg_advances_updated BEFORE UPDATE ON public.advances FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE INDEX idx_advances_emp ON public.advances(employee_id, advance_date);

-- Bonuses / extra allowances
CREATE TABLE public.bonuses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id uuid NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  bonus_date date NOT NULL,
  bonus_type text,
  amount numeric NOT NULL DEFAULT 0,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.bonuses TO service_role;
ALTER TABLE public.bonuses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "no_client_access_bonuses" ON public.bonuses FOR ALL USING (false) WITH CHECK (false);
CREATE TRIGGER trg_bonuses_updated BEFORE UPDATE ON public.bonuses FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE INDEX idx_bonuses_emp ON public.bonuses(employee_id, bonus_date);
