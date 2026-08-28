import { ConceptType, CEFRLevel } from "@prisma/client";

export interface SeedConcept {
  type: ConceptType;
  canonicalForm: string;
  meaning: string;
  translationEs: string;
  cefrLevel: CEFRLevel;
  explanation: string;
  phonetics?: string;
  tags: string[];
  examples: Array<{
    sentence: string;
    translationEs: string;
    context: string;
  }>;
}

export const SEED_CONCEPTS: SeedConcept[] = [
  // -------------------------------------------------------------
  // PHRASAL VERBS
  // -------------------------------------------------------------
  {
    type: "PHRASAL_VERB",
    canonicalForm: "figure out",
    meaning: "To understand or solve something after thinking carefully about it.",
    translationEs: "averiguar / resolver / descifrar",
    cefrLevel: "B2",
    explanation: "Widely used in conversational and professional English when dealing with complex problems or ambiguous situations.",
    phonetics: "/ˈfɪɡ.jɚ aʊt/",
    tags: ["problem-solving", "daily-conversation", "workplace"],
    examples: [
      {
        sentence: "It took us several hours to figure out why the deployment failed.",
        translationEs: "Nos tomó varias horas averiguar por qué falló el despliegue.",
        context: "Software engineering troubleshooting",
      },
      {
        sentence: "I can't figure out how to operate this new espresso machine.",
        translationEs: "No logro descifrar cómo operar esta nueva máquina de espresso.",
        context: "Everyday life",
      },
    ],
  },
  {
    type: "PHRASAL_VERB",
    canonicalForm: "carry out",
    meaning: "To perform, execute, or complete a task, research, or instruction.",
    translationEs: "llevar a cabo / realizar / ejecutar",
    cefrLevel: "B2",
    explanation: "Standard formal and academic phrasal verb. Often paired with 'research', 'experiment', 'survey', or 'investigation'.",
    phonetics: "/ˈkær.i aʊt/",
    tags: ["academic", "business", "execution"],
    examples: [
      {
        sentence: "The research team will carry out a comprehensive clinical trial next month.",
        translationEs: "El equipo de investigación llevará a cabo un ensayo clínico exhaustivo el próximo mes.",
        context: "Scientific research",
      },
      {
        sentence: "Employees are expected to carry out instructions with diligence.",
        translationEs: "Se espera que los empleados ejecuten las instrucciones con diligencia.",
        context: "Workplace compliance",
      },
    ],
  },
  {
    type: "PHRASAL_VERB",
    canonicalForm: "come up with",
    meaning: "To suggest, invent, or produce an idea, solution, or sum of money.",
    translationEs: "proponer / idear / ocurrírsele",
    cefrLevel: "B2",
    explanation: "Crucial three-part phrasal verb used when generating creative strategies or tackling resource shortages.",
    phonetics: "/kʌm ʌp wɪð/",
    tags: ["creativity", "brainstorming", "business"],
    examples: [
      {
        sentence: "She came up with an ingenious workaround to the scalability problem.",
        translationEs: "A ella se le ocurrió una solución ingeniosa al problema de escalabilidad.",
        context: "Product design meeting",
      },
    ],
  },
  {
    type: "PHRASAL_VERB",
    canonicalForm: "boil down to",
    meaning: "If a situation or problem boils down to something, that is the most essential or fundamental point.",
    translationEs: "reducirse a / resumirse en / ser en el fondo",
    cefrLevel: "C1",
    explanation: "Sophisticated expression for cutting through nuance to identify the root cause or core argument.",
    phonetics: "/bɔɪl daʊn tuː/",
    tags: ["analysis", "argumentation", "c1-active"],
    examples: [
      {
        sentence: "The entire debate essentially boils down to cost versus long-term sustainability.",
        translationEs: "Todo el debate se reduce esencialmente al costo frente a la sostenibilidad a largo plazo.",
        context: "Executive board discussion",
      },
    ],
  },
  {
    type: "PHRASAL_VERB",
    canonicalForm: "touch upon",
    meaning: "To mention or discuss a topic briefly during a conversation or presentation.",
    translationEs: "tocar de paso / mencionar brevemente",
    cefrLevel: "C1",
    explanation: "Polite and precise presentation verb. Used when setting agendas or summarizing broad topics.",
    phonetics: "/tʌtʃ əˈpɒn/",
    tags: ["presentations", "meetings", "academic"],
    examples: [
      {
        sentence: "We touched upon the quarterly projections during the opening remarks.",
        translationEs: "Tocamos de paso las proyecciones trimestrales durante las observaciones iniciales.",
        context: "Business briefing",
      },
    ],
  },
  {
    type: "PHRASAL_VERB",
    canonicalForm: "rule out",
    meaning: "To exclude or decide that something is impossible or not suitable.",
    translationEs: "descartar / excluir",
    cefrLevel: "B2",
    explanation: "Used frequently in decision making, diagnostics, and investigative reports.",
    phonetics: "/ruːl aʊt/",
    tags: ["decision-making", "analysis"],
    examples: [
      {
        sentence: "We cannot rule out the possibility of further market volatility.",
        translationEs: "No podemos descartar la posibilidad de mayor volatilidad en el mercado.",
        context: "Financial analysis",
      },
    ],
  },

  // -------------------------------------------------------------
  // COLLOCATIONS
  // -------------------------------------------------------------
  {
    type: "COLLOCATION",
    canonicalForm: "play a pivotal role",
    meaning: "To have a central, decisive, and critical importance in the outcome of something.",
    translationEs: "desempeñar un papel fundamental / clave",
    cefrLevel: "C1",
    explanation: "Elevated C1 alternative to 'play an important part' or 'be very important'.",
    tags: ["business", "academic", "leadership"],
    examples: [
      {
        sentence: "Early childhood education plays a pivotal role in lifelong cognitive development.",
        translationEs: "La educación infantil temprana desempeña un papel fundamental en el desarrollo cognitivo de por vida.",
        context: "Academic essay",
      },
      {
        sentence: "Customer feedback played a pivotal role in refining our roadmap.",
        translationEs: "Los comentarios de los clientes jugaron un papel clave en perfeccionar nuestra hoja de ruta.",
        context: "Product strategy",
      },
    ],
  },
  {
    type: "COLLOCATION",
    canonicalForm: "bear in mind",
    meaning: "To remember or take something into consideration when evaluating a situation.",
    translationEs: "tener en cuenta / tener presente",
    cefrLevel: "B2",
    explanation: "Common transitional phrase used to highlight important caveats or contextual constraints.",
    tags: ["conversation", "advice", "decision-making"],
    examples: [
      {
        sentence: "Bear in mind that the deadline is non-negotiable due to regulatory requirements.",
        translationEs: "Ten presente que la fecha límite no es negociable debido a requisitos regulatorios.",
        context: "Project management directive",
      },
    ],
  },
  {
    type: "COLLOCATION",
    canonicalForm: "bridge the gap",
    meaning: "To connect two distinct things or reduce the difference between two groups or ideas.",
    translationEs: "acortar la brecha / cerrar la distancia",
    cefrLevel: "C1",
    explanation: "Vivid metaphorical collocation frequent in discussions on education, technology, and social policy.",
    tags: ["metaphor", "policy", "societal-discussion"],
    examples: [
      {
        sentence: "The new mentorship program aims to bridge the gap between academic theory and industry practice.",
        translationEs: "El nuevo programa de mentoría busca acortar la brecha entre la teoría académica y la práctica de la industria.",
        context: "University initiative",
      },
    ],
  },
  {
    type: "COLLOCATION",
    canonicalForm: "spark a debate",
    meaning: "To trigger or provoke lively and intense public or academic discussion.",
    translationEs: "suscitar un debate / desatar una polémica",
    cefrLevel: "C1",
    explanation: "More evocative than 'start a conversation' or 'cause a discussion'.",
    tags: ["journalism", "public-discourse", "c1-active"],
    examples: [
      {
        sentence: "The release of the automated system sparked a fierce debate over ethical standards.",
        translationEs: "El lanzamiento del sistema automatizado desató un intenso debate sobre normas éticas.",
        context: "Technology news editorial",
      },
    ],
  },
  {
    type: "COLLOCATION",
    canonicalForm: "shed light on",
    meaning: "To clarify, explain, or reveal information that helps people understand a complicated matter.",
    translationEs: "arrojar luz sobre / esclarecer",
    cefrLevel: "C1",
    explanation: "High-frequency academic and analytical collocation for discoveries and revelations.",
    tags: ["academic", "research", "clarification"],
    examples: [
      {
        sentence: "Recent archaeological findings have shed light on early trading routes across the continent.",
        translationEs: "Hallazgos arqueológicos recientes han arrojado luz sobre las primeras rutas comerciales por el continente.",
        context: "Historical analysis",
      },
    ],
  },
  {
    type: "COLLOCATION",
    canonicalForm: "reach a consensus",
    meaning: "To arrive at an agreement that is collectively accepted by all members of a group.",
    translationEs: "llegar a un consenso / alcanzar un acuerdo",
    cefrLevel: "B2",
    explanation: "Professional business collocation for collaborative decisions.",
    tags: ["negotiation", "meetings", "management"],
    examples: [
      {
        sentence: "After hours of deliberation, the board finally reached a consensus on the merger terms.",
        translationEs: "Tras horas de deliberación, la junta finalmente llegó a un consenso sobre los términos de la fusión.",
        context: "Corporate governance",
      },
    ],
  },

  // -------------------------------------------------------------
  // ADVANCED VOCABULARY & NUANCE
  // -------------------------------------------------------------
  {
    type: "VOCABULARY",
    canonicalForm: "eventually",
    meaning: "In the end, especially after a long time or a lot of effort, problems, or delay.",
    translationEs: "con el tiempo / al final / finalmente (no confundir con 'eventualmente')",
    cefrLevel: "B2",
    explanation: "Crucial false friend for Spanish speakers (Spanish 'eventualmente' means occasionally/by chance, whereas English 'eventually' means in the end/ultimately).",
    phonetics: "/ɪˈven.tʃu.ə.li/",
    tags: ["false-friends", "fluency", "core-b2"],
    examples: [
      {
        sentence: "Though we faced numerous bottlenecks, the prototype eventually worked flawlessly.",
        translationEs: "Aunque enfrentamos numerosos cuellos de botella, el prototipo al final funcionó a la perfección.",
        context: "Engineering milestone",
      },
    ],
  },
  {
    type: "VOCABULARY",
    canonicalForm: "paramount",
    meaning: "More important than anything else; supreme in significance.",
    translationEs: "primordial / de suma importancia / fundamental",
    cefrLevel: "C1",
    explanation: "Formal C1 adjective used to emphasize that something is the top priority.",
    phonetics: "/ˈpær.ə.maʊnt/",
    tags: ["formal", "persuasion", "c1-active"],
    examples: [
      {
        sentence: "Maintaining user privacy and security is of paramount importance to our platform.",
        translationEs: "Mantener la privacidad y seguridad del usuario es de primordial importancia para nuestra plataforma.",
        context: "Data ethics statement",
      },
    ],
  },
  {
    type: "VOCABULARY",
    canonicalForm: "mitigate",
    meaning: "To make something less harmful, unpleasant, or bad; to alleviate risk.",
    translationEs: "mitigar / atenuar / reducir el impacto",
    cefrLevel: "C1",
    explanation: "Precise corporate and risk-management verb. Superior to saying 'make it less bad'.",
    phonetics: "/ˈmɪt.ɪ.ɡeɪt/",
    tags: ["risk-management", "formal", "business"],
    examples: [
      {
        sentence: "Diversifying suppliers is one strategy to mitigate geopolitical disruption.",
        translationEs: "Diversificar proveedores es una estrategia para mitigar la disrupción geopolítica.",
        context: "Supply chain strategy",
      },
    ],
  },
  {
    type: "VOCABULARY",
    canonicalForm: "feasible",
    meaning: "Able to be made, done, or achieved easily or conveniently; viable.",
    translationEs: "viable / factible / realizable",
    cefrLevel: "B2",
    explanation: "Standard evaluation adjective for projects, budgets, and engineering plans.",
    phonetics: "/ˈfiː.zə.bəl/",
    tags: ["evaluation", "project-planning"],
    examples: [
      {
        sentence: "Given our current runway, transitioning to a zero-emissions fleet is economically feasible.",
        translationEs: "Dado nuestro presupuesto actual, la transición a una flota de cero emisiones es económicamente factible.",
        context: "Sustainability report",
      },
    ],
  },
  {
    type: "VOCABULARY",
    canonicalForm: "ubiquitous",
    meaning: "Present, appearing, or found everywhere at the same time.",
    translationEs: "omnipresente / ubicuo / generalizado",
    cefrLevel: "C1",
    explanation: "Sophisticated descriptor for technology, trends, or cultural phenomena that have permeated society.",
    phonetics: "/juːˈbɪk.wə.t̬əs/",
    tags: ["c1-active", "trends", "technology"],
    examples: [
      {
        sentence: "Smartphones have become so ubiquitous that life without them is virtually unimaginable.",
        translationEs: "Los teléfonos inteligentes se han vuelto tan omnipresentes que la vida sin ellos es prácticamente inimaginable.",
        context: "Cultural sociology",
      },
    ],
  },
  {
    type: "VOCABULARY",
    canonicalForm: "scrutinize",
    meaning: "To examine or inspect someone or something very closely and critically.",
    translationEs: "examinar minuciosamente / escudriñar",
    cefrLevel: "C1",
    explanation: "Active C1 verb for deep critical review or rigorous auditing.",
    phonetics: "/ˈskruː.t̬ən.aɪz/",
    tags: ["analysis", "quality", "c1-active"],
    examples: [
      {
        sentence: "The committee will scrutinize every clause of the proposed legislation.",
        translationEs: "El comité examinará minuciosamente cada cláusula de la legislación propuesta.",
        context: "Legal review",
      },
    ],
  },

  // -------------------------------------------------------------
  // FUNCTIONAL EXPRESSIONS
  // -------------------------------------------------------------
  {
    type: "FUNCTIONAL_EXPRESSION",
    canonicalForm: "as far as I'm concerned",
    meaning: "Used to express one's personal opinion or perspective on a matter.",
    translationEs: "por lo que a mí respecta / en lo que a mí concierne",
    cefrLevel: "B2",
    explanation: "Natural conversational discourse marker for taking a clear stance.",
    tags: ["opinion", "speaking-discourse", "fluency"],
    examples: [
      {
        sentence: "As far as I'm concerned, the proposal offers the most pragmatic solution on the table.",
        translationEs: "Por lo que a mí respecta, la propuesta ofrece la solución más pragmática sobre la mesa.",
        context: "Executive debate",
      },
    ],
  },
  {
    type: "FUNCTIONAL_EXPRESSION",
    canonicalForm: "having said that",
    meaning: "Used to introduce an opposing thought, caveat, or balancing statement (synonymous with 'nevertheless').",
    translationEs: "dicho esto / no obstante",
    cefrLevel: "C1",
    explanation: "Essential C1 spoken and written discourse connector that adds balance and sophistication.",
    tags: ["transitions", "nuance", "c1-active"],
    examples: [
      {
        sentence: "The initial investment is substantial. Having said that, the anticipated return outweighs the risk.",
        translationEs: "La inversión inicial es considerable. Dicho esto, el retorno previsto supera el riesgo.",
        context: "Investment pitch",
      },
    ],
  },
  {
    type: "FUNCTIONAL_EXPRESSION",
    canonicalForm: "be that as it may",
    meaning: "Accepting that something is true, but indicating it does not change your main point or conclusion.",
    translationEs: "sea como fuere / aun así / de todos modos",
    cefrLevel: "C1",
    explanation: "Formal concession phrase commonly used in polite debate and academic rebuttals.",
    tags: ["concession", "formal-debate", "c1-active"],
    examples: [
      {
        sentence: "The project was delayed by unforeseen weather. Be that as it may, we must still meet the revised deadline.",
        translationEs: "El proyecto se retrasó por clima imprevisto. Sea como fuere, aún debemos cumplir con el plazo revisado.",
        context: "Client negotiations",
      },
    ],
  },
  {
    type: "FUNCTIONAL_EXPRESSION",
    canonicalForm: "it goes without saying",
    meaning: "Used to state a fact that is so obvious that everyone is expected to know or agree with it.",
    translationEs: "huelga decir / sobra decir / ni que decir tiene",
    cefrLevel: "C1",
    explanation: "Polite emphasis phrase for acknowledging shared understanding.",
    tags: ["emphasis", "fluency", "c1-active"],
    examples: [
      {
        sentence: "It goes without saying that safety protocols must strictly be adhered to at all times.",
        translationEs: "Huelga decir que los protocolos de seguridad deben cumplirse estrictamente en todo momento.",
        context: "Industrial safety guidelines",
      },
    ],
  },

  // -------------------------------------------------------------
  // GRAMMAR CONCEPTS
  // -------------------------------------------------------------
  {
    type: "GRAMMAR",
    canonicalForm: "Inversion with negative adverbials",
    meaning: "Inverting subject and auxiliary verb after negative or restrictive adverbs (e.g. 'Not only...', 'Seldom...', 'Under no circumstances...').",
    translationEs: "Inversión tras adverbios negativos",
    cefrLevel: "C1",
    explanation: "Used to create dramatic emphasis and stylistic elegance in formal writing and persuasive speeches.",
    tags: ["grammar-c1", "inversion", "emphasis"],
    examples: [
      {
        sentence: "Not only did they exceed their annual target, but they also expanded into three new markets.",
        translationEs: "No solo superaron su objetivo anual, sino que también se expandieron a tres nuevos mercados.",
        context: "Annual earnings report",
      },
      {
        sentence: "Under no circumstances should sensitive credentials be committed to a public repository.",
        translationEs: "Bajo ninguna circunstancia se deben subir credenciales confidenciales a un repositorio público.",
        context: "Security policy",
      },
    ],
  },
  {
    type: "GRAMMAR",
    canonicalForm: "Mixed Conditionals (Past Cause, Present Result)",
    meaning: "Combining past hypothetical conditions with present hypothetical consequences (If + Past Perfect, would + bare infinitive).",
    translationEs: "Condicionales mixtos (causa pasada, resultado presente)",
    cefrLevel: "C1",
    explanation: "Expresses how a past decision or event directly impacts the speaker's present state.",
    tags: ["grammar-c1", "conditionals", "hypothetical"],
    examples: [
      {
        sentence: "If I had accepted that job offer in London, I would be living there right now.",
        translationEs: "Si hubiera aceptado esa oferta de trabajo en Londres, estaría viviendo allí ahora mismo.",
        context: "Reflective life decision",
      },
      {
        sentence: "If we had thoroughly tested the migration script, we wouldn't be fixing database errors today.",
        translationEs: "Si hubiéramos probado a fondo el script de migración, hoy no estaríamos corrigiendo errores en la base de datos.",
        context: "Post-incident review",
      },
    ],
  },
  {
    type: "GRAMMAR",
    canonicalForm: "Cleft Sentences with What",
    meaning: "Focusing attention on a specific element of a sentence using 'What... is/was...'",
    translationEs: "Oraciones hendidas con 'What' (lo que... es...)",
    cefrLevel: "C1",
    explanation: "Emphasizes the core message or surprise factor (e.g. 'What surprised me most was his complete honesty').",
    tags: ["grammar-c1", "emphasis", "cleft-sentences"],
    examples: [
      {
        sentence: "What we really need to focus on is user retention rather than raw acquisition.",
        translationEs: "En lo que realmente debemos centrarnos es en la retención de usuarios en lugar de la simple adquisición.",
        context: "Strategic pivot discussion",
      },
    ],
  },
];
