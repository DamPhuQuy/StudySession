import { useState, useEffect } from 'react';
import type { Question } from '../types';
import confetti from 'canvas-confetti';
import { 
  ArrowLeft, 
  CheckCircle2, 
  XCircle, 
  HelpCircle, 
  Award, 
  RefreshCw, 
  Home, 
  ChevronDown, 
  ChevronUp, 
  Sparkles,
  BookOpen
} from 'lucide-react';

interface QuizProps {
  questions: Question[];
  onBack: () => void;
}

export function Quiz({ questions, onBack }: QuizProps) {
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);
  const [answersLog, setAnswersLog] = useState<{ [key: number]: string }>({});
  const [expandedReview, setExpandedReview] = useState<{ [key: number]: boolean }>({});

  if (!questions || questions.length === 0) {
    return (
      <div className="w-full max-w-xl mx-auto px-4 py-8 text-center animate-slide-up">
        <div className="glass-panel rounded-2xl p-8 border border-white/5">
          <HelpCircle className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">Tài liệu không có câu hỏi phù hợp</h2>
          <p className="text-gray-400 text-sm mb-6 leading-relaxed">
            Hệ thống không tìm thấy bất kỳ câu hỏi trắc nghiệm A, B, C, D nào trong tài liệu của bạn.
            Vui lòng kiểm tra lại định dạng tài liệu (cần ghi rõ Câu X, A., B., C., D. và Đáp án).
          </p>
          <button
            onClick={onBack}
            className="px-6 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-bold text-sm cursor-pointer"
          >
            Quay lại trang chủ
          </button>
        </div>
      </div>
    );
  }

  const q = questions[current];
  const letters = ['A', 'B', 'C', 'D'];
  const progressPercent = Math.round(((current + (selected ? 1 : 0)) / questions.length) * 100);

  // Trigger confetti when finished
  useEffect(() => {
    if (finished) {
      const accuracy = score / questions.length;
      if (accuracy >= 0.7) {
        // High score burst
        confetti({
          particleCount: 150,
          spread: 80,
          origin: { y: 0.6 }
        });
        
        // Secondary burst
        setTimeout(() => {
          confetti({
            particleCount: 100,
            angle: 60,
            spread: 55,
            origin: { x: 0 }
          });
        }, 250);
        setTimeout(() => {
          confetti({
            particleCount: 100,
            angle: 120,
            spread: 55,
            origin: { x: 1 }
          });
        }, 400);
      } else if (accuracy > 0.4) {
        // Smaller celebration
        confetti({
          particleCount: 80,
          spread: 50,
          origin: { y: 0.6 }
        });
      }
    }
  }, [finished, score, questions.length]);

  const handleSelect = (letter: string) => {
    if (selected) return;
    setSelected(letter);
    setAnswersLog(prev => ({ ...prev, [current]: letter }));
    if (letter === q.correctAnswer) {
      setScore(s => s + 1);
    }
  };

  const next = () => {
    if (current + 1 >= questions.length) {
      setFinished(true);
    } else {
      setCurrent(c => c + 1);
      setSelected(null);
    }
  };

  const reset = () => {
    setCurrent(0);
    setSelected(null);
    setScore(0);
    setFinished(false);
    setAnswersLog({});
    setExpandedReview({});
  };

  const toggleReview = (index: number) => {
    setExpandedReview(prev => ({ ...prev, [index]: !prev[index] }));
  };

  // Render Finished State (Results Page)
  if (finished) {
    const accuracyRate = Math.round((score / questions.length) * 100);
    
    // SVG values for Circular Progress
    const radius = 60;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (accuracyRate / 100) * circumference;

    // Accuracy Message
    let comment = "Cố gắng hơn nữa vào lần sau nhé!";
    let emoji = "💪";
    let colorClass = "text-red-400";
    if (accuracyRate >= 80) {
      comment = "Xuất sắc! Bạn nắm kiến thức rất vững chắc.";
      emoji = "🏆";
      colorClass = "text-green-400";
    } else if (accuracyRate >= 50) {
      comment = "Khá tốt! Ôn tập thêm một chút để đạt điểm tối đa.";
      emoji = "🌟";
      colorClass = "text-yellow-400";
    }

    return (
      <div className="w-full max-w-3xl mx-auto px-4 py-8 animate-slide-up">
        {/* Background blobs */}
        <div className="absolute top-20 left-1/3 w-80 h-80 bg-brand-600/10 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-20 right-1/3 w-80 h-80 bg-teal-500/10 rounded-full blur-[100px] pointer-events-none" />

        {/* Results Header Card */}
        <div className="glass-panel rounded-2xl p-8 text-center relative overflow-hidden mb-8 border border-brand-500/15">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-brand-500 via-teal-400 to-brand-500" />
          
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-gray-400 mb-6">
            <Award className="w-4 h-4 text-brand-400" /> Phiên kiểm tra hoàn tất
          </div>

          <h2 className="text-3xl font-extrabold font-display text-white mb-8">Kết Quả Luyện Tập</h2>

          {/* SVG Animated Score Ring */}
          <div className="relative flex items-center justify-center w-40 h-40 mx-auto mb-6">
            <svg className="w-full h-full transform -rotate-90">
              {/* Background circle */}
              <circle
                cx="80"
                cy="80"
                r={radius}
                className="stroke-current text-white/5"
                strokeWidth="10"
                fill="transparent"
              />
              {/* Progress circle */}
              <circle
                cx="80"
                cy="80"
                r={radius}
                className={`stroke-current transition-all duration-1000 ease-out ${
                  accuracyRate >= 80 
                    ? 'text-teal-400' 
                    : accuracyRate >= 50 
                      ? 'text-yellow-400' 
                      : 'text-red-400'
                }`}
                strokeWidth="10"
                fill="transparent"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute flex flex-col items-center justify-center">
              <span className="text-3xl font-extrabold font-display text-white">{accuracyRate}%</span>
              <span className="text-xs text-gray-400 font-semibold uppercase tracking-wider mt-0.5">Chính xác</span>
            </div>
          </div>

          <p className="text-lg text-gray-300 font-medium mb-2">
            Đúng <span className="text-white font-bold text-xl">{score}</span> trên tổng số{' '}
            <span className="text-white font-bold text-xl">{questions.length}</span> câu hỏi {emoji}
          </p>
          <p className={`text-sm ${colorClass} font-semibold mb-8`}>{comment}</p>

          {/* Action buttons */}
          <div className="flex flex-wrap items-center justify-center gap-4">
            <button
              onClick={reset}
              className="px-6 py-3 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-bold text-sm md:text-base transition-all duration-200 flex items-center gap-2 glow-brand cursor-pointer"
            >
              <RefreshCw className="w-4 h-4 animate-spin-hover" /> Luyện tập lại
            </button>
            <button
              onClick={onBack}
              className="px-6 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-white border border-white/10 font-bold text-sm md:text-base transition-all duration-200 flex items-center gap-2 cursor-pointer"
            >
              <Home className="w-4 h-4" /> Về trang chủ
            </button>
          </div>
        </div>

        {/* Detailed Question Review */}
        <div>
          <h3 className="text-lg font-bold font-display text-white mb-4 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-brand-400" /> Xem lại chi tiết từng câu
          </h3>

          <div className="flex flex-col gap-4">
            {questions.map((item, idx) => {
              const userAns = answersLog[idx];
              const isCorrect = userAns === item.correctAnswer;
              const isExpanded = expandedReview[idx];

              return (
                <div
                  key={item.id || idx}
                  className={`glass-panel rounded-xl overflow-hidden border transition-all duration-200 ${
                    isCorrect ? 'border-green-500/10' : 'border-red-500/15'
                  }`}
                >
                  {/* Clickable Header */}
                  <div
                    onClick={() => toggleReview(idx)}
                    className="p-4 flex items-center justify-between cursor-pointer hover:bg-white/5 transition"
                  >
                    <div className="flex items-center gap-3 pr-2 min-w-0">
                      {isCorrect ? (
                        <CheckCircle2 className="w-5 h-5 text-teal-400 shrink-0" />
                      ) : (
                        <XCircle className="w-5 h-5 text-red-400 shrink-0" />
                      )}
                      <span className="font-semibold text-xs md:text-sm text-gray-400 shrink-0">Câu {idx + 1}:</span>
                      <p className="text-gray-200 text-xs md:text-sm truncate font-medium">
                        {item.content}
                      </p>
                    </div>
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4 text-gray-500 shrink-0" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-gray-500 shrink-0" />
                    )}
                  </div>

                  {/* Expanded Body */}
                  {isExpanded && (
                    <div className="px-4 pb-5 pt-2 border-t border-white/5 bg-white/[0.01] text-sm animate-slide-up">
                      <p className="font-semibold text-white mb-3 leading-relaxed">{item.content}</p>
                      
                      {/* Option display */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-4">
                        {item.choices.map((choice, choiceIdx) => {
                          const optionLetter = letters[choiceIdx];
                          const isOptionCorrect = optionLetter === item.correctAnswer;
                          const isOptionSelected = optionLetter === userAns;

                          let borderCls = 'border-white/5 bg-white/5 text-gray-400';
                          if (isOptionCorrect) {
                            borderCls = 'border-teal-500/30 bg-teal-500/10 text-teal-300';
                          } else if (isOptionSelected) {
                            borderCls = 'border-red-500/30 bg-red-500/10 text-red-300';
                          }

                          return (
                            <div key={optionLetter} className={`p-3 rounded-lg border text-xs md:text-sm ${borderCls}`}>
                              {choice}
                            </div>
                          );
                        })}
                      </div>

                      {/* Explanation */}
                      {item.explanation ? (
                        <div className="p-3.5 rounded-lg bg-yellow-500/5 border border-yellow-500/15 text-yellow-200/90 text-xs leading-relaxed">
                          <strong>Giải thích:</strong> {item.explanation}
                        </div>
                      ) : (
                        <div className="p-3.5 rounded-lg bg-white/5 border border-white/5 text-gray-400 text-xs">
                          Không có giải thích chi tiết cho câu hỏi này.
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // Render Active Quiz Wizard State
  return (
    <div className="w-full max-w-3xl mx-auto px-4 py-8 animate-slide-up">
      {/* Background radial glow */}
      <div className="absolute top-10 left-1/4 w-96 h-96 bg-brand-600/10 rounded-full blur-[100px] pulse-glow-bg pointer-events-none" />

      {/* Progress Header */}
      <div className="relative z-10 flex items-center justify-between mb-4">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1 text-sm text-gray-400 hover:text-white transition duration-200 group cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition" /> Về trang chủ
        </button>
        
        <div className="text-xs md:text-sm font-semibold text-gray-400 bg-white/5 border border-white/10 px-3 py-1 rounded-full">
          Câu <span className="text-white font-bold">{current + 1}</span> / {questions.length}
        </div>
      </div>

      {/* Linear progress bar */}
      <div className="relative z-10 w-full h-1.5 bg-white/5 rounded-full mb-8 overflow-hidden">
        <div 
          className="h-full bg-gradient-to-r from-brand-500 to-teal-400 transition-all duration-300 ease-out"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* Question panel */}
      <div className="relative z-10 glass-panel rounded-2xl p-6 md:p-8 mb-6 border border-brand-500/10 overflow-hidden shadow-2xl">
        {/* Corner glow */}
        <div className="absolute top-0 right-0 w-24 h-24 bg-brand-500/20 rounded-full blur-xl pointer-events-none" />

        <div className="flex items-start gap-3.5 mb-6">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-brand-500/15 border border-brand-500/20 text-brand-400 text-sm font-bold shrink-0">
            {current + 1}
          </div>
          <h2 className="text-lg md:text-xl font-bold text-white leading-relaxed mt-0.5">
            {q.content}
          </h2>
        </div>

        {/* Choice list */}
        <div className="flex flex-col gap-3">
          {q.choices.map((choice, i) => {
            const letter = letters[i];
            const isCorrect = letter === q.correctAnswer;
            const isUserSelected = letter === selected;
            
            let btnClass = 'w-full text-left p-4 rounded-xl border text-sm md:text-base font-semibold transition-all duration-300 relative overflow-hidden flex items-center justify-between group ';
            
            if (selected) {
              if (isCorrect) {
                // Correct answer styles
                btnClass += 'border-teal-500/40 bg-teal-500/15 text-teal-300 shadow-md glow-green';
              } else if (isUserSelected) {
                // User selected incorrect styles
                btnClass += 'border-red-500/40 bg-red-500/15 text-red-300 shadow-md glow-red';
              } else {
                // Other non-selected styles
                btnClass += 'border-white/5 bg-white/[0.01] text-gray-500 opacity-40 scale-[0.98]';
              }
            } else {
              // Idle state styles
              btnClass += 'border-brand-500/10 bg-white/5 text-gray-300 hover:border-brand-500/40 hover:bg-brand-500/5 hover:scale-[1.005] active:scale-[0.995] cursor-pointer';
            }

            return (
              <button
                key={letter}
                onClick={() => handleSelect(letter)}
                disabled={!!selected}
                className={btnClass}
              >
                <span className="flex items-center gap-3.5 pr-2">
                  <span className={`flex items-center justify-center w-7 h-7 rounded-md font-bold text-xs shrink-0 transition-colors ${
                    selected 
                      ? isCorrect 
                        ? 'bg-teal-500/20 text-teal-300' 
                        : isUserSelected 
                          ? 'bg-red-500/20 text-red-300' 
                          : 'bg-white/5 text-gray-600'
                      : 'bg-white/5 text-brand-400 group-hover:bg-brand-500 group-hover:text-white'
                  }`}>
                    {letter}
                  </span>
                  <span className="leading-relaxed">{choice}</span>
                </span>
                
                {/* Feedback Icons */}
                {selected && isCorrect && <CheckCircle2 className="w-5 h-5 text-teal-400 shrink-0 ml-2" />}
                {selected && isUserSelected && !isCorrect && <XCircle className="w-5 h-5 text-red-400 shrink-0 ml-2" />}
              </button>
            );
          })}
        </div>

        {/* Answer explanation panel */}
        {selected && q.explanation && (
          <div className="mt-6 p-4 rounded-xl bg-yellow-500/5 border border-yellow-500/15 text-yellow-200/90 text-sm leading-relaxed flex items-start gap-2.5 animate-slide-up">
            <HelpCircle className="w-5 h-5 text-yellow-400 shrink-0 mt-0.5" />
            <div>
              <strong className="text-yellow-400">Giải thích: </strong>
              {q.explanation}
            </div>
          </div>
        )}

        {/* Navigation Action */}
        {selected && (
          <div className="mt-6 flex justify-end animate-slide-up">
            <button
              onClick={next}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-brand-500 to-brand-600 hover:from-brand-600 hover:to-brand-700 text-white font-bold text-sm md:text-base border-t border-brand-400/20 transition shadow-lg glow-brand cursor-pointer flex items-center gap-1.5"
            >
              {current + 1 >= questions.length ? (
                <>Hoàn tất & xem kết quả <Sparkles className="w-4 h-4 text-teal-200" /></>
              ) : (
                'Tiếp tục câu hỏi'
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
