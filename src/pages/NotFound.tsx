import { useNavigate } from 'react-router-dom';

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '60vh',
      textAlign: 'center',
      padding: '2rem',
      gap: '1.2rem',
    }}>
      <span style={{ fontSize: '4rem' }}>📖</span>
      <h1 style={{ fontSize: '2rem', margin: 0 }}>404</h1>
      <p style={{ fontSize: '1.1rem', opacity: 0.7 }}>
        이 책은 도서관에 없습니다
      </p>
      <button
        onClick={() => navigate('/')}
        style={{
          padding: '0.6rem 1.6rem',
          fontSize: '0.95rem',
          border: '2px solid var(--gold, #b8860b)',
          borderRadius: '6px',
          background: 'transparent',
          color: 'inherit',
          cursor: 'pointer',
          marginTop: '0.5rem',
        }}
      >
        도서관으로 돌아가기
      </button>
    </div>
  );
}
