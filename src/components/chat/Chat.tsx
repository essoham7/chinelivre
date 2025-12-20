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
  const [timeoutError, setTimeoutError] = useState<string | null>(null);
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
    const t = setTimeout(() => {
      if (loading)
        setTimeoutError(
          "Le chargement prend trop de temps. Veuillez réessayer."
        );
    }, 30000);
    return () => clearTimeout(t);
  }, [loading]);

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

      // Notifications automatiques désormais gérées côté base via triggers
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
      <div className="flex flex-col h-full bg-gray-50">
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className={`flex ${i % 2 ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-xs lg:max-w-md px-4 py-3 rounded-lg ${
                  i % 2 ? "bg-blue-600" : "bg-white border border-gray-200"
                }`}
              >
                <div
                  className={`animate-pulse ${
                    i % 2 ? "bg-blue-500" : "bg-gray-200"
                  } h-4 w-40 rounded`}
                ></div>
                <div
                  className={`animate-pulse ${
                    i % 2 ? "bg-blue-500" : "bg-gray-200"
                  } h-4 w-24 rounded mt-2`}
                ></div>
              </div>
            </div>
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
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-gray-50">
      <div className="flex-1 overflow-y-auto p-4 space-y-4 pb-24">
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

      <form
        onSubmit={sendMessage}
        className="p-4 bg-white border-t sticky bottom-0 z-50 safe-bottom"
      >
        <div className="flex space-x-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Tapez votre message..."
            className="flex-1 px-3 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={!user}
          />
          <button
            type="submit"
            disabled={!newMessage.trim() || !user}
            className="bg-blue-600 text-white px-5 py-3 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
      </form>
    </div>
  );
}
