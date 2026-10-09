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
      {/* La ruota.
          Disegnata come una ruota vera e non come un cerchio che gira:
          gomma scura con il battistrada, cerchio in lega chiaro, sei
          razze, disco del freno e mozzo rosso. A sessantaquattro pixel
          sono i dettagli che la fanno leggere come una ruota di moto
          invece che come una rotella qualunque.

          Il battistrada e' una riga tratteggiata lungo la circonferenza:
          piu' economico di venti trattini disegnati uno per uno, e
          girando da' lo stesso l'impressione della gomma che scorre. */}
      <div className="relative flex h-16 w-16 items-center justify-center">
        <svg
          className="dueffe-intro-wheel"
          width="64"
          height="64"
          viewBox="0 0 100 100"
          fill="none"
        >
          <circle cx="50" cy="50" r="45" stroke="#17171c" strokeWidth="10" />
          <circle
            cx="50"
            cy="50"
            r="45"
            stroke="#2e2e36"
            strokeWidth="10"
            strokeDasharray="4 7"
          />
          <circle cx="50" cy="50" r="38" stroke="#9aa1ad" strokeWidth="3.5" />
          <circle cx="50" cy="50" r="20" stroke="#5c626d" strokeWidth="2" />

          {/* Sei razze: con meno la ruota sembra ferma anche mentre gira,
              con piu' a questa misura diventano una macchia. */}
          <g stroke="#c3c9d4" strokeWidth="4" strokeLinecap="round">
            <line x1="50" y1="14" x2="50" y2="86" />
            <line x1="18.8" y1="32" x2="81.2" y2="68" />
            <line x1="18.8" y1="68" x2="81.2" y2="32" />
          </g>

          <circle cx="50" cy="50" r="9" fill="#0e0f14" />
          <circle cx="50" cy="50" r="5" fill="#D00020" />
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
        /* La ruota parte ferma, prende velocita' e resta in moto: una
           ruota che gira a velocita' costante dal primo istante sembra
           una rotella di caricamento, una che accelera sembra una moto
           che parte. */
        @keyframes dueffeIntroWheelSpin {
          0%   { transform: rotate(0deg); }
          22%  { transform: rotate(70deg); }
          100% { transform: rotate(1100deg); }
        }
        .dueffe-intro-wheel {
          transform-origin: 50% 50%;
          animation: dueffeIntroWheelSpin 1.9s cubic-bezier(0.4, 0, 0.6, 1) forwards;
        }
        /* Chi ha chiesto meno animazioni vede la ruota ferma: il
           caricamento dura lo stesso e non si perde niente. */
        @media (prefers-reduced-motion: reduce) {
          .dueffe-intro-wheel { animation: none; }
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
