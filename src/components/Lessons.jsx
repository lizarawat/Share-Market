import React, { useState } from 'react';
import { useMarket } from '../context/MarketContext';
import { 
  BookOpen, 
  CheckCircle, 
  Lock, 
  ArrowLeft, 
  ArrowRight,
  HelpCircle,
  Award,
  ChevronRight,
  BookOpenCheck
} from 'lucide-react';

const Lessons = () => {
  const { lessons, submitQuizAnswers, activeTab, setActiveTab } = useMarket();
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [quizMode, setQuizMode] = useState(false);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizScore, setQuizScore] = useState(0);

  const completedCount = lessons.filter(l => l.completed).length;

  const startLesson = (lesson) => {
    setSelectedLesson(lesson);
    setCurrentSlideIndex(0);
    setQuizMode(false);
    setSelectedAnswers({});
    setQuizSubmitted(false);
    setQuizScore(0);
  };

  const handleNextSlide = () => {
    if (currentSlideIndex < selectedLesson.slides.length - 1) {
      setCurrentSlideIndex(prev => prev + 1);
    } else {
      setQuizMode(true);
    }
  };

  const handlePrevSlide = () => {
    if (currentSlideIndex > 0) {
      setCurrentSlideIndex(prev => prev - 1);
    }
  };

  const handleSelectAnswer = (questionIndex, optionIndex) => {
    if (quizSubmitted) return;
    setSelectedAnswers(prev => ({
      ...prev,
      [questionIndex]: optionIndex
    }));
  };

  const handleQuizSubmit = () => {
    let score = 0;
    selectedLesson.quiz.forEach((q, idx) => {
      if (selectedAnswers[idx] === q.correctAnswer) {
        score++;
      }
    });

    setQuizScore(score);
    setQuizSubmitted(true);
    
    // Mark as completed in Context
    submitQuizAnswers(selectedLesson.id, score);
  };

  const closeLesson = () => {
    setSelectedLesson(null);
  };

  // Render Lesson Detail / Reader
  if (selectedLesson) {
    const slides = selectedLesson.slides;
    const isLastSlide = currentSlideIndex === slides.length - 1;

    return (
      <div className="glass-card fade-in-up" style={{ minHeight: '500px', display: 'flex', flexDirection: 'column', gap: '1.5rem', position: 'relative' }}>
        
        {/* Top controls */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)', paddingBottom: '1rem' }}>
          <button onClick={closeLesson} className="btn btn-secondary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}>
            <ArrowLeft size={14} /> Back to Lessons
          </button>
          <div style={{ textAlign: 'right' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{selectedLesson.category}</span>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 700 }}>{selectedLesson.title}</h4>
          </div>
        </div>

        {!quizMode ? (
          /* SLIDE READER MODE */
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '1.5rem', justifyContent: 'center' }}>
            
            {/* Progress tracker */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--primary)', fontWeight: 600 }}>SLIDE {currentSlideIndex + 1} OF {slides.length}</span>
              <div style={{ width: '120px', height: '4px', background: 'rgba(255,255,255,0.08)', borderRadius: '99px', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${((currentSlideIndex + 1) / slides.length) * 100}%`, background: 'var(--primary)', transition: 'width 0.3s ease' }}></div>
              </div>
            </div>

            {/* Slide content */}
            <div style={{ minHeight: '220px', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#fff' }}>{slides[currentSlideIndex].title}</h2>
              <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6', fontSize: '1rem' }}>
                {slides[currentSlideIndex].content}
              </p>
              
              {/* Concept visual rendering */}
              {slides[currentSlideIndex].visualData && (
                <div style={{
                  marginTop: '1.5rem',
                  padding: '1.25rem',
                  background: 'rgba(255,255,255,0.01)',
                  border: '1px dashed var(--border)',
                  borderRadius: '12px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '0.75rem'
                }}>
                  <p style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--accent)' }}>Concept: {slides[currentSlideIndex].concept}</p>
                  
                  {/* Visual segment rendering */}
                  <div style={{ display: 'flex', gap: '1rem', width: '100%', maxWidth: '300px', height: '24px', borderRadius: '6px', overflow: 'hidden' }}>
                    {slides[currentSlideIndex].visualData.segments.map(seg => (
                      <div 
                        key={seg.name} 
                        style={{ 
                          width: `${seg.value}%`, 
                          backgroundColor: seg.color, 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'center',
                          fontSize: '0.65rem',
                          fontWeight: 700,
                          color: '#fff'
                        }}
                      >
                        {seg.value}%
                      </div>
                    ))}
                  </div>
                  <div style={{ display: 'flex', gap: '1.5rem', fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
                    {slides[currentSlideIndex].visualData.segments.map(seg => (
                      <span key={seg.name} style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', backgroundColor: seg.color }}></span>
                        {seg.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Slide Navigation controls */}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1.5rem', borderTop: '1px solid var(--border)', paddingTop: '1.25rem' }}>
              <button 
                onClick={handlePrevSlide} 
                className={`btn btn-secondary ${currentSlideIndex === 0 ? 'btn-disabled' : ''}`}
                disabled={currentSlideIndex === 0}
              >
                <ArrowLeft size={16} /> Previous
              </button>
              
              <button 
                onClick={handleNextSlide} 
                className="btn btn-primary"
              >
                {isLastSlide ? "Go to Quiz 📝" : "Next Slide"} <ArrowRight size={16} />
              </button>
            </div>

          </div>
        ) : (
          /* QUIZ MODE */
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent)' }}>
              <HelpCircle size={18} />
              <span style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Lesson Challenge</span>
            </div>
            
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Answer the questions below to earn your XP!</h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem', margin: '1rem 0' }}>
              {selectedLesson.quiz.map((q, qIdx) => {
                const isSelected = selectedAnswers[qIdx] !== undefined;
                return (
                  <div key={qIdx} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    <h4 style={{ fontSize: '0.95rem', fontWeight: 600 }}>Q{qIdx + 1}: {q.question}</h4>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      {q.options.map((opt, oIdx) => {
                        const isChosen = selectedAnswers[qIdx] === oIdx;
                        const isCorrect = oIdx === q.correctAnswer;
                        
                        let optionStyle = {
                          width: '100%',
                          textAlign: 'left',
                          padding: '0.85rem 1rem',
                          borderRadius: '10px',
                          border: '1px solid var(--border)',
                          background: 'rgba(255, 255, 255, 0.02)',
                          color: 'var(--text-secondary)',
                          cursor: 'pointer',
                          transition: 'all var(--transition-fast)',
                          fontWeight: 500,
                          fontSize: '0.85rem'
                        };

                        if (isChosen) {
                          optionStyle.border = '1px solid var(--primary)';
                          optionStyle.background = 'var(--primary-glow)';
                          optionStyle.color = '#fff';
                        }

                        if (quizSubmitted) {
                          optionStyle.cursor = 'default';
                          if (isCorrect) {
                            optionStyle.border = '1px solid var(--success)';
                            optionStyle.background = 'var(--success-glow)';
                            optionStyle.color = 'var(--success)';
                          } else if (isChosen) {
                            optionStyle.border = '1px solid var(--danger)';
                            optionStyle.background = 'var(--danger-glow)';
                            optionStyle.color = 'var(--danger)';
                          }
                        }

                        return (
                          <button
                            key={oIdx}
                            disabled={quizSubmitted}
                            onClick={() => handleSelectAnswer(qIdx, oIdx)}
                            style={optionStyle}
                            className={!quizSubmitted ? "glass-card-interactive" : ""}
                          >
                            <span style={{ marginRight: '0.75rem', fontWeight: 700, color: isChosen ? 'var(--primary)' : 'var(--text-muted)' }}>
                              {String.fromCharCode(65 + oIdx)}.
                            </span>
                            {opt}
                          </button>
                        );
                      })}
                    </div>

                    {quizSubmitted && (
                      <div style={{
                        padding: '0.75rem 1rem',
                        background: 'rgba(255,255,255,0.01)',
                        borderLeft: `3px solid ${selectedAnswers[qIdx] === q.correctAnswer ? 'var(--success)' : 'var(--danger)'}`,
                        fontSize: '0.8rem',
                        color: 'var(--text-secondary)',
                        borderRadius: '0 6px 6px 0'
                      }}>
                        <strong>Explanation:</strong> {q.explanation}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Quiz footer actions */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border)', paddingTop: '1.25rem', marginTop: '1rem' }}>
              {!quizSubmitted ? (
                <>
                  <button onClick={() => setQuizMode(false)} className="btn btn-secondary">
                    Back to Slides
                  </button>
                  <button 
                    onClick={handleQuizSubmit} 
                    disabled={Object.keys(selectedAnswers).length < selectedLesson.quiz.length}
                    className={`btn btn-success ${Object.keys(selectedAnswers).length < selectedLesson.quiz.length ? 'btn-disabled' : ''}`}
                  >
                    Submit Quiz Answers <CheckCircle size={16} />
                  </button>
                </>
              ) : (
                <>
                  <div>
                    <h4 style={{ fontSize: '1rem', fontWeight: 700 }}>
                      Score: <span style={{ color: quizScore === selectedLesson.quiz.length ? 'var(--success)' : 'var(--warning)' }}>{quizScore} / {selectedLesson.quiz.length}</span>
                    </h4>
                    <p style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>+{selectedLesson.xpReward} XP awarded automatically.</p>
                  </div>
                  <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <button onClick={() => {
                      // Trigger simulator or close
                      closeLesson();
                      setActiveTab('simulator');
                    }} className="btn btn-primary">
                      Open Paper Trading Simulator <ChevronRight size={14} />
                    </button>
                    <button onClick={closeLesson} className="btn btn-secondary">
                      Done
                    </button>
                  </div>
                </>
              )}
            </div>

          </div>
        )}

      </div>
    );
  }

  // Render Lesson Selector List
  return (
    <div className="fade-in-up" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* Header */}
      <div>
        <h1 style={{ fontSize: '2.2rem', fontWeight: 800 }}>Financial Education Path</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>Complete each module, solve the challenges, earn XP, and unlock badges to rank up.</p>
      </div>

      {/* Progress header */}
      <div className="glass-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.25rem 1.5rem', background: 'linear-gradient(90deg, var(--bg-card), rgba(99,102,241,0.03))' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ background: 'rgba(99, 102, 241, 0.1)', color: 'var(--primary)', padding: '0.6rem', borderRadius: '10px' }}>
            <BookOpenCheck size={24} />
          </div>
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Modules Completed</h3>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Unlock and complete all 5 classes to become a certified Market Guru.</p>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <div style={{ textAlign: 'right' }}>
            <span style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--primary)' }}>{completedCount}</span>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}> / {lessons.length}</span>
          </div>
          {/* Circular/Linear visual bar */}
          <div style={{ width: '150px', height: '8px', background: 'rgba(255,255,255,0.06)', borderRadius: '99px', overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${(completedCount / lessons.length) * 100}%`, background: 'var(--primary)', transition: 'width 0.4s ease' }}></div>
          </div>
        </div>
      </div>

      {/* Lesson List Grid */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {lessons.map((lesson, index) => {
          // Check if previous lesson is completed (lock mechanism)
          const isLocked = index > 0 && !lessons[index - 1].completed;
          const isCompleted = lesson.completed;

          return (
            <div 
              key={lesson.id}
              className={`glass-card ${isLocked ? 'btn-disabled' : 'glass-card-interactive'}`}
              onClick={() => {
                if (!isLocked) startLesson(lesson);
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '1.25rem 1.5rem',
                opacity: isLocked ? 0.55 : 1,
                borderLeft: isCompleted 
                  ? '4px solid var(--success)' 
                  : isLocked 
                    ? '4px solid var(--border)' 
                    : '4px solid var(--primary)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', flex: 1 }}>
                {isCompleted ? (
                  <div style={{ color: 'var(--success)' }}><CheckCircle size={22} /></div>
                ) : isLocked ? (
                  <div style={{ color: 'var(--text-muted)' }}><Lock size={22} /></div>
                ) : (
                  <div style={{ color: 'var(--primary)', animation: 'pulse 2s infinite' }}><BookOpen size={22} /></div>
                )}
                
                <div>
                  <span style={{ fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: isLocked ? 'var(--text-muted)' : 'var(--accent)', fontWeight: 700 }}>
                    {lesson.category}
                  </span>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: '0.15rem 0' }}>{lesson.title}</h3>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', maxWidth: '600px' }}>{lesson.description}</p>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                <span className="badge badge-primary">
                  +{lesson.xpReward} XP
                </span>
                
                {isCompleted ? (
                  <span className="badge badge-success">
                    Score: {lesson.quizScore}/{lesson.quiz?.length || 2}
                  </span>
                ) : isLocked ? (
                  <span className="badge badge-warning" style={{ fontSize: '0.7rem' }}>
                    Locked
                  </span>
                ) : (
                  <button className="btn btn-primary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem' }}>
                    Start Module
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
};

export default Lessons;
