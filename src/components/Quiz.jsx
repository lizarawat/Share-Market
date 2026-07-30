import React, { useState } from 'react';
import { useMarket } from '../context/MarketContext';
import { 
  Award, 
  HelpCircle, 
  CheckCircle, 
  Lock, 
  ArrowLeft,
  ChevronRight,
  BookOpen,
  Trophy,
  Flame
} from 'lucide-react';

const Quiz = () => {
  const { lessons, submitQuizAnswers, badges, xp, getLevelInfo, setActiveTab } = useMarket();
  const [activeQuizLesson, setActiveQuizLesson] = useState(null);
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [currentScore, setCurrentScore] = useState(0);

  const { level, rankName } = getLevelInfo();
  const completedQuizCount = lessons.filter(l => l.completed).length;

  const startQuiz = (lesson) => {
    setActiveQuizLesson(lesson);
    setAnswers({});
    setSubmitted(false);
    setCurrentScore(0);
  };

  const handleSelectOption = (qIdx, optIdx) => {
    if (submitted) return;
    setAnswers(prev => ({
      ...prev,
      [qIdx]: optIdx
    }));
  };

  const handleSubmit = () => {
    let score = 0;
    activeQuizLesson.quiz.forEach((q, idx) => {
      if (answers[idx] === q.correctAnswer) {
        score++;
      }
    });

    setCurrentScore(score);
    setSubmitted(true);
    submitQuizAnswers(activeQuizLesson.id, score);
  };

  const resetQuiz = () => {
    setActiveQuizLesson(null);
  };

  // 1. Render Active Quiz Sheet
  if (activeQuizLesson) {
    const isCompletedBefore = activeQuizLesson.completed;
    return (
      <div className="glass-card fade-in-up" style={{ minHeight: '480px', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        
        {/* Quiz Header controls */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)', paddingBottom: '0.85rem' }}>
          <button onClick={resetQuiz} className="btn btn-secondary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}>
            <ArrowLeft size={14} /> Back to Challenges
          </button>
          <div style={{ textAlign: 'right' }}>
            <span style={{ fontSize: '0.7rem', color: 'var(--accent)', textTransform: 'uppercase', fontWeight: 700 }}>QUIZ MODE</span>
            <h4 style={{ fontSize: '0.9rem', fontWeight: 700 }}>{activeQuizLesson.title}</h4>
          </div>
        </div>

        {/* Questions list */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', margin: '0.5rem 0', flex: 1 }}>
          {activeQuizLesson.quiz.map((q, qIdx) => {
            return (
              <div key={qIdx} style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 600 }}>Q{qIdx + 1}: {q.question}</h4>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  {q.options.map((opt, oIdx) => {
                    const isChosen = answers[qIdx] === oIdx;
                    const isCorrect = oIdx === q.correctAnswer;
                    
                    let style = {
                      width: '100%',
                      textAlign: 'left',
                      padding: '0.75rem 1rem',
                      borderRadius: '8px',
                      border: '1px solid var(--border)',
                      background: 'rgba(255,255,255,0.01)',
                      color: 'var(--text-secondary)',
                      cursor: 'pointer',
                      fontSize: '0.85rem',
                      fontWeight: 500,
                      transition: 'all var(--transition-fast)'
                    };

                    if (isChosen) {
                      style.border = '1px solid var(--primary)';
                      style.background = 'var(--primary-glow)';
                      style.color = '#fff';
                    }

                    if (submitted) {
                      style.cursor = 'default';
                      if (isCorrect) {
                        style.border = '1px solid var(--success)';
                        style.background = 'var(--success-glow)';
                        style.color = 'var(--success)';
                      } else if (isChosen) {
                        style.border = '1px solid var(--danger)';
                        style.background = 'var(--danger-glow)';
                        style.color = 'var(--danger)';
                      }
                    }

                    return (
                      <button
                        key={oIdx}
                        disabled={submitted}
                        onClick={() => handleSelectOption(qIdx, oIdx)}
                        style={style}
                        className={!submitted ? "glass-card-interactive" : ""}
                      >
                        <span style={{ marginRight: '0.5rem', fontWeight: 700, color: isChosen ? 'var(--primary)' : 'var(--text-muted)' }}>
                          {String.fromCharCode(65 + oIdx)}.
                        </span>
                        {opt}
                      </button>
                    );
                  })}
                </div>

                {submitted && (
                  <div style={{
                    padding: '0.75rem 1rem',
                    background: 'rgba(255,255,255,0.01)',
                    borderLeft: `3px solid ${answers[qIdx] === q.correctAnswer ? 'var(--success)' : 'var(--danger)'}`,
                    fontSize: '0.75rem',
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

        {/* Action Bottom Section */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border)', paddingTop: '1rem' }}>
          {!submitted ? (
            <>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Make sure to read the slides in Lessons if you get stuck.</span>
              <button
                onClick={handleSubmit}
                disabled={Object.keys(answers).length < activeQuizLesson.quiz.length}
                className={`btn btn-success ${Object.keys(answers).length < activeQuizLesson.quiz.length ? 'btn-disabled' : ''}`}
              >
                Submit Answers <CheckCircle size={16} />
              </button>
            </>
          ) : (
            <>
              <div>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 700 }}>
                  Score: <span style={{ color: currentScore === activeQuizLesson.quiz.length ? 'var(--success)' : 'var(--warning)' }}>{currentScore} / {activeQuizLesson.quiz.length}</span>
                </h4>
                <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                  {isCompletedBefore ? "You already unlocked the XP reward." : `+${activeQuizLesson.xpReward} XP has been awarded!`}
                </p>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button onClick={() => { resetQuiz(); setActiveTab('simulator'); }} className="btn btn-primary" style={{ padding: '0.45rem 0.95rem', fontSize: '0.8rem' }}>
                  Paper Trading Simulator <ChevronRight size={14} />
                </button>
                <button onClick={resetQuiz} className="btn btn-secondary" style={{ padding: '0.45rem 0.95rem', fontSize: '0.8rem' }}>
                  Done
                </button>
              </div>
            </>
          )}
        </div>

      </div>
    );
  }

  // 2. Render Main Achievements & Quiz List Screen
  return (
    <div className="fade-in-up" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* Page Title */}
      <div>
        <h1 style={{ fontSize: '2.2rem', fontWeight: 800 }}>Challenge & Achievements</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>Verify your knowledge through quiz modules, track leveling milestones, and inspect badges.</p>
      </div>

      {/* Stats Summary Grid */}
      <div className="grid-3">
        {/* Level & Rank */}
        <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{
            background: 'var(--primary-glow)',
            color: 'var(--primary)',
            padding: '0.75rem',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Flame size={24} />
          </div>
          <div>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Trading Level</span>
            <h4 style={{ fontSize: '1.1rem', fontWeight: 700, marginTop: '0.15rem' }}>Lvl {level} : {rankName}</h4>
          </div>
        </div>

        {/* XP Points */}
        <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{
            background: 'rgba(6, 182, 212, 0.1)',
            color: 'var(--accent)',
            padding: '0.75rem',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Trophy size={24} />
          </div>
          <div>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Accumulated XP</span>
            <h4 style={{ fontSize: '1.1rem', fontWeight: 700, marginTop: '0.15rem' }}>{xp} XP Points</h4>
          </div>
        </div>

        {/* Quizzes Solved */}
        <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{
            background: 'var(--success-glow)',
            color: 'var(--success)',
            padding: '0.75rem',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <CheckCircle size={24} />
          </div>
          <div>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Quizzes Passed</span>
            <h4 style={{ fontSize: '1.1rem', fontWeight: 700, marginTop: '0.15rem' }}>{completedQuizCount} / {lessons.length} Completed</h4>
          </div>
        </div>
      </div>

      {/* Main Grid: Left Side Badges, Right Side Quiz Selector */}
      <div className="grid-main-layout">
        
        {/* Left Side: Quiz List */}
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <HelpCircle size={18} color="var(--accent)" />
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Module Quiz Challenges</h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {lessons.map((lesson, index) => {
              const isLocked = index > 0 && !lessons[index - 1].completed;
              const isCompleted = lesson.completed;

              return (
                <div
                  key={lesson.id}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '0.85rem 1rem',
                    borderRadius: '10px',
                    border: '1px solid var(--border)',
                    background: 'rgba(255,255,255,0.01)',
                    opacity: isLocked ? 0.55 : 1
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    {isCompleted ? (
                      <CheckCircle size={16} color="var(--success)" />
                    ) : isLocked ? (
                      <Lock size={16} color="var(--text-muted)" />
                    ) : (
                      <HelpCircle size={16} color="var(--primary)" />
                    )}
                    <div>
                      <h4 style={{ fontSize: '0.85rem', fontWeight: 700 }}>{lesson.title}</h4>
                      <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>{lesson.category} • +{lesson.xpReward} XP</span>
                    </div>
                  </div>

                  <div>
                    {isCompleted ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span className="badge badge-success" style={{ fontSize: '0.7rem' }}>
                          Score: {lesson.quizScore}/{lesson.quiz.length}
                        </span>
                        <button onClick={() => startQuiz(lesson)} className="btn btn-secondary" style={{ padding: '0.3rem 0.6rem', fontSize: '0.7rem' }}>
                          Retake
                        </button>
                      </div>
                    ) : isLocked ? (
                      <span className="badge badge-warning" style={{ fontSize: '0.7rem' }}>Locked</span>
                    ) : (
                      <button onClick={() => startQuiz(lesson)} className="btn btn-primary" style={{ padding: '0.35rem 0.75rem', fontSize: '0.7rem' }}>
                        Take Challenge
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Side: Badges Showroom */}
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Award size={18} color="var(--primary)" />
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Unlocked Reward Badges</h3>
          </div>

          {badges.length === 0 ? (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '2.5rem 1rem',
              textAlign: 'center',
              border: '1px dashed var(--border)',
              borderRadius: '10px'
            }}>
              <Award size={36} color="var(--text-muted)" style={{ marginBottom: '0.5rem', opacity: 0.5 }} />
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>No badges unlocked yet.</p>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>Buy your first stock or pass module quizzes to earn achievements!</span>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', overflowY: 'auto', maxHeight: '350px', paddingRight: '0.1rem' }}>
              {badges.map((badge, idx) => (
                <div
                  key={idx}
                  style={{
                    background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.04), rgba(255,255,255,0.01))',
                    border: '1px solid rgba(245, 158, 11, 0.15)',
                    borderRadius: '10px',
                    padding: '0.75rem 1rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem'
                  }}
                >
                  <div style={{
                    background: 'rgba(245, 158, 11, 0.15)',
                    color: '#f59e0b',
                    padding: '0.45rem',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 0 10px rgba(245, 158, 11, 0.1)'
                  }}>
                    <Award size={18} />
                  </div>
                  <div>
                    <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: '#f59e0b' }}>{badge.name}</h4>
                    <p style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: '0.15rem' }}>{badge.description}</p>
                    <span style={{ fontSize: '0.6rem', color: 'var(--text-muted)', display: 'block', marginTop: '0.2rem' }}>Earned: {badge.earnedAt}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

    </div>
  );
};

export default Quiz;
