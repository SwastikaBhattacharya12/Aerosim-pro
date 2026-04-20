import React from 'react';
import { getLDRatio } from '../utils/physics';

const Dashboard = ({ metrics, statusObj, config }) => {
  const ldRatio = getLDRatio(config.airfoil);
  // Estimate max speed very roughly by seeing where thrust = drag
  // D = 0.5 * rho * v^2 * S * cd  =>  v = sqrt(2 * Thrust / (rho * S * cd))
  const density = metrics.density || 1.225;
  const cd = metrics.drag > 0 ? (metrics.drag / (0.5 * density * Math.pow(config.velocity || 1, 2) * config.area)) : 0.05; 
  // above cd extraction implies passing cd or importing AIRFOILS, let's just use physics module later.
  // Actually, we can get cd directly if we import AIRFOILS but simpler to just show what we have.
  
  const formattedLift = Math.round(metrics.lift).toLocaleString();
  const formattedDrag = Math.round(metrics.drag).toLocaleString();
  const weightForce = Math.round(config.weight * 9.81).toLocaleString();
  
  return (
    <div className="glass-panel dashboard-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ margin: 0, fontSize: '1.5rem', color: 'var(--accent-blue)' }}>Telemetry & Performance</h2>
        <div style={{
          padding: '8px 16px',
          borderRadius: '8px',
          fontWeight: 'bold',
          backgroundColor: `${statusObj.color}22`,
          color: statusObj.color,
          border: `1px solid ${statusObj.color}`,
          boxShadow: `0 0 10px ${statusObj.color}44`
        }}>
          STATUS: {statusObj.status.toUpperCase()}
        </div>
      </div>

      <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
        
        <div style={{ flex: 1, minWidth: '200px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div className="metric-card" style={{ background: 'rgba(0,0,0,0.3)', padding: '15px', borderRadius: '10px' }}>
            <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Lift Force</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 'bold' }}>{formattedLift} N</div>
            <div style={{ fontSize: '0.8.5rem', color: metrics.lift >= config.weight * 9.81 ? 'var(--status-green)' : 'var(--status-yellow)' }}>
              Weight: {weightForce} N
            </div>
          </div>

          <div className="metric-card" style={{ background: 'rgba(0,0,0,0.3)', padding: '15px', borderRadius: '10px' }}>
            <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Drag Force</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 'bold' }}>{formattedDrag} N</div>
            <div style={{ fontSize: '0.8.5rem', color: config.thrust >= metrics.drag ? 'var(--status-green)' : 'var(--status-red)' }}>
              Thrust: {config.thrust.toLocaleString()} N
            </div>
          </div>
        </div>

        <div style={{ flex: 1, minWidth: '200px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
           <div className="metric-card" style={{ background: 'rgba(0,0,0,0.3)', padding: '15px', borderRadius: '10px' }}>
            <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Lift-to-Drag Ratio (L/D)</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 'bold' }}>{ldRatio.toFixed(2)}</div>
          </div>

           <div className="metric-card" style={{ background: 'rgba(0,0,0,0.3)', padding: '15px', borderRadius: '10px' }}>
            <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Air Density (Alt: {config.altitude}m)</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 'bold' }}>{metrics.density.toFixed(3)} kg/m³</div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;
