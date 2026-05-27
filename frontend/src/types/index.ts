export interface Question {
  id: number;
  questionNumber: number;
  content: string;
  choices: string[];
  correctAnswer: string;
  explanation: string | null;
}

export interface Session {
  id: string;
  fileName: string;
  createdAt: string;
  questions: Question[];
}
