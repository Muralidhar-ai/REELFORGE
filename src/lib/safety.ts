import { ToolLicense, PortfolioItem, ToolUsed } from "./types";
import { LicenseStatus } from "./vocab";

export type SafetyStatus = "green" | "amber" | "red";

export interface ItemSafetyResult {
  status: SafetyStatus;
  causes: string[];
}

export interface CreatorSafetyResult {
  status: SafetyStatus;
  cause: string;
  causes: string[];
}

export function evaluateItemSafety(
  item: PortfolioItem,
  licenses: ToolLicense[]
): ItemSafetyResult {
  let hasNotAllowed = false;
  let hasRestrictedOrUnknown = false;
  const causes: string[] = [];

  for (const entry of item.tools_used) {
    const lic = licenses.find(
      (l) => l.tool.toLowerCase() === entry.tool.toLowerCase() && l.plan.toLowerCase() === entry.plan.toLowerCase()
    );

    const status: LicenseStatus = lic ? lic.commercial_use : "unknown";

    if (status === "not_allowed") {
      hasNotAllowed = true;
      causes.push(`${entry.tool} (${entry.plan}) is not allowed for commercial use`);
    } else if (status === "restricted") {
      hasRestrictedOrUnknown = true;
      causes.push(`Check: ${entry.tool} (${entry.plan}) is restricted`);
    } else if (status === "unknown") {
      hasRestrictedOrUnknown = true;
      causes.push(`Check: ${entry.tool} (${entry.plan}) licence status unknown`);
    }
  }

  if (hasNotAllowed) {
    return { status: "red", causes };
  }
  if (hasRestrictedOrUnknown) {
    return { status: "amber", causes };
  }
  return { status: "green", causes: ["Safe for paid ads"] };
}

export function evaluateCreatorSafety(
  portfolioItems: PortfolioItem[],
  licenses: ToolLicense[]
): CreatorSafetyResult {
  if (!portfolioItems || portfolioItems.length === 0) {
    return {
      status: "amber",
      cause: "No portfolio items to verify",
      causes: ["No portfolio items"],
    };
  }

  const itemResults = portfolioItems.map((item) => evaluateItemSafety(item, licenses));
  const allGreen = itemResults.every((r) => r.status === "green");
  const noneGreen = itemResults.every((r) => r.status === "red");

  const allCauses = Array.from(new Set(itemResults.flatMap((r) => r.causes)));

  if (allGreen) {
    return {
      status: "green",
      cause: "Safe for paid ads",
      causes: ["Safe for paid ads"],
    };
  }
  if (noneGreen) {
    return {
      status: "red",
      cause: allCauses[0] || "Not cleared for commercial ads",
      causes: allCauses,
    };
  }
  const amberOrRedCause = allCauses.find((c) => c.startsWith("Check:") || c.includes("not allowed")) || allCauses[0];
  return {
    status: "amber",
    cause: amberOrRedCause || "Check tool licence terms",
    causes: allCauses,
  };
}
