export function OrbitMark({ size = 18, theme = 'light' }: { size?: number; theme?: 'light' | 'dark' }) {
  return (
    <img
      src={theme === 'dark' ? '/da-ai-dark-mode.png' : '/da-ai-light-mode.png'}
      alt=""
      aria-hidden="true"
      width={size}
      height={size}
      style={{
        width: size,
        height: size,
        borderRadius: Math.round(size * 0.28),
        display: 'block',
        flexShrink: 0,
        objectFit: 'cover',
      }}
    />
  );
}
