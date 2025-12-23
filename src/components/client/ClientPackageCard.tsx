import { Package } from "../../lib/supabase";
import { Package as PackageIcon, Truck, Home, CheckCircle } from "lucide-react";

interface ClientPackageCardProps {
  package: Package;
  onClick: () => void;
}

export function ClientPackageCard({
  package: pkg,
  onClick,
}: ClientPackageCardProps) {
  type PackageListItem = Package & {
    photos?: Array<{
      url: string | null;
      storage_path: string;
      is_primary: boolean;
    }>;
  };
  const p = pkg as unknown as PackageListItem;
  const getStatusBadge = (status: string) => {
    const statusConfig = {
      received_china: {
        label: "Reçu en Chine",
        color: "bg-gray-100 text-gray-800",
        icon: PackageIcon,
      },
      in_transit: {
        label: "En transit",
        color: "bg-yellow-100 text-yellow-800",
        icon: Truck,
      },
      arrived_africa: {
        label: "Arrivé en Afrique",
        color: "bg-orange-100 text-orange-800",
        icon: Home,
      },
      available_warehouse: {
        label: "Disponible",
        color: "bg-green-100 text-green-800",
        icon: Home,
      },
      picked_up: {
        label: "Récupéré",
        color: "bg-green-600 text-white",
        icon: CheckCircle,
      },
    };

    const config = statusConfig[status as keyof typeof statusConfig];
    const Icon = config.icon;

    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}
      >
        <Icon className="h-3 w-3 mr-1" />
        {config.label}
      </span>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("fr-FR");
  };

  return (
    <div
      onClick={onClick}
      className="p-6 hover:bg-gray-50 transition-colors cursor-pointer"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-3">
          <h3 className="text-lg font-semibold text-gray-900">
            {pkg.tracking_number}
          </h3>
          {getStatusBadge(pkg.status)}
        </div>
      </div>

      <p className="text-gray-600 mb-4">{pkg.content}</p>

      {p.photos && p.photos.length > 0 && (
        <div className="mb-3 grid grid-cols-3 gap-2">
          {p.photos.slice(0, 3).map((ph, idx) => (
            <img
              key={idx}
              src={ph.url || ""}
              alt={`Photo ${idx + 1}`}
              className="w-full h-16 object-cover rounded border"
            />
          ))}
        </div>
      )}

      <div className="flex justify-between items-center text-sm text-gray-500">
        <span>Reçu le: {formatDate(pkg.received_china_at)}</span>
        {pkg.estimated_arrival && (
          <span className="text-blue-600 font-medium">
            Arrivée estimée: {formatDate(pkg.estimated_arrival)}
          </span>
        )}
      </div>

      {(pkg.weight || pkg.volume) && (
        <div className="mt-3 flex space-x-4 text-sm text-gray-500">
          {pkg.weight && <span>Poids: {pkg.weight} kg</span>}
          {pkg.volume && <span>Volume: {pkg.volume} m³</span>}
        </div>
      )}
    </div>
  );
}
