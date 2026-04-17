import { useState, useRef, useEffect } from 'react'
import { useProgress } from '../store/ProgressContext'
import { getCompletedCount, getTotalBooks, getCompletionPercent } from '../store/progress'
import { BADGES, getBadgeById } from '../store/badges'
import { QUESTS, getAvailableQuests, checkRequirements } from '../data/quests'
import { APIKeySettings } from './APIKeySettings'

export function ProgressIndicator() {
  const { state } = useProgress()
  const [showPanel, setShowPanel] = useState(false)
  const [tab, setTab] = useState<'stats' | 'quests' | 'settings'>('stats')

  const completed = getCompletedCount(state)
  const total = getTotalBooks()
  const percent = getCompletionPercent(state)
  const streak = state.streak.current
  const earnedBadges = state.badges.map(id => getBadgeById(id)).filter(Boolean)
  const totalTimeMin = Math.round(state.totals.totalTimeMs / 60_000)

  // Quest data
  const activeQuests = QUESTS.filter(q => state.quests[q.id] === 'active')
  const completedQuests = QUESTS.filter(q => state.quests[q.id] === 'completed')
  const availableQuests = getAvailableQuests(state)
  const activeCount = activeQuests.length

  // Streak pulse animation
  const [streakPulse, setStreakPulse] = useState(false)
  const prevStreak = useRef(streak)
  useEffect(() => {
    if (streak > prevStreak.current) {
      setStreakPulse(true)
      setTimeout(() => setStreakPulse(false), 500)
    }
    prevStreak.current = streak
  }, [streak])

  return (
    <div className="progress-indicator">
      <button
        className="progress-indicator-btn"
        onClick={() => setShowPanel(!showPanel)}
        aria-label="읽기 진행 상태"
        title={`${completed}/${total}권 완독 (${percent}%)`}
      >
        <span className="progress-indicator-books">
          📖 {completed}/{total}
        </span>
        {streak > 0 && (
          <span className={`progress-indicator-streak ${streakPulse ? 'streak-pulse' : ''}`} title={`${streak}일 연속 읽기`}>
            🔥 {streak}
          </span>
        )}
        {activeCount > 0 && (
          <span className="progress-indicator-quests" title={`${activeCount}개 퀘스트 진행 중`}>
            📜 {activeCount}
          </span>
        )}
      </button>

      {showPanel && (
        <>
          <div className="progress-panel-overlay" onClick={() => setShowPanel(false)} />
          <div className="progress-panel">
            {/* Tabs */}
            <div className="progress-tabs">
              <button
                className={`progress-tab ${tab === 'stats' ? 'active' : ''}`}
                onClick={() => setTab('stats')}
              >
                📊 현황
              </button>
              <button
                className={`progress-tab ${tab === 'quests' ? 'active' : ''}`}
                onClick={() => setTab('quests')}
              >
                📜 퀘스트 {activeCount > 0 && `(${activeCount})`}
              </button>
              <button
                className={`progress-tab ${tab === 'settings' ? 'active' : ''}`}
                onClick={() => setTab('settings')}
              >
                ⚙️ 설정
              </button>
            </div>

            {tab === 'stats' && (
              <>
                {/* Progress bar */}
                <div className="progress-bar-container">
                  <div className="progress-bar-fill" style={{ width: `${percent}%` }} />
                  <span className="progress-bar-label">{completed}/{total}권 ({percent}%)</span>
                </div>

                {/* Stats */}
                <div className="progress-stats">
                  <div className="progress-stat">
                    <span className="progress-stat-label">총 읽기 시간</span>
                    <span className="progress-stat-value">
                      {totalTimeMin < 60
                        ? `${totalTimeMin}분`
                        : `${Math.floor(totalTimeMin / 60)}시간 ${totalTimeMin % 60}분`}
                    </span>
                  </div>
                  <div className="progress-stat">
                    <span className="progress-stat-label">현재 스트릭</span>
                    <span className="progress-stat-value">{streak}일</span>
                  </div>
                  <div className="progress-stat">
                    <span className="progress-stat-label">최장 스트릭</span>
                    <span className="progress-stat-value">{state.streak.longest}일</span>
                  </div>
                  {state.title && (
                    <div className="progress-stat">
                      <span className="progress-stat-label">칭호</span>
                      <span className="progress-stat-value">{state.title}</span>
                    </div>
                  )}
                </div>

                {/* Badges */}
                <h4 className="progress-panel-subtitle">🏅 배지 ({earnedBadges.length}/{BADGES.length})</h4>
                <div className="progress-badges">
                  {BADGES.map(badge => {
                    const earned = state.badges.includes(badge.id)
                    return (
                      <div
                        key={badge.id}
                        className={`progress-badge ${earned ? 'earned' : 'locked'}`}
                        title={earned ? `${badge.name}: ${badge.description}` : '???'}
                      >
                        <span
                          className="progress-badge-icon"
                          dangerouslySetInnerHTML={{ __html: earned ? badge.icon : '' }}
                        />
                        <span className="progress-badge-name">
                          {earned ? badge.name : '???'}
                        </span>
                      </div>
                    )
                  })}
                </div>
              </>
            )}

            {tab === 'quests' && (
              <div className="progress-quest-list">
                {/* Active quests */}
                {activeQuests.length > 0 && (
                  <>
                    <h4 className="progress-panel-subtitle">진행 중</h4>
                    {activeQuests.map(q => {
                      const met = checkRequirements(q.id, state)
                      return (
                        <div key={q.id} className={`progress-quest ${met ? 'completable' : ''}`}>
                          <div className="progress-quest-header">
                            <span className="progress-quest-title">{met ? '❗' : '📋'} {q.title}</span>
                          </div>
                          <div className="progress-quest-desc">{q.description}</div>
                          {met && <div className="progress-quest-hint">NPC에게 말을 걸어 완료하세요!</div>}
                        </div>
                      )
                    })}
                  </>
                )}

                {/* Available quests */}
                {availableQuests.length > 0 && (
                  <>
                    <h4 className="progress-panel-subtitle">수락 가능</h4>
                    {availableQuests.slice(0, 5).map(q => (
                      <div key={q.id} className="progress-quest available">
                        <div className="progress-quest-header">
                          <span className="progress-quest-title">❓ {q.title}</span>
                        </div>
                        <div className="progress-quest-desc">{q.description}</div>
                      </div>
                    ))}
                  </>
                )}

                {/* Completed quests */}
                {completedQuests.length > 0 && (
                  <>
                    <h4 className="progress-panel-subtitle">완료 ({completedQuests.length})</h4>
                    {completedQuests.map(q => (
                      <div key={q.id} className="progress-quest completed">
                        <span className="progress-quest-title">✅ {q.title}</span>
                      </div>
                    ))}
                  </>
                )}

                {activeQuests.length === 0 && availableQuests.length === 0 && completedQuests.length === 0 && (
                  <div className="progress-quest-empty">
                    NPC에게 말을 걸어 퀘스트를 받아보세요!
                  </div>
                )}
              </div>
            )}

            {tab === 'settings' && <APIKeySettings />}
          </div>
        </>
      )}
    </div>
  )
}
