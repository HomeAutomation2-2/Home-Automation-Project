/** Traduce mesajele brute din backend pentru ultimul acces */
export function formatLastAccessEvent(raw: string): string {
  if (raw === "No access history") {
    return "Fără istoric acces";
  }
  return raw
    .replace(/^Entered at /, "Intrare la ")
    .replace(/^Left at /, "Ieșire la ");
}
