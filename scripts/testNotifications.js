function formatDateFR(d) {
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();
  const hh = String(d.getHours()).padStart(2, "0");
  const min = String(d.getMinutes()).padStart(2, "0");
  return `${dd}/${mm}/${yyyy} ${hh}:${min}`;
}

const STATUS_LABELS = {
  received_china: "Reçu en Chine",
  in_transit: "En transit",
  arrived_africa: "Arrivé en Afrique",
  available_warehouse: "Disponible à l'entrepôt",
  picked_up: "Récupéré",
};

const NEXT_STEPS = {
  received_china: "Préparation en cours",
  in_transit: "Prochaine: arrivée en Afrique",
  arrived_africa: "Prochaine: disponible à l'entrepôt",
  available_warehouse: "Prochaine: retrait",
  picked_up: "Fin: colis récupéré",
};

function formatStatusNotification(trackingNumber, status, { location } = {}) {
  const label = STATUS_LABELS[status];
  const next = NEXT_STEPS[status];
  const when = formatDateFR(new Date());
  const parts = [
    `Statut de votre colis (numéro de suivi: ${trackingNumber}): ${label}`,
    when,
  ];
  if (location && location.trim()) parts.push(`Lieu: ${location.trim()}`);
  if (next) parts.push(next);
  let msg = parts.join(" • ");
  if (msg.length > 160) msg = msg.slice(0, 157) + "...";
  return msg;
}

function formatMessageNotification(trackingNumber, senderRole) {
  const when = formatDateFR(new Date());
  const from = senderRole === "admin" ? "de l'administration" : "du client";
  let msg = `Nouveau message ${from} concernant le colis (numéro de suivi: ${trackingNumber}) • ${when}`;
  if (msg.length > 160) msg = msg.slice(0, 157) + "...";
  return msg;
}

function run() {
  const tracking = "ABC123456789";
  const statuses = [
    "received_china",
    "in_transit",
    "arrived_africa",
    "available_warehouse",
    "picked_up",
  ];
  for (const s of statuses) {
    const msg = formatStatusNotification(tracking, s, {
      location: s === "arrived_africa" ? "Kinshasa, RDC" : undefined,
    });
    console.log(`[${s}] len=${msg.length} -> ${msg}`);
    if (!msg.includes(tracking)) console.error("ERROR: tracking missing");
    if (!msg.includes(STATUS_LABELS[s]))
      console.error("ERROR: status label missing");
    if (msg.length > 160) console.error("ERROR: length > 160");
  }

  const msgClient = formatMessageNotification(tracking, "client");
  console.log(`[new_message client] len=${msgClient.length} -> ${msgClient}`);
  if (!msgClient.includes(tracking))
    console.error("ERROR: tracking missing (client)");
  if (msgClient.length > 160) console.error("ERROR: length > 160 (client)");

  const msgAdmin = formatMessageNotification(tracking, "admin");
  console.log(`[new_message admin] len=${msgAdmin.length} -> ${msgAdmin}`);
  if (!msgAdmin.includes(tracking))
    console.error("ERROR: tracking missing (admin)");
  if (msgAdmin.length > 160) console.error("ERROR: length > 160 (admin)");
}

run();
