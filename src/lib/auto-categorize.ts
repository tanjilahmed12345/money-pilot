import { Category } from "@/types";

// Keyword → category ID mapping (shared with csv-import)
export const KEYWORD_MAP: Record<string, string> = {
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

/**
 * Try to match a merchant name to a category using:
 * 1. User's merchant map (custom rules from corrections)
 * 2. Built-in keyword rules
 * Returns category ID or null if no match.
 */
export function matchCategory(
  merchant: string,
  merchantMap: Record<string, string>,
  categories: Category[]
): string | null {
  const lower = merchant.toLowerCase().trim();
  if (!lower) return null;

  // 1. Check user's merchant map (exact match on normalized name)
  if (merchantMap[lower]) {
    return merchantMap[lower];
  }

  // 2. Check keyword rules
  const catIds = new Set(categories.map((c) => c.id));
  for (const [keyword, catId] of Object.entries(KEYWORD_MAP)) {
    if (lower.includes(keyword) && catIds.has(catId)) {
      return catId;
    }
  }

  return null;
}

/**
 * Call Claude API to categorize an unknown merchant.
 * Returns category ID or null on failure.
 */
export async function aiCategorize(
  merchant: string,
  categories: Category[]
): Promise<string | null> {
  try {
    const res = await fetch("/api/categorize-merchant", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        merchant,
        categories: categories.map((c) => ({ id: c.id, name: c.name })),
      }),
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.categoryId || null;
  } catch {
    return null;
  }
}
