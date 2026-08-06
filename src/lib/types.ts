export type Tariff = "B2B" | "B2C";

export type DiscountType = "percent" | "amount";

export type StatusId =
  | "prospect"
  | "prospect_contacte"
  | "demo_en_cours"
  | "demo"
  | "loi"
  | "acompte"
  | "livre"
  | "signe_paye"
  | "non_conclu";

export interface Settings {
  exchangeRate: number;
  packagingFactor: number;
  netTreasury: number;
  netTreasuryAfterOrder: number;
  margeReelleGlobale: number;
  treasuryNote: string;
}

export interface Machine {
  id: string;
  name: string;
  coverage: string;
  capacity: string;
  weightKg: number;
  aedRetail: number;
  aedFranchise: number;
  b2b: number;
  b2c: number;
  location: number;
  isEstimateFranchise: boolean;
  sortOrder: number;
}

export interface Oil {
  id: string;
  name: string;
  catalogPrice: number;
  weightKg: number;
  aedRetail: number;
  aedFranchise: number;
  isEstimateFranchise: boolean;
  sortOrder: number;
}

export interface ClientMachineItem {
  lineId: string;
  machineId: string;
  qty: number;
  priceOverride: number | null;
}

export interface ClientOilItem {
  lineId: string;
  oilId: string;
  qty: number;
  priceOverride: number | null;
  label: string;
}

export interface Client {
  id: string;
  name: string;
  ville: string;
  segment: string;
  phone: string;
  email: string;
  status: StatusId;
  tariff: Tariff;
  transportRate: number;
  domesticTransportFee: number;
  manualWeight: number | "";
  margeReelle: number | "";
  notes: string;
  discountType: DiscountType;
  discountValue: number;
  items: ClientMachineItem[];
  oilItems: ClientOilItem[];
}

export type TaskCategory = "pipeline" | "administratif";
export type TaskStatus = "a_faire" | "en_cours" | "fait";

export interface Task {
  id: string;
  title: string;
  notes: string;
  category: TaskCategory;
  dossier: string;
  status: TaskStatus;
  clientId: string | null;
  dueDate: string | null;
  createdAt: string;
}

export interface ClientCalc {
  grossRevenue: number;
  discountAmount: number;
  revenue: number;
  costRetail: number;
  costFranchise: number;
  weightCatalog: number;
  weightAuto: number;
  weight: number;
  transport: number;
  transportIntl: number;
  transportDomestic: number;
  marginRetail: number;
  marginFranchise: number;
  marginRetailPct: number;
  marginFranchisePct: number;
}
