import { ROOMS } from '../data/rooms'
import { getQuestById } from '../data/quests'

interface Props {
  currentRoom: string
  unlockedRooms: string[]
  onSelectRoom: (roomId: string) => void
  onClose: () => void
}

const ROOM_LAYOUT: Record<string, { top: string; left: string }> = {
  upper: { top: '15%', left: '35%' },
  west:  { top: '45%', left: '8%' },
  main:  { top: '45%', left: '35%' },
  east:  { top: '45%', left: '62%' },
}

export function WorldMap({ currentRoom, unlockedRooms, onSelectRoom, onClose }: Props) {
  return (
    <div className="world-map-overlay" onClick={onClose}>
      <div className="world-map" onClick={e => e.stopPropagation()}>
        <div className="world-map-header">
          <h2>도서관 지도</h2>
          <button className="world-map-close" onClick={onClose}>&times;</button>
        </div>

        <div className="world-map-grid">
          {ROOMS.map(room => {
            const pos = ROOM_LAYOUT[room.id]
            const unlocked = unlockedRooms.includes(room.id)
            const isCurrent = room.id === currentRoom
            const unlockQuest = room.unlockQuest ? getQuestById(room.unlockQuest) : null

            return (
              <button
                key={room.id}
                className={`world-map-room ${unlocked ? 'unlocked' : 'locked'} ${isCurrent ? 'current' : ''}`}
                style={{ top: pos.top, left: pos.left }}
                onClick={() => unlocked && onSelectRoom(room.id)}
                disabled={!unlocked}
                title={unlocked ? room.description : `"${unlockQuest?.title ?? ''}" 퀘스트 완료 필요`}
              >
                {!unlocked && <span className="world-map-lock">🔒</span>}
                {isCurrent && <span className="world-map-marker" />}
                <span className="world-map-room-name">{room.name}</span>
                {room.shelves.length > 0 && (
                  <span className="world-map-room-info">{room.shelves.length}개 서가</span>
                )}
              </button>
            )
          })}

          {/* Connecting paths */}
          <div className="world-map-path world-map-path-h" style={{ top: '52%', left: '30%', width: '5%' }} />
          <div className="world-map-path world-map-path-h" style={{ top: '52%', left: '57%', width: '5%' }} />
          <div className="world-map-path world-map-path-v" style={{ top: '30%', left: '47%', height: '15%' }} />
        </div>
      </div>
    </div>
  )
}
