export type PackageStatus =
  | "received_china"
  | "in_transit"
  | "arrived_africa"
  | "available_warehouse"
  | "picked_up";

const STATUS_LABELS: Record<PackageStatus, string> = {
  received_china: "Reçu en Chine",
  in_transit: "En transit",
  arrived_africa: "Arrivé en Afrique",
  available_warehouse: "Disponible à l'entrepôt",
  picked_up: "Récupéré",
};

const NEXT_STEPS: Record<PackageStatus, string> = {
  received_china: "Préparation en cours",
  in_transit: "Prochaine: arrivée en Afrique",
  arrived_africa: "Prochaine: disponible à l'entrepôt",
  available_warehouse: "Prochaine: retrait",
  picked_up: "Fin: colis récupéré",
};

function formatDateFR(d: Date): string {
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();
  const hh = String(d.getHours()).padStart(2, "0");
  const min = String(d.getMinutes()).padStart(2, "0");
  return `${dd}/${mm}/${yyyy} ${hh}:${min}`;
}

export function formatStatusNotification(
  trackingNumber: string,
  status: PackageStatus,
  opts?: { location?: string; updatedAt?: Date }
): string {
  const label = STATUS_LABELS[status];
  const next = NEXT_STEPS[status];
  const when = formatDateFR(opts?.updatedAt || new Date());
  const parts: string[] = [
    `Statut de votre colis (numéro de suivi: ${trackingNumber}): ${label}`,
    when,
  ];
  if (opts?.location && opts.location.trim().length > 0) {
    parts.push(`Lieu: ${opts.location.trim()}`);
  }
  if (next) parts.push(next);
  let msg = parts.join(" • ");
  if (msg.length > 160) {
    msg = msg.slice(0, 157) + "...";
  }
  return msg;
}

export function statusLabel(status: PackageStatus): string {
  return STATUS_LABELS[status];
}

export function nextStep(status: PackageStatus): string {
  return NEXT_STEPS[status];
}

export function formatCreatedNotification(trackingNumber: string): string {
  const when = formatDateFR(new Date());
  let msg = `Nouveau colis (numéro de suivi: ${trackingNumber}) • ${when} • Enregistré par le transitaire`;
  if (msg.length > 160) msg = msg.slice(0, 157) + "...";
  return msg;
}

export function formatMessageNotification(
  trackingNumber: string,
  senderRole: "admin" | "client"
): string {
  const when = formatDateFR(new Date());
  const from = senderRole === "admin" ? "de l'administration" : "du client";
  let msg = `Nouveau message ${from} concernant le colis (numéro de suivi: ${trackingNumber}) • ${when}`;
  if (msg.length > 160) msg = msg.slice(0, 157) + "...";
  return msg;
}
