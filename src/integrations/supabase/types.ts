export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      advances: {
        Row: {
          advance_date: string
          amount: number
          created_at: string
          employee_id: string
          id: string
          installments: number | null
          monthly_deduction: number | null
          notes: string | null
          remaining: number | null
          status: string
          updated_at: string
        }
        Insert: {
          advance_date: string
          amount?: number
          created_at?: string
          employee_id: string
          id?: string
          installments?: number | null
          monthly_deduction?: number | null
          notes?: string | null
          remaining?: number | null
          status?: string
          updated_at?: string
        }
        Update: {
          advance_date?: string
          amount?: number
          created_at?: string
          employee_id?: string
          id?: string
          installments?: number | null
          monthly_deduction?: number | null
          notes?: string | null
          remaining?: number | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "advances_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      attendance: {
        Row: {
          created_at: string
          employee_id: string
          hours_worked: number | null
          id: string
          notes: string | null
          overtime_hours: number | null
          status: string
          updated_at: string
          work_date: string
        }
        Insert: {
          created_at?: string
          employee_id: string
          hours_worked?: number | null
          id?: string
          notes?: string | null
          overtime_hours?: number | null
          status?: string
          updated_at?: string
          work_date: string
        }
        Update: {
          created_at?: string
          employee_id?: string
          hours_worked?: number | null
          id?: string
          notes?: string | null
          overtime_hours?: number | null
          status?: string
          updated_at?: string
          work_date?: string
        }
        Relationships: [
          {
            foreignKeyName: "attendance_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      bonuses: {
        Row: {
          amount: number
          bonus_date: string
          bonus_type: string | null
          created_at: string
          employee_id: string
          id: string
          notes: string | null
          updated_at: string
        }
        Insert: {
          amount?: number
          bonus_date: string
          bonus_type?: string | null
          created_at?: string
          employee_id: string
          id?: string
          notes?: string | null
          updated_at?: string
        }
        Update: {
          amount?: number
          bonus_date?: string
          bonus_type?: string | null
          created_at?: string
          employee_id?: string
          id?: string
          notes?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "bonuses_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      employees: {
        Row: {
          address: string | null
          age: number | null
          allowance_food: number | null
          allowance_production: number | null
          allowance_regularity: number | null
          allowance_transport: number | null
          allowance_work_nature: number | null
          annual_leave_balance: number | null
          bank_account: string | null
          birth_date: string | null
          birth_governorate: string | null
          birth_place: string | null
          children_count: number | null
          code: number
          company: string | null
          contract_end_date: string | null
          contract_start_date: string | null
          created_at: string
          doc_birth_cert: string | null
          doc_form_111: string | null
          doc_id_copies: string | null
          doc_military: string | null
          doc_photos: string | null
          doc_profession_license: string | null
          doc_qualification: string | null
          doc_skill_cert: string | null
          employment_type: string | null
          gender: string | null
          graduation_year: number | null
          hire_date: string | null
          id: string
          id_expiry_date: string | null
          id_issue_date: string | null
          id_place: string | null
          id_type: string | null
          insurance_end_date: string | null
          insurance_number: string | null
          insurance_office: string | null
          insurance_start_date: string | null
          insurance_wage: number | null
          is_active: boolean | null
          job_title: string | null
          last_work_day: string | null
          locker_number: string | null
          marital_status: string | null
          medical_insurance: string | null
          military_status: string | null
          mobile: string | null
          name: string
          name_en: string | null
          national_id: string | null
          nationality: string | null
          notes: string | null
          payment_type: string | null
          qualification: string | null
          religion: string | null
          row_num: number | null
          salary: number | null
          service_years: number | null
          shift: string | null
          social_insurance_status: string | null
          termination_reason: string | null
          updated_at: string
          work_stub_status: string | null
        }
        Insert: {
          address?: string | null
          age?: number | null
          allowance_food?: number | null
          allowance_production?: number | null
          allowance_regularity?: number | null
          allowance_transport?: number | null
          allowance_work_nature?: number | null
          annual_leave_balance?: number | null
          bank_account?: string | null
          birth_date?: string | null
          birth_governorate?: string | null
          birth_place?: string | null
          children_count?: number | null
          code: number
          company?: string | null
          contract_end_date?: string | null
          contract_start_date?: string | null
          created_at?: string
          doc_birth_cert?: string | null
          doc_form_111?: string | null
          doc_id_copies?: string | null
          doc_military?: string | null
          doc_photos?: string | null
          doc_profession_license?: string | null
          doc_qualification?: string | null
          doc_skill_cert?: string | null
          employment_type?: string | null
          gender?: string | null
          graduation_year?: number | null
          hire_date?: string | null
          id?: string
          id_expiry_date?: string | null
          id_issue_date?: string | null
          id_place?: string | null
          id_type?: string | null
          insurance_end_date?: string | null
          insurance_number?: string | null
          insurance_office?: string | null
          insurance_start_date?: string | null
          insurance_wage?: number | null
          is_active?: boolean | null
          job_title?: string | null
          last_work_day?: string | null
          locker_number?: string | null
          marital_status?: string | null
          medical_insurance?: string | null
          military_status?: string | null
          mobile?: string | null
          name: string
          name_en?: string | null
          national_id?: string | null
          nationality?: string | null
          notes?: string | null
          payment_type?: string | null
          qualification?: string | null
          religion?: string | null
          row_num?: number | null
          salary?: number | null
          service_years?: number | null
          shift?: string | null
          social_insurance_status?: string | null
          termination_reason?: string | null
          updated_at?: string
          work_stub_status?: string | null
        }
        Update: {
          address?: string | null
          age?: number | null
          allowance_food?: number | null
          allowance_production?: number | null
          allowance_regularity?: number | null
          allowance_transport?: number | null
          allowance_work_nature?: number | null
          annual_leave_balance?: number | null
          bank_account?: string | null
          birth_date?: string | null
          birth_governorate?: string | null
          birth_place?: string | null
          children_count?: number | null
          code?: number
          company?: string | null
          contract_end_date?: string | null
          contract_start_date?: string | null
          created_at?: string
          doc_birth_cert?: string | null
          doc_form_111?: string | null
          doc_id_copies?: string | null
          doc_military?: string | null
          doc_photos?: string | null
          doc_profession_license?: string | null
          doc_qualification?: string | null
          doc_skill_cert?: string | null
          employment_type?: string | null
          gender?: string | null
          graduation_year?: number | null
          hire_date?: string | null
          id?: string
          id_expiry_date?: string | null
          id_issue_date?: string | null
          id_place?: string | null
          id_type?: string | null
          insurance_end_date?: string | null
          insurance_number?: string | null
          insurance_office?: string | null
          insurance_start_date?: string | null
          insurance_wage?: number | null
          is_active?: boolean | null
          job_title?: string | null
          last_work_day?: string | null
          locker_number?: string | null
          marital_status?: string | null
          medical_insurance?: string | null
          military_status?: string | null
          mobile?: string | null
          name?: string
          name_en?: string | null
          national_id?: string | null
          nationality?: string | null
          notes?: string | null
          payment_type?: string | null
          qualification?: string | null
          religion?: string | null
          row_num?: number | null
          salary?: number | null
          service_years?: number | null
          shift?: string | null
          social_insurance_status?: string | null
          termination_reason?: string | null
          updated_at?: string
          work_stub_status?: string | null
        }
        Relationships: []
      }
      penalties: {
        Row: {
          amount: number
          created_at: string
          days: number | null
          employee_id: string
          id: string
          notes: string | null
          penalty_date: string
          reason: string | null
          updated_at: string
        }
        Insert: {
          amount?: number
          created_at?: string
          days?: number | null
          employee_id: string
          id?: string
          notes?: string | null
          penalty_date: string
          reason?: string | null
          updated_at?: string
        }
        Update: {
          amount?: number
          created_at?: string
          days?: number | null
          employee_id?: string
          id?: string
          notes?: string | null
          penalty_date?: string
          reason?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "penalties_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
