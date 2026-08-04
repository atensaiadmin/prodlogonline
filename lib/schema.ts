export type Stage = "inbox" | "validating" | "building" | "launched" | "dead";
export type Mood = "excited" | "unsure" | "frustrated" | "neutral" | "hopeful";
export type VisibilityLevel = "private" | "links" | "docs" | "summary" | "full";
export type IdeaType = "app" | "paper" | "research" | "writing" | "other";

export type AddonCategory =
  | "hosting"
  | "database"
  | "auth"
  | "storage"
  | "analytics"
  | "email"
  | "payments"
  | "monitoring"
  | "ci_cd"
  | "domains"
  | "ai"
  | "other";

export interface Links {
  repo?: string;
  deploy?: string;
  docs?: string;
}

export interface Idea {
  id: string;
  title: string;
  one_liner: string;
  stage: Stage;
  idea_type: IdeaType;
  conviction: number;
  tags: string[];
  links: Links;
  visibility: VisibilityLevel;
  created_at: string;
  updated_at: string;
}

export interface Entry {
  id: string;
  idea_id: string;
  body: string;
  mood: Mood | null;
  action_taken: string;
  created_at: string;
}

export interface Addon {
  id: string;
  idea_id: string;
  name: string;
  category: AddonCategory;
  account_label: string;
  url: string;
  notes: string;
  visible: boolean;
  created_at: string;
}

export interface ShareProfile {
  id: string;
  name: string;
  slug: string;
  description: string;
  created_at: string;
  updated_at: string;
}

export interface ShareProfileIdea {
  profile_id: string;
  idea_id: string;
}

export interface IdeaWithEntries extends Idea {
  entries: Entry[];
  entry_count: number;
  addons: Addon[];
}

export interface SharedIdea {
  idea: Idea;
  addons: Addon[];
  entries: Entry[];
}

export const STAGES: { key: Stage; label: string; color: string }[] = [
  { key: "inbox", label: "Inbox", color: "bg-indigo-500" },
  { key: "validating", label: "Validating", color: "bg-amber-500" },
  { key: "building", label: "Building", color: "bg-emerald-500" },
  { key: "launched", label: "Launched", color: "bg-cyan-500" },
  { key: "dead", label: "Dead", color: "bg-gray-500" },
];

export const MOODS: { key: Mood; label: string }[] = [
  { key: "excited", label: "Excited" },
  { key: "hopeful", label: "Hopeful" },
  { key: "neutral", label: "Neutral" },
  { key: "unsure", label: "Unsure" },
  { key: "frustrated", label: "Frustrated" },
];

export const ADDON_CATEGORIES: { key: AddonCategory; label: string; icon: string }[] = [
  { key: "hosting", label: "Hosting", icon: "" },
  { key: "database", label: "Database", icon: "" },
  { key: "auth", label: "Auth", icon: "" },
  { key: "storage", label: "Storage", icon: "" },
  { key: "analytics", label: "Analytics", icon: "" },
  { key: "email", label: "Email", icon: "" },
  { key: "payments", label: "Payments", icon: "" },
  { key: "monitoring", label: "Monitoring", icon: "" },
  { key: "ci_cd", label: "CI/CD", icon: "" },
  { key: "domains", label: "Domains", icon: "" },
  { key: "ai", label: "AI / LLM", icon: "" },
  { key: "other", label: "Other", icon: "" },
];

export const VISIBILITY_LEVELS: {
  key: VisibilityLevel;
  label: string;
  description: string;
}[] = [
  { key: "private", label: "Private", description: "Nothing shared" },
  { key: "links", label: "Links only", description: "Repo, deploy, docs links" },
  { key: "docs", label: "Docs only", description: "Only the docs link" },
  { key: "summary", label: "Summary", description: "Title, one-liner, stage, tags" },
  { key: "full", label: "Full", description: "Everything including entries & addons" },
];

export interface IdeaTypeDef {
  key: IdeaType;
  label: string;
  icon: string;
  links: { repo: string; deploy: string; docs: string };
}

export const IDEA_TYPES: IdeaTypeDef[] = [
  {
    key: "app",
    label: "App",
    icon: "",
    links: { repo: "Repo", deploy: "Deploy", docs: "Docs" },
  },
  {
    key: "paper",
    label: "Paper",
    icon: "",
    links: { repo: "DOI", deploy: "Preprint", docs: "Journal" },
  },
  {
    key: "research",
    label: "Research",
    icon: "",
    links: { repo: "Data", deploy: "Site", docs: "Paper" },
  },
  {
    key: "writing",
    label: "Writing",
    icon: "",
    links: { repo: "Source", deploy: "Published", docs: "Notes" },
  },
  {
    key: "other",
    label: "Other",
    icon: "",
    links: { repo: "Link 1", deploy: "Link 2", docs: "Link 3" },
  },
];
