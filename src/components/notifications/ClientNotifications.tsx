import React, { useState, useEffect } from "react";
import { useNotificationStore } from "../../store/notificationStore";
import { supabase } from "../../lib/supabase";
import {
  Bell,
  Check,
  Clock,
  AlertCircle,
  Info,
  Tag,
  Gift,
  AlertTriangle,
} from "lucide-react";
import { SkeletonCard } from "../ui/Skeleton";

const ClientNotifications: React.FC = () => {
  const {
    userNotifications,
    loading,
    error,
    fetchUserNotifications,
    markAsRead,
    subscribeToNotifications,
  } = useNotificationStore();

  const [userId, setUserId] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "unread" | "read">("all");
  const [timeoutError, setTimeoutError] = useState<string | null>(null);

  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser();
      if (data.user) {
        setUserId(data.user.id);
        fetchUserNotifications(data.user.id);
      }
    };
    getUser();
  }, []);

  useEffect(() => {
    const t = setTimeout(() => {
      if (loading)
        setTimeoutError(
          "Le chargement prend trop de temps. Veuillez réessayer."
        );
    }, 30000);
    return () => clearTimeout(t);
  }, [loading]);

  useEffect(() => {
    if (!userId) return;

    // Subscribe to real-time notifications
    const unsubscribe = subscribeToNotifications((newNotification) => {
      // Refresh notifications when a new one arrives
      fetchUserNotifications(userId);

      // Show browser notification if supported
      if ("Notification" in window && Notification.permission === "granted") {
        new Notification("Nouvelle notification", {
          body:
            newNotification.notification?.title ||
            "Vous avez reçu une nouvelle notification",
          icon: "/favicon.ico",
        });
      }
    });

    return () => {
      unsubscribe();
    };
  }, [userId]);

  // Request notification permission
  useEffect(() => {
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }
  }, []);

  const filteredNotifications = userNotifications.filter((notification) => {
    if (filter === "unread") return notification.status === "unread";
    if (filter === "read") return notification.status === "read";
    return true;
  });

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "urgent":
        return <AlertTriangle className="h-5 w-5 text-red-500" />;
      case "promotion":
        return <Gift className="h-5 w-5 text-blue-500" />;
      case "update":
        return <Info className="h-5 w-5 text-green-500" />;
      default:
        return <Bell className="h-5 w-5 text-gray-500" />;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case "urgent":
        return "border-l-red-500 bg-red-50";
      case "promotion":
        return "border-l-blue-500 bg-blue-50";
      case "update":
        return "border-l-green-500 bg-green-50";
      default:
        return "border-l-gray-500 bg-gray-50";
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      case "low":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return "Aujourd'hui";
    } else if (diffDays === 1) {
      return "Hier";
    } else if (diffDays < 7) {
      return `Il y a ${diffDays} jours`;
    } else {
      return date.toLocaleDateString("fr-FR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
    }
  };

  const handleMarkAsRead = async (notificationId: string) => {
    await markAsRead(notificationId);
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto space-y-4">
        {[...Array(6)].map((_, i) => (
          <SkeletonCard key={i} />
        ))}
        {timeoutError && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex">
              <AlertCircle className="h-5 w-5 text-red-400 mt-0.5" />
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Erreur</h3>
                <p className="mt-2 text-sm text-red-700">{timeoutError}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex">
          <AlertCircle className="h-5 w-5 text-red-400 mt-0.5" />
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">Erreur</h3>
            <div className="mt-2 text-sm text-red-700">
              <p>{error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Mes Notifications
          </h1>
          <p className="text-gray-600">
            Restez informé des dernières actualités
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-500">
            {userNotifications.filter((n) => n.status === "unread").length} non
            lues
          </span>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 px-6">
            {[
              { key: "all", label: "Toutes", count: userNotifications.length },
              {
                key: "unread",
                label: "Non lues",
                count: userNotifications.filter((n) => n.status === "unread")
                  .length,
              },
              {
                key: "read",
                label: "Lues",
                count: userNotifications.filter((n) => n.status === "read")
                  .length,
              },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setFilter(tab.key as any)}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  filter === tab.key
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                {tab.label} ({tab.count})
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Notifications List */}
      {filteredNotifications.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
          <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {filter === "unread"
              ? "Aucune notification non lue"
              : "Aucune notification"}
          </h3>
          <p className="text-gray-600">
            {filter === "unread"
              ? "Vous avez lu toutes vos notifications"
              : "Vous n'avez pas encore reçu de notifications"}
          </p>
        </div>
      ) : (
        <div className="divide-y divide-gray-200 rounded-lg overflow-hidden bg-white border border-gray-200">
          {filteredNotifications.map((notification) => (
            <button
              key={notification.id}
              onClick={() =>
                notification.status === "unread" &&
                handleMarkAsRead(notification.id)
              }
              className="w-full text-left px-4 py-3 active:bg-gray-50"
            >
              <div className="flex items-center gap-3">
                <div className="flex-shrink-0">
                  {getNotificationIcon(
                    notification.notification?.type || "info"
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-[15px] font-semibold text-gray-900 truncate">
                      {notification.notification?.title}
                    </span>
                    <span className="text-xs text-gray-500 ml-3">
                      {formatDate(notification.created_at)}
                    </span>
                  </div>
                  <p className="text-[13px] text-gray-700 mt-0.5 line-clamp-2">
                    {notification.notification?.content}
                  </p>
                  <div className="mt-1 flex items-center gap-2">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[11px] ${getPriorityBadge(
                        notification.notification?.priority || "medium"
                      )}`}
                    >
                      {notification.notification?.priority || "medium"}
                    </span>
                    <span className="flex items-center text-[11px] text-gray-500">
                      <Tag className="h-3 w-3 mr-1" />
                      {notification.notification?.type || "info"}
                    </span>
                    {notification.status === "read" && (
                      <span className="flex items-center text-[11px] text-gray-500">
                        <Check className="h-3 w-3 mr-1" /> Lu
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default ClientNotifications;
