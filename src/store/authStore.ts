import { create } from "zustand";
import { supabase } from "../lib/supabase";
import { User } from "@supabase/supabase-js";
import { UserRole } from "../lib/supabase";

interface AuthState {
  user: User | null;
  role: UserRole | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (
    email: string,
    password: string,
    role: UserRole,
    firstName: string,
    lastName: string
  ) => Promise<void>;
  signOut: () => Promise<void>;
  checkUser: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  role: null,
  loading: true,

  signIn: async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;

    let role = data.user?.user_metadata?.role as UserRole | null;
    const userId = data.user?.id;
    if (userId) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", userId)
        .single();
      role = (profile?.role as UserRole) ?? role ?? null;
    }
    set({ user: data.user, role: role ?? null });
  },

  signUp: async (
    email: string,
    password: string,
    role: UserRole,
    firstName: string,
    lastName: string
  ) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { role },
      },
    });

    if (error) throw error;

    const userId = data.user?.id;
    if (userId) {
      await supabase
        .from("profiles")
        .upsert({
          id: userId,
          email,
          role,
          first_name: firstName,
          last_name: lastName,
        });
    }

    set({ user: data.user, role });
  },

  signOut: async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    set({ user: null, role: null });
  },

  checkUser: async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    let role = user?.user_metadata?.role as UserRole | null;
    if (user?.id) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();
      role = (profile?.role as UserRole) ?? role ?? null;
    }
    set({ user, role: role ?? null, loading: false });
  },
}));
