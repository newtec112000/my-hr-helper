
CREATE TABLE public.employees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  row_num INTEGER,
  code INTEGER UNIQUE NOT NULL,
  name TEXT NOT NULL,
  job_title TEXT,
  shift TEXT,
  company TEXT,
  hire_date DATE,
  last_work_day TEXT,
  employment_type TEXT,
  payment_type TEXT,
  bank_account TEXT,
  salary NUMERIC DEFAULT 0,
  allowance_regularity NUMERIC DEFAULT 0,
  allowance_transport NUMERIC DEFAULT 0,
  allowance_production NUMERIC DEFAULT 0,
  allowance_work_nature NUMERIC DEFAULT 0,
  allowance_food NUMERIC DEFAULT 0,
  service_years NUMERIC,
  annual_leave_balance INTEGER DEFAULT 0,
  address TEXT,
  national_id TEXT,
  id_type TEXT,
  id_place TEXT,
  id_issue_date DATE,
  id_expiry_date DATE,
  qualification TEXT,
  graduation_year INTEGER,
  birth_place TEXT,
  birth_governorate TEXT,
  gender TEXT,
  religion TEXT,
  nationality TEXT,
  military_status TEXT,
  marital_status TEXT,
  children_count INTEGER,
  mobile TEXT,
  birth_date DATE,
  age NUMERIC,
  insurance_wage NUMERIC DEFAULT 0,
  social_insurance_status TEXT,
  insurance_number TEXT,
  insurance_office TEXT,
  insurance_start_date DATE,
  insurance_end_date DATE,
  termination_reason TEXT,
  name_en TEXT,
  medical_insurance TEXT,
  work_stub_status TEXT,
  doc_birth_cert TEXT,
  doc_qualification TEXT,
  doc_military TEXT,
  doc_photos TEXT,
  doc_id_copies TEXT,
  doc_form_111 TEXT,
  doc_skill_cert TEXT,
  doc_profession_license TEXT,
  locker_number TEXT,
  contract_start_date DATE,
  contract_end_date DATE,
  notes TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT ALL ON public.employees TO service_role;
ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;
-- No policies: all access goes through server functions using service role (password-gated).

CREATE INDEX employees_company_idx ON public.employees(company);
CREATE INDEX employees_shift_idx ON public.employees(shift);
CREATE INDEX employees_is_active_idx ON public.employees(is_active);

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER employees_set_updated_at BEFORE UPDATE ON public.employees
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
