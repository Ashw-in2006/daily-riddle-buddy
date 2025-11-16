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
      achievements: {
        Row: {
          badge_icon: string
          badge_name: string
          earned_date: string
          id: string
          user_id: string
        }
        Insert: {
          badge_icon: string
          badge_name: string
          earned_date?: string
          id?: string
          user_id: string
        }
        Update: {
          badge_icon?: string
          badge_name?: string
          earned_date?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "achievements_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      facts: {
        Row: {
          active: boolean
          category: string
          created_at: string
          fact_text: string
          id: string
          source: string | null
        }
        Insert: {
          active?: boolean
          category?: string
          created_at?: string
          fact_text: string
          id?: string
          source?: string | null
        }
        Update: {
          active?: boolean
          category?: string
          created_at?: string
          fact_text?: string
          id?: string
          source?: string | null
        }
        Relationships: []
      }
      followers: {
        Row: {
          follow_date: string
          follower_id: string
          following_id: string
          id: string
        }
        Insert: {
          follow_date?: string
          follower_id: string
          following_id: string
          id?: string
        }
        Update: {
          follow_date?: string
          follower_id?: string
          following_id?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "followers_follower_id_fkey"
            columns: ["follower_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "followers_following_id_fkey"
            columns: ["following_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          current_streak: number
          email: string
          id: string
          language: Database["public"]["Enums"]["language_type"]
          last_answered_date: string | null
          last_riddle_id: string | null
          longest_streak: number
          name: string
          preferred_time: string
          push_enabled: boolean
          total_correct: number
          updated_at: string
          zoho_id: string | null
        }
        Insert: {
          created_at?: string
          current_streak?: number
          email: string
          id: string
          language?: Database["public"]["Enums"]["language_type"]
          last_answered_date?: string | null
          last_riddle_id?: string | null
          longest_streak?: number
          name: string
          preferred_time?: string
          push_enabled?: boolean
          total_correct?: number
          updated_at?: string
          zoho_id?: string | null
        }
        Update: {
          created_at?: string
          current_streak?: number
          email?: string
          id?: string
          language?: Database["public"]["Enums"]["language_type"]
          last_answered_date?: string | null
          last_riddle_id?: string | null
          longest_streak?: number
          name?: string
          preferred_time?: string
          push_enabled?: boolean
          total_correct?: number
          updated_at?: string
          zoho_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_last_riddle"
            columns: ["last_riddle_id"]
            isOneToOne: false
            referencedRelation: "riddles"
            referencedColumns: ["id"]
          },
        ]
      }
      riddles: {
        Row: {
          active: boolean
          answer: string
          category: string
          created_at: string
          id: string
          text_en: string
          text_ta: string
          text_ta_en: string
        }
        Insert: {
          active?: boolean
          answer: string
          category?: string
          created_at?: string
          id?: string
          text_en: string
          text_ta: string
          text_ta_en: string
        }
        Update: {
          active?: boolean
          answer?: string
          category?: string
          created_at?: string
          id?: string
          text_en?: string
          text_ta?: string
          text_ta_en?: string
        }
        Relationships: []
      }
      user_riddles: {
        Row: {
          answered_at: string | null
          assigned_date: string
          created_at: string
          id: string
          is_correct: boolean | null
          riddle_id: string
          user_id: string
        }
        Insert: {
          answered_at?: string | null
          assigned_date?: string
          created_at?: string
          id?: string
          is_correct?: boolean | null
          riddle_id: string
          user_id: string
        }
        Update: {
          answered_at?: string | null
          assigned_date?: string
          created_at?: string
          id?: string
          is_correct?: boolean | null
          riddle_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_riddles_riddle_id_fkey"
            columns: ["riddle_id"]
            isOneToOne: false
            referencedRelation: "riddles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_riddles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
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
      language_type: "en" | "ta" | "ta_en"
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
      language_type: ["en", "ta", "ta_en"],
    },
  },
} as const
