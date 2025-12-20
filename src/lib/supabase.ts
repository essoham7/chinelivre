import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Types de base de données
type Database = {
  public: {
    Tables: {
      packages: {
        Row: {
          id: string;
          tracking_number: string;
          client_id: string;
          content: string;
          weight: number | null;
          volume: number | null;
          status:
            | "received_china"
            | "in_transit"
            | "arrived_africa"
            | "available_warehouse"
            | "picked_up";
          received_china_at: string;
          estimated_arrival: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<
          Database["public"]["Tables"]["packages"]["Row"],
          "id" | "created_at" | "updated_at"
        >;
        Update: Partial<Database["public"]["Tables"]["packages"]["Insert"]>;
      };
      package_photos: {
        Row: {
          id: string;
          package_id: string;
          storage_path: string;
          is_primary: boolean;
          created_at: string;
        };
        Insert: Omit<
          Database["public"]["Tables"]["package_photos"]["Row"],
          "id" | "created_at"
        >;
        Update: Partial<
          Database["public"]["Tables"]["package_photos"]["Insert"]
        >;
      };
      profiles: {
        Row: {
          id: string;
          email: string | null;
          role: string | null;
          created_at: string;
          first_name: string | null;
          last_name: string | null;
          company: string | null;
          country: string | null;
          city: string | null;
          phone: string | null;
        };
        Insert: Omit<
          Database["public"]["Tables"]["profiles"]["Row"],
          "created_at"
        >;
        Update: Partial<Database["public"]["Tables"]["profiles"]["Insert"]>;
      };
      messages: {
        Row: {
          id: string;
          package_id: string;
          sender_id: string;
          sender_role: "admin" | "client";
          content: string;
          is_read: boolean;
          created_at: string;
        };
        Insert: Omit<
          Database["public"]["Tables"]["messages"]["Row"],
          "id" | "created_at" | "is_read"
        >;
        Update: Partial<Database["public"]["Tables"]["messages"]["Insert"]>;
      };
      notifications: {
        Row: {
          id: string;
          user_id: string;
          package_id: string;
          type:
            | "package_created"
            | "status_updated"
            | "package_arrived"
            | "new_message";
          title: string;
          content: string | null;
          is_read: boolean;
          created_at: string;
        };
        Insert: Omit<
          Database["public"]["Tables"]["notifications"]["Row"],
          "id" | "created_at" | "is_read"
        >;
        Update: Partial<
          Database["public"]["Tables"]["notifications"]["Insert"]
        >;
      };
    };
  };
};

export type Package = Database["public"]["Tables"]["packages"]["Row"];
export type PackageInsert = Database["public"]["Tables"]["packages"]["Insert"];
export type PackagePhoto =
  Database["public"]["Tables"]["package_photos"]["Row"];
export type Message = Database["public"]["Tables"]["messages"]["Row"];
export type Notification = Database["public"]["Tables"]["notifications"]["Row"];

export type UserRole = "admin" | "client";
