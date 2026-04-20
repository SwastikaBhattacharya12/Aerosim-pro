import React from 'react';

const Visualization = ({ config, statusObj, compareConfig = null }) => {
  const scale = 5;
  const fuselageL = 300;
  const fuselageW = 30;
  const centerX = 400;

  const renderCraft = (craftConfig, colorOverride = null) => {
    const spanPx = Math.min(craftConfig.span * scale, 700);
    const cordPx = Math.min((craftConfig.area / craftConfig.span) * scale * 1.5, 200); 
    const baseColor = colorOverride || craftConfig.color || '#3b82f6';
    
    // Positions
    const cgX = centerX - fuselageL/2 + fuselageL * (craftConfig.cgPos / 100);
    const clX = centerX - fuselageL/2 + fuselageL * (craftConfig.clPos / 100);
    // Put wing purely at clX visually for top view
    const wingCenterY = 200;

    return (
      <g style={{ transition: 'all 0.3s ease' }}>
        {/* TOP VIEW */}
        <g transform={`translate(0, 50)`}>
          <text x="20" y="20" fill="gray" fontSize="14">TOP VIEW</text>
          
          {/* Horizontal tail */}
          <path d={`M ${centerX + fuselageL/2 - 20} ${wingCenterY - 15} L ${centerX + fuselageL/2} ${wingCenterY - 30} L ${centerX + fuselageL/2} ${wingCenterY + 30} L ${centerX + fuselageL/2 - 20} ${wingCenterY + 15} Z`} fill="#1e293b" stroke={baseColor} strokeWidth="2" />
          
          {/* Main Wings moved to CL position */}
          <path d={`
            M ${clX} ${wingCenterY - cordPx/2} 
            L ${clX + 20} ${wingCenterY - cordPx/2}
            L ${clX + spanPx/2} ${wingCenterY + spanPx/2} 
            L ${clX - 20} ${wingCenterY + cordPx/2} 
            L ${clX - spanPx/2} ${wingCenterY - spanPx/2}
            Z
          `} fill="#0f172a" stroke={baseColor} strokeWidth="3" opacity="0.6" style={{ transition: 'all 0.3s ease' }} />
          
          {/* Fuselage */}
          <rect x={centerX - fuselageL/2} y={wingCenterY - fuselageW/2} width={fuselageL} height={fuselageW} rx="15" fill="#334155" />
          
          {/* Nose */}
          <path d={`M ${centerX - fuselageL/2} ${wingCenterY - fuselageW/2} Q ${centerX - fuselageL/2 - 40} ${wingCenterY} ${centerX - fuselageL/2} ${wingCenterY + fuselageW/2} Z`} fill="#475569" />

          {/* CL / CG Markers Top */}
          <circle cx={cgX} cy={wingCenterY} r="6" fill="#f59e0b" title="Center of Gravity" />
          <circle cx={clX} cy={wingCenterY} r="4" fill="#00f0ff" title="Center of Lift" />
        </g>

        {/* SIDE VIEW */}
        <g transform={`translate(0, 380)`}>
           <text x="20" y="0" fill="gray" fontSize="14">SIDE VIEW</text>
           <rect x={centerX - fuselageL/2} y="50" width={fuselageL} height={fuselageW} rx="15" fill="#334155" />
           <path d={`M ${centerX - fuselageL/2} 50 Q ${centerX - fuselageL/2 - 40} 65 ${centerX - fuselageL/2} 80 Z`} fill="#475569" />
           <path d={`M ${centerX + fuselageL/2 - 40} 50 L ${centerX + fuselageL/2} 10 L ${centerX + fuselageL/2} 50 Z`} fill="#1e293b" stroke={baseColor} strokeWidth="2" />

           {/* Wing Cross section at CL offset */}
           <ellipse cx={clX} cy="65" rx={cordPx/2} ry="6" fill={baseColor} opacity="0.8" />
           
           <text x={clX - 20} y="95" fill={baseColor} fontSize="10">{craftConfig.airfoil.toUpperCase()}</text>
           
           {/* Markers Side */}
           <line x1={cgX} y1="30" x2={cgX} y2="100" stroke="#f59e0b" strokeWidth="2" strokeDasharray="4" />
           <text x={cgX - 10} y="20" fill="#f59e0b" fontSize="12">CG</text>
           
           <line x1={clX} y1="30" x2={clX} y2="100" stroke="#00f0ff" strokeWidth="2" strokeDasharray="4" />
           <text x={clX - 10} y="20" fill="#00f0ff" fontSize="12">CL</text>
        </g>
      </g>
    );
  };

  const dropShadow = statusObj ? `drop-shadow(0 0 15px ${statusObj.color})` : 'none';

  return (
    <div className="glass-panel" style={{ flex: 1, padding: '20px', display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden' }}>
      {/* Background Grid */}
      <div style={{ position: 'absolute', inset: 0, opacity: 0.05, backgroundImage: 'linear-gradient(rgba(255,255,255,0.2) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.2) 1px, transparent 1px)', backgroundSize: '20px 20px', pointerEvents: 'none' }} />

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <svg width="100%" height="100%" viewBox="0 0 800 500" style={{ filter: dropShadow, transition: 'filter 0.3s ease' }}>
          
          {compareConfig && (
            <g opacity="0.3" filter="grayscale(100%)">
              {renderCraft(compareConfig, '#ffffff')}
            </g>
          )}

          {renderCraft(config)}

        </svg>
      </div>
      
      <div style={{ position: 'absolute', bottom: '10px', right: '10px', display: 'flex', gap: '10px', fontSize: '0.8rem' }}>
        <span style={{ color: '#f59e0b' }}>● CG (Weight Center)</span>
        <span style={{ color: '#00f0ff' }}>● CL (Lift Center)</span>
      </div>
    </div>
  );
};

export default Visualization;
