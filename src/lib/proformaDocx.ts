import {
  AlignmentType,
  BorderStyle,
  Document,
  HeadingLevel,
  Packer,
  Paragraph,
  ShadingType,
  Table,
  TableCell,
  TableRow,
  TextRun,
  WidthType,
} from "docx";
import type { Client, ClientCalc, Machine, Oil } from "./types";
import { fmt } from "./calc";

const NAVY_HEX = "1B2A4A";
const GOLD_HEX = "B8892B";

const NO_BORDER = {
  top: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
  bottom: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
  left: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
  right: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
};

function headCell(text: string, width: number, align: (typeof AlignmentType)[keyof typeof AlignmentType] = AlignmentType.LEFT) {
  return new TableCell({
    width: { size: width, type: WidthType.PERCENTAGE },
    shading: { fill: NAVY_HEX, type: ShadingType.CLEAR, color: "auto" },
    children: [
      new Paragraph({
        alignment: align,
        children: [new TextRun({ text, bold: true, color: "FFFFFF", size: 18 })],
      }),
    ],
  });
}

function bodyCell(text: string, width: number, align: (typeof AlignmentType)[keyof typeof AlignmentType] = AlignmentType.LEFT) {
  return new TableCell({
    width: { size: width, type: WidthType.PERCENTAGE },
    children: [new Paragraph({ alignment: align, children: [new TextRun({ text, size: 20 })] })],
  });
}

function emptyRow(colSpan: number, text: string) {
  return new TableRow({
    children: [
      new TableCell({
        columnSpan: colSpan,
        children: [new Paragraph({ children: [new TextRun({ text, italics: true, size: 20, color: "666666" })] })],
      }),
    ],
  });
}

export async function generateProformaDocx(
  client: Client,
  calc: ClientCalc,
  machines: Machine[],
  oils: Oil[]
): Promise<Blob> {
  const today = new Date().toLocaleDateString("fr-FR");
  const ref = `NAO-PROF-${client.name.replace(/[^A-Za-z0-9]/g, "").slice(0, 8).toUpperCase()}-${new Date().getFullYear()}`;

  const machineRows = client.items
    .map((it) => {
      const m = machines.find((x) => x.id === it.machineId);
      if (!m) return null;
      const catalogUnit = client.tariff === "B2C" ? m.b2c : m.b2b;
      const unit = it.priceOverride != null ? it.priceOverride : catalogUnit;
      return new TableRow({
        children: [
          bodyCell(`${m.name} (${m.coverage})`, 46),
          bodyCell(String(it.qty), 14, AlignmentType.CENTER),
          bodyCell(fmt(unit), 20, AlignmentType.RIGHT),
          bodyCell(fmt(unit * it.qty), 20, AlignmentType.RIGHT),
        ],
      });
    })
    .filter((r): r is TableRow => r !== null);

  const oilRows = client.oilItems
    .map((it) => {
      const o = oils.find((x) => x.id === it.oilId);
      if (!o) return null;
      const unit = it.priceOverride != null ? it.priceOverride : o.catalogPrice;
      return new TableRow({
        children: [
          bodyCell(it.label || o.name, 34),
          bodyCell(o.name, 22),
          bodyCell(String(it.qty), 12, AlignmentType.CENTER),
          bodyCell(fmt(unit), 16, AlignmentType.RIGHT),
          bodyCell(fmt(unit * it.qty), 16, AlignmentType.RIGHT),
        ],
      });
    })
    .filter((r): r is TableRow => r !== null);

  const doc = new Document({
    sections: [
      {
        properties: { page: { margin: { top: 720, bottom: 720, left: 720, right: 720 } } },
        children: [
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [new TextRun({ text: "NIA AL OUD DISTRIBUTION", bold: true, size: 26, color: NAVY_HEX })],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 200 },
            children: [
              new TextRun({
                text: "Where Luxury Meets Fragrance · Distributeur Dr. Scent — Yaoundé · Douala · Garoua",
                italics: true,
                size: 18,
                color: GOLD_HEX,
              }),
            ],
          }),
          new Paragraph({
            heading: HeadingLevel.HEADING_1,
            alignment: AlignmentType.CENTER,
            children: [new TextRun({ text: "PROFORMA", bold: true, size: 36, color: NAVY_HEX })],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 300 },
            children: [new TextRun({ text: `Réf. ${ref} · ${today}`, size: 18, color: "666666" })],
          }),

          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({
                children: [
                  new TableCell({
                    width: { size: 50, type: WidthType.PERCENTAGE },
                    borders: NO_BORDER,
                    children: [
                      new Paragraph({ children: [new TextRun({ text: "DESTINATAIRE", bold: true, size: 18, color: NAVY_HEX })] }),
                      new Paragraph({ children: [new TextRun({ text: client.name, size: 20 })] }),
                      new Paragraph({ children: [new TextRun({ text: client.ville, size: 18, color: "666666" })] }),
                      ...(client.phone
                        ? [new Paragraph({ children: [new TextRun({ text: client.phone, size: 18, color: "666666" })] })]
                        : []),
                    ],
                  }),
                  new TableCell({
                    width: { size: 50, type: WidthType.PERCENTAGE },
                    borders: NO_BORDER,
                    children: [
                      new Paragraph({ children: [new TextRun({ text: "ÉMETTEUR", bold: true, size: 18, color: NAVY_HEX })] }),
                      new Paragraph({ children: [new TextRun({ text: "Nia Al Oud Distribution", size: 20 })] }),
                      new Paragraph({ children: [new TextRun({ text: "Hassan Oumarou Fadil", size: 18, color: "666666" })] }),
                      new Paragraph({ children: [new TextRun({ text: "+237 692 939 272", size: 18, color: "666666" })] }),
                    ],
                  }),
                ],
              }),
            ],
          }),

          new Paragraph({
            spacing: { before: 300, after: 100 },
            children: [new TextRun({ text: `DIFFUSEURS — MACHINES (${client.tariff})`, bold: true, size: 18, color: NAVY_HEX })],
          }),
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({
                children: [
                  headCell("Désignation", 46),
                  headCell("Qté", 14, AlignmentType.CENTER),
                  headCell("P.U. XAF", 20, AlignmentType.RIGHT),
                  headCell("Total XAF", 20, AlignmentType.RIGHT),
                ],
              }),
              ...(machineRows.length ? machineRows : [emptyRow(4, "Aucune machine dans cette commande.")]),
            ],
          }),

          new Paragraph({
            spacing: { before: 300, after: 100 },
            children: [new TextRun({ text: "CONSOMMABLES — HUILES & AÉROSOLS", bold: true, size: 18, color: NAVY_HEX })],
          }),
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({
                children: [
                  headCell("Désignation", 34),
                  headCell("Format", 22),
                  headCell("Qté", 12, AlignmentType.CENTER),
                  headCell("P.U. XAF", 16, AlignmentType.RIGHT),
                  headCell("Total XAF", 16, AlignmentType.RIGHT),
                ],
              }),
              ...(oilRows.length ? oilRows : [emptyRow(5, "Aucun consommable dans cette commande.")]),
            ],
          }),

          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              ...(calc.discountAmount > 0
                ? [
                    new TableRow({
                      children: [
                        bodyCell("Sous-total produits (brut)", 70),
                        bodyCell(fmt(calc.grossRevenue), 30, AlignmentType.RIGHT),
                      ],
                    }),
                    new TableRow({
                      children: [
                        bodyCell(
                          `Remise commerciale${client.discountType === "percent" ? ` (${client.discountValue}%)` : ""}`,
                          70
                        ),
                        bodyCell(`− ${fmt(calc.discountAmount)}`, 30, AlignmentType.RIGHT),
                      ],
                    }),
                  ]
                : [
                    new TableRow({
                      children: [bodyCell("Sous-total produits", 70), bodyCell(fmt(calc.grossRevenue), 30, AlignmentType.RIGHT)],
                    }),
                  ]),
              new TableRow({
                children: [
                  new TableCell({
                    width: { size: 70, type: WidthType.PERCENTAGE },
                    shading: { fill: NAVY_HEX, type: ShadingType.CLEAR, color: "auto" },
                    children: [
                      new Paragraph({
                        children: [new TextRun({ text: "TOTAL GÉNÉRAL (coût & fret inclus)", bold: true, size: 20, color: "FFFFFF" })],
                      }),
                    ],
                  }),
                  new TableCell({
                    width: { size: 30, type: WidthType.PERCENTAGE },
                    shading: { fill: NAVY_HEX, type: ShadingType.CLEAR, color: "auto" },
                    children: [
                      new Paragraph({
                        alignment: AlignmentType.RIGHT,
                        children: [new TextRun({ text: fmt(calc.revenue + calc.transport), bold: true, size: 24, color: "FFFFFF" })],
                      }),
                    ],
                  }),
                ],
              }),
            ],
          }),
          new Paragraph({
            spacing: { before: 100, after: 300 },
            children: [
              new TextRun({
                text: "Le transport international et le fret intérieur sont inclus dans le total ci-dessus.",
                size: 16,
                italics: true,
                color: "999999",
              }),
            ],
          }),

          new Paragraph({
            spacing: { before: 200, after: 100 },
            children: [new TextRun({ text: "CONDITIONS COMMERCIALES", bold: true, size: 18, color: NAVY_HEX })],
          }),
          ...[
            "Prix EX Works Dubaï, EAU — transport et livraison inclus dans le total ci-dessus.",
            "Paiement intégral (100%) exigé avant expédition — Orange Money / virement.",
            "Garantie fabricant 1 an — installation et maintenance incluses.",
            "Proforma valable 30 jours à compter de la date d'émission.",
          ].map(
            (t) =>
              new Paragraph({
                bullet: { level: 0 },
                children: [new TextRun({ text: t, size: 18, color: "444444" })],
              })
          ),

          new Paragraph({
            spacing: { before: 400 },
            children: [new TextRun({ text: "Hassan Oumarou Fadil", size: 20 })],
          }),
          new Paragraph({
            children: [new TextRun({ text: "Nia Al Oud Distribution · +237 692 939 272", size: 18, color: "999999" })],
          }),
        ],
      },
    ],
  });

  return Packer.toBlob(doc);
}
