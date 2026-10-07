'use client';

import React, { useEffect, useState } from 'react';

/**
 * Overlay di accensione mostrato una sola volta per sessione, prima che
 * compaia l'hero vero. Il sessionStorage evita che si rigiochi ogni volta
 * che si naviga tra le pagine; chi ha "riduci le animazioni" attivo non
 * la vede per niente.
 */
const STORAGE_KEY = 'dueffe-intro-seen';

export const IntroOverlay: React.FC = () => {
  const [visible, setVisible] = useState(false);
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    const alreadySeen = window.sessionStorage.getItem(STORAGE_KEY);
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (alreadySeen || reducedMotion) {
      window.sessionStorage.setItem(STORAGE_KEY, '1');
      return;
    }

    setVisible(true);
    const leaveTimer = setTimeout(() => setLeaving(true), 1500);
    const hideTimer = setTimeout(() => {
      setVisible(false);
      window.sessionStorage.setItem(STORAGE_KEY, '1');
    }, 1900);

    return () => {
      clearTimeout(leaveTimer);
      clearTimeout(hideTimer);
    };
  }, []);

  if (!visible) return null;

  return (
    <div
      aria-hidden="true"
      className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center gap-4 bg-[#070709] transition-opacity duration-300 ${
        leaving ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      <div className="relative flex h-16 w-16 items-center justify-center rounded-full border-2 border-white/10 bg-[#0e0f14]">
        <svg
          className="dueffe-intro-key"
          width="20"
          height="46"
          viewBox="0 0 56 130"
          fill="none"
          stroke="#D00020"
          strokeWidth={4.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="28" cy="22" r="18" />
          <circle cx="28" cy="22" r="5" fill="#D00020" stroke="none" />
          <line x1="28" y1="40" x2="28" y2="100" />
          <line x1="28" y1="80" x2="40" y2="80" />
          <line x1="28" y1="92" x2="38" y2="92" />
        </svg>
      </div>

      <div className="dueffe-intro-lights flex gap-3">
        <span className="h-2.5 w-2.5 rounded-full" />
        <span className="h-2.5 w-2.5 rounded-full" />
        <span className="h-2.5 w-2.5 rounded-full" />
      </div>

      <div className="dueffe-intro-wordmark font-display text-lg font-extrabold uppercase tracking-wide text-slate-100">
        DUEFFE <span className="text-[#D00020]">MOTO</span>
      </div>

      <style jsx>{`
        @keyframes dueffeIntroKeyTurn {
          0% { transform: rotate(-28deg); }
          16% { transform: rotate(-28deg); }
          26% { transform: rotate(32deg); }
          100% { transform: rotate(32deg); }
        }
        .dueffe-intro-key {
          transform-origin: 50% 72%;
          animation: dueffeIntroKeyTurn 1.9s ease-in-out forwards;
        }
        @keyframes dueffeIntroLightOn {
          0%, 24% { background: #3a0a10; box-shadow: none; }
          30% { background: #D00020; box-shadow: 0 0 10px 3px rgba(208, 0, 32, 0.8); }
          100% { background: #D00020; box-shadow: 0 0 10px 3px rgba(208, 0, 32, 0.8); }
        }
        .dueffe-intro-lights span {
          background: #3a0a10;
          animation: dueffeIntroLightOn 1.9s ease-in-out forwards;
        }
        .dueffe-intro-lights span:nth-child(2) { animation-delay: 0.08s; }
        .dueffe-intro-lights span:nth-child(3) { animation-delay: 0.16s; }
        @keyframes dueffeIntroWordmarkIn {
          0%, 28% { opacity: 0; text-shadow: none; }
          34% { opacity: 1; text-shadow: 0 0 18px rgba(208, 0, 32, 0.9); }
          40% { opacity: 0.3; text-shadow: none; }
          46% { opacity: 1; text-shadow: 0 0 18px rgba(208, 0, 32, 0.9); }
          100% { opacity: 1; text-shadow: 0 0 10px rgba(208, 0, 32, 0.5); }
        }
        .dueffe-intro-wordmark {
          opacity: 0;
          animation: dueffeIntroWordmarkIn 1.9s linear forwards;
        }
      `}</style>
    </div>
  );
};
