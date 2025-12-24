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
      <div className="p-6 max-w-7xl mx-auto">
        <div className="mb-8">
          <SkeletonLine width="w-1/3" />
          <SkeletonLine width="w-1/2" className="mt-2" />
        </div>
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
        {timeoutError && (
          <div className="mt-6 bg-red-50 border border-red-100 rounded-xl p-4 shadow-sm">
            <div className="flex">
              <Bell className="h-5 w-5 text-red-500 mt-0.5" />
              <div className="ml-3">
                <h3 className="text-sm font-semibold text-red-800">Erreur de connexion</h3>
                <p className="mt-1 text-sm text-red-600 opacity-90">{timeoutError}</p>
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
        <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
              Bonjour, {displayName}
            </h1>
            <p className="text-gray-500 mt-1">
              Bienvenue sur votre espace de suivi.
            </p>
          </div>
          <button
            onClick={() => navigate("/client/notifications")}
            className="w-full md:w-auto bg-white border border-gray-200 text-gray-700 px-4 py-2.5 rounded-xl hover:bg-gray-50 hover:border-red-100 hover:text-red-700 transition-all shadow-sm flex items-center justify-center space-x-2 group"
          >
            <Bell className="h-4 w-4 text-gray-400 group-hover:text-red-700 transition-colors" />
            <span className="font-medium">Notifications</span>
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-900 flex items-center">
            <div className="p-2 bg-red-50 rounded-lg mr-3">
              <PackageIcon className="h-5 w-5 text-red-700" />
            </div>
            Mes colis <span className="ml-2 text-gray-400 font-normal text-sm">({packages.length})</span>
          </h2>
        </div>

        <div className="divide-y divide-gray-50">
          {packages.length === 0 ? (
            <div className="py-16 text-center">
              <div className="bg-gray-50 h-24 w-24 rounded-full flex items-center justify-center mx-auto mb-4">
                <PackageIcon className="h-10 w-10 text-gray-300" />
              </div>
              <h3 className="text-lg font-medium text-gray-900">Aucun colis</h3>
              <p className="text-gray-500 mt-1 max-w-sm mx-auto">
                Vos colis apparaîtront ici une fois enregistrés par nos services.
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
