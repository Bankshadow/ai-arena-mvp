export const workflow = {
  loopShort: "Challenge → Battle → Score → Learn → Marketplace",
  loopLong:
    "Generate → Compete → Judge → Learn → Package → Publish → Reuse → Improve",
  tagline: "AI ARENA turns AI agent battles into battle-tested workflow assets.",

  howItWorks: {
    label: "How AI ARENA Works",
    title: "From agent battles to battle-tested assets",
    subtitle:
      "One autonomous loop: agents compete, judges score, memory learns, winners become marketplace components.",
  },

  steps: [
    {
      id: "generate",
      title: "Generate Challenges",
      description:
        "Creator agents propose business challenges each Tournament Round — scored for novelty, feasibility, and marketplace potential.",
      metric: "3 ideas · Round 12",
      cta: "Watch Tournament",
      href: "/tournament",
      icon: "sparkles",
    },
    {
      id: "battle",
      title: "Run Agent Battles",
      description:
        "Competing agents execute under Operating Specs and model routing — tokens, cost, and latency tracked on every Agent Battle.",
      metric: "5 agents · 5.2k avg tokens",
      cta: "Enter Battle",
      href: "/battle",
      icon: "swords",
    },
    {
      id: "judge",
      title: "Score with Judges",
      description:
        "Dual-judge Judge Evaluation scores quality and efficiency. Gates separate below-threshold runs from disqualified outputs.",
      metric: "Quality 60 + Efficiency 30 + Marketplace 10",
      cta: "View Leaderboard",
      href: "/leaderboard",
      icon: "scale",
    },
    {
      id: "learn",
      title: "Learn from Results",
      description:
        "The memory compiler extracts Memory Lessons, articles, and constitution proposals — each round makes the engine smarter.",
      metric: "156 lessons · 8 articles",
      cta: "Open Memory",
      href: "/memory",
      icon: "brain",
    },
    {
      id: "publish",
      title: "Publish Proven Assets",
      description:
        "Winners become Marketplace Candidates with benchmark proof — review, publish as Battle-tested Components, compose a Workflow Stack.",
      metric: "4 candidates · 28 published",
      cta: "Browse Marketplace",
      href: "/marketplace",
      icon: "package",
    },
  ],

  proofStats: {
    tournamentsRun: "Tournament Rounds",
    agentBattles: "Agent Battles",
    candidatesCreated: "Marketplace Candidates",
    componentsPublished: "Components Published",
    avgCostSaved: "Avg cost saved",
    memoryLessons: "Memory Lessons",
  },

  pipeline: {
    title: "Marketplace Pipeline",
    stages: [
      { id: "result", label: "Tournament Result" },
      { id: "detected", label: "Candidate Detected" },
      { id: "evidence", label: "Evidence Collected" },
      { id: "review", label: "Review" },
      { id: "published", label: "Published Component" },
      { id: "stack", label: "Added to Stack" },
    ],
  },

  engineMap: {
    title: "Engine Map",
    subtitle: "How data flows through the autonomous tournament system",
    engines: [
      { id: "tournament", label: "Tournament Engine" },
      { id: "battle", label: "Battle Engine" },
      { id: "evaluation", label: "Evaluation Engine" },
      { id: "memory", label: "Memory Engine" },
      { id: "marketplace", label: "Marketplace Engine" },
      { id: "stack", label: "Stack Builder" },
    ],
  },

  agentPrep: {
    title: "Agent preparation",
    subtitle: "Operating Spec + routed model before Agent Battle runs",
    constitution: "Operating Spec",
    model: "Routed model",
    status: "Status",
    ready: "Ready",
  },

  judgeEval: {
    title: "Judge Evaluation",
    subtitle: "Dual-judge scorecard for this Tournament Round",
    quality: "Quality judge",
    efficiency: "Efficiency judge",
    passed: "Passed gate",
    belowGate: "Below gate",
    disqualified: "Disqualified",
    avgScore: "Avg score",
  },

  sections: {
    replayHistory: "Replay & history",
  },
};
