function localBuildWhatsappUrl(phone, message) {
  const digits = (phone || "").replace(/[^0-9+]/g, "");
  const noPlus = digits.replace(/^\+/, "");
  const text = encodeURIComponent(message || "");
  return `https://wa.me/${noPlus}?text=${text}`;
}

const samples = [
  "+243 812 345 678",
  "00243-812-345-678",
  "243812345678",
];
for (const s of samples) {
  const url = localBuildWhatsappUrl(s, "Bonjour, concernant le colis ABC123");
  console.log(`${s} -> ${url}`);
}
