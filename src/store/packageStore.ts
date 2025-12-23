import { create } from "zustand";
import { supabase } from "../lib/supabase";
import { Package, PackageInsert } from "../lib/supabase";

type ExtendedPackage = Package & {
  client: {
    email: string | null;
    phone: string | null;
    first_name?: string | null;
    last_name?: string | null;
    company?: string | null;
  };
  photos: Array<{
    storage_path: string;
    is_primary: boolean;
    url: string | null;
  }>;
};

interface PackageState {
  packages: ExtendedPackage[];
  loading: boolean;
  error: string | null;
  fetchPackages: (clientId?: string) => Promise<void>;
  fetchPackage: (id: string) => Promise<ExtendedPackage | null>;
  createPackage: (packageData: PackageInsert) => Promise<Package>;
  updatePackage: (id: string, updates: Partial<PackageInsert>) => Promise<void>;
  deletePackage: (id: string) => Promise<void>;
  archiveOldPickedUpPackages: () => Promise<void>;
}

export const usePackageStore = create<PackageState>((set, get) => ({
  packages: [],
  loading: false,
  error: null,

  fetchPackages: async (clientId?: string) => {
    set({ loading: true, error: null });

    const cutoff = new Date(
      Date.now() - 15 * 24 * 60 * 60 * 1000
    ).toISOString();
    await supabase
      .from("packages")
      .update({ archived: true })
      .eq("status", "picked_up")
      .lte("updated_at", cutoff)
      .eq("archived", false);

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

    const rows = (data || []) as unknown as Package[];
    const clientIds = Array.from(
      new Set(rows.map((p) => p.client_id).filter(Boolean))
    ) as string[];
    const packageIds = rows.map((p) => p.id);
    let profilesMap: Record<
      string,
      {
        email: string | null;
        phone: string | null;
        first_name?: string | null;
        last_name?: string | null;
        company?: string | null;
      }
    > = {};

    if (clientIds.length > 0) {
      const { data: profilesData } = await supabase
        .from("profiles")
        .select("id,email,phone,first_name,last_name,company")
        .in("id", clientIds);
      if (profilesData) {
        type ProfileRow = {
          id: string;
          email: string | null;
          phone?: string | null;
          first_name?: string | null;
          last_name?: string | null;
          company?: string | null;
        };
        const prows = profilesData as unknown as ProfileRow[];
        profilesMap = Object.fromEntries(
          prows.map((pr) => [
            pr.id,
            {
              email: pr.email,
              phone: pr.phone || null,
              first_name: pr.first_name || null,
              last_name: pr.last_name || null,
              company: pr.company || null,
            },
          ])
        );
      }
    }

    // Load photos for all packages and map Cloudinary URLs
    const photosMap: Record<
      string,
      Array<{ storage_path: string; is_primary: boolean }>
    > = {};
    if (packageIds.length > 0) {
      const { data: photosData } = await supabase
        .from("package_photos")
        .select("package_id,storage_path,is_primary")
        .in("package_id", packageIds);
      if (photosData) {
        type PhotoRow = {
          package_id: string;
          storage_path: string;
          is_primary?: boolean;
        };
        const pr = photosData as unknown as PhotoRow[];
        pr.forEach((ph) => {
          const arr = photosMap[ph.package_id] || [];
          arr.push({
            storage_path: ph.storage_path,
            is_primary: !!ph.is_primary,
          });
          photosMap[ph.package_id] = arr;
        });
      }
    }

    const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || "";
    const { cloudinaryUrlFromPublicId } = await import("../utils/cloudinary");
    const withClient: ExtendedPackage[] = rows.map((p) => {
      const photoEntries = photosMap[p.id] || [];
      const photos = photoEntries.map((ph) => ({
        storage_path: ph.storage_path,
        is_primary: ph.is_primary,
        url: cloudName ? cloudinaryUrlFromPublicId(ph.storage_path) : null,
      }));
      return {
        ...p,
        client: profilesMap[p.client_id] || {
          email: null,
          phone: null,
          first_name: null,
          last_name: null,
          company: null,
        },
        photos,
      } as ExtendedPackage;
    });

    set({ packages: withClient, loading: false });
  },

  archiveOldPickedUpPackages: async () => {
    const cutoff = new Date(
      Date.now() - 15 * 24 * 60 * 60 * 1000
    ).toISOString();
    await supabase
      .from("packages")
      .update({ archived: true })
      .eq("status", "picked_up")
      .lte("updated_at", cutoff)
      .eq("archived", false);
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
        data = fallback.data as unknown as Record<string, unknown>;
        const photosRes = await supabase
          .from("package_photos")
          .select("*")
          .eq("package_id", id);
        (data as Record<string, unknown>).photos = (photosRes.data ||
          []) as unknown as object[];
        error = null;
      }
    }

    if (error) {
      set({ error: error.message });
      return null;
    }

    let client = {
      email: null as string | null,
      phone: null as string | null,
      first_name: null as string | null,
      last_name: null as string | null,
      company: null as string | null,
    };
    const d = data as unknown as { client_id?: string };
    if (d?.client_id) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("email,phone,first_name,last_name,company")
        .eq("id", d.client_id)
        .single();
      if (profile) {
        const pr = profile as unknown as {
          email: string | null;
          phone?: string | null;
          first_name?: string | null;
          last_name?: string | null;
          company?: string | null;
        };
        client = {
          email: pr.email,
          phone: pr.phone || null,
          first_name: pr.first_name || null,
          last_name: pr.last_name || null,
          company: pr.company || null,
        };
      }
    }
    // Map photos to include Cloudinary URL
    const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || "";
    const { cloudinaryUrlFromPublicId } = await import("../utils/cloudinary");
    type PhotoRow2 = { storage_path: string } & Record<string, unknown>;
    const dr = data as unknown as { photos?: PhotoRow2[] };
    const photoRows = (dr.photos || []) as PhotoRow2[];
    const photos = photoRows.map((ph) => ({
      ...(ph as unknown as Record<string, unknown>),
      url: cloudName ? cloudinaryUrlFromPublicId(ph.storage_path) : null,
    }));

    return {
      ...(data as unknown as Package),
      client,
      photos,
    } as ExtendedPackage;
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
