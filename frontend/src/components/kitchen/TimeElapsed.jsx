import React, { useEffect, useState } from 'react';

/**
 * Live-updating elapsed timer pill.
 * Normal = blue-tinted. Late (>15 min) = red + pulse.
 */
function TimeElapsed({ createdAt }) {
  const [label, setLabel] = useState('0 min');
  const [isLate, setIsLate] = useState(false);

  useEffect(() => {
    const tick = () => {
      const ms  = Date.now() - new Date(createdAt).getTime();
      const min = Math.floor(ms / 60000);
      const sec = Math.floor((ms % 60000) / 1000);
      setLabel(min > 0 ? `${min} min` : `${sec}s`);
      setIsLate(ms > 15 * 60 * 1000);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [createdAt]);

  return (
    <span
      className={`inline-flex items-center gap-1 text-xs font-semibold tabular-nums px-2 py-[3px] rounded-full ${
        isLate ? 'text-red-400 animate-pulse' : 'text-blue-400'
      }`}
    >
      {/* Clock SVG icon */}
      <svg viewBox="0 0 24 24" className="w-3 h-3 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
      </svg>
      {label}
    </span>
  );
}

export default TimeElapsed;
