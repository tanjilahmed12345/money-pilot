import Papa from "papaparse";
import { Transaction, TransactionType, Category } from "@/types";
import { v4 as uuidv4 } from "uuid";

export interface CsvRow {
  id: string;
  date: string;
  description: string;
  amount: number;
  type: TransactionType;
  categoryId: string;
  isDuplicate: boolean;
  selected: boolean;
}

// Keyword → category ID mapping for auto-categorization
const KEYWORD_MAP: Record<string, string> = {
  // Food
  grocery: "cat-food", restaurant: "cat-food", food: "cat-food", cafe: "cat-food",
  coffee: "cat-food", pizza: "cat-food", burger: "cat-food", lunch: "cat-food",
  dinner: "cat-food", breakfast: "cat-food", bakery: "cat-food", snack: "cat-food",
  // Transport
  uber: "cat-transport", lyft: "cat-transport", taxi: "cat-transport", gas: "cat-transport",
  fuel: "cat-transport", parking: "cat-transport", bus: "cat-transport", metro: "cat-transport",
  train: "cat-transport", flight: "cat-transport", airline: "cat-transport", toll: "cat-transport",
  pathao: "cat-transport", ride: "cat-transport",
  // Shopping
  amazon: "cat-shopping", shop: "cat-shopping", store: "cat-shopping", mall: "cat-shopping",
  market: "cat-shopping", clothing: "cat-shopping", fashion: "cat-shopping", purchase: "cat-shopping",
  daraz: "cat-shopping",
  // Salary
  salary: "cat-salary", payroll: "cat-salary", wages: "cat-salary", deposit: "cat-salary",
  freelance: "cat-salary", payment: "cat-salary",
  // Entertainment
  netflix: "cat-entertainment", spotify: "cat-entertainment", youtube: "cat-entertainment",
  movie: "cat-entertainment", cinema: "cat-entertainment", game: "cat-entertainment",
  music: "cat-entertainment", subscription: "cat-entertainment", hulu: "cat-entertainment",
  disney: "cat-entertainment", steam: "cat-entertainment",
  // Bills
  electric: "cat-bills", water: "cat-bills", internet: "cat-bills", phone: "cat-bills",
  utility: "cat-bills", bill: "cat-bills", rent: "cat-bills", insurance: "cat-bills",
  mortgage: "cat-bills", wifi: "cat-bills", mobile: "cat-bills",
  // Health
  pharmacy: "cat-health", hospital: "cat-health", doctor: "cat-health", medical: "cat-health",
  health: "cat-health", clinic: "cat-health", dentist: "cat-health", medicine: "cat-health",
  gym: "cat-health", fitness: "cat-health",
  // Education
  school: "cat-education", university: "cat-education", course: "cat-education",
  tuition: "cat-education", book: "cat-education", udemy: "cat-education",
  education: "cat-education", college: "cat-education", tutorial: "cat-education",
};

function autoCategorize(description: string, categories: Category[]): string {
  const lower = description.toLowerCase();
  const catIds = new Set(categories.map((c) => c.id));

  for (const [keyword, catId] of Object.entries(KEYWORD_MAP)) {
    if (lower.includes(keyword) && catIds.has(catId)) {
      return catId;
    }
  }
  return "cat-others";
}

function parseDate(raw: string): string {
  // Try common date formats and return YYYY-MM-DD
  const cleaned = raw.trim();

  // Already ISO format
  if (/^\d{4}-\d{2}-\d{2}/.test(cleaned)) {
    return cleaned.substring(0, 10);
  }

  // MM/DD/YYYY or M/D/YYYY
  const slashUS = cleaned.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (slashUS) {
    return `${slashUS[3]}-${slashUS[1].padStart(2, "0")}-${slashUS[2].padStart(2, "0")}`;
  }

  // DD/MM/YYYY or D/M/YYYY (common outside US)
  const slashEU = cleaned.match(/^(\d{1,2})-(\d{1,2})-(\d{4})$/);
  if (slashEU) {
    return `${slashEU[3]}-${slashEU[2].padStart(2, "0")}-${slashEU[1].padStart(2, "0")}`;
  }

  // Fallback: try native Date parser
  const d = new Date(cleaned);
  if (!isNaN(d.getTime())) {
    return d.toISOString().split("T")[0];
  }

  return new Date().toISOString().split("T")[0];
}

function inferType(amount: number, description: string): TransactionType {
  if (amount > 0) {
    const lower = description.toLowerCase();
    if (lower.includes("salary") || lower.includes("deposit") || lower.includes("payment received") || lower.includes("freelance")) {
      return "income";
    }
    // Positive amounts could be income or expense depending on bank format
    return "expense";
  }
  return "expense";
}

export function parseCsv(
  file: File,
  categories: Category[],
  existingTransactions: Transaction[]
): Promise<CsvRow[]> {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete(results) {
        if (!results.data || results.data.length === 0) {
          reject(new Error("No data found in CSV"));
          return;
        }

        const headers = results.meta.fields || [];
        const headerLower = headers.map((h) => h.toLowerCase());

        // Auto-detect column mapping
        const dateCol = headers[headerLower.findIndex((h) => h.includes("date"))] || headers[0];
        const descCol = headers[headerLower.findIndex((h) =>
          h.includes("description") || h.includes("merchant") || h.includes("name") || h.includes("memo") || h.includes("narration") || h.includes("particular")
        )] || headers[1];
        const amountCol = headers[headerLower.findIndex((h) =>
          h.includes("amount") || h.includes("debit") || h.includes("credit") || h.includes("value")
        )] || headers[2];

        // Build duplicate key set from existing transactions
        const existingKeys = new Set(
          existingTransactions.map((t) => `${t.date}|${t.amount}|${t.title.toLowerCase()}`)
        );

        const rows: CsvRow[] = [];
        for (const raw of results.data as Record<string, string>[]) {
          const dateRaw = raw[dateCol];
          const descRaw = raw[descCol];
          const amountRaw = raw[amountCol];

          if (!dateRaw && !descRaw && !amountRaw) continue;

          const description = (descRaw || "").trim();
          const amountNum = Math.abs(parseFloat((amountRaw || "0").replace(/[^0-9.\-]/g, "")));

          if (!description || amountNum === 0) continue;

          const date = parseDate(dateRaw || "");
          const type = inferType(parseFloat((amountRaw || "0").replace(/[^0-9.\-]/g, "")), description);
          const categoryId = autoCategorize(description, categories);
          const key = `${date}|${amountNum}|${description.toLowerCase()}`;

          rows.push({
            id: uuidv4(),
            date,
            description,
            amount: amountNum,
            type,
            categoryId,
            isDuplicate: existingKeys.has(key),
            selected: !existingKeys.has(key),
          });
        }

        resolve(rows);
      },
      error(err) {
        reject(err);
      },
    });
  });
}

export function csvRowsToTransactions(rows: CsvRow[]): Omit<Transaction, "id">[] {
  return rows
    .filter((r) => r.selected)
    .map((r) => ({
      title: r.description,
      amount: r.amount,
      type: r.type,
      category: r.categoryId,
      date: r.date,
      notes: "Imported from CSV",
    }));
}
