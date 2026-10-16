interface LineCandidate {
  id: number;
  supplementIds?: number[];
  preparation?: { destination: string; note: string; modifiers: string[] };
}
/** Catalog additions reuse an ordinary consumption, without inheriting customer-specific modifiers. */
export function catalogLine<T extends LineCandidate>(
  lines: T[],
  productId: number,
): T | undefined {
  const ordinary = lines.filter(
    (line) =>
      line.id === productId &&
      !line.supplementIds?.length &&
      !line.preparation?.note?.trim() &&
      !line.preparation?.modifiers?.length,
  );
  const unrouted = ordinary.find(
    (line) => !line.preparation || line.preparation.destination === "NONE",
  );
  if (unrouted) return unrouted;
  const destinations = new Set(
    ordinary.map((line) => line.preparation!.destination),
  );
  return destinations.size === 1 ? ordinary[0] : undefined;
}
