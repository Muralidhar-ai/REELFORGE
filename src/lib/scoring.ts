import { Creator, Brief, VerificationLevel, PortfolioItem } from "./types";
import { computeVerificationLevel } from "./types";

export interface MatchScoreResult {
  score: number;
  matched: boolean;
  reasons: string[];
  missing: string[];
  breakdown: {
    skillsScore: number;
    toolsScore: number;
    contentTypeScore: number;
    formatScore: number;
    styleScore: number;
    verificationScore: number;
  };
}

export function computeMatchScore(
  creator: Creator,
  brief: Brief,
  portfolioItems: PortfolioItem[] = []
): MatchScoreResult {
  // Hard filter: creator.content_types must include brief.content_type
  if (!creator.content_types.includes(brief.content_type)) {
    return {
      score: 0,
      matched: false,
      reasons: [],
      missing: [`Content type "${brief.content_type}" not offered by creator`],
      breakdown: {
        skillsScore: 0,
        toolsScore: 0,
        contentTypeScore: 0,
        formatScore: 0,
        styleScore: 0,
        verificationScore: 0,
      },
    };
  }

  const reasons: string[] = [];
  const missing: string[] = [];

  reasons.push(`Content type matched (${brief.content_type})`);

  // Skills overlap
  let skillsOverlap = 1;
  if (brief.required_skills && brief.required_skills.length > 0) {
    const matchedSkills = brief.required_skills.filter((s) => creator.skills.includes(s));
    skillsOverlap = matchedSkills.length / brief.required_skills.length;
    if (matchedSkills.length > 0) {
      reasons.push(`Matched skills: ${matchedSkills.join(", ")}`);
    }
    const missingSkills = brief.required_skills.filter((s) => !creator.skills.includes(s));
    if (missingSkills.length > 0) {
      missing.push(`Missing skills: ${missingSkills.join(", ")}`);
    }
  }

  // Tools overlap
  let toolsOverlap = 1;
  if (brief.required_tools && brief.required_tools.length > 0) {
    const matchedTools = brief.required_tools.filter((t) => creator.tools.includes(t));
    toolsOverlap = matchedTools.length / brief.required_tools.length;
    if (matchedTools.length > 0) {
      reasons.push(`Matched tools: ${matchedTools.join(", ")}`);
    }
    const missingTools = brief.required_tools.filter((t) => !creator.tools.includes(t));
    if (missingTools.length > 0) {
      missing.push(`Missing tools: ${missingTools.join(", ")}`);
    }
  }

  // Format match
  const formatMatched = creator.formats.includes(brief.format);
  if (formatMatched) {
    reasons.push(`Format matched (${brief.format})`);
  } else {
    missing.push(`Does not list ${brief.format} aspect ratio`);
  }

  // Style tags overlap
  let styleOverlap = 1;
  if (brief.style_tags && brief.style_tags.length > 0) {
    const matchedStyles = brief.style_tags.filter((st) => creator.style_tags.includes(st));
    styleOverlap = matchedStyles.length / brief.style_tags.length;
    if (matchedStyles.length > 0) {
      reasons.push(`Matched style tags: ${matchedStyles.join(", ")}`);
    }
  }

  // Verification weight
  const level: VerificationLevel =
    creator.verification_level || computeVerificationLevel(creator, portfolioItems);
  let verificationWeight = 0.3;
  if (level === "platform_reviewed") {
    verificationWeight = 1.0;
    reasons.push("Platform reviewed creator");
  } else if (level === "proof_attached") {
    verificationWeight = 0.6;
    reasons.push("Attached workflow proof on portfolio items");
  }

  const skillsScore = 0.3 * skillsOverlap;
  const toolsScore = 0.25 * toolsOverlap;
  const contentTypeScore = 0.2;
  const formatScore = 0.1 * (formatMatched ? 1 : 0);
  const styleScore = 0.1 * styleOverlap;
  const verificationScore = 0.05 * verificationWeight;

  const totalRaw = skillsScore + toolsScore + contentTypeScore + formatScore + styleScore + verificationScore;
  const score = Math.round(100 * totalRaw);

  return {
    score,
    matched: true,
    reasons,
    missing,
    breakdown: {
      skillsScore,
      toolsScore,
      contentTypeScore,
      formatScore,
      styleScore,
      verificationScore,
    },
  };
}

export interface QualityScoreResult {
  score: number;
  hints: string[];
}

export function computeBriefQualityScore(brief: Record<string, any>): QualityScoreResult {
  let score = 0;
  const hints: string[] = [];

  // Content type 10
  if (brief.content_type) {
    score += 10;
  } else {
    hints.push("Select a content type (+10 points)");
  }

  // Objective >= 30 chars 10
  if (brief.objective && brief.objective.trim().length >= 30) {
    score += 10;
  } else {
    hints.push("Write an objective of at least 30 characters (+10 points)");
  }

  // Style tags 10
  if (brief.style_tags && brief.style_tags.length > 0) {
    score += 10;
  } else {
    hints.push("Add at least one style tag (+10 points)");
  }

  // Format 10
  if (brief.format) {
    score += 10;
  } else {
    hints.push("Select an aspect ratio format (+10 points)");
  }

  // Duration 5 (video/animation only, auto if image/3d/etc)
  if (brief.content_type === "video" || brief.content_type === "animation") {
    if (brief.duration_sec && brief.duration_sec > 0) {
      score += 5;
    } else {
      hints.push("Specify video duration in seconds (+5 points)");
    }
  } else {
    score += 5;
  }

  // Deliverables 10
  if (brief.deliverables && brief.deliverables.trim().length > 0) {
    score += 10;
  } else {
    hints.push("Specify expected campaign deliverables (+10 points)");
  }

  // Deadline 5
  if (brief.deadline && brief.deadline.trim().length > 0) {
    score += 5;
  } else {
    hints.push("Set a target project deadline (+5 points)");
  }

  // Usage rights 15
  if (brief.usage_rights && brief.usage_rights.length > 0) {
    score += 15;
  } else {
    hints.push("Select at least one commercial usage right (+15 points)");
  }

  // Territory 5
  if (brief.territory && brief.territory.trim().length > 0) {
    score += 5;
  } else {
    hints.push("Specify licensing territory (+5 points)");
  }

  // Usage duration 5
  if (brief.usage_duration_months && brief.usage_duration_months > 0) {
    score += 5;
  } else {
    hints.push("Specify license duration in months (+5 points)");
  }

  // Exclusivity answered 5
  if (typeof brief.exclusivity === "boolean") {
    score += 5;
  } else {
    hints.push("Specify if exclusive rights are required (+5 points)");
  }

  // AI disclosure answered 5
  if (typeof brief.ai_disclosure_required === "boolean") {
    score += 5;
  } else {
    hints.push("Specify if AI disclosure is required (+5 points)");
  }

  // Required tool or skill 5
  if (
    (brief.required_tools && brief.required_tools.length > 0) ||
    (brief.required_skills && brief.required_skills.length > 0)
  ) {
    score += 5;
  } else {
    hints.push("Add at least one required tool or skill (+5 points)");
  }

  return { score, hints };
}
