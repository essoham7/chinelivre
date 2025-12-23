import { useState, useEffect } from "react";
import { useAuthStore } from "../../store/authStore";
import { useNotificationStore } from "../../store/notificationStore";
import { Bell, X } from "lucide-react";

export function NotificationBell() {
  const { user } = useAuthStore();
  const {
    userNotifications,
    fetchUserNotifications,
    markAsRead,
    subscribeToNotifications,
  } = useNotificationStore();
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (!user) return;
    fetchUserNotifications(user.id);
    const unsubscribe = subscribeToNotifications(() => {
      fetchUserNotifications(user.id);
    });
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }
    return unsubscribe;
  }, [user, fetchUserNotifications, subscribeToNotifications]);

  const handleNotificationClick = async (notificationId: string) => {
    await markAsRead(notificationId);
  };

  // Optionally implement mark-all using markAsRead per item in future

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 1) {
      return "À l'instant";
    } else if (diffInHours < 24) {
      return `Il y a ${Math.floor(diffInHours)}h`;
    } else {
      return date.toLocaleDateString("fr-FR");
    }
  };

  if (!user) return null;

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-full"
      >
        <Bell className="h-5 w-5" />
        {userNotifications.filter((n) => n.status === "unread").length > 0 && (
          <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-500"></span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">
                Notifications
              </h3>
              <div className="flex items-center space-x-2">
                <span className="text-xs text-gray-500">
                  {
                    userNotifications.filter((n) => n.status === "unread")
                      .length
                  }{" "}
                  non lues
                </span>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1 text-gray-400 hover:text-gray-600"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {userNotifications.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                <p>Aucune notification</p>
              </div>
            ) : (
              userNotifications.map((item) => (
                <div
                  key={item.id}
                  onClick={() => handleNotificationClick(item.id)}
                  className={`p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer ${
                    item.status === "unread" ? "bg-blue-50" : ""
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    <div
                      className={`w-2 h-2 rounded-full mt-2 ${
                        item.status === "unread"
                          ? "bg-blue-600"
                          : "bg-transparent"
                      }`}
                    ></div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">
                        {item.notification?.title}
                      </p>
                      {item.notification?.content && (
                        <p className="text-sm text-gray-600 mt-1">
                          {item.notification?.content}
                        </p>
                      )}
                      <p className="text-xs text-gray-500 mt-2">
                        {formatTime(item.created_at)}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Click outside to close */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        ></div>
      )}
    </div>
  );
}
