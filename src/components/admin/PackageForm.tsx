import { useState, useEffect } from "react";
import { usePackageStore } from "../../store/packageStore";
import { Package, PackageInsert } from "../../lib/supabase";
import { supabase } from "../../lib/supabase";
import { PhotoUpload } from "../photos/PhotoUpload";
import {
  notifyPackageCreated,
  notifyStatusUpdated,
} from "../../hooks/useNotifications";
import { X } from "lucide-react";

interface PackageFormProps {
  package?: Package | null;
  onSuccess: () => void;
  onCancel: () => void;
}

export function PackageForm({
  package: pkg,
  onSuccess,
  onCancel,
}: PackageFormProps) {
  const { createPackage, updatePackage } = usePackageStore();
  const [formData, setFormData] = useState<Partial<PackageInsert>>({
    tracking_number: pkg?.tracking_number || "",
    content: pkg?.content || "",
    weight: pkg?.weight || undefined,
    volume: pkg?.volume || undefined,
    client_id: pkg?.client_id || "",
    status: pkg?.status || "received_china",
    estimated_arrival: pkg?.estimated_arrival || undefined,
  });
  const [clients, setClients] = useState<Array<{ id: string; email: string }>>(
    []
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadedPhotos, setUploadedPhotos] = useState<
    Array<{ path: string; url: string }>
  >([]);

  const [searchQuery, setSearchQuery] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const filteredClients = clients.filter((client) =>
    client.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  useEffect(() => {
    fetchClients();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest(".client-search-container")) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const fetchClients = async () => {
    const { data, error } = await supabase
      .from("profiles")
      .select("id, email")
      .eq("role", "client");

    if (!error && data) {
      setClients(data as Array<{ id: string; email: string }>);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (pkg) {
        // Mise à jour du colis
        await updatePackage(pkg.id, formData);

        // La notification de mise à jour de statut est gérée côté base via trigger
      } else {
        // Création d'un nouveau colis
        const created = await createPackage(formData as PackageInsert);

        // Notifier le client
        if (formData.client_id) {
          await notifyPackageCreated(
            formData.client_id,
            created.id,
            created.tracking_number
          );
        }
      }
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Une erreur est survenue");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        name === "weight" || name === "volume"
          ? value
            ? parseFloat(value)
            : undefined
          : value,
    }));
  };

  const handlePhotosUploaded = (
    photos: Array<{ path: string; url: string }>
  ) => {
    setUploadedPhotos((prev) => [...prev, ...photos]);
  };

  const handleClientSelect = (client: { id: string; email: string }) => {
    setFormData((prev) => ({ ...prev, client_id: client.id }));
    setSearchQuery(client.email);
    setShowSuggestions(false);
  };

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">
          {pkg ? "Modifier le colis" : "Créer un colis"}
        </h2>
        <button
          onClick={onCancel}
          className="p-2 text-gray-400 hover:text-gray-600"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-md">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="tracking_number"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Numéro de suivi *
          </label>
          <input
            id="tracking_number"
            name="tracking_number"
            type="text"
            value={formData.tracking_number}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <label
            htmlFor="content"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Contenu *
          </label>
          <textarea
            id="content"
            name="content"
            value={formData.content}
            onChange={handleInputChange}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="weight"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Poids (kg)
            </label>
            <input
              id="weight"
              name="weight"
              type="number"
              step="0.01"
              value={formData.weight || ""}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label
              htmlFor="volume"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Volume (m³)
            </label>
            <input
              id="volume"
              name="volume"
              type="number"
              step="0.0001"
              value={formData.volume || ""}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div>
          <label
            htmlFor="client_id"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Client
          </label>
          <div className="relative client-search-container">
            <input
              type="text"
              placeholder="Rechercher un client par email..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setShowSuggestions(true);
                if (e.target.value === "") {
                  setFormData((prev) => ({ ...prev, client_id: "" }));
                }
              }}
              onFocus={() => setShowSuggestions(true)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

            {showSuggestions && searchQuery && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                {filteredClients.length > 0 ? (
                  filteredClients.map((client) => (
                    <div
                      key={client.id}
                      onClick={() => handleClientSelect(client)}
                      className="px-4 py-2 cursor-pointer hover:bg-blue-50 text-sm text-gray-700"
                    >
                      {client.email}
                    </div>
                  ))
                ) : (
                  <div className="px-4 py-2 text-sm text-gray-500">
                    Aucun client trouvé
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <div>
          <label
            htmlFor="status"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Statut
          </label>
          <select
            id="status"
            name="status"
            value={formData.status}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="received_china">Reçu en Chine</option>
            <option value="in_transit">En transit</option>
            <option value="arrived_africa">Arrivé en Afrique</option>
            <option value="available_warehouse">Disponible à l'entrepôt</option>
            <option value="picked_up">Récupéré</option>
          </select>
        </div>

        <div>
          <label
            htmlFor="estimated_arrival"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Date d'arrivée estimée
          </label>
          <input
            id="estimated_arrival"
            name="estimated_arrival"
            type="date"
            value={
              formData.estimated_arrival
                ? formData.estimated_arrival.split("T")[0]
                : ""
            }
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {!pkg && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Photos du colis
            </label>
            <PhotoUpload
              packageId={pkg?.id || "temp"}
              onPhotosUploaded={handlePhotosUploaded}
              maxPhotos={5}
            />
          </div>
        )}

        <div className="flex justify-end space-x-3 pt-4">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            Annuler
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? "Enregistrement..." : pkg ? "Mettre à jour" : "Créer"}
          </button>
        </div>
      </form>
    </div>
  );
}
