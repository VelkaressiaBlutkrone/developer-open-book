import type { DialogueNode } from '../npcs'

export const scholarDialogue: DialogueNode[] = [
  // ── dart-q1 ──
  { id: 'dq1-complete', text: 'Dart 3권을 읽으셨군요! 기초가 탄탄해지고 있어요.',
    condition: { type: 'quest_completable', target: 'dart-q1' },
    action: { type: 'complete_quest', payload: 'dart-q1' } },
  { id: 'dq1-active', text: 'Dart 서가에서 3권을 읽어보세요. 변수, 타입, 함수부터 시작하면 좋아요.',
    condition: { type: 'quest_active', target: 'dart-q1' } },
  { id: 'dq1-offer', text: '안녕하세요. 저는 Dart를 연구하는 학자입니다. Dart를 배우고 싶으시다면 기초부터 시작해볼까요?',
    condition: { type: 'quest_not_started', target: 'dart-q1' },
    options: [
      { text: 'Dart를 배우고 싶어요!', next: 'dq1-accept' },
      { text: '나중에요.', next: 'dq1-later' },
    ] },
  { id: 'dq1-accept', text: '좋습니다! 왼쪽 위 Dart 서가에서 3권을 읽어오세요.',
    action: { type: 'give_quest', payload: 'dart-q1' } },
  { id: 'dq1-later', text: '언제든 준비되면 오세요.' },

  // ── dart-q2 ──
  { id: 'dq2-complete', text: '10권! 이제 Dart의 핵심을 꿰뚫고 있군요.',
    condition: { type: 'quest_completable', target: 'dart-q2' },
    action: { type: 'complete_quest', payload: 'dart-q2' } },
  { id: 'dq2-active', text: 'Dart 10권까지 읽어보세요. 컬렉션, 클래스, OOP까지 깊이 들어가봅시다.',
    condition: { type: 'quest_active', target: 'dart-q2' } },
  { id: 'dq2-offer', text: '기초를 마쳤으니 이제 더 깊이 들어가볼까요? 10권까지 도전해보세요.',
    condition: { type: 'quest_not_started', target: 'dart-q2' },
    options: [{ text: '도전합니다!', next: 'dq2-accept' }] },
  { id: 'dq2-accept', text: '문법을 넘어서 진정한 Dart 프로그래머가 되어보세요.',
    action: { type: 'give_quest', payload: 'dart-q2' } },

  // ── dart-q3 ──
  { id: 'dq3-complete', text: '비동기 프로그래밍을 정복하셨군요! 이건 쉽지 않은 주제인데...',
    condition: { type: 'quest_completable', target: 'dart-q3' },
    action: { type: 'complete_quest', payload: 'dart-q3' } },
  { id: 'dq3-active', text: 'Async, Future, Stream — Dart의 비동기 세계를 완독해보세요.',
    condition: { type: 'quest_active', target: 'dart-q3' } },
  { id: 'dq3-offer', text: 'Dart의 진정한 힘은 비동기에 있습니다. Step 14를 완독해보시겠어요?',
    condition: { type: 'quest_not_started', target: 'dart-q3' },
    options: [{ text: '비동기의 세계로!', next: 'dq3-accept' }] },
  { id: 'dq3-accept', text: 'Future와 Stream을 마스터하면 Flutter도 수월해질 겁니다.',
    action: { type: 'give_quest', payload: 'dart-q3' } },

  // ── dart-q4 ──
  { id: 'dq4-complete', text: 'Dart 23권 전부... 당신은 진정한 Dart 마스터입니다!',
    condition: { type: 'quest_completable', target: 'dart-q4' },
    action: { type: 'complete_quest', payload: 'dart-q4' } },
  { id: 'dq4-active', text: 'Dart 전체 23권을 완독하면 "Dart 마스터" 칭호를 드리겠습니다.',
    condition: { type: 'quest_active', target: 'dart-q4' } },
  { id: 'dq4-offer', text: '마지막 도전입니다. Dart 전권을 완독할 수 있겠습니까?',
    condition: { type: 'quest_not_started', target: 'dart-q4' },
    options: [{ text: '해내겠습니다.', next: 'dq4-accept' }] },
  { id: 'dq4-accept', text: '그 눈빛... 믿겠습니다.',
    action: { type: 'give_quest', payload: 'dart-q4' } },

  // ── Fallback ──
  { id: 'default', text: 'Dart는 깔끔하고 강력한 언어입니다. 궁금한 게 있으면 물어보세요.' },
]
