import type { DialogueNode } from '../npcs'

export const researcherDialogue: DialogueNode[] = [
  // ── react-q1 ──
  { id: 'rq1-complete', text: 'React 3권을 읽으셨군요! Hook의 매력을 느끼셨나요?',
    condition: { type: 'quest_completable', target: 'react-q1' },
    action: { type: 'complete_quest', payload: 'react-q1' } },
  { id: 'rq1-active', text: 'React 서가에서 3권을 읽어보세요. JSX와 컴포넌트부터 시작하면 좋습니다.',
    condition: { type: 'quest_active', target: 'react-q1' } },
  { id: 'rq1-offer', text: '안녕하세요. 저는 React 생태계를 연구하고 있습니다. React의 세계에 관심이 있으시군요?',
    condition: { type: 'quest_not_started', target: 'react-q1' },
    options: [
      { text: 'React를 배우고 싶습니다!', next: 'rq1-accept' },
      { text: '아직은 괜찮습니다.', next: 'rq1-later' },
    ] },
  { id: 'rq1-accept', text: '좋습니다. 오른쪽 위 React 서가에서 3권을 읽어오세요.',
    action: { type: 'give_quest', payload: 'react-q1' } },
  { id: 'rq1-later', text: '언제든 준비되면 다시 오세요.' },

  // ── react-q2 ──
  { id: 'rq2-complete', text: '10권! 렌더링의 비밀을 파헤치고 계시는군요.',
    condition: { type: 'quest_completable', target: 'react-q2' },
    action: { type: 'complete_quest', payload: 'react-q2' } },
  { id: 'rq2-active', text: 'React 10권까지 읽어보세요. Reconciliation과 Hook 패턴이 핵심입니다.',
    condition: { type: 'quest_active', target: 'react-q2' } },
  { id: 'rq2-offer', text: '기초를 잡았으니 이제 렌더링의 비밀을 파헤쳐볼까요?',
    condition: { type: 'quest_not_started', target: 'react-q2' },
    options: [{ text: '렌더링을 이해하고 싶습니다!', next: 'rq2-accept' }] },
  { id: 'rq2-accept', text: '가상 DOM, Fiber, Reconciliation — 흥미로운 여정이 될 겁니다.',
    action: { type: 'give_quest', payload: 'react-q2' } },

  // ── react-q3 ──
  { id: 'rq3-complete', text: 'React Server Components까지... 최신 패러다임을 꿰뚫고 계시군요!',
    condition: { type: 'quest_completable', target: 'react-q3' },
    action: { type: 'complete_quest', payload: 'react-q3' } },
  { id: 'rq3-active', text: 'React Server Components 문서를 끝까지 읽어보세요.',
    condition: { type: 'quest_active', target: 'react-q3' } },
  { id: 'rq3-offer', text: 'React의 미래는 서버 컴포넌트에 있습니다. 이 영역을 탐구해보시겠어요?',
    condition: { type: 'quest_not_started', target: 'react-q3' },
    options: [{ text: '서버의 영역으로!', next: 'rq3-accept' }] },
  { id: 'rq3-accept', text: 'Step 20을 집중해서 읽어보세요. 패러다임이 바뀔 겁니다.',
    action: { type: 'give_quest', payload: 'react-q3' } },

  // ── react-q4 ──
  { id: 'rq4-complete', text: 'React 43권 전부... 당신은 이제 React 현자입니다. 경의를 표합니다.',
    condition: { type: 'quest_completable', target: 'react-q4' },
    action: { type: 'complete_quest', payload: 'react-q4' } },
  { id: 'rq4-active', text: 'React 전권 완독 도전 중이시군요. 마지막까지 포기하지 마세요.',
    condition: { type: 'quest_active', target: 'react-q4' } },
  { id: 'rq4-offer', text: '마지막 연구 과제입니다. React 전권을 완독할 수 있겠습니까?',
    condition: { type: 'quest_not_started', target: 'react-q4' },
    options: [{ text: '해내겠습니다.', next: 'rq4-accept' }] },
  { id: 'rq4-accept', text: '그 결심이면 충분합니다. 기다리겠습니다.',
    action: { type: 'give_quest', payload: 'react-q4' } },

  // ── Fallback ──
  { id: 'default', text: 'React는 끊임없이 진화하는 생태계입니다. 함께 연구해봅시다.' },
]
