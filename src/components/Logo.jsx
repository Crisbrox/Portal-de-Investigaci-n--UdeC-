/**
 * components/Logo.jsx
 * Logo institucional UdeC.
 * Usa el escudo oficial de public/img/logo-udec.png y, si no existe, el escudo SVG.
 */
import { useState } from 'react';

function Escudo({ tamano }) {
  return (
    <svg
      className="transition-transform duration-500 group-hover/logo:-rotate-6 group-hover/logo:scale-110"
      width={tamano}
      height={tamano}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Escudo Universidad de Cundinamarca"
      role="img"
    >
      <path
        d="M32 3L58 13v22c0 15.5-10.8 24.4-26 29C16.8 59.4 6 50.5 6 35V13L32 3z"
        fill="#00482B"
      />
      <path
        d="M32 8L53 16v19c0 12.7-8.8 20.2-21 24.2C19.8 55.2 11 47.7 11 35V16L32 8z"
        fill="#007A3D"
      />
      <path d="M11 24h42v4H11z" fill="#D4AF37" opacity="0.9" />
      <text
        x="32"
        y="45"
        textAnchor="middle"
        fontFamily="Inter, Segoe UI, sans-serif"
        fontSize="17"
        fontWeight="800"
        fill="#FFFFFF"
      >
        UdeC
      </text>
    </svg>
  );
}

export default function Logo({ tamano = 40, texto = true, claro = false }) {
  const [sinImagen, setSinImagen] = useState(false);

  return (
    <div className="group/logo flex items-center gap-3">
      {sinImagen ? (
        <Escudo tamano={tamano} />
      ) : (
        <img
          src="/img/logo-udec.png"
          alt="Escudo Universidad de Cundinamarca"
          style={{ height: Math.round(tamano * 1.3) }}
          className={`w-auto object-contain transition-transform duration-500 group-hover/logo:scale-105 ${
            claro ? 'drop-shadow-[0_2px_6px_rgba(0,0,0,0.35)]' : ''
          }`}
          onError={() => setSinImagen(true)}
        />
      )}
      {texto && (
        <div className="leading-tight">
          <p
            className={`font-serif text-[15px] font-semibold ${
              claro ? 'text-white' : 'text-udec-900'
            }`}
          >
            Universidad de Cundinamarca
          </p>
          <p className={`text-xs ${claro ? 'text-white/65' : 'text-slate-500'}`}>
            Investigación y Emprendimiento
          </p>
        </div>
      )}
    </div>
  );
}
