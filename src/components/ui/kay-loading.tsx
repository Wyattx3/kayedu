"use client";

interface KayLoadingProps {
  message?: string;
  dark?: boolean;
}

export function KayLoading({ message = "Loading...", dark = true }: KayLoadingProps) {
  const bgClass = dark ? "bg-slate-900" : "bg-[#f0f8ff]";
  const textColor = dark ? "text-white" : "text-gray-600";
  const strokeColor = dark ? "#3b82f6" : "#2b6cb0";

  return (
    <div className={`w-full h-full flex flex-col items-center justify-center ${bgClass}`}>
      {/* Handwriting SVG Animation - "Kabyar" */}
      <div className="w-full max-w-lg">
        <svg viewBox="0 0 600 200" className="w-full h-[200px]">
          <text
            x="50%"
            y="55%"
            textAnchor="middle"
            dominantBaseline="middle"
            className="kabyar-text"
            style={{
              fontFamily: "var(--font-handwriting), 'Great Vibes', cursive",
              fontSize: "140px",
              fill: "transparent",
              stroke: strokeColor,
              strokeWidth: "3px",
              strokeLinecap: "round",
              strokeLinejoin: "round",
              strokeDasharray: 1000,
              strokeDashoffset: 1000,
            }}
          >
            Kabyar
          </text>
        </svg>
      </div>

      {/* Loading message */}
      <div className="mt-4 text-center">
        <p className={`${textColor} text-sm`}>{message}</p>
      </div>

      <style jsx>{`
        @keyframes handwritingLoop {
          0% {
            stroke-dashoffset: 1000;
            fill: transparent;
            opacity: 0;
          }
          10% {
            opacity: 1;
          }
          40% {
            stroke-dashoffset: 0;
            fill: transparent;
          }
          50% {
            fill: ${strokeColor};
          }
          85% {
            opacity: 1;
            fill: ${strokeColor};
          }
          100% {
            opacity: 0;
            fill: ${strokeColor};
          }
        }
        
        .kabyar-text {
          animation: handwritingLoop 5s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
