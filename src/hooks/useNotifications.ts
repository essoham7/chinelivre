import { supabase } from "../lib/supabase";
import { Notification } from "../lib/supabase";

export const createNotification = async (
  userId: string,
  packageId: string,
  type: Notification["type"],
  title: string,
  content?: string
) => {
  const { data, error } = await supabase
    .from("notifications")
    .insert([
      {
        user_id: userId,
        package_id: packageId,
        type,
        title,
        content,
      },
    ])
    .select()
    .single();

  if (error) {
    console.error("Error creating notification:", error);
    return null;
  }
  return data as any;
};

export const notifyPackageCreated = async (
  clientId: string,
  packageId: string,
  trackingNumber: string
) => {
  await createNotification(
    clientId,
    packageId,
    "package_created",
    "Nouveau colis enregistré",
    `Votre colis ${trackingNumber} a été enregistré par le transitaire`
  );
};

export const notifyStatusUpdated = async (
  clientId: string,
  packageId: string,
  trackingNumber: string,
  newStatus: string
) => {
  const statusLabels = {
    received_china: "Reçu en Chine",
    in_transit: "En transit",
    arrived_africa: "Arrivé en Afrique",
    available_warehouse: "Disponible à l'entrepôt",
    picked_up: "Récupéré",
  };

  await createNotification(
    clientId,
    packageId,
    "status_updated",
    "Statut du colis mis à jour",
    `Votre colis ${trackingNumber} est maintenant: ${
      statusLabels[newStatus as keyof typeof statusLabels]
    }`
  );
};

export const notifyNewMessage = async (
  recipientId: string,
  packageId: string,
  senderName: string
) => {
  const created = await createNotification(
    recipientId,
    packageId,
    "new_message",
    "Nouveau message",
    `${senderName} vous a envoyé un message`
  );
  if (created && created.id) {
    const ins = await supabase
      .from("user_notifications")
      .insert([
        {
          notification_id: created.id,
          user_id: recipientId,
          status: "unread",
        },
      ]);
    if (ins.error) {
      const msg = String(ins.error.message || "");
      if (!msg.includes("Could not find the table 'public.user_notifications'")) {
        console.error("Error inserting user_notifications:", ins.error);
      }
    }
  }
};
