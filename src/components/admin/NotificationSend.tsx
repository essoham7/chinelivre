import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useNotificationStore } from "../../store/notificationStore";
import { supabase } from "../../lib/supabase";
import {
  ArrowLeft,
  Send,
  Filter,
  Users,
  Calendar,
  DollarSign,
  MapPin,
  AlertCircle,
} from "lucide-react";

const NotificationSend: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const {
    selectedNotification,
    publicUsers,
    loading,
    error,
    clientFilters,
    setSelectedNotification,
    fetchPublicUsers,
    sendNotification,
    setClientFilters,
  } = useNotificationStore();

  type LocalFilters = {
    name: string;
    subscriptionType: string;
    location: string;
    minSpent: number | undefined;
    maxSpent: number | undefined;
    dateFrom: string;
    dateTo: string;
  };
  const [localFilters, setLocalFilters] = useState<LocalFilters>({
    name: clientFilters.name || "",
    subscriptionType: clientFilters.subscriptionType || "",
    location: clientFilters.location || "",
    minSpent:
      typeof clientFilters.minSpent === "number"
        ? clientFilters.minSpent
        : undefined,
    maxSpent:
      typeof clientFilters.maxSpent === "number"
        ? clientFilters.maxSpent
        : undefined,
    dateFrom: clientFilters.dateFrom || "",
    dateTo: clientFilters.dateTo || "",
  });

  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());
  const [showFilters, setShowFilters] = useState(true);
  const [sending, setSending] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    if (!id) return;
    const loadNotification = async () => {
      const { data } = await supabase
        .from("notifications")
        .select("*")
        .eq("id", id)
        .single();
      if (data) setSelectedNotification(data);
    };
    loadNotification();
  }, [id, setSelectedNotification]);

  useEffect(() => {
    fetchPublicUsers(localFilters);
  }, [fetchPublicUsers, localFilters]);

  const handleFilterChange = (
    key: keyof LocalFilters,
    value: string | number
  ) => {
    const next: LocalFilters = { ...localFilters };
    if (key === "minSpent" || key === "maxSpent") {
      const v = value === "" ? undefined : Number(value);
      next[key] = Number.isNaN(v as number)
        ? undefined
        : (v as number | undefined);
    } else {
      next[key] = String(value);
    }
    setLocalFilters(next);
    setClientFilters(next);
    fetchPublicUsers(next);
  };

  const handleResetFilters = () => {
    const resetFilters: LocalFilters = {
      name: "",
      subscriptionType: "",
      location: "",
      minSpent: undefined,
      maxSpent: undefined,
      dateFrom: "",
      dateTo: "",
    };
    setLocalFilters(resetFilters);
    setClientFilters(resetFilters);
    fetchPublicUsers(resetFilters);
  };

  const handleSelectUser = (userId: string) => {
    const newSelected = new Set(selectedUsers);
    if (newSelected.has(userId)) {
      newSelected.delete(userId);
    } else {
      newSelected.add(userId);
    }
    setSelectedUsers(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedUsers.size === paginatedUsers.length) {
      setSelectedUsers(new Set());
    } else {
      setSelectedUsers(new Set(paginatedUsers.map((user) => user.id)));
    }
  };

  const handleSend = async () => {
    if (selectedUsers.size === 0) {
      alert("Veuillez sélectionner au moins un destinataire");
      return;
    }

    if (
      !window.confirm(
        `Êtes-vous sûr de vouloir envoyer cette notification à ${selectedUsers.size} destinataire(s) ?`
      )
    ) {
      return;
    }

    setSending(true);
    try {
      const success = await sendNotification(id!, Array.from(selectedUsers));
      if (success) {
        alert("Notification envoyée avec succès");
        navigate("/admin/notifications");
      } else {
        alert("Erreur lors de l'envoi de la notification");
      }
    } catch (error) {
      console.error("Error sending notification:", error);
      alert("Erreur lors de l'envoi de la notification");
    } finally {
      setSending(false);
    }
  };

  // Pagination
  const filteredUsers = publicUsers.filter((user) => {
    // Additional client-side filtering if needed
    return true;
  });

  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedUsers = filteredUsers.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  const getSubscriptionColor = (type: string) => {
    switch (type) {
      case "premium":
        return "text-purple-600 bg-purple-100";
      case "enterprise":
        return "text-blue-600 bg-blue-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("fr-FR");
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "EUR",
    }).format(amount);
  };

  if (loading && !selectedNotification) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!selectedNotification) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex">
          <AlertCircle className="h-5 w-5 text-red-400 mt-0.5" />
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">
              Notification non trouvée
            </h3>
            <div className="mt-2 text-sm text-red-700">
              <p>
                La notification que vous cherchez n'existe pas ou a été
                supprimée.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
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
              Envoyer la Notification
            </h1>
            <p className="text-gray-600">
              Sélectionnez les destinataires pour: {selectedNotification.title}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <span className="text-sm text-gray-500">
            {selectedUsers.size} sélectionné(s)
          </span>
          <button
            onClick={handleSend}
            disabled={sending || selectedUsers.size === 0}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg transition-colors"
          >
            <Send className="h-4 w-4" />
            <span>{sending ? "Envoi..." : "Envoyer"}</span>
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

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Filters */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="font-medium text-gray-900 flex items-center">
                  <Filter className="h-4 w-4 mr-2" />
                  Filtres
                </h3>
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  {showFilters ? "−" : "+"}
                </button>
              </div>
            </div>

            {showFilters && (
              <div className="p-4 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nom
                  </label>
                  <input
                    type="text"
                    value={localFilters.name}
                    onChange={(e) => handleFilterChange("name", e.target.value)}
                    placeholder="Rechercher par nom"
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Type d'abonnement
                  </label>
                  <select
                    value={localFilters.subscriptionType}
                    onChange={(e) =>
                      handleFilterChange("subscriptionType", e.target.value)
                    }
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Tous</option>
                    <option value="free">Gratuit</option>
                    <option value="premium">Premium</option>
                    <option value="enterprise">Enterprise</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                    <MapPin className="h-3 w-3 mr-1" />
                    Localisation
                  </label>
                  <input
                    type="text"
                    value={localFilters.location}
                    onChange={(e) =>
                      handleFilterChange("location", e.target.value)
                    }
                    placeholder="Ville ou pays"
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                    <DollarSign className="h-3 w-3 mr-1" />
                    Dépenses totales
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="number"
                      value={localFilters.minSpent}
                      onChange={(e) =>
                        handleFilterChange("minSpent", e.target.value)
                      }
                      placeholder="Min"
                      className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <input
                      type="number"
                      value={localFilters.maxSpent}
                      onChange={(e) =>
                        handleFilterChange("maxSpent", e.target.value)
                      }
                      placeholder="Max"
                      className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                    <Calendar className="h-3 w-3 mr-1" />
                    Date d'inscription
                  </label>
                  <div className="space-y-2">
                    <input
                      type="date"
                      value={localFilters.dateFrom}
                      onChange={(e) =>
                        handleFilterChange("dateFrom", e.target.value)
                      }
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <input
                      type="date"
                      value={localFilters.dateTo}
                      onChange={(e) =>
                        handleFilterChange("dateTo", e.target.value)
                      }
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    onClick={handleResetFilters}
                    className="w-full px-3 py-2 text-sm text-gray-600 hover:text-gray-800 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                  >
                    Réinitialiser
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Summary */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mt-4">
            <h4 className="font-medium text-gray-900 mb-3 flex items-center">
              <Users className="h-4 w-4 mr-2" />
              Résumé
            </h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Total clients:</span>
                <span className="font-medium">{filteredUsers.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Sélectionnés:</span>
                <span className="font-medium text-blue-600">
                  {selectedUsers.size}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Page:</span>
                <span className="font-medium">
                  {currentPage}/{totalPages}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Users List */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="font-medium text-gray-900">Destinataires</h3>
                <button
                  onClick={handleSelectAll}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  {selectedUsers.size === paginatedUsers.length
                    ? "Tout désélectionner"
                    : "Tout sélectionner"}
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <input
                        type="checkbox"
                        checked={
                          selectedUsers.size === paginatedUsers.length &&
                          paginatedUsers.length > 0
                        }
                        onChange={handleSelectAll}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Nom
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Abonnement
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Dépenses
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Localisation
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Inscription
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {paginatedUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="checkbox"
                          checked={selectedUsers.has(user.id)}
                          onChange={() => handleSelectUser(user.id)}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {user.name}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-600">
                          {user.email || "N/A"}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getSubscriptionColor(
                            user.subscription_type
                          )}`}
                        >
                          {user.subscription_type}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-600">
                          {formatCurrency(user.total_spent)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-600">
                          {user.location || "N/A"}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-600">
                          {formatDate(user.created_at)}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {paginatedUsers.length === 0 && (
                <div className="text-center py-8">
                  <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Aucun client trouvé
                  </h3>
                  <p className="text-gray-600">
                    Ajustez vos filtres pour voir plus de résultats
                  </p>
                </div>
              )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="px-6 py-3 border-t border-gray-200 flex items-center justify-between">
                <div className="text-sm text-gray-500">
                  Affichage de {startIndex + 1} à{" "}
                  {Math.min(startIndex + itemsPerPage, filteredUsers.length)}{" "}
                  sur {filteredUsers.length} résultats
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Précédent
                  </button>
                  <button
                    onClick={() =>
                      setCurrentPage(Math.min(totalPages, currentPage + 1))
                    }
                    disabled={currentPage === totalPages}
                    className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Suivant
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationSend;
