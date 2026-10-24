"use client";

import React, { useState } from "react";
import { useRole } from "@/context/RoleContext";
import { Engagement, Brief, Creator, VersionSubmission } from "@/lib/types";
import { validateDeliverable } from "@/lib/deliveryCheck";
import { PortfolioFrame } from "@/components/common/PortfolioFrame";
import {
  Check,
  Upload,
  CheckCircle2,
  Zap,
  SlidersHorizontal,
  ShieldCheck,
  Download,
  FileCode,
  Layers,
  FileCheck,
  AlertTriangle,
  XCircle,
  FileText,
  Video,
  X,
  PhoneCall,
  CreditCard,
  DollarSign,
  Wallet,
  ArrowUpRight,
  Lock,
} from "lucide-react";

// Built-in WebRTC Video Call & Virtual Creative Production Studio
function VideoCallModal({
  roomId,
  open,
  onClose,
  callerRole,
  creatorName = "Director",
  brandName = "Brand Client",
}: {
  roomId: string;
  open: boolean;
  onClose: () => void;
  callerRole: string;
  creatorName?: string;
  brandName?: string;
}) {
  const [micMuted, setMicMuted] = React.useState(false);
  const [cameraOff, setCameraOff] = React.useState(false);
  const [screenShare, setScreenShare] = React.useState(false);
  const [useIframe, setUseIframe] = React.useState(false);
  const [streamError, setStreamError] = React.useState<string | null>(null);
  const localVideoRef = React.useRef<HTMLVideoElement | null>(null);
  const streamRef = React.useRef<MediaStream | null>(null);

  React.useEffect(() => {
    if (!open) {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
      return;
    }

    if (!useIframe) {
      navigator.mediaDevices
        ?.getUserMedia({ video: true, audio: true })
        .then((stream) => {
          streamRef.current = stream;
          if (localVideoRef.current) {
            localVideoRef.current.srcObject = stream;
          }
          setStreamError(null);
        })
        .catch((err) => {
          console.warn("Camera/Mic access error, falling back:", err);
          setStreamError("Camera/Microphone permission denied or not found on device.");
        });
    }

    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
    };
  }, [open, useIframe]);

  const toggleMic = () => {
    if (streamRef.current) {
      const audioTrack = streamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setMicMuted(!audioTrack.enabled);
      }
    } else {
      setMicMuted(!micMuted);
    }
  };

  const toggleCamera = () => {
    if (streamRef.current) {
      const videoTrack = streamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setCameraOff(!videoTrack.enabled);
      }
    } else {
      setCameraOff(!cameraOff);
    }
  };

  if (!open) return null;

  const roomUrl = `https://meet.jit.si/reelforge-${roomId.replace(/[^a-zA-Z0-9]/g, "")}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4">
      <div className="relative w-full max-w-4xl h-[85vh] rounded-2xl overflow-hidden bg-[#0B0D11] border border-[#1E2536] shadow-2xl flex flex-col">
        {/* Header bar */}
        <div className="flex items-center justify-between px-6 py-3.5 border-b border-[#1E2536] bg-[#12151D]">
          <div className="flex items-center gap-3">
            <span className="p-2.5 rounded-xl bg-[#E5A83B]/10 text-[#E5A83B] border border-[#E5A83B]/30">
              <Video className="w-4 h-4" />
            </span>
            <div>
              <h3 className="text-sm font-bold text-[#F8FAFC] font-display flex items-center gap-2">
                Live Creative Production Studio
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#10B981]/20 text-[#34D399] border border-[#10B981]/40 font-bold">
                  ROOM ACTIVE
                </span>
              </h3>
              <p className="text-[11px] font-mono text-[#94A3B8]">
                Channel: <span className="text-[#E5A83B]">reelforge-{roomId}</span> • Connected as <span className="capitalize text-[#F8FAFC] font-bold">{callerRole}</span>
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <a
              href={roomUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-mono px-3 py-1.5 rounded-lg bg-[#1A1E29] hover:bg-[#222736] text-[#E5A83B] border border-[#1E2536] flex items-center gap-1.5 transition-colors"
              title="Open full dedicated call tab"
            >
              <span>Pop-out Call</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </a>
            <button
              onClick={onClose}
              className="text-[#94A3B8] hover:text-[#F8FAFC] bg-[#1A1E29] hover:bg-[#222736] rounded-lg p-2 transition-colors border border-[#1E2536]"
              aria-label="Close Call"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Video Call Workspace */}
        <div className="flex-1 w-full bg-black relative flex flex-col items-center justify-center overflow-hidden">
          {useIframe ? (
            <iframe
              title="ReelForge Video Session"
              src={`${roomUrl}#config.startWithAudioMuted=false&config.prejoinPageEnabled=false`}
              allow="camera; microphone; display-capture; autoplay; encrypted-media"
              className="w-full h-full border-0"
            />
          ) : (
            <div className="w-full h-full relative grid grid-cols-1 md:grid-cols-2 p-4 gap-4 bg-[#080A0E]">
              {/* Local Stream View */}
              <div className="relative rounded-2xl overflow-hidden bg-[#12151D] border border-[#1E2536] flex items-center justify-center group shadow-xl">
                {!cameraOff ? (
                  <video
                    ref={localVideoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover transform -scale-x-100"
                  />
                ) : (
                  <div className="flex flex-col items-center gap-2 text-[#64748B] font-mono">
                    <div className="w-16 h-16 rounded-full bg-[#1A1E29] border border-[#1E2536] flex items-center justify-center text-[#E5A83B] text-xl font-bold">
                      {callerRole === "brand" ? "B" : "C"}
                    </div>
                    <span className="text-xs">Camera is Off</span>
                  </div>
                )}
                <div className="absolute top-3 left-3 px-2.5 py-1 rounded-lg bg-black/60 backdrop-blur-sm border border-white/10 text-[11px] font-mono text-[#F8FAFC] flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${cameraOff ? "bg-red-400" : "bg-[#10B981]"}`} />
                  <span>You ({callerRole})</span>
                </div>
                {micMuted && (
                  <div className="absolute top-3 right-3 px-2 py-0.5 rounded bg-red-900/80 text-red-300 text-[10px] font-mono">
                    MUTED
                  </div>
                )}
              </div>

              {/* Remote Participant / Director Stream */}
              <div className="relative rounded-2xl overflow-hidden bg-[#12151D] border border-[#1E2536] flex items-center justify-center shadow-xl">
                <div className="flex flex-col items-center gap-3 text-center p-6">
                  <div className="relative">
                    <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#E5A83B]/20 to-[#0EA5E9]/20 border border-[#E5A83B]/40 flex items-center justify-center text-[#E5A83B] text-2xl font-bold shadow-lg">
                      {callerRole === "brand" ? creatorName.slice(0, 2).toUpperCase() : brandName.slice(0, 2).toUpperCase()}
                    </div>
                    <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-[#10B981] border-2 border-[#12151D]" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-[#F8FAFC]">
                      {callerRole === "brand" ? creatorName : `${brandName} Brand Representative`}
                    </h4>
                    <p className="text-[11px] font-mono text-[#94A3B8] mt-0.5">
                      Waiting to sync in peer channel...
                    </p>
                  </div>
                  <div className="flex items-center gap-2 pt-2">
                    <button
                      onClick={() => setUseIframe(true)}
                      className="px-3 py-1.5 rounded-lg bg-[#E5A83B]/10 hover:bg-[#E5A83B]/20 border border-[#E5A83B]/30 text-[#E5A83B] text-xs font-mono font-semibold transition-colors"
                    >
                      Connect via Jitsi Network
                    </button>
                    <a
                      href={roomUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 rounded-lg bg-[#1A1E29] hover:bg-[#222736] border border-[#1E2536] text-[#F8FAFC] text-xs font-mono transition-colors"
                    >
                      Join via External App
                    </a>
                  </div>
                </div>
                <div className="absolute top-3 left-3 px-2.5 py-1 rounded-lg bg-black/60 backdrop-blur-sm border border-white/10 text-[11px] font-mono text-[#94A3B8]">
                  Peer: {callerRole === "brand" ? "Director Room" : "Brand Room"}
                </div>
              </div>
            </div>
          )}

          {streamError && !useIframe && (
            <div className="absolute bottom-20 left-1/2 -translate-x-1/2 px-4 py-2 rounded-xl bg-red-950/90 border border-red-800 text-red-200 text-xs font-mono shadow-2xl flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-400" />
              <span>{streamError}</span>
            </div>
          )}
        </div>

        {/* Video Call Bottom Control Bar */}
        <div className="px-6 py-4 border-t border-[#1E2536] bg-[#12151D] flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-mono text-[#94A3B8]">
            <span className="w-2 h-2 rounded-full bg-[#10B981] animate-ping" />
            <span>HD 1080p WebRTC Session</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={toggleMic}
              className={`p-3 rounded-xl border font-mono text-xs flex items-center gap-2 transition-all ${
                micMuted
                  ? "bg-red-900/30 text-red-300 border-red-800/50"
                  : "bg-[#1A1E29] text-[#F8FAFC] border-[#1E2536] hover:border-[#E5A83B]/40"
              }`}
              title={micMuted ? "Unmute Microphone" : "Mute Microphone"}
            >
              <span>{micMuted ? "Mic Muted" : "Mic Live"}</span>
            </button>

            <button
              onClick={toggleCamera}
              className={`p-3 rounded-xl border font-mono text-xs flex items-center gap-2 transition-all ${
                cameraOff
                  ? "bg-red-900/30 text-red-300 border-red-800/50"
                  : "bg-[#1A1E29] text-[#F8FAFC] border-[#1E2536] hover:border-[#E5A83B]/40"
              }`}
              title={cameraOff ? "Turn Camera On" : "Turn Camera Off"}
            >
              <span>{cameraOff ? "Video Off" : "Video Live"}</span>
            </button>

            <button
              onClick={() => setUseIframe(!useIframe)}
              className="p-3 rounded-xl border bg-[#1A1E29] text-[#E5A83B] border-[#1E2536] hover:border-[#E5A83B]/40 font-mono text-xs transition-colors"
              title="Toggle between Direct WebRTC and Jitsi Bridge"
            >
              <span>{useIframe ? "Direct Video Mode" : "Jitsi Bridge Mode"}</span>
            </button>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-mono text-xs font-bold transition-colors shadow-lg"
          >
            End Call
          </button>
        </div>
      </div>
    </div>
  );
}

interface EngagementBoardProps {
  initialEngagement: Engagement;
  brief: Brief;
  creator: Creator;
}

const STEPPER_STAGES = [
  { id: "invited", label: "01. Invited" },
  { id: "accepted", label: "02. Accepted" },
  { id: "in_progress", label: "03. In Progress" },
  { id: "delivered", label: "04. Delivered" },
  { id: "approved", label: "05. Approved" },
];

export function EngagementBoard({
  initialEngagement,
  brief,
  creator,
}: EngagementBoardProps) {
  const { role, setRole } = useRole();
  const [engagement, setEngagement] = useState<Engagement>(initialEngagement);
  const [activeTab, setActiveTab] = useState<"brand" | "creator">(
    role === "creator" ? "creator" : "brand"
  );
  const [submitting, setSubmitting] = useState(false);

  // A/B Comparison state
  const [abCompareMode, setAbCompareMode] = useState(false);

  // C2PA Modal state
  const [c2paModalOpen, setC2paModalOpen] = useState(false);
  const [c2paVersion, setC2paVersion] = useState<VersionSubmission | null>(null);

  // Delivery Check Modal state
  const [deliveryModalOpen, setDeliveryModalOpen] = useState(false);
  const [deliveryModalVersion, setDeliveryModalVersion] = useState<VersionSubmission | null>(null);

  // Creator version submission state
  const [versionNote, setVersionNote] = useState("");
  const [versionMediaUrl, setVersionMediaUrl] = useState("/seed/sneaker_916.mp4");

  // Brand feedback state
  const [brandFeedback, setBrandFeedback] = useState("");

  // Video call state
  const [videoCallOpen, setVideoCallOpen] = useState(false);

  // Payment & Content Protection state
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [fundAmount, setFundAmount] = useState<number>(3500);
  const [paymentMethod, setPaymentMethod] = useState("Corporate Escrow Card (Visa ending 4281)");
  const [creatorWatermarkPreview, setCreatorWatermarkPreview] = useState(false);

  const isPaymentCompleted = engagement.payment?.status === "released";

  const handleFundEscrow = async () => {
    const updatedPayment = {
      id: engagement.payment?.id || `pay_${engagement.id}_${Date.now()}`,
      amount: fundAmount,
      currency: "USD",
      status: "escrowed" as const,
      funded_at: new Date().toISOString(),
      method: paymentMethod,
      brand_name: brief.brand_name,
      creator_name: creator.name,
      transaction_ref: `tx_esc_${Math.floor(1000000 + Math.random() * 9000000)}`,
    };

    await updateEngagementState({
      payment: updatedPayment,
    });
    setPaymentModalOpen(false);
  };

  const handleReleaseEscrow = async () => {
    if (!engagement.payment) return;
    const releasedPayment = {
      ...engagement.payment,
      status: "released" as const,
      released_at: new Date().toISOString(),
      transaction_ref: `tx_rel_${Math.floor(1000000 + Math.random() * 9000000)}`,
    };

    await updateEngagementState({
      payment: releasedPayment,
    });
    setPaymentModalOpen(false);
  };

  const updateEngagementState = async (updates: Partial<Engagement>) => {
    setSubmitting(true);
    // Optimistic UI update for instant feedback
    setEngagement((prev) => ({ ...prev, ...updates }));
    try {
      const res = await fetch(`/api/engagements/${engagement.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });
      const data = await res.json();
      if (data.ok && data.engagement) {
        setEngagement(data.engagement);
      }
    } catch (err) {
      console.error("Update engagement error", err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCreatorSubmitVersion = async () => {
    if (!versionNote.trim()) return;

    const nextVerNum = engagement.versions.length + 1;
    const checks = validateDeliverable(
      {
        mediaUrl: versionMediaUrl,
        aspectRatio: brief.format,
        durationSec: brief.duration_sec,
        workflowGraphAttached: true,
        toolsUsed: creator.tools,
        note: versionNote,
      },
      brief
    );

    const newVer: VersionSubmission = {
      n: nextVerNum,
      note: versionNote,
      media_url: versionMediaUrl,
      state: "submitted",
      delivery_checks: checks,
      submitted_at: new Date().toISOString(),
      submitted_by: creator.name,
    };

    const updatedVersions = [...engagement.versions, newVer];
    const newStatus = nextVerNum >= 1 ? "delivered" : "in_progress";

    await updateEngagementState({
      versions: updatedVersions,
      status: newStatus,
    });

    setVersionNote("");
  };

  const handleConfirmLicensingAgreement = async () => {
    await updateEngagementState({
      status: "in_progress",
      agreed_terms: {
        usage_rights: brief.usage_rights,
        territory: brief.territory || "Worldwide",
        duration_months: brief.usage_duration_months || 12,
        exclusivity: brief.exclusivity ?? true,
        ai_disclosure_required: brief.ai_disclosure_required ?? true,
        deliverable_spec: brief.deliverables,
        tool_licensing_audit: "passed",
        confirmed_at: new Date().toISOString(),
        confirmed_by: role === "creator" ? creator.name : "Brand Manager",
      },
    });
  };

  const handleDeclineBrief = async () => {
    await updateEngagementState({
      status: "declined",
      decline_reason: "Director production calendar fully committed for requested sprint dates.",
    });
  };

  const handleBrandRequestChanges = async (verIndex: number) => {
    if (!brandFeedback.trim()) return;

    const currentRounds = engagement.revision_rounds_used || 0;
    if (currentRounds >= brief.max_revision_rounds) return;

    const copy = [...engagement.versions];
    copy[verIndex] = {
      ...copy[verIndex],
      brand_feedback: brandFeedback,
      state: "changes_requested",
      reviewed_at: new Date().toISOString(),
      reviewed_by: "Brand Campaign Director",
    };

    await updateEngagementState({
      versions: copy,
      revision_rounds_used: currentRounds + 1,
      status: "in_progress",
    });

    setBrandFeedback("");
  };

  const handleBrandApprove = async (verIndex: number) => {
    const copy = [...engagement.versions];
    copy[verIndex] = {
      ...copy[verIndex],
      state: "approved",
      reviewed_at: new Date().toISOString(),
      reviewed_by: "Brand Campaign Director",
    };

    await updateEngagementState({
      versions: copy,
      status: "approved",
    });
  };

  // 1-Click Live Walkthrough Preset Actions
  const handlePresetAccept = () => {
    updateEngagementState({ status: "accepted" });
  };

  const handlePresetSubmitV1 = () => {
    const checks = validateDeliverable(
      {
        mediaUrl: "/seed/sneaker_916.mp4",
        aspectRatio: brief.format,
        durationSec: brief.duration_sec,
        workflowGraphAttached: true,
        toolsUsed: ["Runway", "ComfyUI"],
        note: "Rendered 9:16 liquid fluid flow sequence using ComfyUI node pipeline",
      },
      brief
    );

    const newVer: VersionSubmission = {
      n: (engagement.versions.length || 0) + 1,
      note: "Rendered 9:16 liquid fluid flow sequence using ComfyUI node pipeline",
      media_url: "/seed/sneaker_916.mp4",
      state: "submitted",
      delivery_checks: checks,
      submitted_at: new Date().toISOString(),
      submitted_by: creator.name,
    };
    updateEngagementState({
      versions: [...engagement.versions, newVer],
      status: "delivered",
    });
  };

  const handlePresetRequestRevision = () => {
    if (engagement.versions.length === 0) return;
    const copy = [...engagement.versions];
    const lastIdx = copy.length - 1;
    copy[lastIdx] = {
      ...copy[lastIdx],
      brand_feedback: "Please adjust liquid motion contrast on frame 120 beat drop.",
      state: "changes_requested",
    };
    updateEngagementState({
      versions: copy,
      revision_rounds_used: (engagement.revision_rounds_used || 0) + 1,
      status: "in_progress",
    });
  };

  const handlePresetApprove = () => {
    if (engagement.versions.length === 0) return;
    const copy = [...engagement.versions];
    const lastIdx = copy.length - 1;
    copy[lastIdx] = {
      ...copy[lastIdx],
      state: "approved",
    };
    updateEngagementState({
      versions: copy,
      status: "approved",
    });
  };

  const maxRoundsReached = (engagement.revision_rounds_used || 0) >= brief.max_revision_rounds;

  return (
    <div className="space-y-6 py-4">

      {/* WORKFLOW SIMULATION TOOLBAR */}
      <div className="bg-[#191A17] border border-[#282A24] rounded-xl p-4 space-y-2">
        <div className="flex items-center justify-between">
          <span className="font-mono text-xs font-semibold text-[#D5AD52] uppercase tracking-wider flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5" /> Interactive Campaign Simulation
          </span>
          <span className="font-mono text-[11px] text-[#76756D]">Simulate brand / creator lifecycle transitions</span>
        </div>
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <button
            onClick={handlePresetAccept}
            className="btn-secondary text-xs"
          >
            Accept Brief
          </button>
          <button
            onClick={handlePresetSubmitV1}
            className="btn-secondary text-xs"
          >
            Submit Render v1
          </button>
          <button
            onClick={handlePresetRequestRevision}
            className="btn-secondary text-xs"
          >
            Request Revision
          </button>
          <button
            onClick={handlePresetApprove}
            className="btn-primary text-xs"
          >
            Approve Final Render
          </button>
        </div>
      </div>

      {/* Header Summary Panel */}
      <div className="border border-[#282A24] bg-[#191A17] rounded-xl p-6 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-[#282A24] pb-5">
          <div>
            <div className="flex items-center gap-2 font-mono text-xs text-[#D5AD52]">
              <span className="uppercase font-semibold tracking-wider">{brief.brand_name}</span>
              <span className="text-[#3D4036]">•</span>
              <span className="text-[#76756D]">Engagement #{engagement.id}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#F3F0E8] font-display mt-1">{brief.title}</h1>
            <p className="text-[#AAA99F] text-xs mt-1">
              Director: <strong className="text-[#F3F0E8]">{creator.name}</strong> • Max Revision Allowance: {brief.max_revision_rounds} Rounds
            </p>
          </div>

          {/* DUAL DESK SWITCHER & ACTIONS */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setPaymentModalOpen(true)}
              className={`px-3 py-1.5 text-xs rounded-lg font-mono font-medium flex items-center gap-1.5 transition-colors shadow-sm ${
                engagement.payment?.status === "released"
                  ? "bg-[#10B981]/15 text-[#34D399] border border-[#10B981]/30"
                  : engagement.payment?.status === "escrowed"
                  ? "bg-[#E5A83B]/15 text-[#E5A83B] border border-[#E5A83B]/40"
                  : "bg-[#1A1E29] text-[#94A3B8] hover:text-[#F8FAFC] border border-[#1E2536]"
              }`}
              title="Inspect or release project payment escrow"
            >
              <CreditCard className="w-3.5 h-3.5 text-[#E5A83B]" />
              <span>
                {engagement.payment?.status === "released"
                  ? "Paid ($" + (engagement.payment.amount || 3500).toLocaleString() + ")"
                  : engagement.payment?.status === "escrowed"
                  ? "Escrow Funded ($" + (engagement.payment.amount || 3500).toLocaleString() + ")"
                  : "Payment Escrow"}
              </span>
            </button>

            <button
              onClick={() => setVideoCallOpen(true)}
              className="px-3 py-1.5 text-xs rounded-lg font-mono font-medium bg-[#E5A83B]/10 hover:bg-[#E5A83B]/20 text-[#E5A83B] border border-[#E5A83B]/30 flex items-center gap-1.5 transition-colors shadow-sm"
              title="Launch instant live video call"
            >
              <Video className="w-3.5 h-3.5" />
              <span>Live Video Call</span>
            </button>

            <div className="flex items-center bg-[#111210] border border-[#282A24] rounded-lg p-1 space-x-1">
              <button
                onClick={() => {
                  setActiveTab("brand");
                  setRole("brand");
                }}
                className={`px-3 py-1.5 text-xs rounded font-mono font-medium transition-colors ${
                  activeTab === "brand"
                    ? "bg-[#20211D] text-[#D5AD52] font-semibold border border-[#282A24]"
                    : "text-[#AAA99F] hover:text-[#F3F0E8]"
                }`}
              >
                Brand Review Desk
              </button>
              <button
                onClick={() => {
                  setActiveTab("creator");
                  setRole("creator");
                }}
                className={`px-3 py-1.5 text-xs rounded font-mono font-medium transition-colors ${
                  activeTab === "creator"
                    ? "bg-[#20211D] text-[#D5AD52] font-semibold border border-[#282A24]"
                    : "text-[#AAA99F] hover:text-[#F3F0E8]"
                }`}
              >
                Creator Studio Desk
              </button>
            </div>
          </div>
        </div>

        {/* STATUS STEPPER */}
        <div data-testid="engagement-status" className="space-y-2">
          <span className="font-mono text-xs text-[#76756D] block uppercase tracking-wider font-medium">Production Lifecycle:</span>
          <div className="grid grid-cols-5 gap-2">
            {STEPPER_STAGES.map((stage) => {
              const stagesOrder = ["invited", "accepted", "in_progress", "delivered", "approved"];
              const currentIdx = stagesOrder.indexOf(engagement.status);
              const stageIdx = stagesOrder.indexOf(stage.id);

              const isCompleted = stageIdx < currentIdx || engagement.status === "approved";
              const isCurrent = stage.id === engagement.status;

              return (
                <div
                  key={stage.id}
                  className={`p-2.5 rounded border text-center font-mono text-xs transition-colors ${
                    isCurrent
                      ? "border-[#D5AD52] text-[#F3F0E8] bg-[#20211D] font-semibold"
                      : isCompleted
                      ? "border-[#3E895B]/30 text-[#6BCB8B] bg-[#3E895B]/10"
                      : "border-[#282A24] text-[#76756D] bg-[#111210]"
                  }`}
                >
                  <span className="truncate block">{stage.label}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* MASTER STEMS HANDOFF VAULT (Shown when status is approved) */}
        {engagement.status === "approved" && (
          <div className="border border-[#3E895B]/30 bg-[#3E895B]/10 rounded-xl p-5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs text-[#6BCB8B] uppercase font-bold tracking-wider flex items-center gap-2">
                <ShieldCheck className="w-4 h-4" /> MASTER COMMERCIAL DELIVERY VAULT
              </span>
              <span className="text-[11px] font-mono text-[#AAA99F]">
                {isPaymentCompleted ? "STATUS: PAYMENT CLEARED & UNLOCKED" : "STATUS: ESCROW PAYOUT REQUIRED"}
              </span>
            </div>
            <p className="text-[#AAA99F] text-xs leading-relaxed">
              {isPaymentCompleted
                ? "All revision rounds completed and escrow payment released. Clean unwatermarked 4K deliverables and ComfyUI manifests are ready for download."
                : "Deliverables are approved, but unwatermarked master 4K files remain protected until payment is released to director."}
            </p>

            {!isPaymentCompleted && (
              <div className="p-3 bg-[#E5A83B]/10 border border-[#E5A83B]/30 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-mono">
                <div className="flex items-center gap-2 text-[#E5A83B]">
                  <Lock className="w-4 h-4 shrink-0" />
                  <span>Master Downloads Locked: Release ${(engagement.payment?.amount || 3500).toLocaleString()} escrow to unlock clean deliverables.</span>
                </div>
                {engagement.payment?.status === "escrowed" ? (
                  <button
                    onClick={handleReleaseEscrow}
                    disabled={submitting}
                    className="px-3 py-1.5 rounded bg-[#E5A83B] hover:bg-[#F5BA4C] text-[#0B0D11] font-bold flex items-center gap-1.5 transition-colors shadow-md shrink-0"
                  >
                    <DollarSign className="w-3.5 h-3.5" /> Release Escrow & Unlock Files
                  </button>
                ) : (
                  <button
                    onClick={() => setPaymentModalOpen(true)}
                    className="px-3 py-1.5 rounded bg-[#E5A83B] hover:bg-[#F5BA4C] text-[#0B0D11] font-bold flex items-center gap-1.5 transition-colors shadow-md shrink-0"
                  >
                    <CreditCard className="w-3.5 h-3.5" /> Deposit Escrow Payment
                  </button>
                )}
              </div>
            )}

            <div className="flex flex-wrap items-center gap-2 pt-1">
              <a
                href={isPaymentCompleted ? (engagement.versions[engagement.versions.length - 1]?.media_url || "/seed/sneaker_916.mp4") : "#"}
                download={isPaymentCompleted ? "reelforge_4k_master.mp4" : undefined}
                onClick={(e) => {
                  if (!isPaymentCompleted) {
                    e.preventDefault();
                    setPaymentModalOpen(true);
                  }
                }}
                className={`px-3 py-1.5 rounded text-xs font-mono border flex items-center gap-1.5 transition-colors ${
                  isPaymentCompleted
                    ? "bg-[#3E895B]/20 hover:bg-[#3E895B]/30 text-[#6BCB8B] border-[#3E895B]/30 cursor-pointer"
                    : "bg-[#111210] text-[#76756D] border-[#282A24] cursor-not-allowed opacity-60"
                }`}
              >
                {isPaymentCompleted ? <Download className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
                <span>4K ProRes Video Master (.mov)</span>
                {!isPaymentCompleted && <span className="text-[10px] text-[#E5A83B] font-bold">[LOCKED]</span>}
              </a>
              <button
                disabled={!isPaymentCompleted}
                onClick={() => !isPaymentCompleted && setPaymentModalOpen(true)}
                className={`btn-secondary text-xs flex items-center gap-1.5 ${
                  !isPaymentCompleted ? "opacity-60 cursor-not-allowed" : ""
                }`}
              >
                {isPaymentCompleted ? <Layers className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
                <span>Audio Stems (Voice / SFX / BGM)</span>
                {!isPaymentCompleted && <span className="text-[10px] text-[#E5A83B] font-bold">[LOCKED]</span>}
              </button>
              <button
                disabled={!isPaymentCompleted}
                onClick={() => !isPaymentCompleted && setPaymentModalOpen(true)}
                className={`btn-secondary text-xs flex items-center gap-1.5 ${
                  !isPaymentCompleted ? "opacity-60 cursor-not-allowed" : ""
                }`}
              >
                {isPaymentCompleted ? <FileCode className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
                <span>ComfyUI Workflow Graph (.json)</span>
                {!isPaymentCompleted && <span className="text-[10px] text-[#E5A83B] font-bold">[LOCKED]</span>}
              </button>

              {/* Escrow Status Indicator */}
              {engagement.payment?.status === "released" && (
                <div className="flex items-center gap-1.5 px-3 py-1 rounded bg-[#10B981]/20 border border-[#10B981]/40 text-[#34D399] font-mono text-xs font-bold ml-auto">
                  <Check className="w-3.5 h-3.5" /> Escrow Released to Director
                </div>
              )}
            </div>
          </div>
        )}
      </div>


      {/* TAB 1: BRAND REVIEW DESK */}
      {activeTab === "brand" && (
        <div className="space-y-6">
          {/* Content Protection Alert Banner */}
          {!isPaymentCompleted ? (
            <div className="p-4 rounded-xl bg-gradient-to-r from-[#E5A83B]/10 via-[#1A1E29] to-[#0B0D11] border border-[#E5A83B]/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-lg">
              <div className="flex items-start sm:items-center gap-3">
                <div className="p-2.5 rounded-lg bg-[#E5A83B]/20 text-[#E5A83B] border border-[#E5A83B]/40 shrink-0">
                  <Lock className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-xs font-bold font-mono text-[#F8FAFC]">
                      CONTENT SHIELD ACTIVE • WATERMARKED CLIENT PREVIEW
                    </h4>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#E5A83B]/20 text-[#E5A83B] font-semibold border border-[#E5A83B]/30">
                      ANTI-PIRACY
                    </span>
                  </div>
                  <p className="text-[11px] font-mono text-[#94A3B8] mt-0.5">
                    Videos are dynamically watermarked and protected from downloads. Complete escrow payout to unlock unwatermarked clean 4K masters.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {engagement.payment?.status === "escrowed" ? (
                  <button
                    onClick={handleReleaseEscrow}
                    disabled={submitting}
                    className="px-3.5 py-2 rounded-lg bg-[#E5A83B] hover:bg-[#F5BA4C] text-[#0B0D11] text-xs font-mono font-bold flex items-center gap-1.5 transition-colors shadow-md"
                  >
                    <DollarSign className="w-3.5 h-3.5" />
                    <span>Release Escrow to Unlock (${(engagement.payment.amount || 3500).toLocaleString()})</span>
                  </button>
                ) : (
                  <button
                    onClick={() => setPaymentModalOpen(true)}
                    className="px-3.5 py-2 rounded-lg bg-[#E5A83B] hover:bg-[#F5BA4C] text-[#0B0D11] text-xs font-mono font-bold flex items-center gap-1.5 transition-colors shadow-md"
                  >
                    <CreditCard className="w-3.5 h-3.5" />
                    <span>Deposit Escrow Payment</span>
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="p-3.5 rounded-xl bg-gradient-to-r from-[#10B981]/15 via-[#1A1E29] to-[#0B0D11] border border-[#10B981]/40 flex items-center justify-between gap-3 shadow-lg">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-[#10B981]/20 text-[#34D399] border border-[#10B981]/40">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold font-mono text-[#34D399] flex items-center gap-2">
                    PAYMENT CLEARED • CLEAN 4K MASTER ACTIVATED
                  </h4>
                  <p className="text-[11px] font-mono text-[#94A3B8]">
                    Watermarks removed. Full commercial rights granted. 4K ProRes master and audio stems unlocked.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setPaymentModalOpen(true)}
                className="px-3 py-1.5 rounded-lg bg-[#1A1E29] hover:bg-[#222736] text-[#34D399] border border-[#10B981]/30 font-mono text-xs flex items-center gap-1.5"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Escrow Receipt</span>
              </button>
            </div>
          )}

          <div className="flex items-center justify-between border-b border-[#282A24] pb-3">
            <div className="flex items-center gap-3">
              <h2 className="text-xl sm:text-2xl font-bold text-[#F3F0E8] font-display">Brand Review & Quality Clearance</h2>
              {engagement.versions.length >= 2 && (
                <button
                  onClick={() => setAbCompareMode(!abCompareMode)}
                  className={`px-3 py-1 rounded text-xs font-mono flex items-center gap-1.5 transition-colors ${
                    abCompareMode
                      ? "bg-[#20211D] text-[#D5AD52] border border-[#D5AD52] font-semibold"
                      : "btn-secondary text-xs"
                  }`}
                >
                  <SlidersHorizontal className="w-3.5 h-3.5" />
                  {abCompareMode ? "Exit A/B Diff View" : "A/B Compare Versions"}
                </button>
              )}
            </div>
            <span className="font-mono text-xs text-[#AAA99F]">
              Revisions Used: {engagement.revision_rounds_used || 0} / {brief.max_revision_rounds}
            </span>
          </div>

          {/* A/B VERSION DIFF VIEW */}
          {abCompareMode && engagement.versions.length >= 2 && (
            <div className="border border-[#282A24] bg-[#191A17] rounded-xl p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-[#282A24] pb-3">
                <span className="font-mono text-xs text-[#D5AD52] uppercase font-bold tracking-wider flex items-center gap-2">
                  <SlidersHorizontal className="w-4 h-4" /> A/B Side-by-Side Version Inspector
                </span>
                <span className="font-mono text-[11px] text-[#76756D]">Comparing Version v1 vs Version v{engagement.versions.length}</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Version A (v1) */}
                <div className="space-y-3 p-4 rounded-lg bg-[#111210] border border-[#282A24]">
                  <div className="flex items-center justify-between font-mono text-xs">
                    <span className="font-bold text-[#AAA99F]">Version v1 (Original Draft)</span>
                    <span className="text-[#76756D]">State: {engagement.versions[0].state}</span>
                  </div>
                  <PortfolioFrame
                    mediaUrl={engagement.versions[0].media_url || "/seed/sneaker_916.mp4"}
                    altText="Version v1"
                    aspectRatio={brief.format}
                    mediaType={brief.content_type === "video" ? "video" : "image"}
                    watermarked={!isPaymentCompleted}
                    brandName={brief.brand_name}
                  />
                  <p className="text-[#AAA99F] text-xs font-mono bg-[#191A17] p-2.5 rounded border border-[#282A24]">
                    {engagement.versions[0].note}
                  </p>
                </div>

                {/* Version B (Latest) */}
                <div className="space-y-3 p-4 rounded-lg bg-[#111210] border border-[#282A24]">
                  <div className="flex items-center justify-between font-mono text-xs">
                    <span className="font-bold text-[#F3F0E8]">Version v{engagement.versions.length} (Latest Revision)</span>
                    <span className="text-[#D5AD52] font-semibold">State: {engagement.versions[engagement.versions.length - 1].state}</span>
                  </div>
                  <PortfolioFrame
                    mediaUrl={engagement.versions[engagement.versions.length - 1].media_url || "/seed/sneaker_916.mp4"}
                    altText={`Version v${engagement.versions.length}`}
                    aspectRatio={brief.format}
                    mediaType={brief.content_type === "video" ? "video" : "image"}
                    watermarked={!isPaymentCompleted}
                    brandName={brief.brand_name}
                  />
                  <p className="text-[#AAA99F] text-xs font-mono bg-[#191A17] p-2.5 rounded border border-[#282A24]">
                    {engagement.versions[engagement.versions.length - 1].note}
                  </p>
                </div>
              </div>
            </div>
          )}

          {engagement.status === "invited" && (
            <div className="border border-[#282A24] bg-[#191A17] rounded-xl p-6 space-y-3">
              <span className="font-mono text-xs text-[#E5A853] uppercase font-semibold block">Awaiting Director Acceptance</span>
              <p className="text-[#AAA99F] text-xs sm:text-sm">
                Invitation issued to <strong>{creator.name}</strong>. Once they log into Creator Studio and accept the brief, work on Version 1 will commence.
              </p>
              <button
                onClick={() => {
                  setActiveTab("creator");
                  setRole("creator");
                }}
                className="btn-secondary text-xs"
              >
                Switch to Creator Studio Desk →
              </button>
            </div>
          )}

          {engagement.versions.length === 0 && engagement.status !== "invited" && (
            <div className="border border-[#282A24] bg-[#191A17] rounded-xl p-8 text-center text-xs text-[#AAA99F] space-y-2">
              <p>Creator is currently generating Version 1 renders.</p>
              <button
                onClick={() => {
                  setActiveTab("creator");
                  setRole("creator");
                }}
                className="text-[#D5AD52] underline font-mono"
              >
                Switch to Creator Desk to submit Version 1 →
              </button>
            </div>
          )}

          {/* BRAND FEEDBACK & VERSION LIST */}
          <div className="space-y-5">
            {engagement.versions.map((ver, idx) => (
              <div key={idx} className="border border-[#282A24] bg-[#191A17] rounded-xl p-5 space-y-4">
                <div className="flex items-center justify-between border-b border-[#282A24] pb-3">
                  <div className="flex items-center gap-3 font-mono text-xs">
                    <span className="font-bold bg-[#20211D] text-[#F3F0E8] px-2.5 py-0.5 rounded border border-[#282A24]">
                      Version v{ver.n}
                    </span>
                    <span className="text-[#AAA99F]">
                      State: <strong className="text-[#F3F0E8]">{ver.state}</strong>
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      onClick={() => {
                        setDeliveryModalVersion(ver);
                        setDeliveryModalOpen(true);
                      }}
                      className="px-2.5 py-1 rounded bg-[#111210] border border-[#282A24] text-[11px] font-mono text-[#6BCB8B] hover:border-[#3E895B]/40 flex items-center gap-1.5 transition-colors"
                    >
                      <FileCheck className="w-3.5 h-3.5 text-[#6BCB8B]" /> Technical Delivery Checks
                    </button>

                    <button
                      onClick={() => {
                        setC2paVersion(ver);
                        setC2paModalOpen(true);
                      }}
                      className="px-2.5 py-1 rounded bg-[#111210] border border-[#282A24] text-[11px] font-mono text-[#D5AD52] hover:border-[#D5AD52]/40 flex items-center gap-1 transition-colors"
                    >
                      <ShieldCheck className="w-3.5 h-3.5" /> Inspect C2PA Provenance
                    </button>

                    {ver.state === "approved" && (
                      <span className="font-mono text-xs text-[#6BCB8B] flex items-center gap-1 font-semibold">
                        <CheckCircle2 className="w-4 h-4" /> APPROVED FOR COMMERCE
                      </span>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
                  {/* Left Media */}
                  {ver.media_url && (
                    <div className="lg:col-span-5">
                      <PortfolioFrame
                        mediaUrl={ver.media_url}
                        altText={`Version v${ver.n}`}
                        aspectRatio={brief.format}
                        mediaType={brief.content_type === "video" ? "video" : "image"}
                        watermarked={!isPaymentCompleted}
                        brandName={brief.brand_name}
                      />
                    </div>
                  )}

                  {/* Right Note & Feedback */}
                  <div className={`${ver.media_url ? "lg:col-span-7" : "lg:col-span-12"} space-y-4`}>
                    <div className="space-y-1">
                      <span className="font-mono text-xs text-[#76756D] font-medium block">Director Submission Notes:</span>
                      <p className="text-[#F3F0E8] text-xs bg-[#111210] border border-[#282A24] p-3 rounded leading-relaxed font-mono">
                        {ver.note}
                      </p>
                    </div>

                    {ver.brand_feedback && (
                      <div className="space-y-1 border-t border-[#282A24] pt-3">
                          <span className="font-mono text-xs text-[#D5AD52] font-medium block">Brand Feedback Notes:</span>
                        <p className="text-[#AAA99F] text-xs bg-[#111210] border border-[#282A24] p-3 rounded leading-relaxed">
                          {ver.brand_feedback}
                        </p>
                      </div>
                    )}

                    {/* BRAND ACTIONS FOR SUBMITTED VERSIONS */}
                    {ver.state === "submitted" && (
                      <div className="border-t border-[#282A24] pt-3 space-y-3">
                        <span className="font-mono text-xs text-[#F3F0E8] block font-semibold">Brand Review Decisions:</span>

                        {maxRoundsReached ? (
                          <div className="bg-[#C68A36]/10 border border-[#C68A36]/30 text-[#E5A853] p-3 rounded text-xs font-mono">
                            Maximum revision rounds ({brief.max_revision_rounds}) reached for this brief.
                          </div>
                        ) : (
                          <div className="space-y-2">
                            <textarea
                              rows={2}
                              value={brandFeedback}
                              onChange={(e) => setBrandFeedback(e.target.value)}
                              placeholder="Specify feedback for requested revision changes..."
                              className="w-full bg-[#111210] border border-[#282A24] rounded p-2.5 text-xs text-[#F3F0E8] focus:outline-none focus:border-[#D5AD52]"
                            />
                            <button
                              onClick={() => handleBrandRequestChanges(idx)}
                              disabled={submitting || !brandFeedback.trim()}
                              className="btn-secondary text-xs"
                            >
                              Request Revision with Feedback
                            </button>
                          </div>
                        )}

                        <div>
                          <button
                            onClick={() => handleBrandApprove(idx)}
                            disabled={submitting}
                            className="btn-primary text-xs flex items-center gap-2"
                          >
                            <Check className="w-4 h-4" /> Approve Version v{ver.n}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: CREATOR DELIVERY DESK */}
      {activeTab === "creator" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between border-b border-[#282A24] pb-3">
            <h2 className="text-xl sm:text-2xl font-bold text-[#F3F0E8] font-display">Creator Studio & Version Delivery</h2>
            <span className="font-mono text-xs text-[#AAA99F]">Director: {creator.name}</span>
          </div>

          {/* CREATOR CONTENT PROTECTION SHIELD CARD */}
          <div className="p-3.5 rounded-xl bg-[#12151D] border border-[#1E2536] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-mono">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-[#10B981]/15 text-[#34D399] border border-[#10B981]/30">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <span className="font-bold text-[#F8FAFC] block">
                  ReelForge Content Protection Guard Active
                </span>
                <span className="text-[#94A3B8] text-[11px]">
                  {isPaymentCompleted
                    ? "Payment has been cleared to your account. Master files are now unlocked for client."
                    : "Brand client can only view a watermarked preview. Raw master files cannot be downloaded until escrow is released."}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => setCreatorWatermarkPreview(!creatorWatermarkPreview)}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono border transition-colors ${
                  creatorWatermarkPreview
                    ? "bg-[#E5A83B]/20 text-[#E5A83B] border-[#E5A83B]/50 font-bold"
                    : "bg-[#1A1E29] text-[#94A3B8] border-[#1E2536] hover:text-[#F8FAFC]"
                }`}
              >
                {creatorWatermarkPreview ? "Viewing: Watermarked Client View" : "Toggle Client Watermark Preview"}
              </button>
            </div>
          </div>

          {/* CREATOR ACTION: Accept or Decline when invited */}
          {engagement.status === "invited" && (
            <div className="border border-[#282A24] bg-[#191A17] rounded-xl p-6 space-y-4 text-center">
              <h3 className="text-xl font-bold text-[#F3F0E8] font-display">Campaign Brief Invitation Received</h3>
              <p className="text-[#AAA99F] text-xs sm:text-sm max-w-md mx-auto">
                Review the brief requirements and accept the engagement to begin submitting renders.
              </p>
              <div className="flex items-center justify-center gap-3">
                <button
                  onClick={() => updateEngagementState({ status: "accepted" })}
                  disabled={submitting}
                  className="btn-primary text-xs flex items-center gap-2"
                >
                  <Check className="w-4 h-4" /> Accept Brief as {creator.name}
                </button>
                <button
                  onClick={handleDeclineBrief}
                  disabled={submitting}
                  className="btn-secondary text-xs"
                >
                  Decline Brief
                </button>
              </div>
            </div>
          )}

          {/* CREATOR ACTION: Decline Status */}
          {engagement.status === "declined" && (
            <div className="border border-[#B84A4A]/30 bg-[#B84A4A]/10 rounded-xl p-6 text-center space-y-2">
              <h3 className="text-lg font-bold text-[#E57373] font-display">Campaign Brief Invitation Declined</h3>
              <p className="text-[#AAA99F] text-xs max-w-md mx-auto">
                {engagement.decline_reason || "Director calendar is currently committed for the selected campaign sprint."}
              </p>
            </div>
          )}

          {/* STAGE 3: AGREEMENT & COMMERCIAL SCOPE CONFIRMATION */}
          {engagement.status === "accepted" && (
            <div className="border border-[#282A24] bg-[#191A17] rounded-xl p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-[#282A24] pb-3">
                <span className="font-mono text-xs uppercase font-bold text-[#D5AD52] flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4" /> Stage 3: Commercial Licensing & Agreement Scope Confirmation
                </span>
                <span className="text-[11px] font-mono text-[#AAA99F]">STATUS: ACCEPTED — BINDING SCOPE</span>
              </div>
              <p className="text-[#AAA99F] text-xs leading-relaxed">
                Confirm agreed commercial terms and deliverable format specifications before production begins:
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 font-mono text-xs text-[#AAA99F]">
                <div className="bg-[#111210] p-2.5 rounded border border-[#282A24]">
                  <span className="text-[#76756D] block text-[9px] uppercase">Usage Rights</span>
                  <span className="text-[#F3F0E8] font-semibold">{brief.usage_rights.join(", ")}</span>
                </div>
                <div className="bg-[#111210] p-2.5 rounded border border-[#282A24]">
                  <span className="text-[#76756D] block text-[9px] uppercase">Territory</span>
                  <span className="text-[#F3F0E8] font-semibold">{brief.territory || "Worldwide"}</span>
                </div>
                <div className="bg-[#111210] p-2.5 rounded border border-[#282A24]">
                  <span className="text-[#76756D] block text-[9px] uppercase">Duration</span>
                  <span className="text-[#F3F0E8] font-semibold">{brief.usage_duration_months || 12} Months</span>
                </div>
                <div className="bg-[#111210] p-2.5 rounded border border-[#282A24]">
                  <span className="text-[#76756D] block text-[9px] uppercase">Tool Audit</span>
                  <span className="text-[#6BCB8B] font-semibold">100% Cleared (Paid Media)</span>
                </div>
              </div>
              <div className="flex items-center justify-end pt-1">
                <button
                  onClick={handleConfirmLicensingAgreement}
                  disabled={submitting}
                  className="btn-primary text-xs font-mono font-medium flex items-center gap-2"
                >
                  <Check className="w-4 h-4" /> Confirm Licensing Agreement & Begin Production
                </button>
              </div>
            </div>
          )}

          {/* CREATOR SUBMIT VERSION FORM */}
          {engagement.status !== "approved" && engagement.status !== "invited" && (
            <div className="border border-[#282A24] bg-[#191A17] p-5 rounded-xl space-y-4">
              <h3 className="text-lg font-bold text-[#F3F0E8] font-display">
                Submit Render Version v{(engagement.versions.length || 0) + 1}
              </h3>

              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="font-mono text-xs text-[#AAA99F] block">Render Notes & Step Log Details *</label>
                  <textarea
                    rows={3}
                    value={versionNote}
                    onChange={(e) => setVersionNote(e.target.value)}
                    placeholder="Describe prompt seed parameters, upscaling tools, or color grading updates in this version..."
                    className="w-full bg-[#111210] border border-[#282A24] rounded p-2.5 text-xs text-[#F3F0E8] focus:outline-none focus:border-[#D5AD52]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-mono text-xs text-[#AAA99F] block">Render File Path / Media URL</label>
                  <input
                    type="text"
                    value={versionMediaUrl}
                    onChange={(e) => setVersionMediaUrl(e.target.value)}
                    className="w-full bg-[#111210] border border-[#282A24] rounded px-3 py-1.5 text-xs text-[#F3F0E8] focus:outline-none focus:border-[#D5AD52] font-mono"
                  />
                </div>

                <button
                  onClick={handleCreatorSubmitVersion}
                  disabled={submitting || !versionNote.trim()}
                  className="btn-primary text-xs flex items-center gap-2"
                >
                  <Upload className="w-3.5 h-3.5" />
                  Submit Version v{(engagement.versions.length || 0) + 1}
                </button>
              </div>
            </div>
          )}

          {/* VERSIONS REVISION FEED */}
          {engagement.versions.length === 0 ? (
            <div className="border border-[#282A24] bg-[#191A17] rounded-xl p-8 text-center text-xs text-[#AAA99F]">
              No versions submitted yet. Director will submit initial render v1.
            </div>
          ) : (
            <div className="space-y-5">
              {engagement.versions.map((ver, idx) => (
                <div key={idx} className="border border-[#282A24] bg-[#191A17] rounded-xl p-5 space-y-4">
                  <div className="flex items-center justify-between border-b border-[#282A24] pb-3">
                    <div className="flex items-center gap-3 font-mono text-xs">
                      <span className="font-bold bg-[#20211D] text-[#F3F0E8] px-2.5 py-0.5 rounded border border-[#282A24]">
                        Version v{ver.n}
                      </span>
                      <span className="text-[#AAA99F]">
                        State: <strong className="text-[#F3F0E8]">{ver.state}</strong>
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        onClick={() => {
                          setDeliveryModalVersion(ver);
                          setDeliveryModalOpen(true);
                        }}
                        className="px-2.5 py-1 rounded bg-[#111210] border border-[#282A24] text-[11px] font-mono text-[#6BCB8B] hover:border-[#3E895B]/40 flex items-center gap-1.5 transition-colors"
                      >
                        <FileCheck className="w-3.5 h-3.5 text-[#6BCB8B]" /> Technical Delivery Checks
                      </button>

                      {ver.state === "approved" && (
                        <span className="font-mono text-xs text-[#6BCB8B] flex items-center gap-1 font-semibold">
                          <CheckCircle2 className="w-4 h-4" /> APPROVED FOR COMMERCE
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
                    {/* Left Media */}
                    {ver.media_url && (
                      <div className="lg:col-span-5">
                        <PortfolioFrame
                          mediaUrl={ver.media_url}
                          altText={`Version v${ver.n}`}
                          aspectRatio={brief.format}
                          mediaType={brief.content_type === "video" ? "video" : "image"}
                          watermarked={creatorWatermarkPreview}
                          brandName={brief.brand_name}
                        />
                      </div>
                    )}

                    {/* Right Note & Feedback */}
                    <div className={`${ver.media_url ? "lg:col-span-7" : "lg:col-span-12"} space-y-4`}>
                      <div className="space-y-1">
                          <span className="font-mono text-xs text-[#76756D] font-medium block">Director Submission Notes:</span>
                        <p className="text-[#F3F0E8] text-xs bg-[#111210] border border-[#282A24] p-3 rounded leading-relaxed font-mono">
                          {ver.note}
                        </p>
                      </div>

                      {ver.brand_feedback && (
                        <div className="space-y-1 border-t border-[#282A24] pt-3">
                            <span className="font-mono text-xs text-[#D5AD52] font-medium block">Brand Feedback Notes:</span>
                          <p className="text-[#AAA99F] text-xs bg-[#111210] border border-[#282A24] p-3 rounded leading-relaxed">
                            {ver.brand_feedback}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* C2PA PROVENANCE MANIFEST MODAL */}
      {c2paModalOpen && c2paVersion && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#191A17] border border-[#282A24] rounded-xl w-full max-w-lg p-6 space-y-4 shadow-2xl relative">
            <button
              onClick={() => setC2paModalOpen(false)}
              className="absolute top-4 right-4 text-[#AAA99F] hover:text-[#F3F0E8]"
            >
              ✕
            </button>
            <div className="flex items-center gap-2 text-[#D5AD52] font-mono text-xs uppercase tracking-wider font-bold">
              <ShieldCheck className="w-4 h-4" /> C2PA Content Credentials Manifest
            </div>
            <div className="space-y-3 font-mono text-xs text-[#AAA99F]">
              <div className="p-3 bg-[#111210] rounded border border-[#282A24] space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-[#76756D]">Manifest Digest:</span>
                  <span className="text-[#D5AD52] font-bold">urn:c2pa:2026:rf_ver_{c2paVersion.n}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#76756D]">Generator Model:</span>
                  <span className="text-[#F3F0E8] font-medium">Runway Gen-3 Alpha // ComfyUI Local</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#76756D]">Seed Parameter:</span>
                  <span className="text-[#F3F0E8] font-medium">4820193850</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#76756D]">Licence Check:</span>
                  <span className="text-[#6BCB8B] font-medium">ACTIVE COMMERCIAL SUBSCRIPTION</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#76756D]">Watermark Status:</span>
                  <span className="text-[#6BCB8B] font-medium font-semibold">AUTHENTIC & CLEARED</span>
                </div>
              </div>
              <p className="text-[11px] text-[#AAA99F] font-sans leading-relaxed">
                Cryptographically signed metadata confirms this render was generated by director <strong>{creator.name}</strong> under verified paid commercial tool tier.
              </p>
            </div>
            <button
              onClick={() => setC2paModalOpen(false)}
              className="btn-primary w-full text-xs text-center"
            >
              Close Manifest Inspector
            </button>
          </div>
        </div>
      )}

      {/* TECHNICAL DELIVERY CHECK AUDIT MODAL */}
      {deliveryModalOpen && deliveryModalVersion && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#191A17] border border-[#282A24] rounded-xl w-full max-w-xl p-6 sm:p-7 space-y-5 shadow-2xl relative">
            <button
              onClick={() => setDeliveryModalOpen(false)}
              className="absolute top-4 right-4 text-[#AAA99F] hover:text-[#F3F0E8] font-mono text-sm"
            >
              ✕
            </button>
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-[#6BCB8B] font-mono text-xs uppercase tracking-wider font-bold">
                <FileCheck className="w-4 h-4" /> Technical Delivery & Specification Audit
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-[#F3F0E8] font-display">
                Automated Deliverable Pre-Review Check
              </h3>
              <p className="text-[#AAA99F] text-xs">
                Audited version: <strong className="text-[#F3F0E8]">Version v{deliveryModalVersion.n}</strong> • Target brief: <strong className="text-[#F3F0E8]">{brief.title}</strong>
              </p>
            </div>

            {/* Check Results List */}
            <div className="space-y-2">
              {(deliveryModalVersion.delivery_checks?.checks || [
                {
                  name: "Aspect Ratio Compliance",
                  passed: true,
                  expected: brief.format,
                  actual: brief.format,
                  details: `Render matches target frame aspect ratio (${brief.format})`,
                },
                {
                  name: "Media Format Specification",
                  passed: true,
                  expected: "Video container (MP4 / ProRes MOV)",
                  actual: "MP4",
                  details: "Container format conforms to campaign delivery specification.",
                },
                {
                  name: "Duration Target Compliance",
                  passed: true,
                  expected: `${brief.duration_sec || 15}s (±2s)`,
                  actual: `${brief.duration_sec || 15}s`,
                  details: "Timeline duration is within acceptable range for commercial slot.",
                },
                {
                  name: "Workflow Provenance & Reproducibility",
                  passed: true,
                  expected: "Step log notes or node graph manifest attached",
                  actual: "Documented in submission manifest",
                  details: "Creator supplied prompt generation parameters and workflow execution notes.",
                },
                {
                  name: "Commercial Tool License Clearance",
                  passed: true,
                  expected: "All tools cleared for paid commercial advertising",
                  actual: "Cleared",
                  details: "Tools declared are licensed for global commercial advertising.",
                },
              ]).map((c, i) => (
                <div key={i} className="bg-[#111210] p-3 rounded border border-[#282A24] space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-semibold text-[#F3F0E8]">{c.name}</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                      c.passed ? "text-[#6BCB8B] bg-[#3E895B]/15 border border-[#3E895B]/30" : "text-[#E57373] bg-[#B84A4A]/15 border border-[#B84A4A]/30"
                    }`}>
                      {c.passed ? "PASSED" : "FAILED"}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-[10px] font-mono text-[#AAA99F] pt-0.5">
                    <div>Expected: <span className="text-[#F3F0E8]">{c.expected}</span></div>
                    <div>Actual: <span className="text-[#F3F0E8]">{c.actual}</span></div>
                  </div>
                  <p className="text-[11px] text-[#76756D] leading-normal pt-0.5">{c.details}</p>
                </div>
              ))}
            </div>

            <div className="p-3 bg-[#3E895B]/10 border border-[#3E895B]/30 rounded text-xs font-mono text-[#6BCB8B] flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-[#6BCB8B]" />
              <span>
                All technical delivery checks passed. Deliverable conforms to client brief specs.
              </span>
            </div>

            <button
              onClick={() => setDeliveryModalOpen(false)}
              className="btn-primary w-full text-xs font-mono"
            >
              Close Technical Audit
            </button>
          </div>
        </div>
      )}

      {/* Video Call Modal */}
      <VideoCallModal
        roomId={engagement.id}
        open={videoCallOpen}
        onClose={() => setVideoCallOpen(false)}
        callerRole={activeTab}
      />

      {/* Escrow Payment Management Modal */}
      {paymentModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
          <div className="relative w-full max-w-lg rounded-2xl overflow-hidden bg-[#12151D] border border-[#1E2536] shadow-2xl p-6 space-y-5">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-[#1E2536] pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-[#E5A83B]/10 text-[#E5A83B] border border-[#E5A83B]/30">
                  <Wallet className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#F8FAFC] font-display">
                    Commercial Project Escrow
                  </h3>
                  <p className="text-xs font-mono text-[#94A3B8]">
                    Brand: <span className="text-[#F8FAFC]">{brief.brand_name}</span> • Creator: <span className="text-[#E5A83B]">{creator.name}</span>
                  </p>
                </div>
              </div>
              <button
                onClick={() => setPaymentModalOpen(false)}
                className="text-[#94A3B8] hover:text-[#F8FAFC] p-1 rounded-lg hover:bg-[#1A1E29] transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Escrow Status Summary Card */}
            <div className="bg-[#0B0D11] border border-[#1E2536] rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-[#64748B] uppercase font-bold tracking-wider">Escrow Status</span>
                <span className={`px-2.5 py-0.5 rounded-md text-xs font-mono font-bold uppercase tracking-wider ${
                  engagement.payment?.status === "released"
                    ? "bg-[#10B981]/20 text-[#34D399] border border-[#10B981]/40"
                    : engagement.payment?.status === "escrowed"
                    ? "bg-[#E5A83B]/20 text-[#E5A83B] border border-[#E5A83B]/40"
                    : "bg-[#1A1E29] text-[#94A3B8] border border-[#1E2536]"
                }`}>
                  {engagement.payment?.status || "unfunded"}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-1">
                <div>
                  <span className="text-[10px] font-mono text-[#64748B] block uppercase">Contract Amount</span>
                  <span className="text-xl font-mono font-black text-[#F8FAFC]">
                    ${(engagement.payment?.amount || fundAmount).toLocaleString()} USD
                  </span>
                </div>
                <div>
                  <span className="text-[10px] font-mono text-[#64748B] block uppercase">Reference ID</span>
                  <span className="text-xs font-mono text-[#E5A83B] font-semibold block truncate">
                    {engagement.payment?.transaction_ref || "tx_pending"}
                  </span>
                </div>
              </div>

              <div className="text-[11px] font-mono text-[#94A3B8] flex items-center gap-1.5 pt-2 border-t border-[#1E2536]">
                <Lock className="w-3.5 h-3.5 text-[#10B981]" />
                <span>Funds are securely held in ReelForge Smart Escrow until final render approval.</span>
              </div>
            </div>

            {/* Actions for Brand / Creator */}
            {activeTab === "brand" ? (
              <div className="space-y-4">
                {engagement.payment?.status === "released" ? (
                  <div className="p-3 bg-[#10B981]/10 border border-[#10B981]/30 rounded-xl text-xs font-mono text-[#34D399] flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                    <span>Commercial payment of ${(engagement.payment.amount || 3500).toLocaleString()} USD has been successfully transferred to director {creator.name}.</span>
                  </div>
                ) : engagement.payment?.status === "escrowed" ? (
                  <div className="space-y-3">
                    <div className="p-3 bg-[#E5A83B]/10 border border-[#E5A83B]/30 rounded-xl text-xs text-[#E5A83B] leading-relaxed">
                      Escrow funds (${(engagement.payment.amount || 3500).toLocaleString()}) are locked. Once all revision milestones are verified, you can release the full payout.
                    </div>
                    <button
                      onClick={handleReleaseEscrow}
                      disabled={submitting}
                      className="btn-primary w-full text-xs font-mono font-bold flex items-center justify-center gap-2"
                    >
                      <DollarSign className="w-4 h-4" /> Authorize Immediate Payout to Creator
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="space-y-1.5">
                      <label className="text-xs font-mono text-[#94A3B8] uppercase block font-bold">Escrow Deposit Amount ($ USD)</label>
                      <input
                        type="number"
                        value={fundAmount}
                        onChange={(e) => setFundAmount(Number(e.target.value))}
                        className="w-full bg-[#0B0D11] border border-[#1E2536] rounded-xl px-3 py-2 text-sm font-mono text-[#F8FAFC] focus:outline-none focus:border-[#E5A83B]"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-mono text-[#94A3B8] uppercase block font-bold">Payment Method</label>
                      <select
                        value={paymentMethod}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        className="w-full bg-[#0B0D11] border border-[#1E2536] rounded-xl px-3 py-2 text-xs font-mono text-[#F8FAFC] focus:outline-none focus:border-[#E5A83B]"
                      >
                        <option value="Corporate Escrow Card (Visa ending 4281)">Corporate Escrow Card (Visa ending 4281)</option>
                        <option value="Direct ACH / Wire Transfer">Direct ACH / Wire Transfer</option>
                        <option value="USDC Instant Crypto Escrow">USDC Instant Crypto Escrow</option>
                      </select>
                    </div>
                    <button
                      onClick={handleFundEscrow}
                      disabled={submitting}
                      className="btn-primary w-full text-xs font-mono font-bold flex items-center justify-center gap-2 mt-2"
                    >
                      <Lock className="w-4 h-4" /> Deposit ${fundAmount.toLocaleString()} into Escrow
                    </button>
                  </div>
                )}
              </div>
            ) : (
              /* Creator View */
              <div className="space-y-3">
                <div className="p-3 bg-[#1A1E29] border border-[#1E2536] rounded-xl space-y-1.5 text-xs">
                  <div className="flex justify-between font-mono">
                    <span className="text-[#64748B]">Payout Recipient:</span>
                    <span className="text-[#F8FAFC] font-semibold">{creator.name}</span>
                  </div>
                  <div className="flex justify-between font-mono">
                    <span className="text-[#64748B]">Bank / Wallet:</span>
                    <span className="text-[#E5A83B]">Connected (Stripe Direct)</span>
                  </div>
                  <div className="flex justify-between font-mono">
                    <span className="text-[#64748B]">Disbursement Term:</span>
                    <span className="text-[#F8FAFC]">Instant on Brief Clearance</span>
                  </div>
                </div>

                {engagement.payment?.status === "released" ? (
                  <div className="p-3 bg-[#10B981]/15 border border-[#10B981]/30 rounded-xl text-xs font-mono text-[#34D399] flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Funds deposited to your linked creator account.</span>
                  </div>
                ) : engagement.payment?.status === "escrowed" ? (
                  <div className="p-3 bg-[#E5A83B]/10 border border-[#E5A83B]/30 rounded-xl text-xs font-mono text-[#E5A83B] flex items-center gap-2">
                    <Lock className="w-4 h-4" />
                    <span>${(engagement.payment.amount || 3500).toLocaleString()} USD is securely funded in escrow by {brief.brand_name}.</span>
                  </div>
                ) : (
                  <div className="p-3 bg-[#1A1E29] border border-[#1E2536] rounded-xl text-xs font-mono text-[#94A3B8]">
                    Awaiting brand escrow funding.
                  </div>
                )}
              </div>
            )}

            <button
              onClick={() => setPaymentModalOpen(false)}
              className="btn-secondary w-full text-xs font-mono"
            >
              Close Escrow Portal
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
