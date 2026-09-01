import { WritingPrompt } from "./types";

export const C1_WRITING_PROMPTS: WritingPrompt[] = [
  {
    id: "wri_memo_01",
    category: "EXECUTIVE_MEMO",
    title: "Executive Memo: Architectural Modernization & Risk Governance",
    genre: "Executive Memorandum",
    scenario:
      "Draft a formal executive memorandum to the Chief Technology Officer outlining why our core monolith must undergo modular domain decomposition. Address operational risks, release cadence, and scalability trade-offs.",
    targetAudience: "Chief Technology Officer & Engineering Leadership Council",
    guidelines: [
      "State the strategic objective in the opening paragraph with formal executive tone.",
      "Explain how modernizing architecture is of paramount importance to business continuity.",
      "Acknowledge migration risks and detail how your team will mitigate database regressions.",
      "Use formal connectors such as 'in light of', 'furthermore', and 'notwithstanding'.",
    ],
    mandatoryTargetConcepts: ["mitigate", "bear in mind", "paramount"],
    recommendedConnectors: ["notwithstanding", "in light of", "furthermore"],
    minWords: 60,
    maxWords: 200,
    modelC1Response:
      "In light of recent platform scalability bottlenecks, modernizing our monolithic codebase is of paramount importance. Notwithstanding initial migration overhead, decomposing services into domain boundaries will decisively mitigate long-term systemic risks. Furthermore, we must bear in mind that maintaining developer velocity requires modular test isolation.",
    translationEs: "Redactar un memorando ejecutivo formal sobre modernización arquitectónica y mitigación de riesgos.",
  },
  {
    id: "wri_prop_01",
    category: "PERSUASIVE_PROPOSAL",
    title: "Business Case: Upgrading to Real-Time Event-Driven Architecture",
    genre: "Persuasive Business Case",
    scenario:
      "Write a structured business proposal justifying a budget allocation for transitioning from legacy batch ETL processing to real-time Apache Kafka event streaming.",
    targetAudience: "VP of Product & Capital Allocation Committee",
    guidelines: [
      "Articulate how real-time latency bridges the gap between customer expectations and backend processing.",
      "Highlight how real-time event infrastructure plays a pivotal role in quarterly revenue growth.",
      "Demonstrate why the proposed 3-month timeline is fully feasible with existing team capacity.",
      "Maintain a persuasive, data-backed formal register.",
    ],
    mandatoryTargetConcepts: ["bridge the gap", "play a pivotal role", "feasible"],
    recommendedConnectors: ["consequently", "whereas", "in addition"],
    minWords: 60,
    maxWords: 200,
    modelC1Response:
      "Transitioning to an event-driven architecture will directly bridge the gap between user demand and data availability. Real-time telemetry plays a pivotal role in fraud detection and conversion optimization. Consequently, investing in this upgrade is fully feasible within our current capital expenditure allocation.",
    translationEs: "Elaborar una propuesta persuasiva para actualizar la infraestructura a procesamiento de eventos en tiempo real.",
  },
  {
    id: "wri_post_01",
    category: "TECHNICAL_POST_MORTEM",
    title: "Incident Post-Mortem: Distributed Locking Deadlock Resolution",
    genre: "Technical Root Cause Analysis",
    scenario:
      "Compose a formal incident report detailing a high-severity production outage caused by distributed Redis lock starvation during peak throughput.",
    targetAudience: "Enterprise Clients & System Reliability Committee",
    guidelines: [
      "Describe how the incident response engineers figured out the root cause under tight SLAs.",
      "Explain the remediation procedures carried out to restore service integrity.",
      "Shed light on preventative measures instituted to eliminate recurrence.",
      "Use objective, transparent, and authoritative technical prose.",
    ],
    mandatoryTargetConcepts: ["figure out", "carry out", "shed light on"],
    recommendedConnectors: ["subsequently", "in light of", "conversely"],
    minWords: 60,
    maxWords: 200,
    modelC1Response:
      "Following the latency spike at 14:00 UTC, our incident engineers quickly figured out that expired distributed locks triggered connection starvation. In light of telemetry logs, we immediately carried out a safe rollback and rate-limiting safeguard. This thorough investigation sheds light on necessary connection pooling optimizations.",
    translationEs: "Redactar un post-mortem técnico formal explicando el análisis de causa raíz y remediación de un incidente crítico.",
  },
  {
    id: "wri_essay_01",
    category: "ARGUMENTATIVE_ESSAY",
    title: "Position Paper: Generative AI in Professional Software Engineering",
    genre: "Argumentative Position Essay",
    scenario:
      "Write a critical, balanced position paper evaluating whether AI code generation enhances engineering velocity or degrades architectural rigor.",
    targetAudience: "Engineering Community & Academic Review Board",
    guidelines: [
      "Synthesize both perspectives into a cohesive thesis statement.",
      "Argue why the question boils down to verification discipline and architectural stewardship.",
      "Touch upon the implications for junior engineer mentorship and code quality standards.",
      "Conclude with a framework for how organizations can reach a consensus on AI governance.",
    ],
    mandatoryTargetConcepts: ["boil down to", "touch upon", "reach a consensus"],
    recommendedConnectors: ["nevertheless", "while", "on the contrary"],
    minWords: 60,
    maxWords: 220,
    modelC1Response:
      "The debate surrounding AI code synthesis essentially boils down to whether automated generation compromises long-term code maintainability. While AI dramatically accelerates boilerplate implementation, we must touch upon the risks of unverified dependencies. Ultimately, engineering organizations must reach a consensus on strict code review guidelines.",
    translationEs: "Escribir un ensayo argumentativo equilibrado sobre el impacto de la IA en la ingeniería de software.",
  },
];
