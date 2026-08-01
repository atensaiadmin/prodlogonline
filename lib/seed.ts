import { v4 as uuidv4 } from "uuid";
import fs from "fs";
import path from "path";

const DB_PATH = path.join(process.cwd(), "prodlog.json");
const now = new Date().toISOString();

const ideas = [
  {
    id: uuidv4(),
    title: "AI-powered recipe generator",
    one_liner: "Generate recipes from photos of ingredients in your fridge",
    stage: "inbox",
    conviction: 6,
    tags: ["ai", "consumer", "food"],
    created_at: now,
    updated_at: now,
  },
  {
    id: uuidv4(),
    title: "Freelancer contract template marketplace",
    one_liner: "Buy/sell legally-reviewed contract templates for freelancers",
    stage: "validating",
    conviction: 7,
    tags: ["marketplace", "legal", "freelance"],
    created_at: now,
    updated_at: now,
  },
  {
    id: uuidv4(),
    title: "SaaS usage analytics dashboard",
    one_liner: "Simple dashboard that shows MRR, churn, and feature usage",
    stage: "building",
    conviction: 9,
    tags: ["saas", "analytics"],
    created_at: now,
    updated_at: now,
  },
  {
    id: uuidv4(),
    title: "Product hunt for indie makers",
    one_liner: "Daily curated list of indie maker products",
    stage: "launched",
    conviction: 6,
    tags: ["community", "curation"],
    created_at: now,
    updated_at: now,
  },
  {
    id: uuidv4(),
    title: "Blockchain for supply chain tracking",
    one_liner: "Track goods through supply chain on a public ledger",
    stage: "dead",
    conviction: 2,
    tags: ["blockchain", "enterprise"],
    created_at: now,
    updated_at: now,
  },
];

const buildingIdea = ideas[2];
const entries = [
  {
    id: uuidv4(),
    idea_id: buildingIdea.id,
    body: "Set up Next.js project with Tailwind. Basic dashboard layout working with mock data.",
    mood: "excited",
    action_taken: "scaffolded project",
    created_at: now,
  },
  {
    id: uuidv4(),
    idea_id: buildingIdea.id,
    body: "Integrated Stripe for subscriptions. Webhook handling is more complex than expected.",
    mood: "frustrated",
    action_taken: "integrated Stripe",
    created_at: now,
  },
  {
    id: uuidv4(),
    idea_id: buildingIdea.id,
    body: "Stripe webhooks now working. Got first beta user to sign up. Need to prioritize the chart components next.",
    mood: "hopeful",
    action_taken: "fixed webhooks, got beta user",
    created_at: now,
  },
];

fs.writeFileSync(
  DB_PATH,
  JSON.stringify({ ideas, entries }, null, 2)
);

console.log(`Seeded ${ideas.length} ideas and ${entries.length} entries`);
