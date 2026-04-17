interface Props {
  type: '!' | '?' | null
}

export function NPCMarker({ type }: Props) {
  if (!type) return null
  return (
    <span className={`npc-marker ${type === '!' ? 'npc-marker-complete' : 'npc-marker-available'}`}>
      {type}
    </span>
  )
}
