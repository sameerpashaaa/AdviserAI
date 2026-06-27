export type AgentStatus = "idle" | "thinking" | "done" | "error";

export interface Agent {
  id: string;
  name: string;
  icon: string;
  description: string;
  status: AgentStatus;
}

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  agents?: Agent[];
  type?: "chat" | "analysis" | "report";
}

export interface SWOTData {
  strengths: string[];
  weaknesses: string[];
  opportunities: string[];
  threats: string[];
}

export interface PESTLEData {
  political: string[];
  economic: string[];
  social: string[];
  technological: string[];
  legal: string[];
  environmental: string[];
}

export interface ValidationScore {
  dimension: string;
  score: number;
  rationale: string;
  keyQuestion: string;
}

export interface ValidationResult {
  scores: ValidationScore[];
  overallScore: number;
  verdict: "STRONG PROCEED" | "PROCEED WITH CAUTION" | "PIVOT RECOMMENDED" | "DO NOT PROCEED";
  strengths: string[];
  weaknesses: string[];
  nextSteps: string[];
  tam?: string;
  sam?: string;
  som?: string;
}

export interface TrendItem {
  name: string;
  category: string;
  status: "Emerging" | "Growing" | "Mainstream" | "Declining";
  velocity: number;
  timeToMainstream: string;
  signals: string[];
  opportunities: string[];
  impact: string;
}

export interface ResearchSession {
  id: string;
  title: string;
  query: string;
  result: string;
  timestamp: Date;
  type: "research" | "strategy" | "validation" | "trends" | "career" | "adviser";
}

export interface CareerPath {
  title: string;
  timeline: string;
  salaryRange: string;
  demandScore: number;
  automationRisk: "Low" | "Medium" | "High";
  requiredSkills: string[];
  skillGaps: string[];
  topActions: string[];
}

export const AGENTS: Agent[] = [
  { id: "chief", name: "Chief Adviser", icon: "🎯", description: "Master orchestrator & synthesizer", status: "idle" },
  { id: "research", name: "Research Agent", icon: "🔬", description: "Deep information retrieval", status: "idle" },
  { id: "market", name: "Market Intelligence", icon: "📊", description: "Market analysis & competitive intel", status: "idle" },
  { id: "trend", name: "Trend Analysis", icon: "📈", description: "Emerging trend detection", status: "idle" },
  { id: "finance", name: "Financial Analyst", icon: "💰", description: "Financial modeling & projections", status: "idle" },
  { id: "startup", name: "Startup Consultant", icon: "🚀", description: "Startup strategy & validation", status: "idle" },
  { id: "tech", name: "Tech Architect", icon: "🏗️", description: "Technology strategy & architecture", status: "idle" },
  { id: "risk", name: "Risk Assessment", icon: "⚠️", description: "Strategic risk identification", status: "idle" },
  { id: "report", name: "Report Generator", icon: "📋", description: "Professional document creation", status: "idle" },
  { id: "verify", name: "Fact Verifier", icon: "✅", description: "Quality assurance & truth validation", status: "idle" },
];
