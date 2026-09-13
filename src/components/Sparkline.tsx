export function Sparkline({ data }: { data?: number[] }) {
  if (!data || data.length === 0) return null;
  const w = 200, h = 48, pad = 4;
  const min = Math.min(...data) - 2;
  const max = Math.max(...data) + 2;
  const range = max - min || 1;
  
  const pts = data.map((v, i) => {
    const x = pad + (i / (data.length - 1 || 1)) * (w - 2 * pad);
    const y = h - pad - ((v - min) / range) * (h - 2 * pad);
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  });
  
  const lastPt = pts[pts.length - 1].split(',');
  const cx = lastPt[0];
  const cy = lastPt[1];

  return (
    <svg viewBox={`0 0 ${w} ${h}`} width="100%" height="48" style={{ overflow: 'visible', marginTop: 12 }}>
      <polyline 
        points={pts.join(' ')} 
        fill="none" 
        stroke="var(--primary-dark, currentColor)" 
        strokeWidth="2.5" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      />
      <circle 
        cx={cx} 
        cy={cy} 
        r="4" 
        fill="var(--primary-dark, currentColor)"
      />
    </svg>
  );
}
