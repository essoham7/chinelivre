import { useState, useEffect } from "react";
import { Package } from "../../lib/supabase";
import { usePackageStore } from "../../store/packageStore";
import { Chat } from "../chat/Chat";
import {
  ArrowLeft,
  Package as PackageIcon,
  Truck,
  Home,
  CheckCircle,
  MessageCircle,
  User,
  Weight,
  Ruler,
} from "lucide-react";

interface PackageDetailProps {
  package: Package;
  onBack: () => void;
}

export function PackageDetail({ package: pkg, onBack }: PackageDetailProps) {
  const [showChat, setShowChat] = useState(false);
  const [packageWithDetails, setPackageWithDetails] = useState<Package | null>(
    null
  );
  const { fetchPackage } = usePackageStore();

  useEffect(() => {
    loadPackageDetails();
  }, [pkg.id]);

  const loadPackageDetails = async () => {
    const details = await fetchPackage(pkg.id);
    if (details) {
      setPackageWithDetails(details);
    }
  };

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
        className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${config.color}`}
      >
        <Icon className="h-4 w-4 mr-2" />
        {config.label}
      </span>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("fr-FR", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getStatusHistory = () => {
    const history = [];

    history.push({
      date: pkg.received_china_at,
      status: "received_china",
      label: "Colis reçu en Chine",
      description: "Votre colis a été reçu par le transitaire",
    });

    if (pkg.status !== "received_china") {
      history.push({
        date: pkg.updated_at,
        status: "in_transit",
        label: "En transit vers l'Afrique",
        description: "Votre colis est en route vers l'Afrique",
      });
    }

    if (
      ["arrived_africa", "available_warehouse", "picked_up"].includes(
        pkg.status
      )
    ) {
      history.push({
        date: pkg.updated_at,
        status: "arrived_africa",
        label: "Arrivé en Afrique",
        description: "Votre colis est arrivé en Afrique",
      });
    }

    if (["available_warehouse", "picked_up"].includes(pkg.status)) {
      history.push({
        date: pkg.updated_at,
        status: "available_warehouse",
        label: "Disponible à l'entrepôt",
        description:
          "Votre colis est disponible à l'entrepôt pour récupération",
      });
    }

    if (pkg.status === "picked_up") {
      history.push({
        date: pkg.updated_at,
        status: "picked_up",
        label: "Colis récupéré",
        description: "Votre colis a été récupéré",
      });
    }

    return history;
  };

  if (showChat) {
    return (
      <div className="h-screen flex flex-col">
        <div className="bg-white border-b px-4 py-3 flex items-center">
          <button
            onClick={() => setShowChat(false)}
            className="mr-3 p-2 text-gray-400 hover:text-gray-600"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h2 className="text-lg font-semibold">
            Chat - {pkg.tracking_number}
          </h2>
        </div>
        <div className="flex-1">
          <Chat packageId={pkg.id} />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-6">
        <button
          onClick={onBack}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Retour à mes colis
        </button>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                {pkg.tracking_number}
              </h1>
              {getStatusBadge(pkg.status)}
            </div>
            <button
              onClick={() => setShowChat(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center space-x-2"
            >
              <MessageCircle className="h-4 w-4" />
              <span>Contacter</span>
            </button>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Informations du colis
              </h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Contenu
                  </label>
                  <p className="text-gray-900">{pkg.content}</p>
                </div>

                {(pkg.weight || pkg.volume) && (
                  <div className="flex space-x-4">
                    {pkg.weight && (
                      <div className="flex items-center">
                        <Weight className="h-4 w-4 text-gray-400 mr-2" />
                        <span className="text-sm text-gray-600">
                          {pkg.weight} kg
                        </span>
                      </div>
                    )}
                    {pkg.volume && (
                      <div className="flex items-center">
                        <Ruler className="h-4 w-4 text-gray-400 mr-2" />
                        <span className="text-sm text-gray-600">
                          {pkg.volume} m³
                        </span>
                      </div>
                    )}
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Reçu en Chine
                  </label>
                  <p className="text-gray-900">
                    {formatDate(pkg.received_china_at)}
                  </p>
                </div>

                {pkg.estimated_arrival && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Arrivée estimée
                    </label>
                    <p className="text-gray-900">
                      {formatDate(pkg.estimated_arrival)}
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Statut actuel
              </h3>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center mb-2">
                  {getStatusBadge(pkg.status)}
                </div>
                <p className="text-sm text-gray-600">
                  {pkg.status === "received_china" &&
                    "Votre colis a été reçu en Chine et sera bientôt expédié vers l'Afrique."}
                  {pkg.status === "in_transit" &&
                    "Votre colis est actuellement en transit vers l'Afrique."}
                  {pkg.status === "arrived_africa" &&
                    "Votre colis est arrivé en Afrique et sera bientôt disponible à l'entrepôt."}
                  {pkg.status === "available_warehouse" &&
                    "Votre colis est disponible à l'entrepôt. Vous pouvez venir le récupérer."}
                  {pkg.status === "picked_up" &&
                    "Votre colis a été récupéré. Merci de votre confiance!"}
                </p>
              </div>
            </div>
          </div>

          {packageWithDetails &&
            (packageWithDetails as any).photos &&
            (packageWithDetails as any).photos.length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  Photos
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {(packageWithDetails as any).photos.map(
                    (ph: any, idx: number) => (
                      <img
                        key={idx}
                        src={ph.url || ""}
                        alt={`Photo ${idx + 1}`}
                        className="w-full h-32 object-cover rounded-lg border"
                      />
                    )
                  )}
                </div>
              </div>
            )}

          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Historique du colis
            </h3>
            <div className="space-y-4">
              {getStatusHistory().map((item, index) => (
                <div key={index} className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-medium text-gray-900">
                        {item.label}
                      </h4>
                      <span className="text-sm text-gray-500">
                        {formatDate(item.date)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      {item.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
