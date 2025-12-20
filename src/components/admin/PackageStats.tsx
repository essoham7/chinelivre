import { Package, Truck, Home, CheckCircle } from "lucide-react";

interface PackageStatsProps {
  stats: {
    total: number;
    received: number;
    inTransit: number;
    arrived: number;
    available: number;
    pickedUp: number;
  };
}

export function PackageStats({ stats }: PackageStatsProps) {
  const statItems = [
    {
      title: "Total Colis",
      value: stats.total,
      icon: Package,
      color: "bg-blue-500",
    },
    {
      title: "Reçus en Chine",
      value: stats.received,
      icon: Package,
      color: "bg-gray-500",
    },
    {
      title: "En Transit",
      value: stats.inTransit,
      icon: Truck,
      color: "bg-yellow-500",
    },
    {
      title: "Arrivés en Afrique",
      value: stats.arrived,
      icon: Home,
      color: "bg-orange-500",
    },
    {
      title: "Disponibles",
      value: stats.available,
      icon: Home,
      color: "bg-green-500",
    },
    {
      title: "Récupérés",
      value: stats.pickedUp,
      icon: CheckCircle,
      color: "bg-green-600",
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
      {statItems.map((item, index) => {
        const Icon = item.icon;
        return (
          <div key={index} className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center">
              <div className={`${item.color} rounded-lg p-2 mr-3`}>
                <Icon className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">
                  {item.title}
                </p>
                <p className="text-2xl font-bold text-gray-900">{item.value}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
