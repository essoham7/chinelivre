import { create } from "zustand";
import { supabase } from "../lib/supabase";

export interface Notification {
  id: string;
  title: string;
  content: string;
  type:
    | "info"
    | "promotion"
    | "urgent"
    | "update"
    | "package_created"
    | "status_updated"
    | "package_arrived"
    | "new_message";
  priority?: "low" | "medium" | "high";
  status?: "draft" | "sent" | "archived";
  created_by?: string;
  created_at: string;
  updated_at?: string;
  expires_at?: string;
}

export interface UserNotification {
  id: string;
  notification_id: string;
  user_id: string;
  status: "unread" | "read" | "deleted";
  read_at?: string;
  created_at: string;
  notification?: Notification;
}

export interface PublicUser {
  id: string;
  name: string;
  email?: string;
  subscription_type?: "free" | "premium" | "enterprise";
  total_spent?: number;
  location?: string;
  created_at: string;
  updated_at?: string;
}

interface NotificationFilters {
  status?: string;
  type?: string;
  priority?: string;
  dateFrom?: string;
  dateTo?: string;
}

interface ClientFilters {
  name?: string;
  email?: string;
  subscriptionType?: string;
  location?: string;
  minSpent?: number;
  maxSpent?: number;
  dateFrom?: string;
  dateTo?: string;
}

interface NotificationStore {
  notifications: Notification[];
  userNotifications: UserNotification[];
  publicUsers: PublicUser[];
  loading: boolean;
  error: string | null;
  filters: NotificationFilters;
  clientFilters: ClientFilters;
  selectedNotification: Notification | null;

  // Actions
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setFilters: (filters: NotificationFilters) => void;
  setClientFilters: (filters: ClientFilters) => void;
  setSelectedNotification: (notification: Notification | null) => void;

  // CRUD operations
  fetchNotifications: (filters?: NotificationFilters) => Promise<void>;
  fetchUserNotifications: (userId: string) => Promise<void>;
  fetchPublicUsers: (filters?: ClientFilters) => Promise<void>;
  createNotification: (
    notification: Partial<Notification>
  ) => Promise<Notification | null>;
  updateNotification: (
    id: string,
    notification: Partial<Notification>
  ) => Promise<boolean>;
  deleteNotification: (id: string) => Promise<boolean>;
  sendNotification: (
    notificationId: string,
    userIds: string[]
  ) => Promise<boolean>;
  markAsRead: (userNotificationId: string) => Promise<boolean>;

  // Real-time subscriptions
  subscribeToNotifications: (
    callback: (notification: UserNotification) => void
  ) => () => void;
}

export const useNotificationStore = create<NotificationStore>((set) => ({
  notifications: [],
  userNotifications: [],
  publicUsers: [],
  loading: false,
  error: null,
  filters: {},
  clientFilters: {},
  selectedNotification: null,

  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  setFilters: (filters) => set({ filters }),
  setClientFilters: (clientFilters) => set({ clientFilters }),
  setSelectedNotification: (selectedNotification) =>
    set({ selectedNotification }),

  fetchNotifications: async (filters = {}) => {
    set({ loading: true, error: null });
    try {
      let query = supabase
        .from("notifications")
        .select("*")
        .order("created_at", { ascending: false });

      if (filters.status) {
        query = query.eq("status", filters.status);
      }
      if (filters.type) {
        query = query.eq("type", filters.type);
      }
      if (filters.priority) {
        query = query.eq("priority", filters.priority);
      }
      if (filters.dateFrom) {
        query = query.gte("created_at", filters.dateFrom);
      }
      if (filters.dateTo) {
        query = query.lte("created_at", filters.dateTo);
      }

      const { data, error } = await query;

      if (error) throw error;
      set({ notifications: data || [], filters });
    } catch (error) {
      set({ error: (error as Error).message });
    } finally {
      set({ loading: false });
    }
  },

  fetchUserNotifications: async (userId) => {
    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase
        .from("user_notifications")
        .select(
          `
          *,
          notification:notification_id(*)
        `
        )
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (error) {
        const msg = String(error.message || "");
        if (
          msg.includes("Could not find the table 'public.user_notifications'")
        ) {
          const legacy = await supabase
            .from("notifications")
            .select("*")
            .eq("user_id", userId)
            .order("created_at", { ascending: false });
          if (legacy.error) throw legacy.error;
          type LegacyRow = {
            id: string;
            user_id: string;
            is_read: boolean;
            title: string;
            content?: string | null;
            type: Notification["type"];
            created_at: string;
          };
          const rows = (legacy.data || []) as unknown as LegacyRow[];
          const mapped: UserNotification[] = rows.map((n) => ({
            id: n.id,
            notification_id: n.id,
            user_id: n.user_id,
            status: n.is_read ? "read" : "unread",
            read_at: n.is_read ? n.created_at : undefined,
            created_at: n.created_at,
            notification: {
              id: n.id,
              title: n.title,
              content: n.content || "",
              type: n.type,
              created_at: n.created_at,
            },
          }));
          set({ userNotifications: mapped });
        } else {
          throw error;
        }
      } else {
        set({ userNotifications: data || [] });
      }
    } catch (error) {
      set({ error: (error as Error).message });
    } finally {
      set({ loading: false });
    }
  },

  fetchPublicUsers: async (filters: ClientFilters = {}) => {
    set({ loading: true, error: null });
    try {
      // Try primary source: public_users (if exists in project)
      let query = supabase
        .from("public_users")
        .select("*")
        .order("created_at", { ascending: false });

      if (filters.name) {
        query = query.ilike("name", `%${filters.name}%`);
      }
      if (filters.subscriptionType) {
        query = query.eq("subscription_type", filters.subscriptionType);
      }
      if (filters.location) {
        query = query.ilike("location", `%${filters.location}%`);
      }
      if (typeof filters.minSpent === "number") {
        query = query.gte("total_spent", filters.minSpent);
      }
      if (typeof filters.maxSpent === "number") {
        query = query.lte("total_spent", filters.maxSpent);
      }
      if (filters.dateFrom) {
        query = query.gte("created_at", filters.dateFrom);
      }
      if (filters.dateTo) {
        query = query.lte("created_at", filters.dateTo);
      }

      const { data, error } = await query;

      if (!error) {
        set({
          publicUsers: (data || []) as unknown as PublicUser[],
          clientFilters: filters,
        });
      } else {
        const msg = String(error.message || "");
        // Fallback: use profiles when public_users missing
        if (msg.includes("Could not find the table 'public.public_users'")) {
          let q2 = supabase
            .from("profiles")
            .select("id, first_name, last_name, country, city, created_at")
            .order("created_at", { ascending: false });

          if (filters.name) {
            // match either first_name or last_name
            q2 = q2.or(
              `first_name.ilike.%${filters.name}%,last_name.ilike.%${filters.name}%`
            );
          }
          if (filters.dateFrom) {
            q2 = q2.gte("created_at", filters.dateFrom);
          }
          if (filters.dateTo) {
            q2 = q2.lte("created_at", filters.dateTo);
          }

          const r2 = await q2;
          if (r2.error) throw r2.error;
          type ProfileRow = {
            id: string;
            first_name?: string | null;
            last_name?: string | null;
            country?: string | null;
            city?: string | null;
            created_at: string;
          };
          const rows = (r2.data || []) as unknown as ProfileRow[];
          const mapped: PublicUser[] = rows.map((p) => ({
            id: p.id,
            name:
              [p.first_name, p.last_name].filter(Boolean).join(" ").trim() ||
              "Utilisateur",
            location: [p.city, p.country].filter(Boolean).join(", "),
            subscription_type: undefined,
            total_spent: undefined,
            created_at: p.created_at,
            updated_at: undefined,
          }));
          set({ publicUsers: mapped, clientFilters: filters });
        } else {
          throw error;
        }
      }
    } catch (error) {
      set({ error: (error as Error).message });
    } finally {
      set({ loading: false });
    }
  },

  createNotification: async (notification) => {
    set({ loading: true, error: null });
    try {
      const payload: Partial<Notification> = { ...notification };
      let attempt = 0;
      let data: Notification | null = null;
      let error: Error | null = null;
      const tryOrder = [
        payload.type,
        // fallbacks to satisfy differing CHECK constraints across projects
        "info",
        "new_message",
      ].filter(Boolean) as string[];
      const allowedTypes: Notification["type"][] = [
        "info",
        "promotion",
        "urgent",
        "update",
        "package_created",
        "status_updated",
        "package_arrived",
        "new_message",
      ];
      while (attempt < 5) {
        const res = await supabase
          .from("notifications")
          .insert([payload])
          .select()
          .single();
        data = res.data as unknown as Notification;
        error = res.error ? new Error(String(res.error.message || "")) : null;
        if (!error) break;
        const msg = error ? String(error.message || "") : "";
        const m = msg.match(/Could not find the '([^']+)' column/i);
        if (m && m[1]) {
          const col = m[1];
          delete (payload as Record<string, unknown>)[col];
          attempt++;
          continue;
        }
        // Handle CHECK constraint on type
        if (
          /violates check constraint/i.test(msg) &&
          /notifications_type_check/i.test(msg)
        ) {
          // pick next candidate type
          const next = tryOrder.shift();
          if (
            next &&
            next !== payload.type &&
            (allowedTypes as string[]).includes(next)
          ) {
            payload.type = next as Notification["type"];
            attempt++;
            continue;
          }
        }
        throw error;
      }

      if (error) throw error;

      const newNotification = data as Notification;
      set((state) => ({
        notifications: [newNotification, ...state.notifications],
      }));

      return newNotification;
    } catch (error) {
      set({ error: (error as Error).message });
      return null;
    } finally {
      set({ loading: false });
    }
  },

  updateNotification: async (id, notification) => {
    set({ loading: true, error: null });
    try {
      const payload: Partial<Notification> = { ...notification };
      let attempt = 0;
      let data: Notification | null = null;
      let error: Error | null = null;
      const tryOrder = [payload.type, "info", "new_message"].filter(
        Boolean
      ) as string[];
      const allowedTypes: Notification["type"][] = [
        "info",
        "promotion",
        "urgent",
        "update",
        "package_created",
        "status_updated",
        "package_arrived",
        "new_message",
      ];
      while (attempt < 5) {
        const res = await supabase
          .from("notifications")
          .update(payload)
          .eq("id", id)
          .select()
          .single();
        data = res.data as unknown as Notification;
        error = res.error ? new Error(String(res.error.message || "")) : null;
        if (!error) break;
        const msg = error ? String(error.message || "") : "";
        const m = msg.match(/Could not find the '([^']+)' column/i);
        if (m && m[1]) {
          const col = m[1];
          delete (payload as Record<string, unknown>)[col];
          attempt++;
          continue;
        }
        if (
          /violates check constraint/i.test(msg) &&
          /notifications_type_check/i.test(msg)
        ) {
          const next = tryOrder.shift();
          if (
            next &&
            next !== payload.type &&
            (allowedTypes as string[]).includes(next)
          ) {
            payload.type = next as Notification["type"];
            attempt++;
            continue;
          }
        }
        throw error;
      }

      if (error) throw error;

      const updatedNotification = data as Notification;
      set((state) => ({
        notifications: state.notifications.map((n) =>
          n.id === id ? updatedNotification : n
        ),
      }));

      return true;
    } catch (error) {
      set({ error: (error as Error).message });
      return false;
    } finally {
      set({ loading: false });
    }
  },

  deleteNotification: async (id) => {
    set({ loading: true, error: null });
    try {
      const { error } = await supabase
        .from("notifications")
        .delete()
        .eq("id", id);

      if (error) throw error;

      set((state) => ({
        notifications: state.notifications.filter((n) => n.id !== id),
      }));

      return true;
    } catch (error) {
      set({ error: (error as Error).message });
      return false;
    } finally {
      set({ loading: false });
    }
  },

  sendNotification: async (notificationId, userIds) => {
    set({ loading: true, error: null });
    try {
      const notifications = userIds.map((userId) => ({
        notification_id: notificationId,
        user_id: userId,
        status: "unread" as const,
      }));

      const { error } = await supabase
        .from("user_notifications")
        .insert(notifications);

      if (error) throw error;

      // Update notification status to sent
      await supabase
        .from("notifications")
        .update({ status: "sent" })
        .eq("id", notificationId);

      set((state) => ({
        notifications: state.notifications.map((n) =>
          n.id === notificationId ? { ...n, status: "sent" as const } : n
        ),
      }));

      return true;
    } catch (error) {
      set({ error: (error as Error).message });
      return false;
    } finally {
      set({ loading: false });
    }
  },

  markAsRead: async (userNotificationId) => {
    set({ loading: true, error: null });
    try {
      const { error } = await supabase
        .from("user_notifications")
        .update({
          status: "read",
          read_at: new Date().toISOString(),
        })
        .eq("id", userNotificationId);

      if (error) {
        const msg = String(error.message || "");
        if (
          msg.includes("Could not find the table 'public.user_notifications'")
        ) {
          const legacy = await supabase
            .from("notifications")
            .update({ is_read: true })
            .eq("id", userNotificationId);
          if (legacy.error) throw legacy.error;
        } else {
          throw error;
        }
      }

      set((state) => ({
        userNotifications: state.userNotifications.map((n) =>
          n.id === userNotificationId
            ? {
                ...n,
                status: "read" as const,
                read_at: new Date().toISOString(),
              }
            : n
        ),
      }));

      return true;
    } catch (error) {
      set({ error: (error as Error).message });
      return false;
    } finally {
      set({ loading: false });
    }
  },

  subscribeToNotifications: (callback) => {
    const subscription = supabase
      .channel("notifications")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "user_notifications" },
        (payload) => {
          callback(payload.new as UserNotification);
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  },
}));
