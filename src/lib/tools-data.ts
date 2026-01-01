export interface ToolPage {
  slug: string;
  name: string;
  tagline: string;
  description: string;
  icon: string;
  color: string;
  features: {
    title: string;
    description: string;
    icon: string;
  }[];
  howItWorks: {
    step: number;
    title: string;
    description: string;
  }[];
  benefits: string[];
  faqs: {
    question: string;
    answer: string;
  }[];
  cta: {
    title: string;
    description: string;
  };
}

export const toolPages: ToolPage[] = [
  {
    slug: "essay-writer",
    name: "AI Essay Writer",
    tagline: "Write Better Essays, Faster",
    description: "Generate well-structured, plagiarism-free essays on any topic. Our AI essay writer helps students create high-quality academic papers with proper formatting, citations, and natural-sounding content.",
    icon: "FileText",
    color: "blue",
    features: [
      {
        title: "Multiple Essay Types",
        description: "Generate argumentative, persuasive, expository, narrative, and descriptive essays tailored to your needs.",
        icon: "Layers"
      },
      {
        title: "Adjustable Word Count",
        description: "Specify exact word counts from 500 to 5000+ words for any assignment requirement.",
        icon: "Type"
      },
      {
        title: "Built-in Humanizer",
        description: "Automatically humanize your essay to pass AI detection tools while maintaining quality.",
        icon: "Sparkles"
      },
      {
        title: "Citation Support",
        description: "Add proper citations in APA, MLA, Chicago, or Harvard format automatically.",
        icon: "Quote"
      },
      {
        title: "Multiple Languages",
        description: "Generate essays in English, Spanish, French, German, and many more languages.",
        icon: "Globe"
      },
      {
        title: "Export Options",
        description: "Download your essay as PDF, Word, or copy to clipboard with one click.",
        icon: "Download"
      }
    ],
    howItWorks: [
      {
        step: 1,
        title: "Enter Your Topic",
        description: "Type in your essay topic, thesis statement, or assignment prompt. Be as specific as possible for best results."
      },
      {
        step: 2,
        title: "Customize Settings",
        description: "Choose essay type, word count, tone, and academic level. Toggle auto-humanize for natural-sounding content."
      },
      {
        step: 3,
        title: "Generate & Edit",
        description: "Click generate and watch your essay come to life. Edit, refine, and export when you're satisfied."
      }
    ],
    benefits: [
      "Save hours of writing time on every assignment",
      "Overcome writer's block instantly",
      "Learn proper essay structure from generated examples",
      "Get inspiration for unique angles and arguments",
      "Improve your writing skills by studying AI output"
    ],
    faqs: [
      {
        question: "Is the essay unique and plagiarism-free?",
        answer: "Yes, every essay is generated fresh and unique. We recommend running it through plagiarism checkers for peace of mind, but our AI creates original content each time."
      },
      {
        question: "Will the essay pass AI detection?",
        answer: "Our built-in humanizer significantly reduces AI detection scores. For best results, enable the auto-humanize feature and make personal edits to add your voice."
      },
      {
        question: "Can I use the essay for my school assignment?",
        answer: "The essay is meant to be a starting point and learning tool. We recommend using it as a draft and adding your own insights, research, and edits before submission."
      },
      {
        question: "What subjects are supported?",
        answer: "Our AI can write essays on virtually any subject including literature, history, science, social studies, business, and more."
      },
      {
        question: "How many essays can I generate?",
        answer: "Free users get 50 daily credits. Each essay uses credits based on word count. Upgrade to Pro for more credits and features."
      }
    ],
    cta: {
      title: "Start Writing Better Essays Today",
      description: "Join thousands of students improving their grades with Kabyar's AI Essay Writer."
    }
  },
  {
    slug: "ai-detector",
    name: "AI Content Detector",
    tagline: "Check If Your Content Sounds Human",
    description: "Analyze any text to see if it reads as human-written or AI-generated. Our advanced detection tool helps you ensure your content passes authenticity checks.",
    icon: "ShieldCheck",
    color: "green",
    features: [
      {
        title: "Accurate Detection",
        description: "Advanced algorithms analyze writing patterns, vocabulary, and structure to detect AI content.",
        icon: "Target"
      },
      {
        title: "Detailed Analysis",
        description: "Get a breakdown of which parts of your text trigger AI detection and why.",
        icon: "BarChart"
      },
      {
        title: "Sentence-by-Sentence",
        description: "See AI probability scores for each sentence to identify problem areas.",
        icon: "List"
      },
      {
        title: "Improvement Tips",
        description: "Receive actionable suggestions on how to make your content sound more natural.",
        icon: "Lightbulb"
      },
      {
        title: "Multiple Text Support",
        description: "Check essays, articles, emails, and any other text format.",
        icon: "FileText"
      },
      {
        title: "Instant Results",
        description: "Get detection results in seconds, not minutes.",
        icon: "Zap"
      }
    ],
    howItWorks: [
      {
        step: 1,
        title: "Paste Your Text",
        description: "Copy and paste the content you want to analyze into the detector."
      },
      {
        step: 2,
        title: "Run Analysis",
        description: "Click analyze and our AI will examine your text for AI-generated patterns."
      },
      {
        step: 3,
        title: "Review Results",
        description: "See your AI probability score and specific areas that need improvement."
      }
    ],
    benefits: [
      "Verify your content before submission",
      "Identify which parts trigger AI detection",
      "Learn to write more naturally",
      "Avoid academic integrity issues",
      "Improve your writing authenticity"
    ],
    faqs: [
      {
        question: "How accurate is the AI detector?",
        answer: "Our detector uses advanced algorithms and is regularly updated. While no detector is 100% accurate, ours provides reliable guidance on your content's AI probability."
      },
      {
        question: "Does it work with all AI writers?",
        answer: "Yes, our detector can identify content from ChatGPT, Claude, Gemini, and other AI writing tools."
      },
      {
        question: "Can I check my own writing?",
        answer: "Absolutely! The detector works on any text, whether AI-generated or human-written."
      },
      {
        question: "How do I reduce my AI score?",
        answer: "Add personal experiences, vary sentence structure, use contractions, and inject your unique voice. Our humanizer tool can also help."
      }
    ],
    cta: {
      title: "Check Your Content Now",
      description: "Make sure your writing sounds authentically human before submission."
    }
  },
  {
    slug: "humanizer",
    name: "Content Humanizer",
    tagline: "Make AI Content Sound Human",
    description: "Transform AI-generated text into natural, human-sounding content. Our humanizer rewrites your content to bypass AI detection while preserving meaning and quality.",
    icon: "Wand2",
    color: "purple",
    features: [
      {
        title: "Advanced Rewriting",
        description: "Sophisticated algorithms transform AI text into natural human writing.",
        icon: "RefreshCw"
      },
      {
        title: "Preserve Meaning",
        description: "Your core message and facts remain intact while the style becomes more natural.",
        icon: "Shield"
      },
      {
        title: "Multiple Passes",
        description: "Run multiple humanization passes for maximum authenticity.",
        icon: "Repeat"
      },
      {
        title: "Tone Adjustment",
        description: "Choose formal, casual, academic, or conversational tones.",
        icon: "Mic"
      },
      {
        title: "Bypass Detection",
        description: "Optimized to pass popular AI detection tools like GPTZero and Turnitin.",
        icon: "Check"
      },
      {
        title: "Side-by-Side Compare",
        description: "See original and humanized versions side by side for comparison.",
        icon: "Columns"
      }
    ],
    howItWorks: [
      {
        step: 1,
        title: "Input Your Text",
        description: "Paste AI-generated content or text you want to humanize."
      },
      {
        step: 2,
        title: "Choose Settings",
        description: "Select tone, aggressiveness level, and number of passes."
      },
      {
        step: 3,
        title: "Get Human Content",
        description: "Receive naturally-written content that sounds authentically human."
      }
    ],
    benefits: [
      "Transform robotic text into natural writing",
      "Pass AI detection checks confidently",
      "Maintain your content's core message",
      "Save time on manual rewriting",
      "Learn natural writing patterns"
    ],
    faqs: [
      {
        question: "Will humanized content pass AI detection?",
        answer: "Our humanizer is optimized for maximum authenticity. Most content passes detection after humanization, though we recommend personal edits for best results."
      },
      {
        question: "Does it change my content's meaning?",
        answer: "No, the humanizer preserves your core message while changing the writing style to sound more natural."
      },
      {
        question: "How many times should I run it?",
        answer: "Usually once is enough, but for highly AI-sounding text, 2-3 passes can improve results."
      },
      {
        question: "What's the difference from the essay writer's humanize?",
        answer: "The standalone humanizer offers more control and aggressive options for existing content, while the essay writer's humanize is integrated into the generation process."
      }
    ],
    cta: {
      title: "Humanize Your Content Now",
      description: "Transform AI text into natural, human-sounding writing in seconds."
    }
  },
  {
    slug: "answer-finder",
    name: "Answer Finder",
    tagline: "Get Answers to Any Question",
    description: "Find accurate, detailed answers to any academic question. Our AI provides clear explanations with examples, formulas, and step-by-step breakdowns.",
    icon: "Search",
    color: "orange",
    features: [
      {
        title: "Any Subject",
        description: "Get answers for math, science, history, literature, and all academic subjects.",
        icon: "BookOpen"
      },
      {
        title: "Step-by-Step",
        description: "Complex problems are broken down into easy-to-understand steps.",
        icon: "ListOrdered"
      },
      {
        title: "Examples Included",
        description: "Learn from real examples that illustrate concepts clearly.",
        icon: "Lightbulb"
      },
      {
        title: "Formula Display",
        description: "Math and science formulas are properly formatted and explained.",
        icon: "Calculator"
      },
      {
        title: "Source References",
        description: "Get references to help you research further and verify information.",
        icon: "Link"
      },
      {
        title: "Follow-up Questions",
        description: "Ask follow-up questions to dive deeper into any topic.",
        icon: "MessageCircle"
      }
    ],
    howItWorks: [
      {
        step: 1,
        title: "Ask Your Question",
        description: "Type any academic question or problem you need help with."
      },
      {
        step: 2,
        title: "Get Detailed Answer",
        description: "Receive a comprehensive answer with explanations and examples."
      },
      {
        step: 3,
        title: "Learn & Understand",
        description: "Use the explanation to truly understand the concept, not just memorize."
      }
    ],
    benefits: [
      "Get instant answers 24/7",
      "Understand concepts, not just answers",
      "Learn from detailed explanations",
      "Cover any academic subject",
      "Perfect for exam preparation"
    ],
    faqs: [
      {
        question: "What subjects does it cover?",
        answer: "Our Answer Finder covers all academic subjects including math, science, history, literature, geography, economics, and more."
      },
      {
        question: "How accurate are the answers?",
        answer: "Our AI provides highly accurate answers, but we always recommend verifying important information with textbooks or teachers."
      },
      {
        question: "Can it solve math problems?",
        answer: "Yes! It can solve equations, word problems, calculus, statistics, and more, with step-by-step solutions."
      },
      {
        question: "Is this cheating?",
        answer: "We encourage using Answer Finder to learn and understand concepts. Use it as a study tool, not just to copy answers."
      }
    ],
    cta: {
      title: "Find Answers Now",
      description: "Get clear, detailed answers to any academic question instantly."
    }
  },
  {
    slug: "homework-helper",
    name: "Homework Helper",
    tagline: "Get Help Without Getting Answers",
    description: "Learn how to solve problems yourself with guided hints, tips, and explanations. Our Homework Helper teaches you the process, not just the answer.",
    icon: "BookOpen",
    color: "teal",
    features: [
      {
        title: "Guided Learning",
        description: "Get hints and nudges that lead you to the answer without giving it away.",
        icon: "Compass"
      },
      {
        title: "Step-by-Step Hints",
        description: "Receive progressive hints that help you work through problems.",
        icon: "Footprints"
      },
      {
        title: "Concept Explanations",
        description: "Understand the underlying concepts needed to solve the problem.",
        icon: "Brain"
      },
      {
        title: "Practice Problems",
        description: "Get similar practice problems to reinforce your learning.",
        icon: "Target"
      },
      {
        title: "All Subjects",
        description: "Support for math, science, English, social studies, and more.",
        icon: "Layers"
      },
      {
        title: "Learning-Focused",
        description: "Designed to help you learn, not just complete assignments.",
        icon: "GraduationCap"
      }
    ],
    howItWorks: [
      {
        step: 1,
        title: "Describe Your Problem",
        description: "Enter the homework question or problem you're stuck on."
      },
      {
        step: 2,
        title: "Get Guided Help",
        description: "Receive hints and explanations that guide you toward the solution."
      },
      {
        step: 3,
        title: "Solve It Yourself",
        description: "Apply what you've learned to solve the problem independently."
      }
    ],
    benefits: [
      "Actually learn, don't just copy",
      "Build problem-solving skills",
      "Understand concepts deeply",
      "Gain confidence in your abilities",
      "Prepare for exams effectively"
    ],
    faqs: [
      {
        question: "How is this different from Answer Finder?",
        answer: "Homework Helper guides you to find the answer yourself through hints and explanations, while Answer Finder provides direct answers with explanations."
      },
      {
        question: "Will it just give me the answer?",
        answer: "No, the Homework Helper is designed to teach you how to solve problems. It provides hints and guidance, not direct answers."
      },
      {
        question: "What if I'm really stuck?",
        answer: "Keep asking for more hints. The helper will progressively give more detailed guidance until you can solve it."
      },
      {
        question: "Is this good for test prep?",
        answer: "Absolutely! Learning to solve problems yourself is the best way to prepare for exams."
      }
    ],
    cta: {
      title: "Start Learning Now",
      description: "Get the help you need while actually learning the material."
    }
  },
  {
    slug: "study-guide",
    name: "Study Guide Generator",
    tagline: "Create Comprehensive Study Materials",
    description: "Generate complete study guides with summaries, key concepts, practice questions, and review materials for any topic or subject.",
    icon: "GraduationCap",
    color: "indigo",
    features: [
      {
        title: "Complete Guides",
        description: "Get comprehensive study materials covering all aspects of your topic.",
        icon: "FileText"
      },
      {
        title: "Key Concepts",
        description: "Important terms, definitions, and concepts clearly explained.",
        icon: "Key"
      },
      {
        title: "Practice Questions",
        description: "Test your knowledge with auto-generated practice questions.",
        icon: "HelpCircle"
      },
      {
        title: "Summaries",
        description: "Concise summaries perfect for quick review sessions.",
        icon: "AlignLeft"
      },
      {
        title: "Mind Maps",
        description: "Visual concept maps showing relationships between ideas.",
        icon: "Share2"
      },
      {
        title: "Customizable",
        description: "Choose depth, format, and focus areas for your guide.",
        icon: "Settings"
      }
    ],
    howItWorks: [
      {
        step: 1,
        title: "Enter Your Topic",
        description: "Specify the subject, chapter, or topic you need to study."
      },
      {
        step: 2,
        title: "Customize Options",
        description: "Choose what to include: summaries, questions, examples, etc."
      },
      {
        step: 3,
        title: "Study Effectively",
        description: "Use your personalized study guide to master the material."
      }
    ],
    benefits: [
      "Save hours of note-taking",
      "Never miss important concepts",
      "Test yourself with practice questions",
      "Organize information logically",
      "Review efficiently before exams"
    ],
    faqs: [
      {
        question: "What subjects are supported?",
        answer: "Any academic subject! From biology to history, math to literature, our generator creates study guides for all topics."
      },
      {
        question: "Can I customize the study guide?",
        answer: "Yes, you can choose what sections to include, adjust depth, and focus on specific areas."
      },
      {
        question: "Are the practice questions good?",
        answer: "Yes, questions are designed to test understanding, not just memorization, preparing you for real exams."
      },
      {
        question: "Can I export my study guide?",
        answer: "Absolutely! Download as PDF, print, or copy to your preferred note-taking app."
      }
    ],
    cta: {
      title: "Create Your Study Guide",
      description: "Generate comprehensive study materials for any topic in minutes."
    }
  },
  {
    slug: "presentation",
    name: "Presentation Maker",
    tagline: "Create Professional Presentations Fast",
    description: "Generate beautiful, content-rich presentation slides on any topic. Our AI creates engaging slides with proper structure, visuals, and speaker notes.",
    icon: "Presentation",
    color: "pink",
    features: [
      {
        title: "Complete Slides",
        description: "Get fully designed slides with content, layouts, and visual suggestions.",
        icon: "Layout"
      },
      {
        title: "Professional Design",
        description: "Clean, modern designs that impress teachers and audiences.",
        icon: "Palette"
      },
      {
        title: "Speaker Notes",
        description: "Optional speaker notes to help you present confidently.",
        icon: "MessageSquare"
      },
      {
        title: "Multiple Formats",
        description: "Export to PowerPoint, Google Slides, or PDF.",
        icon: "Download"
      },
      {
        title: "Custom Length",
        description: "Specify number of slides from quick 5-slide to comprehensive 30-slide decks.",
        icon: "Hash"
      },
      {
        title: "Any Topic",
        description: "Create presentations for any subject or purpose.",
        icon: "Globe"
      }
    ],
    howItWorks: [
      {
        step: 1,
        title: "Enter Topic",
        description: "Describe your presentation topic and key points to cover."
      },
      {
        step: 2,
        title: "Customize",
        description: "Choose number of slides, style, and whether to include speaker notes."
      },
      {
        step: 3,
        title: "Download & Present",
        description: "Get your presentation and export to your preferred format."
      }
    ],
    benefits: [
      "Create presentations in minutes, not hours",
      "Professional-quality slides every time",
      "Focus on presenting, not designing",
      "Never start from a blank slide again",
      "Include compelling content automatically"
    ],
    faqs: [
      {
        question: "What formats can I export to?",
        answer: "Export to PowerPoint (.pptx), Google Slides (via import), or PDF for easy sharing."
      },
      {
        question: "Can I edit the slides after?",
        answer: "Yes! Download the PowerPoint file and edit it however you like in PowerPoint or Google Slides."
      },
      {
        question: "Does it include images?",
        answer: "The AI suggests relevant images and provides image placeholders. You can add your own images after export."
      },
      {
        question: "How many slides can I generate?",
        answer: "You can create presentations from 5 to 30+ slides depending on your needs."
      }
    ],
    cta: {
      title: "Create Your Presentation",
      description: "Generate professional presentations for any topic in minutes."
    }
  },
  {
    slug: "tutor",
    name: "AI Tutor",
    tagline: "Your Personal Learning Assistant",
    description: "Get personalized tutoring on any subject. Our AI Tutor explains concepts, answers questions, and adapts to your learning style and pace.",
    icon: "MessageCircle",
    color: "cyan",
    features: [
      {
        title: "Any Subject",
        description: "Get help with math, science, languages, history, and more.",
        icon: "BookOpen"
      },
      {
        title: "Personalized",
        description: "Explanations adapt to your level and learning style.",
        icon: "User"
      },
      {
        title: "Interactive Chat",
        description: "Have natural conversations and ask follow-up questions.",
        icon: "MessageCircle"
      },
      {
        title: "24/7 Available",
        description: "Get help whenever you need it, day or night.",
        icon: "Clock"
      },
      {
        title: "Patient Teaching",
        description: "Never feel rushed or embarrassed asking questions.",
        icon: "Heart"
      },
      {
        title: "Practice Problems",
        description: "Request practice problems and get instant feedback.",
        icon: "Target"
      }
    ],
    howItWorks: [
      {
        step: 1,
        title: "Start a Session",
        description: "Tell the tutor what subject or topic you need help with."
      },
      {
        step: 2,
        title: "Ask & Learn",
        description: "Ask questions, request explanations, and work through problems."
      },
      {
        step: 3,
        title: "Master Concepts",
        description: "Keep learning until you fully understand the material."
      }
    ],
    benefits: [
      "Learn at your own pace",
      "Get explanations that make sense to you",
      "Never feel judged for asking questions",
      "Available whenever you need help",
      "Affordable alternative to human tutors"
    ],
    faqs: [
      {
        question: "Is AI tutoring as good as human tutoring?",
        answer: "AI tutoring offers instant availability, infinite patience, and personalized pacing. For many students, it's an excellent complement to classroom learning."
      },
      {
        question: "What subjects can the tutor help with?",
        answer: "All academic subjects including math, science, English, history, languages, and test prep."
      },
      {
        question: "Can I ask follow-up questions?",
        answer: "Absolutely! The tutor maintains context throughout your session, so you can have natural back-and-forth conversations."
      },
      {
        question: "How long can a tutoring session be?",
        answer: "Sessions can be as long as you need. There's no time limit per session."
      }
    ],
    cta: {
      title: "Start Your Tutoring Session",
      description: "Get personalized help with any subject from your AI tutor."
    }
  }
];

export function getToolPage(slug: string): ToolPage | undefined {
  return toolPages.find(tool => tool.slug === slug);
}
