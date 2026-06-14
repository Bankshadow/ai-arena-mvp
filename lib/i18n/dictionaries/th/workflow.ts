export const workflow = {
  loopShort: "Challenge → Battle → Score → Learn → Marketplace",
  loopLong:
    "Generate → Compete → Judge → Learn → Package → Publish → Reuse → Improve",
  tagline: "AI ARENA เปลี่ยน AI agent battles เป็น battle-tested workflow assets",

  howItWorks: {
    label: "How AI ARENA Works",
    title: "จาก agent battles สู่ battle-tested assets",
    subtitle:
      "ลูปอัตโนมัติเดียว: agents แข่ง judges ให้คะแนน memory เรียนรู้ ผู้ชนะกลายเป็น marketplace components",
  },

  steps: [
    {
      id: "generate",
      title: "Generate Challenges",
      description:
        "Creator agents เสนอ business challenges ในแต่ละ Tournament Round — คะแนน novelty, feasibility และ marketplace potential",
      metric: "3 ideas · Round 12",
      cta: "Watch Tournament",
      href: "/tournament",
      icon: "sparkles",
    },
    {
      id: "battle",
      title: "Run Agent Battles",
      description:
        "Agents แข่งภายใต้ Operating Spec และ model routing — ติดตาม tokens, cost, latency ทุก Agent Battle",
      metric: "5 agents · 5.2k avg tokens",
      cta: "Enter Battle",
      href: "/battle",
      icon: "swords",
    },
    {
      id: "judge",
      title: "Score with Judges",
      description:
        "Judge Evaluation แบบ dual-judge ให้คะแนน quality และ efficiency แยก below gate จาก disqualified",
      metric: "Quality 60 + Efficiency 30 + Marketplace 10",
      cta: "View Leaderboard",
      href: "/leaderboard",
      icon: "scale",
    },
    {
      id: "learn",
      title: "Learn from Results",
      description:
        "Memory compiler สกัด Memory Lessons, articles และ constitution proposals — ทุกรอบทำให้ engine ฉลาดขึ้น",
      metric: "156 lessons · 8 articles",
      cta: "Open Memory",
      href: "/memory",
      icon: "brain",
    },
    {
      id: "publish",
      title: "Publish Proven Assets",
      description:
        "ผู้ชนะกลายเป็น Marketplace Candidates พร้อม benchmark proof — review, publish เป็น Battle-tested Components, ประกอบ Workflow Stack",
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
    subtitle: "Data flow ผ่านระบบ tournament อัตโนมัติ",
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
    subtitle: "Operating Spec + routed model ก่อน Agent Battle runs",
    constitution: "Operating Spec",
    model: "Routed model",
    status: "Status",
    ready: "Ready",
  },

  judgeEval: {
    title: "Judge Evaluation",
    subtitle: "Dual-judge scorecard สำหรับ Tournament Round นี้",
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
