import React from 'react';

interface DueffeLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showRacer?: boolean;
}

export const DueffeLogo: React.FC<DueffeLogoProps> = ({
  className = '',
  size = 'md',
  showRacer = true,
}) => {
  const sizeMap = {
    sm: { width: 140, height: 48 },
    md: { width: 200, height: 68 },
    lg: { width: 280, height: 96 },
    xl: { width: 380, height: 130 },
  };

  const { width, height } = sizeMap[size];

  return (
    <div className={`inline-flex items-center select-none ${className}`}>
      <svg
        viewBox="0 0 400 140"
        width={width}
        height={height}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="overflow-visible"
        aria-label="Dueffe Moto Logo"
      >
        {/* Racer Silhouette atop the wordmark */}
        {showRacer && (
          <g transform="translate(130, -5) scale(0.68)">
            {/* Speed racer contour lines: tucked position, helmet, visor, aero back, handlebars, fairing, tail cowl */}
            <path
              d="M 170 55 C 160 40, 145 25, 130 20 C 115 15, 100 20, 95 35 C 90 48, 98 62, 108 65 C 118 68, 130 65, 135 60 C 145 75, 160 85, 175 88 C 190 90, 205 85, 218 75 C 230 65, 240 50, 248 38 L 225 32 C 215 45, 205 55, 192 60 C 182 63, 175 60, 170 55 Z"
              fill="#FFFFFF"
            />
            {/* Racer Helmet & Visor */}
            <path
              d="M 120 18 C 112 12, 100 14, 94 22 C 88 30, 90 42, 98 46 C 104 49, 115 48, 122 40 C 127 34, 127 24, 120 18 Z"
              fill="#FFFFFF"
            />
            <path
              d="M 115 25 C 112 23, 106 25, 103 28 C 100 32, 102 36, 106 37 C 110 38, 116 35, 118 31 Z"
              fill="#070709"
            />
            {/* Streamlined body contour lines */}
            <path
              d="M 15 88 C 45 45, 100 25, 160 28 C 220 30, 260 70, 280 92"
              stroke="#FFFFFF"
              strokeWidth="4.5"
              strokeLinecap="round"
              fill="none"
            />
            <path
              d="M 60 92 C 90 70, 130 62, 170 65 C 205 68, 235 88, 255 105"
              stroke="#FFFFFF"
              strokeWidth="3.5"
              strokeLinecap="round"
              fill="none"
            />
            {/* Aerodynamic Tail / Cowl */}
            <path
              d="M 5 95 L 45 78 L 75 90 L 35 105 Z"
              stroke="#FFFFFF"
              strokeWidth="3"
              strokeLinejoin="round"
              fill="none"
            />
            {/* Front clip-on handle & windscreen arc */}
            <path
              d="M 230 48 L 260 42 L 285 75 L 255 82 Z"
              stroke="#FFFFFF"
              strokeWidth="3"
              strokeLinejoin="round"
              fill="none"
            />
            {/* Rear wheel arch hint */}
            <path
              d="M 10 108 C 25 102, 50 105, 65 118"
              stroke="#FFFFFF"
              strokeWidth="3.5"
              strokeLinecap="round"
              fill="none"
            />
          </g>
        )}

        {/* Wordmark: "dueffe" in white + red descending stem on 'f' */}
        <g transform="translate(10, 68)">
          {/* "due" in white */}
          <text
            x="0"
            y="30"
            fontFamily="'Syne', 'Plus Jakarta Sans', sans-serif"
            fontWeight="800"
            fontSize="48"
            fill="#FFFFFF"
            letterSpacing="-0.03em"
          >
            due
          </text>

          {/* First "f" with signature long red tail going down */}
          {/* Top arc of f in white */}
          <path
            d="M 105 10 C 110 5, 118 2, 126 3 L 126 12 C 122 11, 118 12, 115 15 C 114 16, 113 18, 113 22 L 113 24 L 126 24 L 126 31 L 113 31 L 113 72 C 113 75, 110 77, 107 77 L 101 77 C 98 77, 96 75, 96 72 L 96 31 L 88 31 L 88 24 L 96 24 L 96 18 C 96 12, 100 6, 105 10 Z"
            fill="#E10600"
          />

          {/* Second "f" and "e" in white */}
          <text
            x="126"
            y="30"
            fontFamily="'Syne', 'Plus Jakarta Sans', sans-serif"
            fontWeight="800"
            fontSize="48"
            fill="#FFFFFF"
            letterSpacing="-0.03em"
          >
            fe
          </text>

          {/* "moto" in bold racing italic red */}
          <text
            x="14"
            y="65"
            fontFamily="'Syne', 'Plus Jakarta Sans', sans-serif"
            fontWeight="800"
            fontStyle="italic"
            fontSize="44"
            fill="#E10600"
            letterSpacing="-0.02em"
          >
            moto
          </text>
        </g>
      </svg>
    </div>
  );
};

export const DueffeRacerIcon: React.FC<{ className?: string }> = ({ className = 'w-10 h-10' }) => {
  return (
    <svg viewBox="0 0 100 60" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <path
        d="M 65 30 C 58 22, 50 15, 42 12 C 35 10, 30 14, 28 20 C 26 26, 30 32, 35 34 C 42 36, 50 33, 54 30 C 60 38, 70 42, 78 40 C 85 38, 90 32, 94 25 L 82 22 C 77 28, 72 32, 65 30 Z"
        fill="#FFFFFF"
      />
      <circle cx="34" cy="18" r="6" fill="#FFFFFF" />
      <path d="M 5 45 C 20 25, 45 18, 70 19 C 85 20, 95 32, 98 42" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" />
      <path d="M 2 48 L 18 42 L 30 47" stroke="#E10600" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
};
