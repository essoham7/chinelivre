import { useState, useEffect, useRef } from "react";
import { supabase } from "../../lib/supabase";
import { Message } from "../../lib/supabase";
import { useAuthStore } from "../../store/authStore";
import { Send, Check, CheckCheck } from "lucide-react";
import { notifyNewMessage } from "../../hooks/useNotifications";

interface ChatProps {
  packageId: string;
}

export function Chat({ packageId }: ChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const channelRef = useRef<any>(null);
  const { user } = useAuthStore();

  const addOrUpdateMessage = (msg: Message) => {
    setMessages((prev) => {
      const idx = prev.findIndex((m) => m.id === msg.id);
      if (idx === -1) return [...prev, msg];
      const next = [...prev];
      next[idx] = msg;
      return next;
    });
  };

  useEffect(() => {
    loadMessages();
    const channel = subscribeToMessages();
    channelRef.current = channel;

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [packageId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const markUnread = async () => {
      if (!user?.id || messages.length === 0) return;
      const ids = messages
        .filter((m) => m.sender_id !== user.id && !m.is_read)
        .map((m) => m.id);
      if (ids.length === 0) return;
      await supabase.from("messages").update({ is_read: true }).in("id", ids);
    };
    markUnread();
  }, [messages, user?.id, packageId]);

  useEffect(() => {
    const handler = () => {
      if (document.visibilityState === "visible") {
        const markUnread = async () => {
          if (!user?.id || messages.length === 0) return;
          const ids = messages
            .filter((m) => m.sender_id !== user.id && !m.is_read)
            .map((m) => m.id);
          if (ids.length === 0) return;
          await supabase
            .from("messages")
            .update({ is_read: true })
            .in("id", ids);
        };
        markUnread();
      }
    };
    document.addEventListener("visibilitychange", handler);
    return () => document.removeEventListener("visibilitychange", handler);
  }, [messages, user?.id]);

  const loadMessages = async () => {
    const { data, error } = await supabase
      .from("messages")
      .select("*")
      .eq("package_id", packageId)
      .order("created_at", { ascending: true });

    if (!error && data) {
      setMessages(data);
      // Mark incoming messages as read when opening the chat
      if (user?.id) {
        await supabase
          .from("messages")
          .update({ is_read: true })
          .eq("package_id", packageId)
          .neq("sender_id", user.id)
          .eq("is_read", false);
      }
    }
    setLoading(false);
  };

  const subscribeToMessages = () => {
    const channel = supabase
      .channel(`chat:${packageId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `package_id=eq.${packageId}`,
        },
        (payload) => {
          const msg = payload.new as Message;
          addOrUpdateMessage(msg);
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "messages",
          filter: `package_id=eq.${packageId}`,
        },
        (payload) => {
          const updated = payload.new as Message;
          addOrUpdateMessage(updated);
        }
      )
      .subscribe();
    return channel;
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !user) return;

    const { data, error } = await supabase
      .from("messages")
      .insert([
        {
          package_id: packageId,
          sender_id: user.id,
          content: newMessage.trim(),
          sender_role: user.user_metadata?.role || "client",
        },
      ])
      .select("*")
      .single();

    if (!error && data) {
      setNewMessage("");
      addOrUpdateMessage(data as Message);

      // Notifications au destinataire
      try {
        const senderName = user.email || "Utilisateur";
        const role = (user.user_metadata?.role as string) || "client";

        const { data: pkg } = await supabase
          .from("packages")
          .select("client_id")
          .eq("id", packageId)
          .single();

        if (role === "admin" && pkg?.client_id) {
          await notifyNewMessage(pkg.client_id, packageId, senderName);
        } else if (role === "client") {
          const { data: admins } = await supabase
            .from("profiles")
            .select("id")
            .eq("role", "admin");
          if (admins && admins.length > 0) {
            await Promise.all(
              admins.map((a: any) =>
                notifyNewMessage(a.id, packageId, senderName)
              )
            );
          }
        }
      } catch (err) {
        // Échec de notification non bloquant
      }
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString("fr-FR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-gray-50">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center text-gray-500 mt-8">
            <p>Aucun message pour le moment</p>
            <p className="text-sm">Commencez la conversation!</p>
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${
                message.sender_id === user?.id ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                  message.sender_id === user?.id
                    ? "bg-blue-600 text-white"
                    : "bg-white text-gray-900 border border-gray-200"
                }`}
              >
                <p className="text-sm">{message.content}</p>
                <div
                  className={`flex items-center gap-1 mt-1 ${
                    message.sender_id === user?.id
                      ? "justify-end"
                      : "justify-start"
                  }`}
                >
                  <span
                    className={`text-xs ${
                      message.sender_id === user?.id
                        ? "text-blue-100"
                        : "text-gray-500"
                    }`}
                  >
                    {formatTime(message.created_at)}
                  </span>
                  {message.sender_id === user?.id &&
                    (message.is_read ? (
                      <CheckCheck className="h-3 w-3 text-blue-200" />
                    ) : (
                      <Check className="h-3 w-3 text-blue-100" />
                    ))}
                </div>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={sendMessage} className="p-4 bg-white border-t">
        <div className="flex space-x-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Tapez votre message..."
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={!user}
          />
          <button
            type="submit"
            disabled={!newMessage.trim() || !user}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
      </form>
    </div>
  );
}
