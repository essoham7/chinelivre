import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useNotificationStore } from "../../store/notificationStore";
import { supabase } from "../../lib/supabase";
import {
  Save,
  Send,
  Eye,
  ArrowLeft,
  Calendar,
  Tag,
  AlertCircle,
} from "lucide-react";

const NotificationForm: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const {
    selectedNotification,
    loading,
    error,
    createNotification,
    updateNotification,
    setSelectedNotification,
    fetchNotifications,
  } = useNotificationStore();

  const [formData, setFormData] = useState({
    title: "",
    content: "",
    type: "info" as "info" | "promotion" | "urgent" | "update",
    priority: "medium" as "low" | "medium" | "high",
    expires_at: "",
    status: "draft" as "draft" | "sent" | "archived",
  });

  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    if (id) {
      // Load existing notification
      const loadNotification = async () => {
        const { data } = await supabase
          .from("notifications")
          .select("*")
          .eq("id", id)
          .single();

        if (data) {
          setSelectedNotification(data);
          setFormData({
            title: data.title,
            content: data.content,
            type: data.type,
            priority: data.priority,
            expires_at: data.expires_at ? data.expires_at.substring(0, 16) : "",
            status: data.status,
          });
        }
      };
      loadNotification();
    }
  }, [id]);

  // Auto-save functionality
  useEffect(() => {
    const autoSave = setInterval(() => {
      if (formData.title && formData.content && !saving) {
        handleSave(false);
      }
    }, 30000); // Auto-save every 30 seconds

    return () => clearInterval(autoSave);
  }, [formData, saving]);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async (showConfirmation = true) => {
    if (!formData.title || !formData.content) {
      if (showConfirmation) {
        alert("Veuillez remplir le titre et le contenu");
      }
      return;
    }

    setSaving(true);
    try {
      const user = await supabase.auth.getUser();
      if (!user.data.user) {
        throw new Error("Utilisateur non connecté");
      }

      const notificationData = {
        ...formData,
        expires_at: formData.expires_at
          ? new Date(formData.expires_at).toISOString()
          : null,
      };

      let success = false;
      if (id) {
        success = await updateNotification(id, notificationData);
      } else {
        const newNotification = await createNotification(notificationData);
        success = !!newNotification;
        if (newNotification) {
          navigate(`/admin/notifications/edit/${newNotification.id}`);
        }
      }

      if (success) {
        setLastSaved(new Date());
        if (showConfirmation) {
          alert("Notification sauvegardée avec succès");
        }
      }
    } catch (error) {
      console.error("Error saving notification:", error);
      if (showConfirmation) {
        alert("Erreur lors de la sauvegarde");
      }
    } finally {
      setSaving(false);
    }
  };

  const handleSaveAndSend = async () => {
    await handleSave(false);
    if (id) {
      navigate(`/admin/notifications/send/${id}`);
    }
  };

  const insertFormatting = (before: string, after: string = "") => {
    const textarea = document.getElementById("content") as HTMLTextAreaElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = formData.content.substring(start, end);
    const newText =
      formData.content.substring(0, start) +
      before +
      selectedText +
      after +
      formData.content.substring(end);

    setFormData((prev) => ({ ...prev, content: newText }));

    // Restore cursor position
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + before.length, end + before.length);
    }, 0);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate("/admin/notifications")}
            className="text-gray-600 hover:text-gray-900 p-2"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {id ? "Modifier la Notification" : "Créer une Notification"}
            </h1>
            {lastSaved && (
              <p className="text-sm text-gray-500">
                Dernière sauvegarde: {lastSaved.toLocaleTimeString("fr-FR")}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowPreview(!showPreview)}
            className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Eye className="h-4 w-4" />
            <span>Aperçu</span>
          </button>

          <button
            onClick={handleSaveAndSend}
            disabled={saving || !formData.title || !formData.content}
            className="flex items-center space-x-2 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white rounded-lg transition-colors"
          >
            <Send className="h-4 w-4" />
            <span>Sauvegarder et Envoyer</span>
          </button>

          <button
            onClick={() => handleSave(true)}
            disabled={saving || !formData.title || !formData.content}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg transition-colors"
          >
            <Save className="h-4 w-4" />
            <span>{saving ? "Sauvegarde..." : "Sauvegarder"}</span>
          </button>
        </div>
      </div>

      {error && (
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
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Info */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Informations de base
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Titre *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => handleInputChange("title", e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Entrez le titre de la notification"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Contenu *
                </label>

                {/* Formatting Toolbar */}
                <div className="border border-gray-300 rounded-t-lg bg-gray-50 px-3 py-2 flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={() => insertFormatting("**", "**")}
                    className="px-2 py-1 text-sm font-bold hover:bg-gray-200 rounded"
                    title="Gras"
                  >
                    B
                  </button>
                  <button
                    type="button"
                    onClick={() => insertFormatting("*", "*")}
                    className="px-2 py-1 text-sm italic hover:bg-gray-200 rounded"
                    title="Italique"
                  >
                    I
                  </button>
                  <button
                    type="button"
                    onClick={() => insertFormatting("[", "](url)")}
                    className="px-2 py-1 text-sm hover:bg-gray-200 rounded"
                    title="Lien"
                  >
                    🔗
                  </button>
                  <div className="border-l border-gray-300 h-4 mx-1"></div>
                  <button
                    type="button"
                    onClick={() => insertFormatting("\n\n• ", "")}
                    className="px-2 py-1 text-sm hover:bg-gray-200 rounded"
                    title="Liste à puces"
                  >
                    •
                  </button>
                  <button
                    type="button"
                    onClick={() => insertFormatting("\n\n1. ", "")}
                    className="px-2 py-1 text-sm hover:bg-gray-200 rounded"
                    title="Liste numérotée"
                  >
                    1.
                  </button>
                </div>

                <textarea
                  id="content"
                  value={formData.content}
                  onChange={(e) => handleInputChange("content", e.target.value)}
                  rows={10}
                  className="w-full border border-gray-300 rounded-b-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Entrez le contenu de la notification"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Settings */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
              <Tag className="h-5 w-5 mr-2" />
              Paramètres
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Type de notification
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => handleInputChange("type", e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="info">Information</option>
                  <option value="promotion">Promotion</option>
                  <option value="urgent">Urgente</option>
                  <option value="update">Mise à jour</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Priorité
                </label>
                <select
                  value={formData.priority}
                  onChange={(e) =>
                    handleInputChange("priority", e.target.value)
                  }
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="low">Faible</option>
                  <option value="medium">Moyenne</option>
                  <option value="high">Haute</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                  <Calendar className="h-4 w-4 mr-1" />
                  Date d'expiration (optionnel)
                </label>
                <input
                  type="datetime-local"
                  value={formData.expires_at}
                  onChange={(e) =>
                    handleInputChange("expires_at", e.target.value)
                  }
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Preview */}
          {showPreview && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Aperçu</h3>

              <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                <h4 className="font-medium text-gray-900 mb-2">
                  {formData.title || "Titre de la notification"}
                </h4>
                <div className="text-sm text-gray-600 whitespace-pre-wrap">
                  {formData.content || "Contenu de la notification"}
                </div>

                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>Type: {formData.type}</span>
                    <span>Priorité: {formData.priority}</span>
                  </div>
                  {formData.expires_at && (
                    <div className="text-xs text-gray-500 mt-1">
                      Expire:{" "}
                      {new Date(formData.expires_at).toLocaleString("fr-FR")}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationForm;
