// Mapping between Arabic Excel headers and DB column names for the "القوة" sheet.

export type FieldType = "text" | "number" | "integer" | "date" | "boolean";

export interface FieldDef {
  key: string;
  labelAr: string;
  type: FieldType;
  group: "أساسي" | "الراتب والبدلات" | "شخصي" | "الهوية" | "التأمينات" | "المستندات" | "العقد";
}

export const EMPLOYEE_FIELDS: FieldDef[] = [
  { key: "code", labelAr: "الكود الوظيفي", type: "integer", group: "أساسي" },
  { key: "name", labelAr: "الاسم", type: "text", group: "أساسي" },
  { key: "name_en", labelAr: "الإسم بالإنجليزية", type: "text", group: "أساسي" },
  { key: "job_title", labelAr: "الوظيفة", type: "text", group: "أساسي" },
  { key: "shift", labelAr: "الوردية", type: "text", group: "أساسي" },
  { key: "company", labelAr: "الشركة", type: "text", group: "أساسي" },
  { key: "hire_date", labelAr: "تاريخ التعيين", type: "date", group: "أساسي" },
  { key: "last_work_day", labelAr: "اخر يوم عمل", type: "text", group: "أساسي" },
  { key: "employment_type", labelAr: "نوع التعيين", type: "text", group: "أساسي" },
  { key: "payment_type", labelAr: "نوع الصرف", type: "text", group: "أساسي" },
  { key: "bank_account", labelAr: "رقم الحساب البنكى", type: "text", group: "أساسي" },

  { key: "salary", labelAr: "الراتب بعد التعديل", type: "number", group: "الراتب والبدلات" },
  { key: "allowance_regularity", labelAr: "انتظام", type: "number", group: "الراتب والبدلات" },
  { key: "allowance_transport", labelAr: "بدل انتقال", type: "number", group: "الراتب والبدلات" },
  { key: "allowance_production", labelAr: "حافز انتاج", type: "number", group: "الراتب والبدلات" },
  { key: "allowance_work_nature", labelAr: "بدل طبيعه عمل", type: "number", group: "الراتب والبدلات" },
  { key: "allowance_food", labelAr: "بدل غذاء", type: "number", group: "الراتب والبدلات" },
  { key: "service_years", labelAr: "فترة العمل حتى تاريخة", type: "number", group: "الراتب والبدلات" },
  { key: "annual_leave_balance", labelAr: "استحقاق الرصيد السنوي", type: "integer", group: "الراتب والبدلات" },

  { key: "national_id", labelAr: "الرقم القومى", type: "text", group: "الهوية" },
  { key: "id_type", labelAr: "نوع تحقيق الشخصية", type: "text", group: "الهوية" },
  { key: "id_place", labelAr: "محل الاصدار", type: "text", group: "الهوية" },
  { key: "id_issue_date", labelAr: "تاريخ الاصدار", type: "date", group: "الهوية" },
  { key: "id_expiry_date", labelAr: "تاريخ الانتهاء", type: "date", group: "الهوية" },
  { key: "address", labelAr: "العنوان المدرج بالبطاقه", type: "text", group: "الهوية" },

  { key: "birth_date", labelAr: "تاريخ الميلاد", type: "date", group: "شخصي" },
  { key: "age", labelAr: "العمر", type: "number", group: "شخصي" },
  { key: "birth_place", labelAr: "محل الميلاد", type: "text", group: "شخصي" },
  { key: "birth_governorate", labelAr: "محافظة الميلاد", type: "text", group: "شخصي" },
  { key: "gender", labelAr: "النوع", type: "text", group: "شخصي" },
  { key: "religion", labelAr: "الديانة", type: "text", group: "شخصي" },
  { key: "nationality", labelAr: "الجنسية", type: "text", group: "شخصي" },
  { key: "military_status", labelAr: "الموقف من التجنيد", type: "text", group: "شخصي" },
  { key: "marital_status", labelAr: "الحالة الاجتماعية", type: "text", group: "شخصي" },
  { key: "children_count", labelAr: "عدد الابناء", type: "integer", group: "شخصي" },
  { key: "mobile", labelAr: "رقم المحمول", type: "text", group: "شخصي" },
  { key: "qualification", labelAr: "المؤهل", type: "text", group: "شخصي" },
  { key: "graduation_year", labelAr: "سنة التخرج", type: "integer", group: "شخصي" },

  { key: "insurance_wage", labelAr: "الأجر التأمينى", type: "number", group: "التأمينات" },
  { key: "social_insurance_status", labelAr: "التأمينات الاجتماعية ( مؤمن عليه / غير مؤمن )", type: "text", group: "التأمينات" },
  { key: "insurance_number", labelAr: "الرقم التأمينى", type: "text", group: "التأمينات" },
  { key: "insurance_office", labelAr: "مكتب التأمينات", type: "text", group: "التأمينات" },
  { key: "insurance_start_date", labelAr: "تاريخ الاشتراك بالتأمينات الاجتماعية", type: "date", group: "التأمينات" },
  { key: "insurance_end_date", labelAr: "تاريخ نهاية الإشتراك بالتأمينات الاجتماعية", type: "date", group: "التأمينات" },
  { key: "termination_reason", labelAr: "سبب انتهاء الخدمة", type: "text", group: "التأمينات" },
  { key: "medical_insurance", labelAr: "التأمين الطبي ( مؤمن / غير مؤمن )", type: "text", group: "التأمينات" },

  { key: "doc_birth_cert", labelAr: "اصل شهادة الميلاد", type: "text", group: "المستندات" },
  { key: "doc_qualification", labelAr: "أصلا المؤهل الدراسى", type: "text", group: "المستندات" },
  { key: "doc_military", labelAr: "اصل شهادة التجنيد", type: "text", group: "المستندات" },
  { key: "doc_photos", labelAr: "6 صور شخصية", type: "text", group: "المستندات" },
  { key: "doc_id_copies", labelAr: "6صور بطاقة", type: "text", group: "المستندات" },
  { key: "doc_form_111", labelAr: "نموذج 111", type: "text", group: "المستندات" },
  { key: "doc_skill_cert", labelAr: "شهادة قياس مستوى المهارة", type: "text", group: "المستندات" },
  { key: "doc_profession_license", labelAr: "ترخيص مزاولة المهنة", type: "text", group: "المستندات" },
  { key: "work_stub_status", labelAr: "موقف كعب العمل", type: "text", group: "المستندات" },

  { key: "locker_number", labelAr: "رقم اللوكر", type: "text", group: "العقد" },
  { key: "contract_start_date", labelAr: "تاريخ بداية عقد العمل", type: "date", group: "العقد" },
  { key: "contract_end_date", labelAr: "تاريخ نهاية عقد العمل", type: "date", group: "العقد" },
  { key: "notes", labelAr: "ملاحظات", type: "text", group: "العقد" },
];

const norm = (s: string) => String(s ?? "").replace(/\s+/g, " ").trim();

const HEADER_TO_KEY = new Map<string, string>();
for (const f of EMPLOYEE_FIELDS) HEADER_TO_KEY.set(norm(f.labelAr), f.key);

export function headerToKey(header: string): string | undefined {
  return HEADER_TO_KEY.get(norm(header));
}

export function coerce(value: unknown, type: FieldType): unknown {
  if (value === null || value === undefined || value === "") return null;
  if (type === "number" || type === "integer") {
    const n = typeof value === "number" ? value : Number(String(value).replace(/,/g, ""));
    if (!isFinite(n)) return null;
    return type === "integer" ? Math.trunc(n) : n;
  }
  if (type === "date") {
    // xlsx returns JS Date objects when cellDates:true
    if (value instanceof Date) {
      const y = value.getFullYear();
      if (y < 1920 || y > 2100) return null; // filter obvious bad dates
      return value.toISOString().slice(0, 10);
    }
    const d = new Date(String(value));
    if (isNaN(d.getTime())) return null;
    const y = d.getFullYear();
    if (y < 1920 || y > 2100) return null;
    return d.toISOString().slice(0, 10);
  }
  if (type === "boolean") return Boolean(value);
  return String(value);
}
