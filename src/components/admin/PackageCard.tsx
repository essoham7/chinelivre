import { Package } from "../../lib/supabase";
import {
  Edit,
  MessageCircle,
  Package as PackageIcon,
  Truck,
  Home,
  CheckCircle,
  User,
} from "lucide-react";

interface PackageCardProps {
  package: Package;
  onEdit: () => void;
  onChat?: () => void;
}

export function PackageCard({
  package: pkg,
  onEdit,
  onChat,
}: PackageCardProps) {
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
    <div className="p-6 hover:bg-gray-50 transition-colors">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-3 mb-2">
            <h3 className="text-lg font-semibold text-gray-900">
              {pkg.tracking_number}
            </h3>
            {getStatusBadge(pkg.status)}
          </div>

          <p className="text-gray-600 mb-3">{pkg.content}</p>

          <div className="grid grid-cols-2 gap-4 text-sm text-gray-500">
            <div className="flex items-center">
              <User className="h-4 w-4 mr-1" />
              <span>Client: {(pkg as any).client?.email || "Non assigné"}</span>
            </div>
            <div>
              <span>Reçu le: {formatDate(pkg.received_china_at)}</span>
            </div>
            {pkg.weight && (
              <div>
                <span>Poids: {pkg.weight} kg</span>
              </div>
            )}
            {pkg.volume && (
              <div>
                <span>Volume: {pkg.volume} m³</span>
              </div>
            )}
            {pkg.estimated_arrival && (
              <div className="col-span-2">
                <span>
                  Arrivée estimée: {formatDate(pkg.estimated_arrival)}
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center space-x-2 ml-4">
          <button
            onClick={onEdit}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
            title="Modifier"
          >
            <Edit className="h-4 w-4" />
          </button>
          <button
            onClick={onChat}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
            title="Chat"
          >
            <MessageCircle className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
