
CREATE TABLE public.incentives (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  incentive_date DATE NOT NULL,
  incentive_type TEXT NOT NULL,
  amount NUMERIC(12,2) NOT NULL DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT ALL ON public.incentives TO service_role;
ALTER TABLE public.incentives ENABLE ROW LEVEL SECURITY;
CREATE POLICY "no client access" ON public.incentives FOR ALL USING (false) WITH CHECK (false);
CREATE TRIGGER incentives_updated_at BEFORE UPDATE ON public.incentives
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE INDEX idx_incentives_emp_date ON public.incentives(employee_id, incentive_date);
