import { useEffect, useState } from "react";
import { useAuthStore } from "../../store/authStore";
import { usePackageStore } from "../../store/packageStore";
import { Package } from "../../lib/supabase";
import { ClientPackageCard } from "./ClientPackageCard";
import { PackageDetail } from "./PackageDetail";
import { Package as PackageIcon, Bell } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import { SkeletonCard, SkeletonLine } from "../ui/Skeleton";

export function ClientDashboard() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { packages, loading, fetchPackages } = usePackageStore();
  const [selectedPackage, setSelectedPackage] = useState<Package | null>(null);
  const [showDetail, setShowDetail] = useState(false);
  const [timeoutError, setTimeoutError] = useState<string | null>(null);
  const [displayName, setDisplayName] = useState<string>("");

  useEffect(() => {
    if (user) {
      fetchPackages(user.id);
    }
  }, [user, fetchPackages]);

  useEffect(() => {
    const loadName = async () => {
      if (!user) return;
      const alias = user.email?.split("@")[0] || "";
      const { data } = await supabase
        .from("profiles")
        .select("first_name,last_name")
        .eq("id", user.id)
        .single();
      const full = [data?.first_name, data?.last_name]
        .filter(Boolean)
        .join(" ")
        .trim();
      setDisplayName(full || alias);
    };
    loadName();
  }, [user]);

  useEffect(() => {
    const t = setTimeout(() => {
      if (loading)
        setTimeoutError(
          "Le chargement prend trop de temps. Veuillez réessayer."
        );
    }, 30000);
    return () => clearTimeout(t);
  }, [loading]);

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
      <div className="p-6">
        <div className="mb-8">
          <SkeletonLine width="w-1/3" />
          <SkeletonLine width="w-1/2" className="mt-2" />
        </div>
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
        {timeoutError && (
          <div className="mt-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex">
              <Bell className="h-5 w-5 text-red-400 mt-0.5" />
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
              Bonjour {displayName}!
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
