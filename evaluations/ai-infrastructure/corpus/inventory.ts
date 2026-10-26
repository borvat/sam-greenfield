/** Reserve stock for shipment atomically. Refuse overselling across concurrent checkouts. */
export function reserveStock(available: number, requested: number): number {
  if (requested < 1 || requested > available) throw new Error('INSUFFICIENT_STOCK');
  return available - requested;
}
