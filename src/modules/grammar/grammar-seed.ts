import { GrammarTransformationExercise, GrammarErrorIdentificationExercise } from "./types";

export const C1_GRAMMAR_TRANSFORMATIONS: GrammarTransformationExercise[] = [
  {
    id: "gt_inv_01",
    category: "INVERSION",
    title: "Negative Inversion with 'Rarely'",
    baseSentence: "I have rarely witnessed such exceptional dedication from a team.",
    promptLead: "Rarely",
    targetExpectedSentence: "Rarely have I witnessed such exceptional dedication from a team.",
    acceptableVariations: [
      "rarely have i witnessed such exceptional dedication from a team",
      "rarely have i seen such exceptional dedication from a team",
    ],
    keyPhrase: "have I witnessed",
    dimension: "PRODUCTION",
    explanation:
      "When negative or limiting adverbs (rarely, seldom, scarcely, barely) begin a clause for emphasis, the auxiliary verb precedes the subject.",
    translationEs: "Raras veces he presenciado una dedicación tan excepcional de un equipo.",
    hint: "Place the auxiliary verb 'have' immediately after 'Rarely', followed by the subject 'I'.",
  },
  {
    id: "gt_inv_02",
    category: "INVERSION",
    title: "Emphatic Inversion with 'Under no circumstances'",
    baseSentence: "You must not disclose confidential client credentials under any circumstances.",
    promptLead: "Under no circumstances",
    targetExpectedSentence: "Under no circumstances must you disclose confidential client credentials.",
    acceptableVariations: [
      "under no circumstances must you disclose confidential client credentials",
      "under no circumstances should you disclose confidential client credentials",
    ],
    keyPhrase: "must you disclose",
    dimension: "PRODUCTION",
    explanation:
      "Prepositional phrases with negative meaning at the head of a sentence trigger full subject-auxiliary inversion.",
    translationEs: "Bajo ninguna circunstancia debes divulgar credenciales confidenciales de clientes.",
    hint: "Use 'must you disclose' directly after 'Under no circumstances'.",
  },
  {
    id: "gt_cond_01",
    category: "MIXED_CONDITIONALS",
    title: "Mixed Conditional: Past Action ➔ Present State",
    baseSentence: "I didn't take the senior architect role last year, so I am not living in Munich now.",
    promptLead: "If I had taken",
    targetExpectedSentence: "If I had taken the senior architect role last year, I would be living in Munich now.",
    acceptableVariations: [
      "if i had taken the senior architect role last year, i would be living in munich now",
      "if i had taken the senior architect role last year i would be living in munich now",
    ],
    keyPhrase: "would be living",
    dimension: "PRODUCTION",
    explanation:
      "Combines a 3rd conditional if-clause (past counterfactual: 'had taken') with a 2nd conditional main clause (present counterfactual result: 'would be living').",
    translationEs: "Si hubiera tomado el puesto de arquitecto senior el año pasado, estaría viviendo en Múnich ahora.",
    hint: "Use past perfect in the if-clause ('had taken') and present conditional continuous in the main clause ('would be living').",
  },
  {
    id: "gt_cleft_01",
    category: "CLEFT_SENTENCES",
    title: "Wh- Cleft for Information Focus",
    baseSentence: "The speed of the cloud database migration surprised the entire executive team.",
    promptLead: "What surprised the entire executive team was",
    targetExpectedSentence: "What surprised the entire executive team was the speed of the cloud database migration.",
    acceptableVariations: [
      "what surprised the entire executive team was the speed of the cloud database migration",
    ],
    keyPhrase: "the speed of the cloud database migration",
    dimension: "PRODUCTION",
    explanation:
      "Wh-cleft sentences isolate and foreground the new or most significant piece of information at the end of the sentence.",
    translationEs: "Lo que sorprendió a todo el equipo ejecutivo fue la velocidad de la migración de la base de datos.",
    hint: "Follow the 'What... was' construction by stating the focused subject.",
  },
  {
    id: "gt_subj_01",
    category: "SUBJUNCTIVE_MODALS",
    title: "Formal Mandative Subjunctive",
    baseSentence: "The compliance officer insists that every engineer adheres to the new code security protocol.",
    promptLead: "The compliance officer insists that every engineer",
    targetExpectedSentence: "The compliance officer insists that every engineer adhere to the new code security protocol.",
    acceptableVariations: [
      "the compliance officer insists that every engineer adhere to the new code security protocol",
    ],
    keyPhrase: "adhere to",
    dimension: "PRODUCTION",
    explanation:
      "In formal C1 English, verbs of demand, insistence, and recommendation (insist, require, recommend, demand) take the base form of the verb (subjunctive) regardless of third-person singular.",
    translationEs: "El oficial de cumplimiento insiste en que cada ingeniero cumpla con el nuevo protocolo.",
    hint: "Use the base infinitive form 'adhere' without the third-person '-s'.",
  },
  {
    id: "gt_part_01",
    category: "PARTICIPLE_CLAUSES",
    title: "Perfect Participle Clause for Chronology",
    baseSentence: "After the development team completed the comprehensive performance benchmarks, they deployed the release.",
    promptLead: "Having completed",
    targetExpectedSentence: "Having completed the comprehensive performance benchmarks, the development team deployed the release.",
    acceptableVariations: [
      "having completed the comprehensive performance benchmarks, the development team deployed the release",
      "having completed the comprehensive performance benchmarks the development team deployed the release",
    ],
    keyPhrase: "Having completed",
    dimension: "PRODUCTION",
    explanation:
      "Perfect participle clauses ('Having + past participle') concisely express an action that took place prior to the main clause action.",
    translationEs: "Habiendo completado las pruebas de rendimiento, el equipo desplegó la versión.",
    hint: "Start with 'Having completed...' and follow with the subject in the main clause.",
  },
];

export const C1_GRAMMAR_ERRORS: GrammarErrorIdentificationExercise[] = [
  {
    id: "ge_inv_01",
    category: "INVERSION",
    title: "Incorrect Word Order in Negative Inversion",
    erroneousSentence: "Seldom we have observed such rapid adoption of a new framework.",
    errorFragment: "we have observed",
    correctedSentence: "Seldom have we observed such rapid adoption of a new framework.",
    acceptableCorrections: [
      "seldom have we observed such rapid adoption of a new framework",
      "have we observed",
    ],
    dimension: "RECALL",
    explanation:
      "Negative adverbs like 'Seldom' require auxiliary verb inversion ('have we observed', not 'we have observed').",
    translationEs: "Raras veces hemos observado una adopción tan rápida de un nuevo framework.",
    hint: "Invert the subject and auxiliary verb after 'Seldom'.",
  },
  {
    id: "ge_subj_01",
    category: "SUBJUNCTIVE_MODALS",
    title: "Superfluous Third-Person '-s' in Mandative Subjunctive",
    erroneousSentence: "It is crucial that each project manager conducts a risk assessment prior to launch.",
    errorFragment: "conducts",
    correctedSentence: "It is crucial that each project manager conduct a risk assessment prior to launch.",
    acceptableCorrections: [
      "it is crucial that each project manager conduct a risk assessment prior to launch",
      "conduct",
    ],
    dimension: "RECALL",
    explanation:
      "Clauses following 'It is crucial / essential / imperative that...' require the bare subjunctive form ('conduct', not 'conducts').",
    translationEs: "Es crucial que cada director de proyecto realice una evaluación de riesgos.",
    hint: "Change the verb form to the bare infinitive (remove the '-s').",
  },
  {
    id: "ge_cond_01",
    category: "MIXED_CONDITIONALS",
    title: "Mismatched Tense in Mixed Conditional",
    erroneousSentence: "If we would have anticipated the server traffic spike, the system wouldn't be down today.",
    errorFragment: "would have anticipated",
    correctedSentence: "If we had anticipated the server traffic spike, the system wouldn't be down today.",
    acceptableCorrections: [
      "if we had anticipated the server traffic spike, the system wouldn't be down today",
      "had anticipated",
    ],
    dimension: "RECALL",
    explanation:
      "In standard English conditional if-clauses, never use 'would have'; use the past perfect 'had anticipated'.",
    translationEs: "Si hubiéramos anticipado el pico de tráfico, el sistema no estaría caído hoy.",
    hint: "Replace 'would have anticipated' with the past perfect in the if-clause.",
  },
];
