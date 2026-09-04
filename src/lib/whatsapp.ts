/** Build a wa.me deep link with a prefilled message. */
export function whatsappLink(number: string, message?: string): string {
  const clean = (number || "").replace(/[^\d]/g, "");
  const base = `https://wa.me/${clean}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}

export function productInquiryMessage(businessName: string, productName: string, url?: string): string {
  return `Hello ${businessName}, I'm interested in "${productName}".${url ? `\n${url}` : ""}`;
}

export function generalInquiryMessage(businessName: string): string {
  return `Hello ${businessName}, I'd like to know more about your products.`;
}
