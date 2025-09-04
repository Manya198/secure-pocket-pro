import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://your-project.supabase.co'
const supabaseAnonKey = 'your-anon-key'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Database = {
  public: {
    Tables: {
      credentials: {
        Row: {
          id: string
          user_id: string
          platform: string
          username: string
          password: string
          email?: string
          notes?: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          platform: string
          username: string
          password: string
          email?: string
          notes?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          platform?: string
          username?: string
          password?: string
          email?: string
          notes?: string
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}