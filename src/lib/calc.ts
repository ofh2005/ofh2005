import type { Client, ClientCalc, Machine, Oil, Settings } from "./types";

export const uid = () => Math.random().toString(36).slice(2, 10);

export const fmt = (n: number) =>
  Math.round(n || 0)
    .toLocaleString("fr-FR")
    .replace(/ /g, " ") + " XAF";

export const pct = (n: number) => `${(n || 0).toFixed(1)}%`;

export const num = (v: unknown, fallback = 0): number => {
  const n = parseFloat(String(v));
  return isNaN(n) ? fallback : n;
};

export const machineCost = (m: Machine, exchangeRate: number) => ({
  retail: m.aedRetail * exchangeRate,
  franchise: m.aedFranchise * exchangeRate,
});

export const oilCost = (o: Oil, exchangeRate: number) => ({
  retail: o.aedRetail * exchangeRate,
  franchise: o.aedFranchise * exchangeRate,
});

/**
 * Exact port of computeClient() from the original index.html tracker, plus a
 * commercial discount applied to the product revenue.
 * Transport is a pass-through billed to the client — never deducted from margin.
 * The discount, unlike transport, comes straight out of Nia Al Oud's margin —
 * it reduces what the client pays for the products themselves.
 */
export function computeClient(
  client: Client,
  machines: Machine[],
  oils: Oil[],
  settings: Settings
): ClientCalc {
  let grossRevenue = 0,
    costRetail = 0,
    costFranchise = 0,
    weightCatalog = 0;

  client.items.forEach((it) => {
    const m = machines.find((x) => x.id === it.machineId);
    if (!m) return;
    const catalogUnit = client.tariff === "B2C" ? m.b2c : m.b2b;
    const unit =
      it.priceOverride != null && (it.priceOverride as unknown) !== ""
        ? num(it.priceOverride)
        : catalogUnit;
    const costs = machineCost(m, settings.exchangeRate);
    grossRevenue += unit * it.qty;
    costRetail += costs.retail * it.qty;
    costFranchise += costs.franchise * it.qty;
    weightCatalog += m.weightKg * it.qty;
  });

  client.oilItems.forEach((it) => {
    const o = oils.find((x) => x.id === it.oilId);
    if (!o) return;
    const unit =
      it.priceOverride != null && (it.priceOverride as unknown) !== ""
        ? num(it.priceOverride)
        : o.catalogPrice;
    const costs = oilCost(o, settings.exchangeRate);
    grossRevenue += unit * it.qty;
    costRetail += costs.retail * it.qty;
    costFranchise += costs.franchise * it.qty;
    weightCatalog += o.weightKg * it.qty;
  });

  const rawDiscount =
    client.discountType === "amount"
      ? num(client.discountValue)
      : grossRevenue * (num(client.discountValue) / 100);
  const discountAmount = Math.min(Math.max(rawDiscount, 0), grossRevenue);
  const revenue = grossRevenue - discountAmount;

  const weightAuto = weightCatalog * settings.packagingFactor;
  const weight =
    client.manualWeight !== "" && client.manualWeight != null
      ? num(client.manualWeight)
      : weightAuto;
  const transportIntl = weight * num(client.transportRate);
  const transportDomestic = num(client.domesticTransportFee);
  const transport = transportIntl + transportDomestic;

  const marginRetail = revenue - costRetail;
  const marginFranchise = revenue - costFranchise;

  return {
    grossRevenue,
    discountAmount,
    revenue,
    costRetail,
    costFranchise,
    weightCatalog,
    weightAuto,
    weight,
    transport,
    transportIntl,
    transportDomestic,
    marginRetail,
    marginFranchise,
    marginRetailPct: revenue > 0 ? (marginRetail / revenue) * 100 : 0,
    marginFranchisePct: revenue > 0 ? (marginFranchise / revenue) * 100 : 0,
  };
}

export function mkClient(over: Partial<Client> = {}): Client {
  return {
    id: uid(),
    name: "",
    ville: "Douala",
    segment: "Hôtel",
    phone: "",
    email: "",
    status: "prospect",
    tariff: "B2B",
    transportRate: 7500,
    domesticTransportFee: 10000,
    manualWeight: "",
    margeReelle: "",
    notes: "",
    discountType: "percent",
    discountValue: 0,
    items: [],
    oilItems: [],
    ...over,
  };
}
