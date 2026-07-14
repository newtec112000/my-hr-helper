CREATE TABLE public.insurance (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  insurance_date DATE NOT NULL,
  basis NUMERIC NOT NULL DEFAULT 0,
  amount NUMERIC,
  rate NUMERIC NOT NULL DEFAULT 0.11,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (employee_id, insurance_date)
);
GRANT ALL ON public.insurance TO service_role;
ALTER TABLE public.insurance ENABLE ROW LEVEL SECURITY;
CREATE POLICY "no_direct_access" ON public.insurance FOR ALL USING (false) WITH CHECK (false);
CREATE TRIGGER set_insurance_updated_at BEFORE UPDATE ON public.insurance FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();