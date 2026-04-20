import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceArea } from 'recharts';
import { calculateLift, calculateDrag, checkStability, getFuelMetrics, getFailureModes, generateAIAssistantFeedback, optimizeDesign } from '../../utils/physics';

const AnalyticsTab = ({ config, env, metrics, setFullConfig }) => {
  // Generate Flight Envelope Data
  const data = [];
  const W = config.weight * 9.81;
  const stallSpeedSq = (2 * W) / (metrics.density * config.area * 1.5); // Approx theoretical max Cl of 1.5
  const stallSpeed = stallSpeedSq > 0 ? Math.sqrt(stallSpeedSq) : 0;
  
  for (let v = 0; v <= 350; v += 10) {
    data.push({
      velocity: v,
      lift: calculateLift(metrics.density, v, env.windSpeed, config.area, config.aoa, config.wingType, config.span) / 1000, 
      drag: calculateDrag(metrics.density, v, env.windSpeed, config.area, config.aoa, config.wingType, config.span) / 1000,
      weight: W / 1000
    });
  }

  const fuelStats = getFuelMetrics(config.thrust, config.fuelCapacity, config.velocity, config.engineType, config.batteryCapacityWh, config.energyDensityWhKg);
  const stability = checkStability(config.cgPos, config.clPos);
  
  let totalWeight = config.weight;
  if(fuelStats.isElectric) totalWeight += fuelStats.batteryWeight || 0; // Penalty

  let lift = calculateLift(metrics.density, config.velocity, env.windSpeed, config.area, config.aoa, config.wingType, config.span);
  let drag = calculateDrag(metrics.density, config.velocity, env.windSpeed, config.area, config.aoa, config.wingType, config.span);
  
  const failures = getFailureModes(lift, totalWeight, config.thrust, drag, config.cgPos, config.clPos, config.aoa, config.span, config.area, config.wingType, config.velocity, fuelStats);
  
  const assistantFeedback = generateAIAssistantFeedback({ lift, drag, range: fuelStats.range }, config);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', height: '100%', overflowY: 'auto', paddingRight: '10px' }}>
      
      {/* Optimizer Section */}
      <div className="glass-panel" style={{ padding: '20px', borderRadius: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
         <div>
            <h3 style={{ margin: '0 0 5px 0' }}>Auto-Optimize Configuration</h3>
            <p style={{ margin: 0, fontSize: '0.8.5rem', color: 'var(--text-secondary)' }}>Apply mathematical heuristic optimizations based on aerodynamic principles.</p>
         </div>
         <div style={{ display: 'flex', gap: '10px' }}>
            <button onClick={() => setFullConfig(optimizeDesign(config, 'max_range'))}>Maximize Range</button>
            <button onClick={() => setFullConfig(optimizeDesign(config, 'max_efficiency'))}>Maximize Efficiency</button>
            <button onClick={() => setFullConfig(optimizeDesign(config, 'min_fuel'))}>Minimize Fuel/Weight</button>
         </div>
      </div>

      {failures.length > 0 && (
        <div style={{ background: 'rgba(239, 68, 68, 0.2)', border: '1px solid var(--status-red)', padding: '15px', borderRadius: '10px' }}>
          <h3 style={{ margin: '0 0 10px 0', color: 'var(--status-red)' }}>⚠️ Flight Warnings Detected!</h3>
          <ul style={{ margin: 0, paddingLeft: '20px' }}>
             {failures.map((f, i) => <li key={i}>{f}</li>)}
          </ul>
        </div>
      )}

      {/* Constraints Dashboard */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
        <div className="glass-panel" style={{ padding: '15px', borderRadius: '10px' }}>
           <div style={{ color: 'var(--text-secondary)' }}>Real-World Total Mass</div>
           <h3 style={{ margin: '5px 0 0 0' }}>{Math.round(totalWeight).toLocaleString()} kg</h3>
           <div style={{ fontSize: '0.8rem', color: totalWeight > config.weight ? 'var(--status-yellow)' : 'var(--text-secondary)' }}>
             {fuelStats.isElectric ? `Includes ${Math.round(fuelStats.batteryWeight)}kg battery penalty.` : "Standard mass."}
           </div>
        </div>
        <div className="glass-panel" style={{ padding: '15px', borderRadius: '10px', borderLeft: `5px solid ${stability.color}` }}>
           <div style={{ color: 'var(--text-secondary)' }}>Stability Metric</div>
           <h3 style={{ margin: '5px 0 0 0', color: stability.color }}>{stability.status.toUpperCase()}</h3>
           <div style={{ fontSize: '0.8rem' }}>Margin: {config.clPos - config.cgPos}%</div>
        </div>
        <div className="glass-panel" style={{ padding: '15px', borderRadius: '10px' }}>
           <div style={{ color: 'var(--text-secondary)' }}>Propulsion Target</div>
           <h3 style={{ margin: '5px 0 0 0' }}>{(fuelStats.range / 1000).toFixed(0)} km</h3>
           <div style={{ fontSize: '0.8rem' }}>Type: {config.engineType.toUpperCase()}</div>
        </div>
      </div>

      {/* AI Assistant */}
      <div className="glass-panel" style={{ padding: '20px', borderRadius: '10px', background: 'rgba(0, 240, 255, 0.05)', border: '1px solid rgba(0, 240, 255, 0.3)' }}>
        <h3 style={{ margin: '0 0 10px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '1.2rem' }}>🤖</span> AI Design Assistant
        </h3>
        <ul style={{ margin: 0, paddingLeft: '20px', lineHeight: '1.6' }}>
          {assistantFeedback.map((tip, i) => <li key={i}>{tip}</li>)}
        </ul>
      </div>

      {/* Flight Envelope Graph */}
      <div className="glass-panel" style={{ padding: '20px', borderRadius: '10px', flex: 1, minHeight: '350px' }}>
        <h3 style={{ margin: '0 0 15px 0' }}>Flight Envelope (Lift vs Velocity)</h3>
        <ResponsiveContainer width="100%" height="85%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
            <XAxis dataKey="velocity" stroke="var(--text-secondary)" label={{ value: 'Velocity (m/s)', position: 'insideBottomRight', fill: 'gray' }} />
            <YAxis stroke="var(--text-secondary)" label={{ value: 'Force (kN)', angle: -90, position: 'insideLeft', fill: 'gray' }} />
            <Tooltip contentStyle={{ backgroundColor: 'rgba(10, 15, 25, 0.9)' }} />
            <Legend />
            <ReferenceArea x1={0} x2={stallSpeed} fill="rgba(239, 68, 68, 0.2)" opacity={0.6} />
            
            <Line type="monotone" dataKey="lift" stroke="var(--accent-cyan)" strokeWidth={3} dot={false} name="Available Lift (kN)" />
            <Line type="monotone" dataKey="weight" stroke="var(--text-secondary)" strokeWidth={2} dot={false} strokeDasharray="5 5" name="Required Lift (Weight)" />
            <Line type="monotone" dataKey="drag" stroke="var(--status-yellow)" strokeWidth={2} dot={false} name="Drag (kN)" />
            
          </LineChart>
        </ResponsiveContainer>
      </div>

    </div>
  );
};

export default AnalyticsTab;
