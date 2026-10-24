import { Brief, Creator, PortfolioItem, ToolLicense } from "../types";
import { computeMatchScore } from "../scoring";
import { evaluateCreatorSafety } from "../safety";

export interface ShortlistCandidate {
  creator: Creator;
  matchScore: number;
  safetyStatus: "green" | "amber" | "red";
  safetyCause: string;
  rationale: string;
  strengths: string[];
  tradeoffs: string[];
  evidenceItems: {
    title: string;
    mediaUrl: string;
    aspectRatio: string;
    hasProof: boolean;
  }[];
  suitability: "strongly_recommended" | "viable_alternative";
}

export interface UnsuitableCandidate {
  creator: Creator;
  disqualificationReasons: string[];
}

export interface AutoShortlistProposal {
  briefId: string;
  briefTitle: string;
  generatedAt: string;
  selectionCriteria: {
    dimension: string;
    briefRequirement: string;
    evaluationMethod: string;
  }[];
  candidates: ShortlistCandidate[];
  unsuitable: UnsuitableCandidate[];
  nextSteps: string[];
}

/**
 * Autonomous Agent logic that analyzes platform creator records and brief specifications
 * to generate a rigorous, evidence-backed candidate shortlist proposal.
 */
export function generateAutoShortlist(
  brief: Brief,
  creators: Creator[],
  portfolio: PortfolioItem[],
  licenses: ToolLicense[]
): AutoShortlistProposal {
  const evaluated = creators.map((creator) => {
    const creatorItems = portfolio.filter((p) => p.creator_id === creator.id);
    const match = computeMatchScore(creator, brief, creatorItems);
    const safety = evaluateCreatorSafety(creatorItems, licenses);

    return {
      creator,
      portfolio: creatorItems,
      match,
      safety,
    };
  });

  const candidates: ShortlistCandidate[] = [];
  const unsuitable: UnsuitableCandidate[] = [];

  for (const item of evaluated) {
    const { creator, portfolio: cPortfolio, match, safety } = item;

    // Hard disqualification: content type mismatch or critical safety failure
    if (!match.matched || safety.status === "red") {
      const disqualificationReasons: string[] = [];
      if (!match.matched) {
        disqualificationReasons.push(`Content type "${brief.content_type}" not supported`);
      }
      if (safety.status === "red") {
        disqualificationReasons.push(`Licensing barrier: ${safety.cause}`);
      }
      if (match.missing.length > 0) {
        disqualificationReasons.push(...match.missing);
      }

      unsuitable.push({
        creator,
        disqualificationReasons,
      });
      continue;
    }

    // Strengths analysis
    const strengths: string[] = [...match.reasons];
    if (creator.reviewed) {
      strengths.push("Platform vetted with verified client deliveries");
    }
    const hasProof = cPortfolio.some((p) => !!p.proof_url);
    if (hasProof) {
      strengths.push("Workflow replay provenance verifiable via generation audit links");
    }

    // Trade-offs analysis
    const tradeoffs: string[] = [...match.missing];
    if (safety.status === "amber") {
      tradeoffs.push(`Licensing note: ${safety.cause}`);
    }
    if (creator.availability === "busy") {
      tradeoffs.push("Current availability listed as busy — confirm sprint timelines");
    }

    // Evidence items
    const evidenceItems = cPortfolio.slice(0, 3).map((p) => ({
      title: p.title,
      mediaUrl: p.thumbnail_url || p.media_url,
      aspectRatio: p.aspect_ratio,
      hasProof: !!p.proof_url,
    }));

    candidates.push({
      creator,
      matchScore: match.score,
      safetyStatus: safety.status,
      safetyCause: safety.cause,
      rationale: `${creator.name} demonstrates ${match.score}% brief alignment across ${brief.required_tools.join(", ") || "core tools"} and ${brief.format} frame requirements.`,
      strengths,
      tradeoffs,
      evidenceItems,
      suitability: match.score >= 80 ? "strongly_recommended" : "viable_alternative",
    });
  }

  // Rank by match score descending
  candidates.sort((a, b) => b.matchScore - a.matchScore);

  return {
    briefId: brief.id,
    briefTitle: brief.title,
    generatedAt: new Date().toISOString(),
    selectionCriteria: [
      {
        dimension: "Content Specialization",
        briefRequirement: brief.content_type,
        evaluationMethod: "Exact match filter against creator roster capabilities",
      },
      {
        dimension: "Frame Format",
        briefRequirement: brief.format,
        evaluationMethod: "Validated historical portfolio deliveries in specified aspect ratio",
      },
      {
        dimension: "Tool Stack & Workflow",
        briefRequirement: brief.required_tools.join(", ") || "Generative pipeline",
        evaluationMethod: "Creator tool list overlap and verified generation logs",
      },
      {
        dimension: "Commercial Clearance",
        briefRequirement: brief.usage_rights.join(", "),
        evaluationMethod: "Deterministic audit of tool subscription tiers vs advertising usage",
      },
      {
        dimension: "Trust Multiplier",
        briefRequirement: "Workflow provenance",
        evaluationMethod: "Platform-reviewed status and public seed generation audit links",
      },
    ],
    candidates: candidates.slice(0, 4), // Top 4 viable recommendations
    unsuitable,
    nextSteps: [
      "Review creator portfolio workflow replays to inspect node graphs and prompt style.",
      "Add preferred candidates to your campaign shortlist or send a direct engagement invite.",
      "Review the confirmed licensing terms during the agreement phase before production begins.",
    ],
  };
}
