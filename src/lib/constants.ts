import type { StatusId, TaskCategory, TaskStatus } from "./types";

export const NAVY = "#1B2A4A";
export const NAVY_LIGHT = "#2A3F66";
export const GOLD = "#B8892B";
export const GOLD_LIGHT = "#D9B563";
export const CREAM = "#FAF8F4";
export const RED = "#DC2626";
export const GREEN = "#16A34A";

export const BABA_GOAL = 4_000_000;

export const BANK_DETAILS = {
  accountName: "HASSAN OUAMROU FADIL",
  swift: "CCEICMCX",
  bankCode: "10005",
  branchCode: "00061",
  accountNumber: "09575401051",
  key: "45",
  iban: "CM21 10005 00061 09575401051 - 45",
};

export const TASK_STATUSES: { id: TaskStatus; label: string; color: string }[] = [
  { id: "a_faire", label: "À faire", color: "#9CA3AF" },
  { id: "en_cours", label: "En cours / En attente", color: "#38BDF8" },
  { id: "fait", label: "Fait", color: GREEN },
];

export const TASK_CATEGORIES: { id: TaskCategory; label: string; color: string }[] = [
  { id: "pipeline", label: "Pipeline", color: GOLD },
  { id: "administratif", label: "Administratif", color: NAVY_LIGHT },
];

export const DOSSIER_SUGGESTIONS = ["RCCM", "Banque", "Crédit", "Franchise"];

export const VILLES = ["Douala", "Yaoundé", "Garoua", "Ebolowa", "—"];

export const SEGMENTS = [
  "Hôtel",
  "Restaurant",
  "Salle de conférence",
  "Salle de fêtes",
  "Spa",
  "B2C",
  "Institutionnel",
];

export const STATUSES: { id: StatusId; label: string; color: string }[] = [
  { id: "prospect", label: "Prospect", color: "#9CA3AF" },
  { id: "prospect_contacte", label: "Prospect contacté", color: "#818CF8" },
  { id: "demo_en_cours", label: "Démo en cours", color: "#38BDF8" },
  { id: "demo", label: "Démo faite", color: "#60A5FA" },
  { id: "loi", label: "LOI signée", color: "#FBBF24" },
  { id: "acompte", label: "Acompte reçu", color: "#34D399" },
  { id: "livre", label: "Livré", color: GOLD },
  { id: "signe_paye", label: "Signé & payé", color: GREEN },
  { id: "non_conclu", label: "Non conclu", color: "#EF4444" },
];

export const SCENTS_OIL = [
  "Je T'aime", "Brown Sugar", "Black Orchide", "Passion", "Oudy", "Harmony", "Turkish Coffee", "Moon",
  "Home", "Amazonia Wood", "Patchouli", "Tulip", "For You", "Enjoy", "Luxury", "Address", "Amber",
  "Sense", "DR.24", "Aqua Oud", "Royality", "Angels Interest", "Dr. Louis", "White Musk", "Citrus Oasis",
  "Crystal", "Sparkle", "Fabulous", "Pink Pepper", "Royal Palace", "Sosphera", "Red Tobacco", "Persian Oud",
  "Mountain Mist", "Gentle", "Green Tea", "Gold", "Lemongrass", "Ginger Blossom", "Lavender",
  "Vanilla Coconut", "Ginger Lemongrass", "Event", "Beauty", "Jasmine", "Flora",
];

export const SCENTS_AEROSOL = [
  "Lemon", "Gold", "Jasmine", "Moon", "For You", "Lavender", "Oudi", "Address", "Marshmallow",
  "Framboise", "Tulip", "Lily", "Flora", "Event", "Beauty", "Berry Breeze", "Sense", "Papaya",
  "Crystal", "Tropicana",
];

export const scentsForOil = (oilId: string) =>
  oilId === "aerosol300" ? SCENTS_AEROSOL : SCENTS_OIL;

export const DEFAULT_SETTINGS = {
  exchangeRate: 153.4,
  packagingFactor: 1.0,
  netTreasury: 0,
  netTreasuryAfterOrder: 0,
  margeReelleGlobale: 0,
  treasuryNote: "",
};

export const DEFAULT_MACHINES = [
  { id: "dr_small", name: "DR Small", coverage: "100 m² / 300 m³", capacity: "170 ml", weightKg: 4, b2b: 228500, b2c: 213000, location: 40000, aedRetail: 1050, aedFranchise: 400, isEstimateFranchise: true },
  { id: "dr_medium", name: "DR Medium", coverage: "400 m² / 1200 m³", capacity: "500 ml", weightKg: 4, b2b: 324000, b2c: 302000, location: 56500, aedRetail: 1890, aedFranchise: 500, isEstimateFranchise: true },
  { id: "sa_big", name: "Stand Alone Big", coverage: "900 m² / 2700 m³", capacity: "1000 ml", weightKg: 7, b2b: 419500, b2c: 390500, location: 73500, aedRetail: 2205, aedFranchise: 575, isEstimateFranchise: false },
  { id: "sa_mini", name: "Stand Alone Mini", coverage: "600 m² / 1800 m³", capacity: "500 ml", weightKg: 5, b2b: 324000, b2c: 302000, location: 56500, aedRetail: 1785, aedFranchise: 400, isEstimateFranchise: false },
  { id: "eco_tulip", name: "Eco Tulip", coverage: "80 m² / 300 m³", capacity: "170 ml", weightKg: 2, b2b: 162000, b2c: 151000, location: 28500, aedRetail: 630, aedFranchise: 200, isEstimateFranchise: false },
  { id: "zen", name: "Zen Diffuser", coverage: "60 m² / 300 m³", capacity: "200 ml", weightKg: 1, b2b: 95500, b2c: 88500, location: 16500, aedRetail: 420, aedFranchise: 110, isEstimateFranchise: false },
  { id: "home_scent", name: "Home Scent", coverage: "72 m² / 300 m³", capacity: "170 ml", weightKg: 1, b2b: 162000, b2c: 151000, location: 28500, aedRetail: 787.5, aedFranchise: 200, isEstimateFranchise: false },
  { id: "plugin", name: "Plug-in", coverage: "20 – 30 m²", capacity: "30 ml", weightKg: 1.5, b2b: 47500, b2c: 44500, location: 8500, aedRetail: 131.25, aedFranchise: 85, isEstimateFranchise: false },
  { id: "lcd", name: "LCD Volitalia", coverage: "Directionnelle", capacity: "300 ml aérosol", weightKg: 1.5, b2b: 28500, b2c: 26500, location: 5000, aedRetail: 78.75, aedFranchise: 35, isEstimateFranchise: false },
];

export const DEFAULT_OILS = [
  { id: "oil170", name: "Huile 170ml", catalogPrice: 30500, weightKg: 0.3, aedRetail: 157.5, aedFranchise: 25, isEstimateFranchise: false },
  { id: "oil500", name: "Huile 500ml", catalogPrice: 50500, weightKg: 0.5, aedRetail: 262.5, aedFranchise: 65, isEstimateFranchise: false },
  { id: "oil1000", name: "Huile 1000ml", catalogPrice: 101000, weightKg: 1, aedRetail: 525, aedFranchise: 135, isEstimateFranchise: false },
  { id: "aerosol300", name: "Aérosol 300ml", catalogPrice: 5500, weightKg: 0.3, aedRetail: 26.25, aedFranchise: 20, isEstimateFranchise: true },
];
