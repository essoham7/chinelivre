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
import { buildWhatsappUrl } from "../../utils/whatsapp";

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
  type PackageListItem = Package & {
    client?: {
      first_name?: string | null;
      last_name?: string | null;
      company?: string | null;
      email?: string | null;
      phone?: string | null;
    };
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

          {p.photos && p.photos.length > 0 && (
            <div className="mb-3 grid grid-cols-4 gap-2">
              {p.photos.slice(0, 4).map((ph, idx) => (
                <img
                  key={idx}
                  src={ph.url || ""}
                  alt={`Photo ${idx + 1}`}
                  className="w-full h-16 object-cover rounded border"
                />
              ))}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4 text-sm text-gray-500">
            <div className="flex items-center">
              <User className="h-4 w-4 mr-1" />
              <span>
                Client: {(p.client?.first_name || "").trim()}{" "}
                {(p.client?.last_name || "").trim()}
                {p.client?.company && p.client.company.trim().length > 0
                  ? ` (${p.client.company})`
                  : ""}
              </span>
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
          {p.client?.phone && (
            <a
              href={buildWhatsappUrl(
                p.client.phone,
                `Bonjour, concernant le colis ${pkg.tracking_number}`
              )}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 text-green-500 hover:text-green-600 transition-colors"
              title="WhatsApp"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="h-4 w-4"
              >
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.472-.148-.67.149-.198.297-.767.967-.94 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.131-.606.134-.133.297-.347.446-.521.149-.173.198-.297.297-.495.099-.198.05-.372-.025-.521-.074-.149-.669-1.611-.916-2.206-.242-.579-.487-.5-.67-.51-.173-.01-.372-.012-.571-.012-.198 0-.521.074-.794.372-.273.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.1 3.206 5.077 4.492.709.306 1.262.489 1.694.626.712.226 1.36.194 1.871.118.57-.085 1.758-.718 2.006-1.412.248-.694.248-1.289.173-1.412-.074-.123-.272-.198-.57-.347z" />
                <path d="M12.004 2.003c-5.5 0-9.997 4.497-9.997 9.997 0 1.761.468 3.412 1.284 4.856l-1.36 4.972 5.09-1.335c1.39.76 2.972 1.191 4.683 1.191 5.5 0 9.997-4.497 9.997-9.997s-4.497-9.997-9.997-9.997zm0 18.19c-1.516 0-2.922-.39-4.152-1.07l-.297-.173-3.018.792.808-2.96-.198-.306c-.792-1.255-1.213-2.708-1.213-4.2 0-4.632 3.769-8.401 8.401-8.401 4.632 0 8.401 3.769 8.401 8.401 0 4.632-3.769 8.401-8.401 8.401z" />
              </svg>
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
