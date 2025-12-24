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
  }, [fetchPackages, archiveOldPickedUpPackages]);

  type PackageListItem = Package & {
    archived?: boolean;
  };
  const pkgList = packages as unknown as PackageListItem[];
  const activePackages = pkgList.filter((p) => !p.archived);
  const archivedPackages = pkgList.filter((p) => p.archived);
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

  if (loading) {
    return (
      <div className="flex items-center justify-between min-h-screen bg-gray-50">
        <div className="ml-auto mr-auto">
             <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-red-700"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="px-3 py-4 sm:px-6">
      <div className="max-w-md mx-auto sm:max-w-4xl">
        <div className="mb-8">
          <div className="flex justify-between items-center mb-6">
            <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
              Tableau de bord Admin
            </h1>
            <p className="text-gray-600">
              Gérez vos colis et suivez leur progression
            </p>
            </div>
          <div className="flex space-x-3">
            <button
              onClick={() => navigate("/admin/notifications")}
              className="bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 hover:border-red-200 hover:text-red-700 transition-all font-medium text-sm flex items-center space-x-2 shadow-sm"
            >
              <Bell className="h-4 w-4" />
              <span className="hidden sm:inline">Notifications</span>
            </button>
            <button
              onClick={() => setShowForm(true)}
              className="bg-red-700 text-white px-5 py-2 rounded-lg hover:bg-red-800 transition-all font-medium text-sm flex items-center space-x-2 shadow-lg shadow-red-900/20"
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

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-gray-900 flex items-center">
               <div className="p-2 bg-red-50 rounded-lg mr-3">
                 <PackageIcon className="h-5 w-5 text-red-700" />
               </div>
              {tab === "active"
                ? "Tous les colis"
                : "Archives"} 
               <span className="ml-2 text-gray-400 font-normal text-sm">({tab === "active" ? activePackages.length : archivedPackages.length})</span>
            </h2>
            <div className="flex space-x-2 bg-gray-100 p-1 rounded-lg">
              <button
                onClick={() => setTab("active")}
                className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
                  tab === "active"
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                Actifs
              </button>
              <button
                onClick={() => setTab("archived")}
                className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
                  tab === "archived"
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                Archivés
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
    </div>
  );
}
