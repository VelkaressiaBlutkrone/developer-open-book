import { useState, useCallback, useRef } from 'react';
import { type RouteConfig, routes } from '../routes';
import { BookReader } from './BookReader';
import { ProgressIndicator } from './ProgressIndicator';
import { SpeechBubble } from './SpeechBubble';
import { NPCMarker } from './NPCMarker';
import AIChat from './AIChat';
import { SPINE_COLORS, seedFromId } from '../data/books';
import { SHELVES as SHELF_REGISTRY } from '../data/shelves';
import { getNPCsByRoom, findDialogueNode, getNPCMarkerType, type NPC, type DialogueNode } from '../data/npcs';
import { getQuestById } from '../data/quests';
import { getAPIKey } from '../ai/claude';
import { WorldMap } from './WorldMap';
import { SoundToggle } from './SoundToggle';
import { DustCanvas, type DustCanvasRef } from './DustCanvas';
import { useProgress } from '../store/ProgressContext';
import { useSound } from '../audio/SoundContext';

const B = import.meta.env.BASE_URL + 'sprites/';

interface ShelfDef {
  id: string;
  label: string;
  icon: string;
  filter: (r: RouteConfig) => boolean;
  pos: string;
}

const SHELF_POSITIONS: Record<string, string> = {
  dart: 'top-left',
  flutter: 'top-center',
  react: 'top-right',
  spring: 'bot-left',
  archive: 'bot-right',
};

const SHELVES: ShelfDef[] = SHELF_REGISTRY.map(s => ({
  id: s.id,
  label: s.name,
  icon: s.icon,
  filter: (r: RouteConfig) => r.shelf === s.id,
  pos: SHELF_POSITIONS[s.id] || 'bot-right',
}));

function chunkArray<T>(arr: T[], size: number): T[][] {
  const result: T[][] = [];
  for (let i = 0; i < arr.length; i += size) result.push(arr.slice(i, i + size));
  return result;
}

/*
 * Consistent 2.5× pixel scale for all sprites.
 * Original → rendered:
 *   table  64×48 → 160×120
 *   chair  32×32 → 80×80
 *   candle 32×32 → 60×60 (slightly smaller, decorative)
 *   plant  32×32 → 80×80
 *   lamp   32×48 → 80×120
 *   wallmap 48×48 → 120×120
 *   NPC    48×48 → 120×120
 */

export function LibraryRoom() {
  const [openShelf, setOpenShelf] = useState<ShelfDef | null>(null);
  const [readingBook, setReadingBook] = useState<RouteConfig | null>(null);
  const [activeNPC, setActiveNPC] = useState<NPC | null>(null);
  const [dialogueNode, setDialogueNode] = useState<DialogueNode | null>(null);
  const [npcMode, setNpcMode] = useState<'select' | 'quest' | null>(null);
  const [aiChatNPC, setAiChatNPC] = useState<NPC | null>(null);
  const [showWorldMap, setShowWorldMap] = useState(false);
  const [currentRoom, setCurrentRoom] = useState('main');
  const [showFlash, setShowFlash] = useState(false);
  const dustRef = useRef<DustCanvasRef>(null);

  const { state, activateQuest, completeQuest, unlockRoom, setTitle } = useProgress();
  const { play } = useSound();
  const roomNPCs = getNPCsByRoom('main');

  const handleBookClick = useCallback((route: RouteConfig) => {
    setOpenShelf(null);
    setReadingBook(route);
  }, []);

  const handleNPCClick = useCallback((npc: NPC) => {
    play('npcTalk');
    setActiveNPC(npc);
    setNpcMode('select');
    setDialogueNode(null);
  }, [play]);

  const handleDialogueSelect = useCallback((nextId: string) => {
    if (!activeNPC) return;
    const node = activeNPC.dialogueTree.find(n => n.id === nextId);
    if (node) {
      // Execute action if present
      if (node.action) {
        switch (node.action.type) {
          case 'give_quest':
            activateQuest(node.action.payload);
            play('questAccept');
            break;
          case 'complete_quest': {
            completeQuest(node.action.payload);
            play('questComplete');
            dustRef.current?.celebrate(window.innerWidth / 2, window.innerHeight / 3);
            setShowFlash(true);
            setTimeout(() => setShowFlash(false), 300);
            const quest = getQuestById(node.action.payload);
            if (quest) {
              for (const reward of quest.rewards) {
                if (reward.type === 'unlock_room') unlockRoom(reward.value);
                if (reward.type === 'title') setTitle(reward.value);
              }
            }
            break;
          }
          case 'unlock_room':
            unlockRoom(node.action.payload);
            break;
          case 'give_title':
            setTitle(node.action.payload);
            break;
        }
      }
      setDialogueNode(node);
    }
  }, [activeNPC, activateQuest, completeQuest, unlockRoom, setTitle]);

  const closeDialogue = useCallback(() => {
    setActiveNPC(null);
    setDialogueNode(null);
    setNpcMode(null);
  }, []);

  const handleSelectQuest = useCallback(() => {
    if (!activeNPC) return;
    setNpcMode('quest');
    const node = findDialogueNode(activeNPC, state);
    if (node) setDialogueNode(node);
  }, [activeNPC, state]);

  const handleSelectAI = useCallback(() => {
    if (!activeNPC) return;
    setAiChatNPC(activeNPC);
    closeDialogue();
  }, [activeNPC, closeDialogue]);

  return (
    <div className="lr">
      <div className="lr-floor" />
      <div className="lr-wall lr-wall-t" />
      <div className="lr-wall lr-wall-b" />
      <div className="lr-wall lr-wall-l" />
      <div className="lr-wall lr-wall-r" />

      {/* Bookshelves */}
      {SHELVES.map(shelf => {
        const books = routes.filter(shelf.filter);
        const empty = books.length === 0;
        return (
          <div key={shelf.id} className={`lr-shelf-wrap lr-shelf-${shelf.pos}`}>
            <button
              className={`lr-shelf ${empty ? 'lr-shelf-empty' : ''}`}
              onClick={() => !empty && setOpenShelf(shelf)}
              aria-label={`${shelf.label} (${books.length}권)`}
            >
              <div className="lr-shelf-books">
                <div className="lr-shelf-bookrow" />
                <div className="lr-shelf-plank" />
                <div className="lr-shelf-bookrow" />
                <div className="lr-shelf-plank" />
                <div className="lr-shelf-bookrow lr-shelf-bookrow-short" />
                <div className="lr-shelf-plank" />
              </div>
            </button>
            <div className="lr-sign">
              <span className="lr-sign-icon">{shelf.icon}</span>
              <span className="lr-sign-text">{shelf.label}</span>
              {!empty && <span className="lr-sign-count">{books.length}</span>}
              {empty && <span className="lr-sign-soon">Soon</span>}
            </div>
          </div>
        );
      })}

      <div className="lr-carpet" />

      {/* ── Wall decorations ── */}
      <img src={B + 'wallmap.png'} alt="도서관 지도" className="lr-sprite lr-wallmap-clickable" width={120} height={120}
        style={{ top: '0%', left: '50%', marginLeft: -60, zIndex: 6, cursor: 'pointer', pointerEvents: 'auto' }}
        onClick={() => setShowWorldMap(true)} title="도서관 지도 열기" />
      <img src={B + 'lamp.png'} alt="" className="lr-sprite" width={80} height={120}
        style={{ top: '0%', left: '33%', zIndex: 6 }} />
      <img src={B + 'lamp.png'} alt="" className="lr-sprite" width={80} height={120}
        style={{ top: '0%', right: '33%', zIndex: 6 }} />

      {/* Side wall candles */}
      <img src={B + 'candle.png'} alt="" className="lr-sprite pixel-candle" width={60} height={60}
        style={{ top: '35%', left: '2.5%', zIndex: 6 }} />
      <div className="lr-glow" style={{ top: '33%', left: '1%', width: '8%', height: '8%' }} />
      <img src={B + 'candle.png'} alt="" className="lr-sprite pixel-candle" width={60} height={60}
        style={{ top: '35%', right: '2.5%', zIndex: 6 }} />
      <div className="lr-glow" style={{ top: '33%', right: '1%', width: '8%', height: '8%' }} />

      {/* ── Central table — librarian ── */}
      <img src={B + 'table.png'} alt="" className="lr-sprite" width={160} height={120}
        style={{ top: '36%', left: '50%', marginLeft: -80 }} />
      <img src={B + 'candle.png'} alt="" className="lr-sprite pixel-candle" width={48} height={48}
        style={{ top: '30%', left: '50%', marginLeft: -24, zIndex: 4 }} />
      <div className="lr-glow" style={{ top: '28%', left: '46%', width: '8%', height: '8%' }} />
      <img src={B + 'chairs/south.png'} alt="" className="lr-sprite" width={80} height={80}
        style={{ top: '54%', left: '50%', marginLeft: -100 }} />
      <img src={B + 'chairs/south.png'} alt="" className="lr-sprite" width={80} height={80}
        style={{ top: '54%', left: '50%', marginLeft: 20 }} />
      {/* Librarian NPC — rendered from data */}
      {(() => {
        const npc = roomNPCs.find(n => n.id === 'librarian');
        if (!npc) return null;
        const marker = getNPCMarkerType(npc, state);
        return (
          <div className="lr-npc-wrap" style={{ position: 'absolute', ...npc.position, zIndex: 6 }}>
            <NPCMarker type={marker} />
            <img src={B + npc.sprite[npc.defaultDirection]} alt={npc.name} className="lr-npc lr-npc-clickable"
              width={110} height={110} onClick={() => handleNPCClick(npc)} />
            {activeNPC?.id === 'librarian' && npcMode === 'select' && (
              <SpeechBubble mode="select" hasApiKey={!!getAPIKey()}
                onSelectQuest={handleSelectQuest} onSelectAI={handleSelectAI}
                onClose={closeDialogue} />
            )}
            {activeNPC?.id === 'librarian' && npcMode === 'quest' && dialogueNode && (
              <SpeechBubble mode="dialogue" text={dialogueNode.text}
                options={dialogueNode.options}
                onSelect={handleDialogueSelect} onClose={closeDialogue} />
            )}
          </div>
        );
      })()}

      {/* ── Left nook — scholar sitting at table ── */}
      <img src={B + 'chairs/east.png'} alt="" className="lr-sprite" width={72} height={72}
        style={{ top: '62%', left: '26%', marginLeft: -80 }} />
      {(() => {
        const npc = roomNPCs.find(n => n.id === 'scholar');
        if (!npc) return null;
        const marker = getNPCMarkerType(npc, state);
        return (
          <div className="lr-npc-wrap" style={{ position: 'absolute', ...npc.position, zIndex: 6 }}>
            <NPCMarker type={marker} />
            <img src={B + npc.sprite[npc.defaultDirection]} alt={npc.name} className="lr-npc lr-npc-clickable"
              width={96} height={96} style={{ animationDelay: '-1.2s' }}
              onClick={() => handleNPCClick(npc)} />
            {activeNPC?.id === 'scholar' && npcMode === 'select' && (
              <SpeechBubble mode="select" hasApiKey={!!getAPIKey()}
                onSelectQuest={handleSelectQuest} onSelectAI={handleSelectAI}
                onClose={closeDialogue} />
            )}
            {activeNPC?.id === 'scholar' && npcMode === 'quest' && dialogueNode && (
              <SpeechBubble mode="dialogue" text={dialogueNode.text}
                options={dialogueNode.options}
                onSelect={handleDialogueSelect} onClose={closeDialogue} />
            )}
          </div>
        );
      })()}
      <img src={B + 'table.png'} alt="" className="lr-sprite" width={128} height={96}
        style={{ top: '58%', left: '26%', marginLeft: -44 }} />
      <img src={B + 'candle.png'} alt="" className="lr-sprite pixel-candle" width={40} height={40}
        style={{ top: '54%', left: '27%', zIndex: 4 }} />
      <div className="lr-glow" style={{ top: '52%', left: '23%', width: '8%', height: '6%' }} />

      {/* ── Right nook — visitor sitting at table ── */}
      <img src={B + 'table.png'} alt="" className="lr-sprite" width={128} height={96}
        style={{ top: '58%', right: '26%', marginRight: -44 }} />
      <img src={B + 'candle.png'} alt="" className="lr-sprite pixel-candle" width={40} height={40}
        style={{ top: '54%', right: '27%', zIndex: 4 }} />
      <div className="lr-glow" style={{ top: '52%', right: '23%', width: '8%', height: '6%' }} />
      <img src={B + 'chairs/west.png'} alt="" className="lr-sprite" width={72} height={72}
        style={{ top: '62%', right: '26%', marginRight: -80 }} />
      {(() => {
        const npc = roomNPCs.find(n => n.id === 'visitor');
        if (!npc) return null;
        const marker = getNPCMarkerType(npc, state);
        return (
          <div className="lr-npc-wrap" style={{ position: 'absolute', ...npc.position, zIndex: 6 }}>
            <NPCMarker type={marker} />
            <img src={B + npc.sprite[npc.defaultDirection]} alt={npc.name} className="lr-npc lr-npc-clickable"
              width={96} height={96} style={{ animationDelay: '-2.5s' }}
              onClick={() => handleNPCClick(npc)} />
            {activeNPC?.id === 'visitor' && npcMode === 'select' && (
              <SpeechBubble mode="select" hasApiKey={!!getAPIKey()}
                onSelectQuest={handleSelectQuest} onSelectAI={handleSelectAI}
                onClose={closeDialogue} />
            )}
            {activeNPC?.id === 'visitor' && npcMode === 'quest' && dialogueNode && (
              <SpeechBubble mode="dialogue" text={dialogueNode.text}
                options={dialogueNode.options}
                onSelect={handleDialogueSelect} onClose={closeDialogue} />
            )}
          </div>
        );
      })()}

      {/* ── Researcher NPC — near React shelf ── */}
      {(() => {
        const npc = roomNPCs.find(n => n.id === 'researcher');
        if (!npc) return null;
        const marker = getNPCMarkerType(npc, state);
        return (
          <div className="lr-npc-wrap" style={{ position: 'absolute', ...npc.position, zIndex: 6 }}>
            <NPCMarker type={marker} />
            <img src={B + npc.sprite[npc.defaultDirection]} alt={npc.name} className="lr-npc lr-npc-clickable"
              width={96} height={96} style={{ animationDelay: '-0.8s' }}
              onClick={() => handleNPCClick(npc)} />
            {activeNPC?.id === 'researcher' && npcMode === 'select' && (
              <SpeechBubble mode="select" hasApiKey={!!getAPIKey()}
                onSelectQuest={handleSelectQuest} onSelectAI={handleSelectAI}
                onClose={closeDialogue} />
            )}
            {activeNPC?.id === 'researcher' && npcMode === 'quest' && dialogueNode && (
              <SpeechBubble mode="dialogue" text={dialogueNode.text}
                options={dialogueNode.options}
                onSelect={handleDialogueSelect} onClose={closeDialogue} />
            )}
          </div>
        );
      })()}

      {/* ── Corner plants ── */}
      <img src={B + 'plant.png'} alt="" className="lr-sprite" width={72} height={72}
        style={{ top: '9%', left: '8.5%', zIndex: 4 }} />
      <img src={B + 'plant.png'} alt="" className="lr-sprite" width={72} height={72}
        style={{ top: '9%', right: '8.5%', zIndex: 4 }} />
      <img src={B + 'plant.png'} alt="" className="lr-sprite" width={72} height={72}
        style={{ bottom: '7%', left: '8.5%', zIndex: 4 }} />
      <img src={B + 'plant.png'} alt="" className="lr-sprite" width={72} height={72}
        style={{ bottom: '7%', right: '8.5%', zIndex: 4 }} />

      {/* ── Side wall plants ── */}
      <img src={B + 'plant.png'} alt="" className="lr-sprite" width={64} height={64}
        style={{ top: '48%', left: '9%', zIndex: 4 }} />
      <img src={B + 'plant.png'} alt="" className="lr-sprite" width={64} height={64}
        style={{ top: '48%', right: '9%', zIndex: 4 }} />

      {/* ── Bottom center decoration ── */}
      <img src={B + 'candle.png'} alt="" className="lr-sprite pixel-candle" width={48} height={48}
        style={{ bottom: '8%', left: '50%', marginLeft: -24, zIndex: 6 }} />
      <div className="lr-glow" style={{ bottom: '6%', left: '47%', width: '6%', height: '6%' }} />
      <img src={B + 'plant.png'} alt="" className="lr-sprite" width={60} height={60}
        style={{ bottom: '7%', left: '50%', marginLeft: -120, zIndex: 4 }} />
      <img src={B + 'plant.png'} alt="" className="lr-sprite" width={60} height={60}
        style={{ bottom: '7%', left: '50%', marginLeft: 60, zIndex: 4 }} />

      {/* ── Lower side candles ── */}
      <img src={B + 'candle.png'} alt="" className="lr-sprite pixel-candle" width={50} height={50}
        style={{ top: '68%', left: '3%', zIndex: 6 }} />
      <div className="lr-glow" style={{ top: '66%', left: '1%', width: '8%', height: '8%' }} />
      <img src={B + 'candle.png'} alt="" className="lr-sprite pixel-candle" width={50} height={50}
        style={{ top: '68%', right: '3%', zIndex: 6 }} />
      <div className="lr-glow" style={{ top: '66%', right: '1%', width: '8%', height: '8%' }} />

      <DustCanvas ref={dustRef} />
      {showFlash && <div className="lr-flash" />}
      <div className="lr-vignette" />

      <div className="lr-title">
        <h1>Developer Open Book</h1>
        <p>책장을 클릭하여 도서를 탐색하세요</p>
      </div>

      {/* Progress indicator — top right corner */}
      <div className="lr-progress">
        <SoundToggle />
        <ProgressIndicator />
      </div>

      {openShelf && (
        <ShelfModal
          shelf={openShelf}
          books={routes.filter(openShelf.filter)}
          onClose={() => setOpenShelf(null)}
          onBookClick={handleBookClick}
        />
      )}

      {showWorldMap && (
        <WorldMap
          currentRoom={currentRoom}
          unlockedRooms={state.unlockedRooms}
          onSelectRoom={(roomId) => { setCurrentRoom(roomId); setShowWorldMap(false); }}
          onClose={() => setShowWorldMap(false)}
        />
      )}

      {readingBook && (
        <BookReader route={readingBook} onClose={() => setReadingBook(null)} />
      )}

      {aiChatNPC && (
        <AIChat npc={aiChatNPC} onClose={() => setAiChatNPC(null)} />
      )}
    </div>
  );
}

function ShelfModal({ shelf, books, onClose, onBookClick }: {
  shelf: ShelfDef; books: RouteConfig[];
  onClose: () => void; onBookClick: (r: RouteConfig) => void;
}) {
  return (
    <div className="shelf-modal-overlay" onClick={onClose}>
      <div className="shelf-modal" onClick={e => e.stopPropagation()}>
        <div className="shelf-modal-header">
          <span style={{ fontSize: '1.3rem' }}>{shelf.icon}</span>
          <h2>{shelf.label}</h2>
          <span className="shelf-modal-count">{books.length}권</span>
          <button className="shelf-modal-close" onClick={onClose}>&times;</button>
        </div>
        <div className="shelf-modal-books">
          {books.length === 0 && (
            <div className="shelf-modal-empty">
              <span style={{ fontSize: '2rem' }}>{shelf.icon}</span>
              <p>이 책장은 아직 준비 중입니다</p>
              <p style={{ fontSize: '0.8rem', opacity: 0.5 }}>Coming Soon</p>
            </div>
          )}
          {chunkArray(books, 10).map((row, ri) => (
            <div key={ri} className="modal-shelf-unit">
              <div className="modal-shelf-row">
                {row.map((book, i) => {
                  const seed = seedFromId(book.path);
                  const height = 130 + (seed % 50);
                  const thickness = 28 + (seed % 18);
                  const color = SPINE_COLORS[seed % SPINE_COLORS.length];
                  const stepMatch = book.title.match(/Step\s*(\d+)/i);
                  const stepLabel = stepMatch ? `Step ${stepMatch[1]}` : '';
                  const titleOnly = book.title.replace(/Step\s*\d+\s*[-—]\s*/i, '').trim();
                  return (
                    <div key={book.path} className="modal-book" role="button" tabIndex={0}
                      title={book.title}
                      style={{ '--height': `${height}px`, '--thickness': `${thickness}px`, animationDelay: `${0.03*i}s` } as React.CSSProperties}
                      onClick={() => onBookClick(book)}
                      onKeyDown={e => { if (e.key==='Enter'||e.key===' ') { e.preventDefault(); onBookClick(book); } }}>
                      <div className="modal-book-spine" style={{ backgroundColor: color }}>
                        <span className="modal-spine-title">{titleOnly}</span>
                        {stepLabel && <span className="modal-spine-badge">{stepLabel}</span>}
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="modal-shelf-plank" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
