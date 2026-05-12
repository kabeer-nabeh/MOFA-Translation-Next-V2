// ─── Meeting Detail Data ──────────────────────────────────────────────────────

export type EngagementLevel = "Very High" | "High" | "Medium" | "Low" | "Very Low";

export type ParticipantDetail = {
  id: string;
  initials: string;
  bg: string;
  name: string;
  role?: string;
  engagement: EngagementLevel;
  wordCount: number;
  wordPercent: number;
  speakingTime: string; // e.g. "04:11"
  participationLevel: number; // 0–100
  segments: number;
  sentences: number;
  wordsPerSegment: number;
  wordsPerMin: number;
};

export type TranscriptEntry = {
  id: string;
  speakerId: string;
  speakerInitials: string;
  speakerBg: string;
  speakerName: string;
  timestamp: string; // e.g. "00:02"
  text: string;
  /** Arabic translation of the original text */
  arabicTranslation?: string;
};

export type MinuteItem = {
  type: "decision" | "action" | "note";
  text: string;
  owner?: string;
};

export type MeetingDetail = {
  meetingId: string;
  audioDuration: string;
  totalSpeakers: number;
  totalWords: number;
  totalSpeakingTime: string;
  avgSpeakingRate: number;
  executiveSummary: string;
  keywords: string[];
  participants: ParticipantDetail[];
  transcript: TranscriptEntry[];
  minutes: MinuteItem[];
};

// ─── Demo Data ────────────────────────────────────────────────────────────────

export const MEETING_DETAILS: Record<string, MeetingDetail> = {
  m1: {
    meetingId: "m1",
    audioDuration: "00:28",
    totalSpeakers: 5,
    totalWords: 12552,
    totalSpeakingTime: "59:49",
    avgSpeakingRate: 167,
    executiveSummary:
      "ناقشت الجلسة أداء منظومة الترجمة الحية لوزارة الخارجية واستعراض مؤشرات الأداء الرئيسية. تضمنت المناقشة تقييم دقة النصوص المستخلصة لدعم الاجتماعات الدبلوماسية، وتحسين معالجة اللهجات العربية المتعددة، وخارطة طريق تكامل منصات التواصل الخارجية (Teams وBeem). تم التركيز على قياس مدة الجلسات الدبلوماسية ودقة الترجمة الفورية بين اللغة العربية والإنجليزية.",
    keywords: [
      "# BRD",
      "# المعاملات المالية",
      "# المشاريع المستقبلية",
      "# الإدارة المالية الموحدة",
      "# إعدادات الحساب",
      "# KPIs",
      "# قاعدة البيانات الرئيسية",
      "# MOFA Meetings",
      "# تحسين التفاعلات",
      "# الخدمات المالية",
      "# تحليل الاستخدام",
      "# إدارة التكاليف",
    ],
    participants: [
      {
        id: "p1",
        initials: "SA",
        bg: "#e5ddce",
        name: "Suliman Alawi",
        role: "Lead",
        engagement: "Very High",
        wordCount: 1007,
        wordPercent: 75.7,
        speakingTime: "04:11",
        participationLevel: 78.9,
        segments: 92,
        sentences: 107,
        wordsPerSegment: 71,
        wordsPerMin: 122,
      },
      {
        id: "p2",
        initials: "KO",
        bg: "#e5cfe7",
        name: "Koray Okumus",
        role: "Engineering",
        engagement: "High",
        wordCount: 890,
        wordPercent: 42.3,
        speakingTime: "03:45",
        participationLevel: 52.4,
        segments: 68,
        sentences: 84,
        wordsPerSegment: 58,
        wordsPerMin: 110,
      },
      {
        id: "p3",
        initials: "ZM",
        bg: "#d3d6e9",
        name: "Zara Malik",
        role: "Product",
        engagement: "Medium",
        wordCount: 540,
        wordPercent: 25.6,
        speakingTime: "02:18",
        participationLevel: 34.0,
        segments: 44,
        sentences: 53,
        wordsPerSegment: 42,
        wordsPerMin: 98,
      },
      {
        id: "p4",
        initials: "AB",
        bg: "#c7d1b0",
        name: "Ahmed Bashir",
        role: "Client",
        engagement: "Low",
        wordCount: 210,
        wordPercent: 10.0,
        speakingTime: "01:02",
        participationLevel: 14.5,
        segments: 18,
        sentences: 22,
        wordsPerSegment: 28,
        wordsPerMin: 87,
      },
      {
        id: "p5",
        initials: "RN",
        bg: "#c7a8b0",
        name: "Rania Nasser",
        role: "Design",
        engagement: "Very Low",
        wordCount: 85,
        wordPercent: 4.0,
        speakingTime: "00:24",
        participationLevel: 8.2,
        segments: 7,
        sentences: 9,
        wordsPerSegment: 12,
        wordsPerMin: 74,
      },
    ],
    transcript: [
      { id: "t1", speakerId: "p1", speakerInitials: "SA", speakerBg: "#e5ddce", speakerName: "Suliman Alawi", timestamp: "00:00", text: "Good morning everyone, let's get started. Today we'll be reviewing the MOFA Live Translation system performance and discussing the deployment roadmap.", arabicTranslation: "صباح الخير للجميع، لنبدأ. سنراجع اليوم أداء منظومة الترجمة الحية لوزارة الخارجية ونناقش خارطة طريق النشر." },
      { id: "t2", speakerId: "p2", speakerInitials: "KO", speakerBg: "#e5cfe7", speakerName: "Koray Okumus", timestamp: "00:42", text: "Thanks Suliman. From the engineering side, we've completed the BRD review. The unified database schema is now ready for staging deployment.", arabicTranslation: "شكراً سليمان. من الجانب الهندسي، أكملنا مراجعة BRD. مخطط قاعدة البيانات الموحدة جاهز الآن لنشر بيئة التشغيل التجريبي." },
      { id: "t3", speakerId: "p3", speakerInitials: "ZM", speakerBg: "#d3d6e9", speakerName: "Zara Malik", timestamp: "01:15", text: "Great progress. On the product side, we need to finalize the KPIs before we push to production. I've prepared a draft framework we can walk through.", arabicTranslation: "تقدم رائع. من جانب المنتج، نحتاج إلى إنهاء مؤشرات الأداء الرئيسية قبل الإطلاق للإنتاج. لقد أعددت إطاراً مسودة يمكننا استعراضه." },
      { id: "t4", speakerId: "p1", speakerInitials: "SA", speakerBg: "#e5ddce", speakerName: "Suliman Alawi", timestamp: "02:00", text: "Perfect. Let's focus on the financial transaction metrics first. The client specifically asked about call duration tracking and transcript accuracy.", arabicTranslation: "ممتاز. لنركز أولاً على مقاييس المعاملات المالية. طلب العميل تحديداً تتبع مدة المكالمة ودقة النص المستخلص." },
      { id: "t5", speakerId: "p4", speakerInitials: "AB", speakerBg: "#c7d1b0", speakerName: "Ahmed Bashir", timestamp: "03:10", text: "Yes, that's our top priority. We need the transcript accuracy to be above 95% before we can proceed with the account settings integration.", arabicTranslation: "نعم، هذه أولويتنا القصوى. نحتاج أن تتجاوز دقة النص المستخلص 95% قبل أن نتمكن من المضي قدماً في تكامل إعدادات الحساب." },
      { id: "t6", speakerId: "p2", speakerInitials: "KO", speakerBg: "#e5cfe7", speakerName: "Koray Okumus", timestamp: "04:05", text: "We're currently at 92.3%. The remaining 3% gap is mostly around Arabic dialect handling. We have a fix scheduled for next sprint.", arabicTranslation: "نحن حالياً عند 92.3%. الفجوة المتبقية البالغة 3% تتعلق أساساً بمعالجة اللهجة العربية. لدينا إصلاح مجدول للسبرينت القادم." },
      { id: "t7", speakerId: "p3", speakerInitials: "ZM", speakerBg: "#d3d6e9", speakerName: "Zara Malik", timestamp: "05:30", text: "That's acceptable. Can we set a firm deadline for the sprint completion? I'd like to update the client timeline accordingly.", arabicTranslation: "هذا مقبول. هل يمكننا تحديد موعد نهائي صارم لإتمام السبرينت؟ أود تحديث الجدول الزمني للعميل وفقاً لذلك." },
      { id: "t8", speakerId: "p1", speakerInitials: "SA", speakerBg: "#e5ddce", speakerName: "Suliman Alawi", timestamp: "06:15", text: "Let's target December 28th. That gives us buffer before the January review. Koray, does that work for your team?", arabicTranslation: "لنستهدف 28 ديسمبر. هذا يمنحنا هامشاً قبل مراجعة يناير. كوراي، هل يناسب ذلك فريقك؟" },
      { id: "t9", speakerId: "p2", speakerInitials: "KO", speakerBg: "#e5cfe7", speakerName: "Koray Okumus", timestamp: "06:48", text: "Yes, December 28th works. I'll allocate two engineers to focus specifically on the dialect model fine-tuning.", arabicTranslation: "نعم، 28 ديسمبر مناسب. سأخصص مهندسين اثنين للتركيز تحديداً على ضبط نموذج اللهجة." },
      { id: "t10", speakerId: "p5", speakerInitials: "RN", speakerBg: "#c7a8b0", speakerName: "Rania Nasser", timestamp: "07:40", text: "From a design perspective, we should also update the transcript viewer UI to highlight low-confidence segments for the user.", arabicTranslation: "من منظور التصميم، يجب أيضاً تحديث واجهة عارض النص المستخلص لتمييز المقاطع ذات الثقة المنخفضة للمستخدم." },
    ],
    minutes: [
      { type: "decision", text: "Unified database schema approved for staging deployment by December 26, 2025." },
      { type: "decision", text: "Transcript accuracy target set at 95% before production release." },
      { type: "action", text: "Koray Okumus to allocate two engineers for Arabic dialect model fine-tuning.", owner: "Koray Okumus" },
      { type: "action", text: "Zara Malik to finalize KPI framework document and share with team by December 25, 2025.", owner: "Zara Malik" },
      { type: "action", text: "Rania Nasser to design updated transcript viewer with low-confidence segment highlighting.", owner: "Rania Nasser" },
      { type: "note", text: "Next sprint completion target: December 28, 2025. January review date to be confirmed." },
      { type: "note", text: "Client (Ahmed Bashir) to review KPI framework and provide feedback within 48 hours." },
    ],
  },
  m2: {
    meetingId: "m2",
    audioDuration: "00:47",
    totalSpeakers: 4,
    totalWords: 18340,
    totalSpeakingTime: "45:12",
    avgSpeakingRate: 142,
    executiveSummary:
      "اجتماع مراجعة استراتيجية الربع الرابع الذي ضم قيادة الفريق لمناقشة الأهداف السنوية وتخصيص الموارد. تم استعراض مؤشرات الأداء الرئيسية للربع الثالث والتخطيط لمبادرات الربع الأول من عام 2026. ركزت المناقشة على توسيع قدرات الترجمة الفورية وتطوير الشراكات الاستراتيجية مع الجهات الحكومية.",
    keywords: [
      "# Q4 Strategy",
      "# Leadership",
      "# KPIs Q3",
      "# Resource Allocation",
      "# 2026 Planning",
      "# Translation Capacity",
      "# Government Partnerships",
      "# Revenue Targets",
    ],
    participants: [
      { id: "p2", initials: "KO", bg: "#e5cfe7", name: "Koray Okumus", role: "CTO", engagement: "Very High", wordCount: 2100, wordPercent: 68.2, speakingTime: "12:30", participationLevel: 82.0, segments: 140, sentences: 160, wordsPerSegment: 90, wordsPerMin: 148 },
      { id: "p3", initials: "ZM", bg: "#d3d6e9", name: "Zara Malik", role: "CPO", engagement: "High", wordCount: 1450, wordPercent: 47.1, speakingTime: "08:45", participationLevel: 65.3, segments: 95, sentences: 112, wordsPerSegment: 72, wordsPerMin: 132 },
      { id: "p4", initials: "AB", bg: "#c7d1b0", name: "Ahmed Bashir", role: "CFO", engagement: "Medium", wordCount: 870, wordPercent: 28.2, speakingTime: "05:10", participationLevel: 40.0, segments: 58, sentences: 70, wordsPerSegment: 55, wordsPerMin: 118 },
      { id: "p5", initials: "RN", bg: "#c7a8b0", name: "Rania Nasser", role: "Design Lead", engagement: "Low", wordCount: 320, wordPercent: 10.4, speakingTime: "01:55", participationLevel: 22.1, segments: 22, sentences: 28, wordsPerSegment: 30, wordsPerMin: 95 },
    ],
    transcript: [
      { id: "t1", speakerId: "p2", speakerInitials: "KO", speakerBg: "#e5cfe7", speakerName: "Koray Okumus", timestamp: "00:00", text: "Welcome to our Q4 Strategy Review. Let's start by looking at Q3 performance metrics before we plan for next year." },
      { id: "t2", speakerId: "p4", speakerInitials: "AB", speakerBg: "#c7d1b0", speakerName: "Ahmed Bashir", timestamp: "01:20", text: "From a financial standpoint, we hit 94% of our Q3 revenue target. The translation services division performed exceptionally well." },
      { id: "t3", speakerId: "p3", speakerInitials: "ZM", speakerBg: "#d3d6e9", speakerName: "Zara Malik", timestamp: "03:45", text: "On the product side, we launched three major features this quarter. User adoption is up 34% month-over-month." },
      { id: "t4", speakerId: "p2", speakerInitials: "KO", speakerBg: "#e5cfe7", speakerName: "Koray Okumus", timestamp: "06:00", text: "For Q1 2026, I propose we allocate an additional 20% of engineering resources toward expanding our Arabic NLP capabilities." },
    ],
    minutes: [
      { type: "decision", text: "Increase engineering budget for Arabic NLP by 20% in Q1 2026." },
      { type: "decision", text: "Target 110% of Q3 revenue in Q4 2025." },
      { type: "action", text: "Ahmed Bashir to prepare Q4 budget allocation proposal by December 27, 2025.", owner: "Ahmed Bashir" },
      { type: "action", text: "Zara Malik to draft product roadmap for H1 2026 and share with leadership team.", owner: "Zara Malik" },
      { type: "note", text: "Government partnership discussions to be initiated in January 2026." },
    ],
  },
  m3: {
    meetingId: "m3",
    audioDuration: "01:12",
    totalSpeakers: 3,
    totalWords: 9870,
    totalSpeakingTime: "38:22",
    avgSpeakingRate: 158,
    executiveSummary:
      "جلسة المشي التقني التفصيلية لمناقشة بنية خط أنابيب الترجمة الآلية. تضمن الاجتماع استعراضاً شاملاً للمراحل الأربع: معالجة الصوت، والتعرف على الكلام، والترجمة، وما بعد المعالجة. تمت مناقشة تقنيات تحسين الأداء وتقليل زمن الاستجابة مع الحفاظ على جودة الترجمة.",
    keywords: [
      "# Pipeline Architecture",
      "# ASR",
      "# NMT",
      "# Latency Optimization",
      "# Post-Processing",
      "# Arabic NLP",
      "# Quality Metrics",
    ],
    participants: [
      { id: "p1", initials: "SA", bg: "#e5ddce", name: "Suliman Alawi", role: "Tech Lead", engagement: "Very High", wordCount: 1820, wordPercent: 71.3, speakingTime: "09:45", participationLevel: 88.4, segments: 120, sentences: 142, wordsPerSegment: 85, wordsPerMin: 155 },
      { id: "p3", initials: "ZM", bg: "#d3d6e9", name: "Zara Malik", role: "ML Engineer", engagement: "High", wordCount: 980, wordPercent: 38.4, speakingTime: "05:20", participationLevel: 52.0, segments: 65, sentences: 78, wordsPerSegment: 62, wordsPerMin: 138 },
      { id: "p5", initials: "RN", bg: "#c7a8b0", name: "Rania Nasser", role: "DevOps", engagement: "Medium", wordCount: 430, wordPercent: 16.9, speakingTime: "02:15", participationLevel: 30.5, segments: 28, sentences: 35, wordsPerSegment: 38, wordsPerMin: 112 },
    ],
    transcript: [
      { id: "t1", speakerId: "p1", speakerInitials: "SA", speakerBg: "#e5ddce", speakerName: "Suliman Alawi", timestamp: "00:00", text: "Today we'll do a deep dive into the translation pipeline architecture. I want to cover all four stages in detail." },
      { id: "t2", speakerId: "p3", speakerInitials: "ZM", speakerBg: "#d3d6e9", speakerName: "Zara Malik", timestamp: "02:10", text: "The ASR module is now running at 340ms average latency. We've improved it by 22% through model quantization." },
      { id: "t3", speakerId: "p5", speakerInitials: "RN", speakerBg: "#c7a8b0", speakerName: "Rania Nasser", timestamp: "05:30", text: "On the infrastructure side, we've deployed the pipeline across three availability zones for redundancy." },
      { id: "t4", speakerId: "p1", speakerInitials: "SA", speakerBg: "#e5ddce", speakerName: "Suliman Alawi", timestamp: "08:00", text: "Good work on the latency improvements. Let's now look at the post-processing quality metrics." },
    ],
    minutes: [
      { type: "decision", text: "Adopt model quantization for ASR across all production deployments." },
      { type: "action", text: "Zara Malik to document quantization methodology and performance benchmarks.", owner: "Zara Malik" },
      { type: "action", text: "Rania Nasser to set up multi-region pipeline monitoring dashboard.", owner: "Rania Nasser" },
      { type: "note", text: "Post-processing quality review scheduled for next technical walkthrough." },
    ],
  },

  m9: {
    meetingId: "m9",
    audioDuration: "00:35",
    totalSpeakers: 4,
    totalWords: 8924,
    totalSpeakingTime: "45:22",
    avgSpeakingRate: 155,
    executiveSummary:
      "تركزت الجلسة على تحسين التنسيق الدبلوماسي بين الدول الخليجية وتعزيز آليات التواصل الثنائي. تم مناقشة المعاهدات الجديدة والاتفاقيات الثنائية، مع التركيز على دور الترجمة الفورية في ضمان دقة النقل بين اللغة العربية والإنجليزية. قدمت الجلسة رؤى حول تحسين كفاءة المباحثات الدبلوماسية والتعاون الإقليمي.",
    keywords: [
      "# التنسيق الدبلوماسي",
      "# الاتفاقيات الثنائية",
      "# الترجمة الفورية",
      "# التواصل الدولي",
      "# المعاهدات",
      "# التعاون الإقليمي",
      "# الحوار الدبلوماسي",
      "# GCC Summit",
    ],
    participants: [
      {
        id: "p1",
        initials: "SA",
        bg: "#e5ddce",
        name: "Suliman Alawi",
        role: "Senior Diplomat",
        engagement: "Very High",
        wordCount: 2145,
        wordPercent: 68.4,
        speakingTime: "15:32",
        participationLevel: 82.1,
        segments: 45,
        sentences: 68,
        wordsPerSegment: 88,
        wordsPerMin: 128,
      },
      {
        id: "p2",
        initials: "KO",
        bg: "#e5cfe7",
        name: "Koray Okumus",
        role: "Interpreter",
        engagement: "High",
        wordCount: 1876,
        wordPercent: 45.2,
        speakingTime: "14:18",
        participationLevel: 71.3,
        segments: 38,
        sentences: 52,
        wordsPerSegment: 81,
        wordsPerMin: 119,
      },
    ],
    transcript: [
      { id: "t1", speakerId: "p1", speakerInitials: "SA", speakerBg: "#e5ddce", speakerName: "Suliman Alawi", timestamp: "00:05", text: "Good morning. Let's discuss the diplomatic coordination framework for this year.", arabicTranslation: "صباح الخير. دعونا نناقش إطار التنسيق الدبلوماسي لهذا العام." },
      { id: "t2", speakerId: "p2", speakerInitials: "KO", speakerBg: "#e5cfe7", speakerName: "Koray Okumus", timestamp: "00:12", text: "The bilateral agreements need strengthening in three key areas.", arabicTranslation: "الاتفاقيات الثنائية تحتاج إلى تعزيز في ثلاثة مجالات رئيسية." },
      { id: "t3", speakerId: "p1", speakerInitials: "SA", speakerBg: "#e5ddce", speakerName: "Suliman Alawi", timestamp: "00:28", text: "Can you detail those areas for our regional partners?", arabicTranslation: "هل يمكنك تفصيل تلك المجالات لشركائنا الإقليميين؟" },
      { id: "t4", speakerId: "p2", speakerInitials: "KO", speakerBg: "#e5cfe7", speakerName: "Koray Okumus", timestamp: "00:45", text: "Economic cooperation, security coordination, and cultural exchange initiatives.", arabicTranslation: "التعاون الاقتصادي، والتنسيق الأمني، ومبادرات التبادل الثقافي." },
    ],
    minutes: [
      { type: "decision", text: "Establish joint diplomatic coordination committee for GCC nations." },
      { type: "action", text: "Suliman Alawi to prepare detailed bilateral agreement framework.", owner: "Suliman Alawi" },
      { type: "action", text: "Schedule follow-up meeting for implementation planning.", owner: "Koray Okumus" },
      { type: "note", text: "All participants to review updated protocols before next session." },
    ],
  },
};
