import { GoogleGenAI } from '@google/genai';

const apiKey = process.env.GEMINI_API_KEY;
const ai = apiKey
  ? new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    })
  : null;

export interface TutorResponse {
  answer: string;
  keyPoints: string[];
  practiceQuestion: string;
  isAiGenerated: boolean;
  modelUsed?: string;
  notice?: string;
}

interface TutorRequestOptions {
  subject: string;
  topic: string;
  question: string;
  explanationLevel: 'Beginner' | 'Intermediate' | 'Advanced';
  language: string; // 'en', 'te', 'hi', 'es'
  educationLevel?: string;
  conversationHistory?: { role: 'user' | 'assistant'; content: string }[];
}

export async function askAiTutor(options: TutorRequestOptions): Promise<TutorResponse> {
  const {
    subject,
    topic,
    question,
    explanationLevel,
    language,
    educationLevel = 'Undergraduate Student',
    conversationHistory = []
  } = options;

  const langInstruction =
    language === 'te'
      ? 'Explain clearly in Telugu script or bilingual English-Telugu.'
      : language === 'hi'
      ? 'Explain clearly in Hindi (Devanagari) or bilingual English-Hindi.'
      : language === 'es'
      ? 'Explain clearly in Spanish.'
      : 'Explain clearly in simple, concise English.';

  // If Gemini API is available, invoke Gemini 3.8 Flash
  if (ai) {
    try {
      const systemInstruction = `You are an expert, encouraging university tutor assisting a student studying "${subject}", specifically on "${topic}".
The student's educational level is ${educationLevel}.
Explanation depth required: ${explanationLevel}.
Language directive: ${langInstruction}.

Your response format must be clean and educational:
1. Provide an intuitive, step-by-step pedagogical explanation with real-world examples or code snippets where applicable.
2. End your answer with a section starting with "[KEY_POINTS]" containing 2-3 bullet points summarizing essential exam concepts.
3. Conclude with a section starting with "[PRACTICE_QUESTION]" containing 1 thoughtful test question for the student to practice.`;

      const prompt = `Student Question: ${question}
Subject: ${subject}
Topic: ${topic}`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          systemInstruction,
          temperature: 0.7,
        },
      });

      const fullText = response.text || '';
      
      // Parse key points and practice question from markers
      let answerText = fullText;
      const keyPoints: string[] = [];
      let practiceQuestion = '';

      if (fullText.includes('[KEY_POINTS]')) {
        const parts = fullText.split('[KEY_POINTS]');
        answerText = parts[0].trim();
        const afterKey = parts[1];

        if (afterKey.includes('[PRACTICE_QUESTION]')) {
          const subParts = afterKey.split('[PRACTICE_QUESTION]');
          const pointsRaw = subParts[0].trim();
          practiceQuestion = subParts[1].trim();

          pointsRaw.split('\n').forEach(line => {
            const clean = line.replace(/^[-*•\d.]\s*/, '').trim();
            if (clean) keyPoints.push(clean);
          });
        } else {
          afterKey.split('\n').forEach(line => {
            const clean = line.replace(/^[-*•\d.]\s*/, '').trim();
            if (clean) keyPoints.push(clean);
          });
        }
      }

      if (keyPoints.length === 0) {
        keyPoints.push(`Core concept tested in ${topic}`);
        keyPoints.push(`Mastering ${subject} requires iterative problem solving`);
      }

      if (!practiceQuestion) {
        practiceQuestion = `How would you explain the fundamental invariant of ${topic} to a peer?`;
      }

      return {
        answer: answerText,
        keyPoints,
        practiceQuestion,
        isAiGenerated: true,
        modelUsed: 'gemini-3.8-flash'
      };
    } catch (err: any) {
      console.warn('Gemini API call failed, falling back to rule-based tutor:', err.message);
    }
  }

  // Knowledge-based pedagogical fallback
  return generateRuleBasedExplanation(subject, topic, question, explanationLevel, language);
}

function generateRuleBasedExplanation(
  subject: string,
  topic: string,
  question: string,
  explanationLevel: 'Beginner' | 'Intermediate' | 'Advanced',
  language: string
): TutorResponse {
  let answer = '';
  const keyPoints: string[] = [];
  let practiceQuestion = '';

  const qLower = question.toLowerCase();

  // Subject-sensitive structured responses
  if (topic.includes('Binary Search Tree') || qLower.includes('tree') || qLower.includes('bst')) {
    answer = `### Understanding Binary Search Trees (BST)\n\n` +
      `A Binary Search Tree is a hierarchical node-based data structure where each node has at most two children.\n\n` +
      `**The Fundamental BST Invariant:**\n` +
      `- For any node $N$:\n` +
      `  - All values in $N$'s left subtree are strictly **less** than $N$.val.\n` +
      `  - All values in $N$'s right subtree are strictly **greater** than $N$.val.\n\n` +
      `**Step-by-Step Traversal Order:**\n` +
      `When you execute an **In-Order Traversal** (Left $\\to$ Root $\\to$ Right), you visit keys in sorted ascending order. Time complexity is $O(N)$.\n\n` +
      `**Search and Insertion Complexity:**\n` +
      `- Balanced Tree (AVL, Red-Black): $O(\\log N)$\n` +
      `- Skewed/Degenerate Tree (like a linked list): $O(N)$`;

    keyPoints.push('In-order traversal yields elements in sorted ascending order in O(N) time.');
    keyPoints.push('Balanced trees guarantee O(log N) search and insertion bounds.');
    practiceQuestion = 'Given keys [10, 5, 15, 3, 7], what would the post-order traversal sequence be?';
  } else if (topic.includes('Python') || qLower.includes('python') || qLower.includes('oop')) {
    answer = `### Core Concepts in Python & Object-Oriented Design\n\n` +
      `In Python, everything is an object, including functions, modules, and classes.\n\n` +
      `**Key Building Blocks:**\n` +
      `1. **Classes and Instances:** A class serves as the blueprint, and instances are concrete objects created in memory.\n` +
      `2. **Constructor (\`__init__\`):** The initializer method receives \`self\` (the instance) and initializes state attributes.\n` +
      `3. **Inheritance & Polymorphism:** Classes can inherit behaviors from parent classes via \`class Child(Parent):\`.\n` +
      `4. **Encapsulation:** Python uses naming conventions (like single leading underscore \`_protected\` or double \`__private\` with name-mangling) to indicate visibility boundaries.\n\n` +
      `**Code Example:**\n` +
      `\`\`\`python\n` +
      `class Student:\n` +
      `    def __init__(self, name: str, gpa: float):\n` +
      `        self.name = name\n` +
      `        self.gpa = gpa\n` +
      `        \n` +
      `    def is_honors(self) -> bool:\n` +
      `        return self.gpa >= 3.7\n` +
      `\`\`\``;

    keyPoints.push('The __init__ method initializes instance state once memory has been allocated.');
    keyPoints.push('Python uses dynamic typing with duck typing: behavior defines interface.');
    practiceQuestion = 'What is the operational difference between a class method (@classmethod) and a static method (@staticmethod)?';
  } else if (topic.includes('Pandas') || topic.includes('Regression') || topic.includes('Machine Learning')) {
    answer = `### Foundational Principles in Machine Learning & Data Processing\n\n` +
      `Machine learning models discover patterns in historical data to make predictions on unseen instances.\n\n` +
      `**The Standard ML Pipeline:**\n` +
      `1. **Data Preprocessing:** Imputing missing records, encoding categorical variables, and scaling numeric features.\n` +
      `2. **Train/Test Splitting:** Reserving 20-30% of data to evaluate generalization error and detect overfitting.\n` +
      `3. **Model Training:** Optimizing loss functions (e.g. Mean Squared Error for regression, Cross-Entropy for classification).\n` +
      `4. **Validation:** Measuring Precision, Recall, F1-Score, and ROC-AUC rather than raw Accuracy on imbalanced datasets.`;

    keyPoints.push('Always split datasets before feature scaling to prevent data leakage.');
    keyPoints.push('Precision measures false positive resistance; Recall measures false negative resistance.');
    practiceQuestion = 'Why does adding too many high-degree polynomial features increase model variance and cause overfitting?';
  } else {
    answer = `### Learning Guide for ${topic} (${subject})\n\n` +
      `To master **${topic}**, follow this structured conceptual framework:\n\n` +
      `1. **Define the Core Objective:** What specific real-world problem does ${topic} solve?\n` +
      `2. **Key Invariants and Rules:** Break the topic down into its primary definitions, mathematical relations, or operational constraints.\n` +
      `3. **Common Pitfalls:** Watch out for edge cases, off-by-one boundary conditions, and improper assumptions.\n` +
      `4. **Active Recall Strategy:** Summarize the mechanism without looking at reference notes and build a small test case to verify your understanding.`;

    keyPoints.push(`Focus on first principles: understand WHY ${topic} works before memorizing syntax.`);
    keyPoints.push(`Practice applying concepts to active problem sets to cement spaced recall.`);
    practiceQuestion = `Can you write down a 2-sentence summary explaining how ${topic} interacts with other components in ${subject}?`;
  }

  const notice = !apiKey
    ? 'Note: Running in built-in offline educational knowledge engine mode. (Set GEMINI_API_KEY in Secrets for live generative AI tutoring).'
    : undefined;

  return {
    answer,
    keyPoints,
    practiceQuestion,
    isAiGenerated: false,
    notice
  };
}
