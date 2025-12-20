function normalizePhone(input: string): string {
  const digits = (input || "").replace(/[^0-9+]/g, "");
  const noPlus = digits.replace(/^\+/, "");
  return noPlus;
}

export function buildWhatsappUrl(phone: string, message: string): string {
  const num = normalizePhone(phone);
  const text = encodeURIComponent(message || "");
  return `https://wa.me/${num}?text=${text}`;
}
