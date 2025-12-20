import { useEffect, useState } from "react";
import { usePackageStore } from "../../store/packageStore";
import { Package } from "../../lib/supabase";
import { PackageCard } from "./PackageCard";
import { PackageForm } from "./PackageForm";
import { PackageStats } from "./PackageStats";
import { Plus, Package as PackageIcon, Bell } from "lucide-react";
import { Chat } from "../chat/Chat";
import { useNavigate } from "react-router-dom";

export function AdminDashboard() {
  const navigate = useNavigate();
  const { packages, loading, fetchPackages, archiveOldPickedUpPackages } =
    usePackageStore();
  const [showForm, setShowForm] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<Package | null>(null);
  const [showChat, setShowChat] = useState(false);
  const [tab, setTab] = useState<"active" | "archived">("active");

  useEffect(() => {
    (async () => {
      await archiveOldPickedUpPackages();
      await fetchPackages();
    })();
  }, [fetchPackages]);

  const activePackages = packages.filter((p: any) => !p.archived);
  const archivedPackages = packages.filter((p: any) => p.archived);
  const stats = {
    total: activePackages.length,
    received: activePackages.filter((p) => p.status === "received_china")
      .length,
    inTransit: activePackages.filter((p) => p.status === "in_transit").length,
    arrived: activePackages.filter((p) => p.status === "arrived_africa").length,
    available: activePackages.filter((p) => p.status === "available_warehouse")
      .length,
    pickedUp: activePackages.filter((p) => p.status === "picked_up").length,
  };

  const handlePackageCreated = () => {
    setShowForm(false);
    setSelectedPackage(null);
    fetchPackages();
  };

  const handlePackageUpdated = () => {
    setSelectedPackage(null);
    fetchPackages();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Tableau de bord Admin
            </h1>
            <p className="text-gray-600">
              Gérez vos colis et suivez leur progression
            </p>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={() => navigate("/admin/notifications")}
              className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 flex items-center space-x-2"
            >
              <Bell className="h-4 w-4" />
              <span>Notifications</span>
            </button>
            <button
              onClick={() => setShowForm(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center space-x-2"
            >
              <Plus className="h-4 w-4" />
              <span>Nouveau colis</span>
            </button>
          </div>
        </div>

        <PackageStats stats={stats} />
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-screen overflow-y-auto">
            <PackageForm
              package={selectedPackage}
              onSuccess={handlePackageCreated}
              onCancel={() => {
                setShowForm(false);
                setSelectedPackage(null);
              }}
            />
          </div>
        </div>
      )}

      {showChat && selectedPackage && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-screen overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold text-gray-900">
                Chat pour {selectedPackage.tracking_number}
              </h3>
              <button
                onClick={() => setShowChat(false)}
                className="px-3 py-1 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Fermer
              </button>
            </div>
            {/* Chat */}
            <div className="h-[60vh]">
              <Chat packageId={selectedPackage.id} />
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center">
              <PackageIcon className="h-5 w-5 mr-2" />
              {tab === "active"
                ? `Liste des colis (${activePackages.length})`
                : `Colis archivés (${archivedPackages.length})`}
            </h2>
            <div className="flex space-x-4">
              <button
                onClick={() => setTab("active")}
                className={`px-3 py-1 rounded-md text-sm ${
                  tab === "active"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-700"
                }`}
              >
                Actifs
              </button>
              <button
                onClick={() => setTab("archived")}
                className={`px-3 py-1 rounded-md text-sm ${
                  tab === "archived"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-700"
                }`}
              >
                Colis archivés
              </button>
            </div>
          </div>
        </div>

        <div className="divide-y divide-gray-200">
          {(tab === "active" ? activePackages : archivedPackages).length ===
          0 ? (
            <div className="p-8 text-center text-gray-500">
              <PackageIcon className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>Aucun colis {tab === "active" ? "actif" : "archivé"} trouvé</p>
              <p className="text-sm">Commencez par créer votre premier colis</p>
            </div>
          ) : (
            (tab === "active" ? activePackages : archivedPackages).map(
              (pkg) => (
                <PackageCard
                  key={pkg.id}
                  package={pkg}
                  onEdit={() => {
                    setSelectedPackage(pkg);
                    setShowForm(true);
                  }}
                  onChat={() => {
                    setSelectedPackage(pkg);
                    setShowChat(true);
                  }}
                />
              )
            )
          )}
        </div>
      </div>
    </div>
  );
}
