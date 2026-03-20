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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      analytics_events: {
        Row: {
          created_at: string
          event_type: string
          id: string
          ip_address: string | null
          metadata: Json | null
          page_path: string | null
          referrer: string | null
          session_id: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          event_type: string
          id?: string
          ip_address?: string | null
          metadata?: Json | null
          page_path?: string | null
          referrer?: string | null
          session_id?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          event_type?: string
          id?: string
          ip_address?: string | null
          metadata?: Json | null
          page_path?: string | null
          referrer?: string | null
          session_id?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      blog_articles: {
        Row: {
          author: string
          canonical_url: string | null
          content: string
          created_at: string
          description: string
          focus_keyword: string | null
          id: string
          image_url: string | null
          meta_description: string | null
          meta_keywords: string[] | null
          meta_title: string | null
          og_description: string | null
          og_image: string | null
          og_title: string | null
          published: boolean
          published_at: string | null
          slug: string
          tags: string[] | null
          title: string
          updated_at: string
        }
        Insert: {
          author: string
          canonical_url?: string | null
          content: string
          created_at?: string
          description: string
          focus_keyword?: string | null
          id?: string
          image_url?: string | null
          meta_description?: string | null
          meta_keywords?: string[] | null
          meta_title?: string | null
          og_description?: string | null
          og_image?: string | null
          og_title?: string | null
          published?: boolean
          published_at?: string | null
          slug: string
          tags?: string[] | null
          title: string
          updated_at?: string
        }
        Update: {
          author?: string
          canonical_url?: string | null
          content?: string
          created_at?: string
          description?: string
          focus_keyword?: string | null
          id?: string
          image_url?: string | null
          meta_description?: string | null
          meta_keywords?: string[] | null
          meta_title?: string | null
          og_description?: string | null
          og_image?: string | null
          og_title?: string | null
          published?: boolean
          published_at?: string | null
          slug?: string
          tags?: string[] | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      campaign_recipients: {
        Row: {
          campaign_id: string
          clicked_at: string | null
          id: string
          lead_id: string
          opened_at: string | null
          sent_at: string | null
        }
        Insert: {
          campaign_id: string
          clicked_at?: string | null
          id?: string
          lead_id: string
          opened_at?: string | null
          sent_at?: string | null
        }
        Update: {
          campaign_id?: string
          clicked_at?: string | null
          id?: string
          lead_id?: string
          opened_at?: string | null
          sent_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "campaign_recipients_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "email_campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "campaign_recipients_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "quiz_leads"
            referencedColumns: ["id"]
          },
        ]
      }
      contact_submissions: {
        Row: {
          created_at: string
          email: string
          id: string
          name: string
          phone: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          name: string
          phone?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          name?: string
          phone?: string | null
        }
        Relationships: []
      }
      email_campaigns: {
        Row: {
          content: string
          created_at: string | null
          created_by: string | null
          id: string
          name: string
          sent_at: string | null
          status: string | null
          subject: string
        }
        Insert: {
          content: string
          created_at?: string | null
          created_by?: string | null
          id?: string
          name: string
          sent_at?: string | null
          status?: string | null
          subject: string
        }
        Update: {
          content?: string
          created_at?: string | null
          created_by?: string | null
          id?: string
          name?: string
          sent_at?: string | null
          status?: string | null
          subject?: string
        }
        Relationships: []
      }
      lead_activities: {
        Row: {
          activity_type: string
          completed: boolean | null
          created_at: string | null
          created_by: string | null
          description: string | null
          due_date: string | null
          id: string
          lead_id: string
          title: string
        }
        Insert: {
          activity_type: string
          completed?: boolean | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          lead_id: string
          title: string
        }
        Update: {
          activity_type?: string
          completed?: boolean | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          lead_id?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "lead_activities_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "quiz_leads"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          email: string
          id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          user_id: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      providers: {
        Row: {
          business_types: Json
          countries: string
          created_at: string
          customer_support: string
          display_order: number
          features: Json
          fee_score: number
          funding_speed: number
          id: string
          is_active: boolean
          is_top_pick: boolean
          logo: string | null
          logo_placeholder: string
          markets: Json
          name: string
          payment_methods: string
          rating: number
          rating_label: string
          setup_speed: string
          tagline: string
          transaction_fees: string
          updated_at: string
          url: string
        }
        Insert: {
          business_types?: Json
          countries: string
          created_at?: string
          customer_support: string
          display_order?: number
          features?: Json
          fee_score?: number
          funding_speed?: number
          id?: string
          is_active?: boolean
          is_top_pick?: boolean
          logo?: string | null
          logo_placeholder?: string
          markets?: Json
          name: string
          payment_methods: string
          rating: number
          rating_label: string
          setup_speed: string
          tagline: string
          transaction_fees: string
          updated_at?: string
          url: string
        }
        Update: {
          business_types?: Json
          countries?: string
          created_at?: string
          customer_support?: string
          display_order?: number
          features?: Json
          fee_score?: number
          funding_speed?: number
          id?: string
          is_active?: boolean
          is_top_pick?: boolean
          logo?: string | null
          logo_placeholder?: string
          markets?: Json
          name?: string
          payment_methods?: string
          rating?: number
          rating_label?: string
          setup_speed?: string
          tagline?: string
          transaction_fees?: string
          updated_at?: string
          url?: string
        }
        Relationships: []
      }
      newsletter_subscribers: {
        Row: {
          id: string
          email: string
          subscribed_at: string
          source: string
          status: string
          monthly_volume: string | null
        }
        Insert: {
          id?: string
          email: string
          subscribed_at?: string
          source?: string
          status?: string
          monthly_volume?: string | null
        }
        Update: {
          id?: string
          email?: string
          subscribed_at?: string
          source?: string
          status?: string
          monthly_volume?: string | null
        }
        Relationships: []
      }
      quiz_leads: {
        Row: {
          assigned_to: string | null
          average_transaction: string | null
          business_type: string | null
          chargeback_history: string | null
          conversion_date: string | null
          created_at: string
          deal_value: number | null
          email: string
          follow_up_date: string | null
          full_name: string
          id: string
          industry: string | null
          integration_needs: string | null
          international_payments: string | null
          is_high_risk: string | null
          last_contacted: string | null
          monthly_volume: string | null
          notes: string | null
          phone: string | null
          priority: string | null
          recommended_provider: string | null
          source: string | null
          status: string
          tags: string[] | null
        }
        Insert: {
          assigned_to?: string | null
          average_transaction?: string | null
          business_type?: string | null
          chargeback_history?: string | null
          conversion_date?: string | null
          created_at?: string
          deal_value?: number | null
          email: string
          follow_up_date?: string | null
          full_name: string
          id?: string
          industry?: string | null
          integration_needs?: string | null
          international_payments?: string | null
          is_high_risk?: string | null
          last_contacted?: string | null
          monthly_volume?: string | null
          notes?: string | null
          phone?: string | null
          priority?: string | null
          recommended_provider?: string | null
          source?: string | null
          status?: string
          tags?: string[] | null
        }
        Update: {
          assigned_to?: string | null
          average_transaction?: string | null
          business_type?: string | null
          chargeback_history?: string | null
          conversion_date?: string | null
          created_at?: string
          deal_value?: number | null
          email?: string
          follow_up_date?: string | null
          full_name?: string
          id?: string
          industry?: string | null
          integration_needs?: string | null
          international_payments?: string | null
          is_high_risk?: string | null
          last_contacted?: string | null
          monthly_volume?: string | null
          notes?: string | null
          phone?: string | null
          priority?: string | null
          recommended_provider?: string | null
          source?: string | null
          status?: string
          tags?: string[] | null
        }
        Relationships: []
      }
      quiz_questions: {
        Row: {
          created_at: string
          display_order: number
          id: string
          options: Json
          question_id: string
          question_text: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          display_order?: number
          id?: string
          options?: Json
          question_id: string
          question_text: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          display_order?: number
          id?: string
          options?: Json
          question_id?: string
          question_text?: string
          updated_at?: string
        }
        Relationships: []
      }
      quiz_results: {
        Row: {
          conditions: Json
          created_at: string
          id: string
          priority: number
          recommended_provider: string
          result_name: string
          updated_at: string
        }
        Insert: {
          conditions?: Json
          created_at?: string
          id?: string
          priority?: number
          recommended_provider: string
          result_name: string
          updated_at?: string
        }
        Update: {
          conditions?: Json
          created_at?: string
          id?: string
          priority?: number
          recommended_provider?: string
          result_name?: string
          updated_at?: string
        }
        Relationships: []
      }
      role_permissions: {
        Row: {
          can_access: boolean | null
          created_at: string | null
          id: string
          page_name: string
          role: Database["public"]["Enums"]["app_role"]
        }
        Insert: {
          can_access?: boolean | null
          created_at?: string | null
          id?: string
          page_name: string
          role: Database["public"]["Enums"]["app_role"]
        }
        Update: {
          can_access?: boolean | null
          created_at?: string | null
          id?: string
          page_name?: string
          role?: Database["public"]["Enums"]["app_role"]
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "user" | "moderator"
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
    Enums: {
      app_role: ["admin", "user", "moderator"],
    },
  },
} as const
