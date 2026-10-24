import fs from "fs";
import path from "path";

export interface FeedbackEntry {
  id: string;
  type: "bug" | "feature" | "general" | "praise";
  subject: string;
  message: string;
  rating?: number; // 1-5
  email?: string;
  page?: string;
  role?: string;
  createdAt: string;
  status: "new" | "reviewed" | "resolved";
}

const FEEDBACK_FILE = path.join(process.cwd(), "data", "seed", "feedback.json");

// Default initial feedback so the admin page is never empty on clean load
const DEFAULT_FEEDBACK: FeedbackEntry[] = [
  {
    id: "fb_seed_001",
    type: "feature",
    subject: "Video call & Instant Escrow release",
    message: "Loving the new production desk. Can we also have live video calling and escrow payout controls directly in the engagement board?",
    rating: 5,
    email: "creator.dev@reelforge.ai",
    page: "/engagements/eng_sneaker_001",
    role: "creator",
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    status: "new",
  },
  {
    id: "fb_seed_002",
    type: "praise",
    subject: "ComfyUI prompt node inspector",
    message: "The workflow graph inspector and provenance tracking are incredible for brand advertising audits.",
    rating: 5,
    email: "agency.lead@velox.com",
    page: "/creators",
    role: "brand",
    createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
    status: "reviewed",
  },
];

export function readFeedback(): FeedbackEntry[] {
  try {
    if (!fs.existsSync(FEEDBACK_FILE)) {
      fs.mkdirSync(path.dirname(FEEDBACK_FILE), { recursive: true });
      fs.writeFileSync(FEEDBACK_FILE, JSON.stringify(DEFAULT_FEEDBACK, null, 2), "utf-8");
      return DEFAULT_FEEDBACK;
    }
    const data = fs.readFileSync(FEEDBACK_FILE, "utf-8");
    const parsed = JSON.parse(data);
    return Array.isArray(parsed) ? parsed : DEFAULT_FEEDBACK;
  } catch (err) {
    console.error("Error reading feedback file:", err);
    return DEFAULT_FEEDBACK;
  }
}

export function saveFeedback(entries: FeedbackEntry[]): void {
  try {
    fs.mkdirSync(path.dirname(FEEDBACK_FILE), { recursive: true });
    fs.writeFileSync(FEEDBACK_FILE, JSON.stringify(entries, null, 2), "utf-8");
  } catch (err) {
    console.error("Error saving feedback file:", err);
  }
}

export function addFeedback(entry: FeedbackEntry): FeedbackEntry {
  const current = readFeedback();
  current.unshift(entry);
  saveFeedback(current);
  return entry;
}

export function updateFeedbackStatus(id: string, status: FeedbackEntry["status"]): FeedbackEntry | null {
  const current = readFeedback();
  const item = current.find((f) => f.id === id);
  if (!item) return null;
  item.status = status;
  saveFeedback(current);
  return item;
}
