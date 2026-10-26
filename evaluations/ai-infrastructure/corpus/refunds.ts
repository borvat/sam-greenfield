/** Reverse earned loyalty points when a customer returns part of an invoice. */
export function reverseLoyaltyPoints(earned: number, returnedValue: number, invoiceValue: number) {
  return Math.floor(earned * returnedValue / invoiceValue);
}
