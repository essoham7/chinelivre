import { create } from "zustand";
import { supabase } from "../lib/supabase";
import { Package, PackageInsert } from "../lib/supabase";

interface PackageState {
  packages: Package[];
  loading: boolean;
  error: string | null;
  fetchPackages: (clientId?: string) => Promise<void>;
  fetchPackage: (id: string) => Promise<Package | null>;
  createPackage: (packageData: PackageInsert) => Promise<Package>;
  updatePackage: (id: string, updates: Partial<PackageInsert>) => Promise<void>;
  deletePackage: (id: string) => Promise<void>;
}

export const usePackageStore = create<PackageState>((set, get) => ({
  packages: [],
  loading: false,
  error: null,

  fetchPackages: async (clientId?: string) => {
    set({ loading: true, error: null });

    let query = supabase
      .from("packages")
      .select(`*`)
      .order("created_at", { ascending: false });

    if (clientId) {
      query = query.eq("client_id", clientId);
    }

    const { data, error } = await query;

    if (error) {
      set({ error: error.message, loading: false });
      return;
    }

    if (!data || data.length === 0) {
      set({ packages: [], loading: false });
      return;
    }

    const clientIds = Array.from(
      new Set(data.map((p: any) => p.client_id).filter(Boolean))
    );
    let profilesMap: Record<string, { email: string | null }> = {};

    if (clientIds.length > 0) {
      const { data: profilesData } = await supabase
        .from("profiles")
        .select("id,email")
        .in("id", clientIds);
      if (profilesData) {
        profilesMap = Object.fromEntries(
          (profilesData as any[]).map((pr) => [pr.id, { email: pr.email }])
        );
      }
    }

    const withClient = (data as any[]).map((p) => ({
      ...p,
      client: profilesMap[p.client_id] || { email: null },
    }));

    set({ packages: withClient, loading: false });
  },

  fetchPackage: async (id: string) => {
    let { data, error } = await supabase
      .from("packages")
      .select(`*, photos:package_photos(*)`)
      .eq("id", id)
      .single();

    if (error) {
      const fallback = await supabase
        .from("packages")
        .select("*")
        .eq("id", id)
        .single();
      if (!fallback.error) {
        data = fallback.data as any;
        const photosRes = await supabase
          .from("package_photos")
          .select("*")
          .eq("package_id", id);
        (data as any).photos = photosRes.data || [];
        error = null as any;
      }
    }

    if (error) {
      set({ error: error.message });
      return null;
    }

    let client = { email: null as string | null };
    if ((data as any)?.client_id) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("email")
        .eq("id", (data as any).client_id)
        .single();
      if (profile) client = { email: (profile as any).email };
    }
    // Map photos to include Cloudinary URL
    const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || "";
    const photos = ((data as any)?.photos || []).map((ph: any) => ({
      ...ph,
      url: cloudName
        ? `https://res.cloudinary.com/${cloudName}/image/upload/${ph.storage_path}`
        : null,
    }));

    return { ...(data as any), client, photos } as any;
  },

  createPackage: async (packageData: PackageInsert) => {
    set({ loading: true, error: null });

    const { data, error } = await supabase
      .from("packages")
      .insert([packageData])
      .select("*")
      .single();

    if (error) {
      set({ error: error.message, loading: false });
      throw error;
    }

    await get().fetchPackages();
    set({ loading: false });
    return data as Package;
  },

  updatePackage: async (id: string, updates: Partial<PackageInsert>) => {
    set({ loading: true, error: null });

    const { error } = await supabase
      .from("packages")
      .update(updates)
      .eq("id", id);

    if (error) {
      set({ error: error.message, loading: false });
      throw error;
    }

    await get().fetchPackages();
    set({ loading: false });
  },

  deletePackage: async (id: string) => {
    set({ loading: true, error: null });

    const { error } = await supabase.from("packages").delete().eq("id", id);

    if (error) {
      set({ error: error.message, loading: false });
      throw error;
    }

    await get().fetchPackages();
    set({ loading: false });
  },
}));
