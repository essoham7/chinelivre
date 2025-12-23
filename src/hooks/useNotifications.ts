import { supabase } from "../lib/supabase";
import { Notification, Package } from "../lib/supabase";
import {
  formatStatusNotification,
  formatCreatedNotification,
  formatMessageNotification,
} from "../utils/notificationFormatter";

export const createNotification = async (
  userId: string,
  packageId: string,
  type: Notification["type"],
  title: string,
  content?: string
): Promise<Notification | null> => {
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
  return data as Notification;
};

export const notifyPackageCreated = async (
  clientId: string,
  packageId: string,
  trackingNumber: string
) => {
  const content = formatCreatedNotification(trackingNumber);
  const created = await createNotification(
    clientId,
    packageId,
    "package_created",
    "Statut ajouté",
    content
  );
  if (created?.id) {
    const ins = await supabase.from("user_notifications").insert([
      {
        notification_id: created.id,
        user_id: clientId,
        status: "unread",
      },
    ]);
    if (ins.error) {
      const msg = String(ins.error.message || "");
      if (
        !msg.includes("Could not find the table 'public.user_notifications'")
      ) {
        console.error(
          "Error inserting user_notifications (package_created):",
          ins.error
        );
      }
    }
  }
};

export const notifyStatusUpdated = async (
  clientId: string,
  packageId: string,
  trackingNumber: string,
  newStatus: Package["status"],
  location?: string
) => {
  const content = formatStatusNotification(trackingNumber, newStatus, {
    location,
    updatedAt: new Date(),
  });
  await createNotification(
    clientId,
    packageId,
    "status_updated",
    "Suivi colis",
    content
  );
};

export const notifyNewMessage = async (
  recipientId: string,
  packageId: string,
  senderName: string,
  trackingNumber?: string,
  senderRole?: "admin" | "client"
) => {
  const content =
    trackingNumber && senderRole
      ? formatMessageNotification(trackingNumber, senderRole)
      : `${senderName} vous a envoyé un message`;
  const created = await createNotification(
    recipientId,
    packageId,
    "new_message",
    "Message colis",
    content
  );
  if (created && created.id) {
    const ins = await supabase.from("user_notifications").insert([
      {
        notification_id: created.id,
        user_id: recipientId,
        status: "unread",
      },
    ]);
    if (ins.error) {
      const msg = String(ins.error.message || "");
      if (
        !msg.includes("Could not find the table 'public.user_notifications'")
      ) {
        console.error("Error inserting user_notifications:", ins.error);
      }
    }
  }
};
