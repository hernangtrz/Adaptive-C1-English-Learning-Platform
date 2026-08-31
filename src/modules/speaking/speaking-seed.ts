import { SpeakingPrompt } from "./types";

export const C1_SPEAKING_PROMPTS: SpeakingPrompt[] = [
  {
    id: "spk_exec_01",
    category: "EXECUTIVE_DECISION",
    title: "Strategic Postponement of Major Release",
    role: "Head of Engineering addressing the Executive Committee",
    scenario:
      "A critical product release is scheduled for next Monday, but your latest performance benchmarks revealed severe database contention. Explain why the release must be deferred by two weeks.",
    guidingQuestions: [
      "What is the fundamental trade-off between speed to market and system stability?",
      "How does postponing mitigate long-term reputational risk?",
      "What concrete remediation steps will your team execute during the deferral period?",
    ],
    mandatoryTargetConcepts: ["mitigate", "bear in mind", "boil down to"],
    recommendedStructures: [
      "Wh-cleft: 'What we must bear in mind is...'",
      "Inversion: 'Under no circumstances should we deploy without...'",
    ],
    timeLimitSeconds: 120,
    modelC1Response:
      "What we must bear in mind is that rushing this deployment would jeopardize our platform integrity. It essentially boils down to whether we prioritize short-term milestones over customer trust. By deferring the launch by two weeks, we can decisively mitigate these compliance and database bottlenecks.",
    translationEs: "Explicar por qué es necesario posponer un lanzamiento importante para mitigar riesgos técnicos.",
  },
  {
    id: "spk_deb_01",
    category: "DEBATE_DISAGREEMENT",
    title: "Nuanced Disagreement on Mandatory In-Office Policy",
    role: "Engineering Director in a Senior Leadership Forum",
    scenario:
      "The COO has proposed a rigid five-day in-office mandate to improve collaboration. Present a structured, diplomatic counter-argument advocating for asynchronous flexibility while maintaining high engineering velocity.",
    guidingQuestions: [
      "How do you concede the value of face-to-face interaction while challenging rigid mandates?",
      "What data or metrics shed light on distributed engineering productivity?",
      "How can the leadership team reach a consensus on hybrid core collaboration days?",
    ],
    mandatoryTargetConcepts: ["play a pivotal role", "shed light on", "reach a consensus"],
    recommendedStructures: [
      "Concession clause: 'While I concede that co-location can play a pivotal role...'",
      "Negative inversion: 'Rarely does a one-size-fits-all policy...'",
    ],
    timeLimitSeconds: 120,
    modelC1Response:
      "While I concede that in-person collaboration can play a pivotal role during initial ideation, our quarterly throughput metrics shed light on the advantages of asynchronous focus. I propose we reach a consensus on designated collaborative synchronization days rather than enforcing a rigid blanket mandate.",
    translationEs: "Presentar un contraargumento diplomático y estructurado frente a una política estricta de presencialidad.",
  },
  {
    id: "spk_pitch_01",
    category: "STRATEGIC_PITCH",
    title: "Pitching Automated AI Testing Infrastructure",
    role: "Lead Systems Architect pitching to the Chief Technology Officer",
    scenario:
      "You want approval and budget for an automated AI test-generation framework that reduces regression cycles by 60%. Deliver a persuasive 90-second executive pitch.",
    guidingQuestions: [
      "Why is automated test generation of paramount importance to release velocity?",
      "How does this initiative bridge the gap between engineering speed and reliability?",
      "Why is this proposal immediately feasible given current team capacity?",
    ],
    mandatoryTargetConcepts: ["paramount", "bridge the gap", "feasible"],
    recommendedStructures: [
      "Emphatic cleft: 'It is precisely this initiative that will bridge the gap...'",
      "Formal subjunctive: 'It is imperative that our engineering pipeline be modernized...'",
    ],
    timeLimitSeconds: 90,
    modelC1Response:
      "Maintaining release velocity without sacrificing quality is of paramount importance to our competitive advantage. This framework will directly bridge the gap between developer velocity and test reliability. Our proof-of-concept proves that the migration is fully feasible within the current sprint cycle.",
    translationEs: "Presentar una propuesta ejecutiva convincente para modernizar la infraestructura de pruebas con IA.",
  },
  {
    id: "spk_narr_01",
    category: "PROBLEM_SOLVING_NARRATIVE",
    title: "Spontaneous Problem-Solving: High-Severity Incident",
    role: "Incident Response Commander conducting a post-mortem debrief",
    scenario:
      "Narrate how your team diagnosed and resolved a catastrophic database latency spike during Black Friday peak traffic.",
    guidingQuestions: [
      "How did your team figure out the root cause under intense time pressure?",
      "What remediation tasks did you carry out immediately?",
      "What architectural weaknesses did this incident touch upon for future planning?",
    ],
    mandatoryTargetConcepts: ["figure out", "carry out", "touch upon"],
    recommendedStructures: [
      "Participle clause: 'Having identified the deadlock, we proceeded to...'",
      "Mixed conditional: 'If we had not carried out the hotfix, the service would be...'",
    ],
    timeLimitSeconds: 120,
    modelC1Response:
      "Under immense pressure, we had to quickly figure out why the replica database was lagging behind primary transactions. We immediately decided to carry out a safe traffic shed while our senior engineers resolved the locking contention. This incident touched upon critical scalability limitations that we are now permanently rearchitecting.",
    translationEs: "Narrar cómo tu equipo diagnosticó y resolvió un incidente técnico de alta severidad.",
  },
];
