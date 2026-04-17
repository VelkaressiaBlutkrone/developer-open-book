import type { DialogueNode } from '../npcs'

export const librarianDialogue: DialogueNode[] = [
  // ── main-1: 첫 발걸음 ──
  { id: 'main1-complete', text: '첫 번째 책을 다 읽으셨군요! 대단합니다. 이 배지를 받으세요.',
    condition: { type: 'quest_completable', target: 'main-1' },
    action: { type: 'complete_quest', payload: 'main-1' } },
  { id: 'main1-active', text: '아무 책이나 하나 골라서 끝까지 읽어보세요. 기다리고 있겠습니다.',
    condition: { type: 'quest_active', target: 'main-1' } },
  { id: 'main1-offer', text: '도서관에 오신 것을 환영합니다! 이곳에는 다양한 프로그래밍 서적이 있어요. 먼저 아무 책이나 하나 읽어보시겠어요?',
    condition: { type: 'quest_not_started', target: 'main-1' },
    options: [
      { text: '네, 시작할게요!', next: 'main1-accept' },
      { text: '잠시만요, 둘러볼게요.', next: 'main1-later' },
    ] },
  { id: 'main1-accept', text: '좋아요! 책장을 클릭해서 원하는 책을 골라보세요.',
    action: { type: 'give_quest', payload: 'main-1' } },
  { id: 'main1-later', text: '천천히 둘러보세요. 준비되면 다시 말 걸어주세요.' },

  // ── main-2: 세 갈래 길 ──
  { id: 'main2-complete', text: '세 분야를 모두 맛보셨군요! 진정한 탐험가예요.',
    condition: { type: 'quest_completable', target: 'main-2' },
    action: { type: 'complete_quest', payload: 'main-2' } },
  { id: 'main2-active', text: 'Dart, Flutter, React — 세 분야에서 각각 한 권씩 읽어보세요.',
    condition: { type: 'quest_active', target: 'main-2' } },
  { id: 'main2-offer', text: '이 도서관에는 세 개의 주요 서가가 있어요. Dart, Flutter, React — 각 분야에서 한 권씩 읽어보시겠어요?',
    condition: { type: 'quest_not_started', target: 'main-2' },
    options: [{ text: '도전해볼게요!', next: 'main2-accept' }] },
  { id: 'main2-accept', text: '각 책장을 클릭해서 다양한 분야를 경험해보세요!',
    action: { type: 'give_quest', payload: 'main-2' } },

  // ── main-3: 동쪽으로 ──
  { id: 'main3-complete', text: '10권을 완독하셨군요! 동관의 문이 열렸습니다.',
    condition: { type: 'quest_completable', target: 'main-3' },
    action: { type: 'complete_quest', payload: 'main-3' } },
  { id: 'main3-active', text: '총 10권을 완독하면 동관으로 가는 길이 열립니다. 계속 읽어보세요!',
    condition: { type: 'quest_active', target: 'main-3' } },
  { id: 'main3-offer', text: '이 도서관에는 숨겨진 방이 있어요. 10권을 완독하면 동관의 문을 열어드리겠습니다.',
    condition: { type: 'quest_not_started', target: 'main-3' },
    options: [{ text: '열어주세요!', next: 'main3-accept' }] },
  { id: 'main3-accept', text: '벽에 걸린 지도를 확인해보세요. 진행 상황을 볼 수 있습니다.',
    action: { type: 'give_quest', payload: 'main-3' } },

  // ── main-4: 서쪽으로 ──
  { id: 'main4-complete', text: '두 분야를 깊이 파셨군요! 서관의 문이 열렸습니다.',
    condition: { type: 'quest_completable', target: 'main-4' },
    action: { type: 'complete_quest', payload: 'main-4' } },
  { id: 'main4-active', text: '두 개 카테고리에서 각 5권 이상 읽으면 서관이 열립니다.',
    condition: { type: 'quest_active', target: 'main-4' } },
  { id: 'main4-offer', text: '서관에는 더 많은 지식이 기다리고 있어요. 두 개 분야에서 각각 5권 이상 읽어보시겠어요?',
    condition: { type: 'quest_not_started', target: 'main-4' },
    options: [{ text: '도전합니다!', next: 'main4-accept' }] },
  { id: 'main4-accept', text: '깊이 있는 학습이 시작됩니다!',
    action: { type: 'give_quest', payload: 'main-4' } },

  // ── main-5: 전설의 독서가 ──
  { id: 'main5-complete', text: '50권... 당신은 진정한 전설의 독서가입니다! 2층이 열렸습니다.',
    condition: { type: 'quest_completable', target: 'main-5' },
    action: { type: 'complete_quest', payload: 'main-5' } },
  { id: 'main5-active', text: '50권을 향해 나아가세요. 2층에서 특별한 것이 기다리고 있습니다.',
    condition: { type: 'quest_active', target: 'main-5' } },
  { id: 'main5-offer', text: '이 도서관의 최상층에는 아무나 올라갈 수 없어요. 50권을 완독한 자만이...',
    condition: { type: 'quest_not_started', target: 'main-5' },
    options: [{ text: '반드시 올라가겠습니다.', next: 'main5-accept' }] },
  { id: 'main5-accept', text: '그 각오라면... 기대하겠습니다.',
    action: { type: 'give_quest', payload: 'main-5' } },

  // ── Fallback ──
  { id: 'default', text: '도서관에서 즐거운 시간 보내고 계신가요? 궁금한 것이 있으면 언제든 말 걸어주세요.' },
]
