import { useEffect, useState } from "react";
import { useAuthStore } from "../../store/authStore";
import { usePackageStore } from "../../store/packageStore";
import { Package } from "../../lib/supabase";
import { ClientPackageCard } from "./ClientPackageCard";
import { PackageDetail } from "./PackageDetail";
import { Package as PackageIcon, Bell } from "lucide-react";
import { useNavigate } from "react-router-dom";

export function ClientDashboard() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { packages, loading, fetchPackages } = usePackageStore();
  const [selectedPackage, setSelectedPackage] = useState<Package | null>(null);
  const [showDetail, setShowDetail] = useState(false);

  useEffect(() => {
    if (user) {
      fetchPackages(user.id);
    }
  }, [user, fetchPackages]);

  const handlePackageClick = (pkg: Package) => {
    setSelectedPackage(pkg);
    setShowDetail(true);
  };

  const handleBackToList = () => {
    setShowDetail(false);
    setSelectedPackage(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (showDetail && selectedPackage) {
    return (
      <PackageDetail package={selectedPackage} onBack={handleBackToList} />
    );
  }

  return (
    <div className="p-6">
      <div className="mb-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Bonjour {user?.email?.split("@")[0]}!
            </h1>
            <p className="text-gray-600">Suivez vos colis en temps réel</p>
          </div>
          <button
            onClick={() => navigate("/client/notifications")}
            className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 flex items-center space-x-2"
          >
            <Bell className="h-4 w-4" />
            <span>Mes notifications</span>
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center">
            <PackageIcon className="h-5 w-5 mr-2" />
            Mes colis ({packages.length})
          </h2>
        </div>

        <div className="divide-y divide-gray-200">
          {packages.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <PackageIcon className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>Aucun colis trouvé</p>
              <p className="text-sm">
                Vos colis apparaîtront ici une fois enregistrés par votre
                transitaire
              </p>
            </div>
          ) : (
            packages.map((pkg) => (
              <ClientPackageCard
                key={pkg.id}
                package={pkg}
                onClick={() => handlePackageClick(pkg)}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}
