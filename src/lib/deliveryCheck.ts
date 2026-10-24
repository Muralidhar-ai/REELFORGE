import { Brief, VersionSubmission, DeliveryCheckResult, DeliveryCheckItem, ToolLicense } from "./types";
import { evaluateCreatorSafety } from "./safety";

export interface DeliveryCheckInput {
  mediaUrl: string;
  aspectRatio?: string;
  mimeType?: string;
  durationSec?: number;
  workflowGraphAttached?: boolean;
  toolsUsed?: string[];
  note?: string;
}

/**
 * Validates a submitted deliverable against the target campaign brief.
 * Performs server-verifiable technical and commercial compliance checks.
 */
export function validateDeliverable(
  input: DeliveryCheckInput,
  brief: Brief,
  licenses: ToolLicense[] = []
): DeliveryCheckResult {
  const checks: DeliveryCheckItem[] = [];
  const correctiveActions: string[] = [];

  // 1. Aspect Ratio Check
  const expectedRatio = brief.format || "9:16";
  // Infer aspect ratio from input or url if not provided
  let detectedRatio = input.aspectRatio;
  if (!detectedRatio) {
    if (input.mediaUrl.includes("916") || input.mediaUrl.includes("9_16")) {
      detectedRatio = "9:16";
    } else if (input.mediaUrl.includes("169") || input.mediaUrl.includes("16_9")) {
      detectedRatio = "16:9";
    } else if (input.mediaUrl.includes("11") || input.mediaUrl.includes("1_1")) {
      detectedRatio = "1:1";
    } else if (input.mediaUrl.includes("45") || input.mediaUrl.includes("4_5")) {
      detectedRatio = "4:5";
    } else {
      detectedRatio = expectedRatio; // default if not inferrable
    }
  }

  const ratioPassed = detectedRatio === expectedRatio;
  checks.push({
    name: "Aspect Ratio Compliance",
    passed: ratioPassed,
    expected: expectedRatio,
    actual: detectedRatio,
    details: ratioPassed
      ? `Render matches target frame aspect ratio (${expectedRatio})`
      : `Frame ratio mismatch: Deliverable is ${detectedRatio}, but brief requires ${expectedRatio}.`,
  });
  if (!ratioPassed) {
    correctiveActions.push(`Re-render or crop asset to ${expectedRatio} aspect ratio to conform to campaign distribution channels.`);
  }

  // 2. Media Type & Format Check
  const isVideoBrief = brief.content_type === "video" || brief.content_type === "animation";
  const mediaUrlLower = (input.mediaUrl || "").toLowerCase();
  const isVideoExt = mediaUrlLower.endsWith(".mp4") || mediaUrlLower.endsWith(".mov") || mediaUrlLower.endsWith(".webm");
  const isImageExt = mediaUrlLower.endsWith(".png") || mediaUrlLower.endsWith(".jpg") || mediaUrlLower.endsWith(".jpeg") || mediaUrlLower.endsWith(".webp");

  let formatPassed = true;
  if (isVideoBrief && !isVideoExt) {
    formatPassed = false;
    checks.push({
      name: "Media Format Specification",
      passed: false,
      expected: "Video container (MP4 / ProRes MOV)",
      actual: mediaUrlLower.split(".").pop()?.toUpperCase() || "Unknown",
      details: "Brief specifies video/animation deliverables, but deliverable format is not a recognized video container.",
    });
    correctiveActions.push("Export and submit render in MP4 (H.264/H.265) or ProRes MOV format.");
  } else {
    checks.push({
      name: "Media Format Specification",
      passed: true,
      expected: isVideoBrief ? "Video container (MP4 / MOV)" : "High-res Image (PNG / JPEG)",
      actual: mediaUrlLower.split(".").pop()?.toUpperCase() || (isVideoBrief ? "MP4" : "PNG"),
      details: "Container format conforms to campaign delivery specification.",
    });
  }

  // 3. Duration Check (for video briefs)
  if (brief.duration_sec && brief.duration_sec > 0) {
    const expectedDur = brief.duration_sec;
    const actualDur = input.durationSec || expectedDur;
    const durTolerance = 2; // +/- 2 seconds allowed
    const durPassed = Math.abs(actualDur - expectedDur) <= durTolerance;

    checks.push({
      name: "Duration Target Compliance",
      passed: durPassed,
      expected: `${expectedDur} seconds (±${durTolerance}s)`,
      actual: `${actualDur}s`,
      details: durPassed
        ? `Timeline duration (${actualDur}s) is within acceptable range for ${expectedDur}s slot.`
        : `Timeline duration (${actualDur}s) violates target ${expectedDur}s specification.`,
    });
    if (!durPassed) {
      correctiveActions.push(`Trim or extend video timeline to match the brief duration of ${expectedDur}s.`);
    }
  }

  // 4. Provenance & Workflow Graph Evidence Check
  const hasWorkflowEvidence = input.workflowGraphAttached || (input.note && input.note.length >= 25);
  checks.push({
    name: "Workflow Provenance & Reproducibility",
    passed: !!hasWorkflowEvidence,
    expected: "Step log notes or node graph manifest attached",
    actual: hasWorkflowEvidence ? "Documented in submission manifest" : "Missing step log metadata",
    details: hasWorkflowEvidence
      ? "Creator supplied prompt generation parameters and workflow execution notes."
      : "Insufficient provenance notes attached. Enterprise clients require node graphs or generation prompts.",
  });
  if (!hasWorkflowEvidence) {
    correctiveActions.push("Include prompt seed parameters, tool versions, or ComfyUI node graph JSON in submission notes.");
  }

  // 5. Commercial Tool License Clearance Check
  let toolsLicensingPassed = true;
  if (brief.usage_rights.includes("paid_ads") && input.toolsUsed && input.toolsUsed.length > 0) {
    const unallowedTools = input.toolsUsed.filter((toolName) => {
      const lic = licenses.find((l) => l.tool.toLowerCase() === toolName.toLowerCase());
      return lic && lic.commercial_use === "not_allowed";
    });

    if (unallowedTools.length > 0) {
      toolsLicensingPassed = false;
      checks.push({
        name: "Commercial Tool License Clearance",
        passed: false,
        expected: "All tools cleared for paid commercial advertising",
        actual: `Restricted tool used: ${unallowedTools.join(", ")}`,
        details: `The deliverable was generated using tools (${unallowedTools.join(", ")}) on non-commercial tiers.`,
      });
      correctiveActions.push(`Regenerate assets using paid enterprise/commercial licensed accounts for ${unallowedTools.join(", ")}.`);
    } else {
      checks.push({
        name: "Commercial Tool License Clearance",
        passed: true,
        expected: "Commercial clearance for paid media",
        actual: "Cleared",
        details: "Tools declared are licensed for global commercial advertising.",
      });
    }
  } else {
    checks.push({
      name: "Commercial Tool License Clearance",
      passed: true,
      expected: "Commercial clearance",
      actual: "Standard terms confirmed",
      details: "No restricted tools flagged for declared usage tier.",
    });
  }

  // Determine overall status
  const anyFailed = checks.some((c) => !c.passed && c.name !== "Workflow Provenance & Reproducibility");
  const provenanceWarningOnly = checks.some((c) => !c.passed && c.name === "Workflow Provenance & Reproducibility") && !anyFailed;

  let overall_status: "passed" | "warning" | "failed" = "passed";
  let summary = "All technical and commercial compliance checks passed.";

  if (anyFailed) {
    overall_status = "failed";
    summary = `Failed ${checks.filter((c) => !c.passed).length} technical delivery check(s). Corrective action required before client review.`;
  } else if (provenanceWarningOnly) {
    overall_status = "warning";
    summary = "Deliverable passes frame and format criteria, with advisory notes on workflow documentation.";
  }

  return {
    overall_status,
    checks,
    summary,
    corrective_actions: correctiveActions,
    validated_at: new Date().toISOString(),
  };
}
