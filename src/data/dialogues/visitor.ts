import type { DialogueNode } from '../npcs'

export const visitorDialogue: DialogueNode[] = [
  // ── flutter-q1 ──
  { id: 'fq1-complete', text: 'Flutter 3권을 읽으셨군요! 위젯의 세계에 발을 들이셨네요.',
    condition: { type: 'quest_completable', target: 'flutter-q1' },
    action: { type: 'complete_quest', payload: 'flutter-q1' } },
  { id: 'fq1-active', text: 'Flutter 서가에서 3권을 읽어보세요. 위젯 개념부터 익히면 좋아요.',
    condition: { type: 'quest_active', target: 'flutter-q1' } },
  { id: 'fq1-offer', text: '안녕하세요! 저는 여러 나라를 여행하며 앱을 만드는 Flutter 개발자예요. 같이 배워볼래요?',
    condition: { type: 'quest_not_started', target: 'flutter-q1' },
    options: [
      { text: 'Flutter를 배우고 싶어요!', next: 'fq1-accept' },
      { text: '다음에요.', next: 'fq1-later' },
    ] },
  { id: 'fq1-accept', text: '좋아요! Flutter 서가에서 3권을 읽어보세요.',
    action: { type: 'give_quest', payload: 'flutter-q1' } },
  { id: 'fq1-later', text: '언제든 환영이에요!' },

  // ── flutter-q2 ──
  { id: 'fq2-complete', text: '10권! 상태 관리까지 다루셨네요. 대단해요!',
    condition: { type: 'quest_completable', target: 'flutter-q2' },
    action: { type: 'complete_quest', payload: 'flutter-q2' } },
  { id: 'fq2-active', text: 'Flutter 10권까지 읽어보세요. 상태 관리가 핵심이에요.',
    condition: { type: 'quest_active', target: 'flutter-q2' } },
  { id: 'fq2-offer', text: '위젯을 알았으니 이제 상태 관리를 배워볼까요? 10권까지 도전!',
    condition: { type: 'quest_not_started', target: 'flutter-q2' },
    options: [{ text: '상태를 다스리겠습니다!', next: 'fq2-accept' }] },
  { id: 'fq2-accept', text: 'setState부터 Provider까지, 화이팅!',
    action: { type: 'give_quest', payload: 'flutter-q2' } },

  // ── flutter-q3 ──
  { id: 'fq3-complete', text: 'Clean Architecture를 이해하셨군요! 프로 개발자의 눈을 가지셨네요.',
    condition: { type: 'quest_completable', target: 'flutter-q3' },
    action: { type: 'complete_quest', payload: 'flutter-q3' } },
  { id: 'fq3-active', text: 'Flutter Clean Architecture 문서를 끝까지 읽어보세요.',
    condition: { type: 'quest_active', target: 'flutter-q3' } },
  { id: 'fq3-offer', text: '진짜 앱을 만들려면 아키텍처가 중요해요. Clean Architecture를 읽어보시겠어요?',
    condition: { type: 'quest_not_started', target: 'flutter-q3' },
    options: [{ text: '아키텍처를 배우겠습니다!', next: 'fq3-accept' }] },
  { id: 'fq3-accept', text: 'Step 21을 집중해서 읽어보세요. 관점이 달라질 거예요.',
    action: { type: 'give_quest', payload: 'flutter-q3' } },

  // ── flutter-q4 ──
  { id: 'fq4-complete', text: 'Flutter 31권 전부! 당신은 진정한 Flutter 장인이에요!',
    condition: { type: 'quest_completable', target: 'flutter-q4' },
    action: { type: 'complete_quest', payload: 'flutter-q4' } },
  { id: 'fq4-active', text: 'Flutter 전권 완독 도전 중이시네요. 끝까지 힘내세요!',
    condition: { type: 'quest_active', target: 'flutter-q4' } },
  { id: 'fq4-offer', text: '마지막 여정입니다. Flutter 전권을 완독할 수 있겠어요?',
    condition: { type: 'quest_not_started', target: 'flutter-q4' },
    options: [{ text: '반드시 해내겠습니다.', next: 'fq4-accept' }] },
  { id: 'fq4-accept', text: '그 열정이면 분명 해낼 수 있을 거예요!',
    action: { type: 'give_quest', payload: 'flutter-q4' } },

  // ── Fallback ──
  { id: 'default', text: 'Flutter로 만들 수 있는 건 무궁무진해요. 같이 탐험해봐요!' },
]
