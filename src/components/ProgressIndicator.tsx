import { useState } from 'react'
import { useProgress } from '../store/ProgressContext'
import { getCompletedCount, getTotalBooks, getCompletionPercent } from '../store/progress'
import { BADGES, getBadgeById } from '../store/badges'

export function ProgressIndicator() {
  const { state } = useProgress()
  const [showPanel, setShowPanel] = useState(false)

  const completed = getCompletedCount(state)
  const total = getTotalBooks()
  const percent = getCompletionPercent(state)
  const streak = state.streak.current
  const earnedBadges = state.badges.map(id => getBadgeById(id)).filter(Boolean)
  const totalTimeMin = Math.round(state.totals.totalTimeMs / 60_000)

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
          <span className="progress-indicator-streak" title={`${streak}일 연속 읽기`}>
            🔥 {streak}
          </span>
        )}
      </button>

      {showPanel && (
        <>
          <div className="progress-panel-overlay" onClick={() => setShowPanel(false)} />
          <div className="progress-panel">
            <h3 className="progress-panel-title">📊 읽기 현황</h3>

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
          </div>
        </>
      )}
    </div>
  )
}
