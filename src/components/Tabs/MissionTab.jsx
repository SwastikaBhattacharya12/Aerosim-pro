import React, { useState, useEffect, useRef } from 'react';
import { calculateDensity, calculateLift, calculateDrag, GRAVITY } from '../../utils/physics';

const TakeoffSimulator = ({ config, env, mission }) => {
  const [isRunning, setIsRunning] = useState(false);
  const [state, setState] = useState({ x: 0, v: 0, time: 0, status: 'Idle', message: '' });
  const animationRef = useRef(null);
  
  const runwayLength = mission.runway || 2000;
  
  const startSim = () => {
    // Check constraints before starting
    if (mission.minWeight && config.weight < mission.minWeight) {
      setState({ x: 0, v: 0, time: 0, status: 'Failed', message: `Mission requires at least ${mission.minWeight}kg weight.` });
      return;
    }
    
    setIsRunning(true);
    setState({ x: 0, v: 0, time: 0, status: 'Accelerating', message: 'Throttles at MAX' });
  };

  useEffect(() => {
    if (!isRunning) return;

    let lastTime = performance.now();
    const density = calculateDensity(config.altitude, env.temperature);
    const weightForce = config.weight * GRAVITY;

    const loop = (time) => {
      const dt = Math.min((time - lastTime) / 1000, 0.1); // seconds
      lastTime = time;

      setState(prev => {
        if (prev.status !== 'Accelerating') return prev;

        const currentLift = calculateLift(density, prev.v, env.windSpeed, config.area, config.aoa, config.wingType, config.span);
        const currentDrag = calculateDrag(density, prev.v, env.windSpeed, config.area, config.aoa, config.wingType, config.span);
        
        // Friction when wheels are on ground
        const normalForce = Math.max(0, weightForce - currentLift);
        const friction = normalForce * 0.02; // rolling resistance
        
        const netForce = config.thrust - currentDrag - friction;
        const accel = netForce / config.weight;
        
        const nextV = Math.max(0, prev.v + accel * dt);
        const nextX = prev.x + nextV * dt;
        const nextTime = prev.time + dt;

        if (currentLift >= weightForce) {
          setIsRunning(false);
          return { v: nextV, x: nextX, time: nextTime, status: 'Success', message: `Liftoff! V_r = ${Math.round(nextV)} m/s at ${Math.round(nextX)}m.` };
        }

        if (nextX >= runwayLength) {
          setIsRunning(false);
          return { v: nextV, x: nextX, time: nextTime, status: 'Failed', message: `Runway Overrun. Never reached liftoff speed.` };
        }

        return { v: nextV, x: nextX, time: nextTime, status: 'Accelerating', message: `Accelerating: ${Math.round(nextV)} m/s` };
      });

      if (isRunning) {
        animationRef.current = requestAnimationFrame(loop);
      }
    };

    animationRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animationRef.current);
  }, [isRunning, config, env, runwayLength]);

  const progress = Math.min(100, (state.x / runwayLength) * 100);
  const color = state.status === 'Success' ? 'var(--status-green)' : state.status === 'Failed' ? 'var(--status-red)' : 'var(--accent-cyan)';

  return (
    <div className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
      <h3>Flight Simulator: {mission.title}</h3>
      <p style={{ margin: 0, color: 'var(--text-secondary)' }}>{mission.description} Runway: {runwayLength}m.</p>
      
      <div style={{ height: '100px', background: 'rgba(0,0,0,0.5)', borderRadius: '10px', position: 'relative', overflow: 'hidden', borderBottom: '4px solid gray' }}>
         {/* Runway ticks */}
         <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '4px', backgroundImage: 'linear-gradient(90deg, white 50%, transparent 50%)', backgroundSize: '100px 100%' }} />
         
         {/* Aircraft Sprite (Text/SVG) */}
         <div style={{ 
           position: 'absolute', 
           bottom: state.status === 'Success' ? '40px' : '5px', 
           left: `${progress}%`, 
           transform: `translateX(-50%) ${state.status === 'Success' ? 'rotate(-15deg)' : ''}`,
           transition: state.status === 'Success' ? 'bottom 2s ease-out, transform 2s ease-out' : 'none',
           fontSize: '2rem' 
         }}>
            ✈️
         </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
         <div style={{ color }}>
            <strong>{state.status.toUpperCase()}</strong>: {state.message}
         </div>
         <div style={{ display: 'flex', gap: '10px' }}>
            <span style={{ fontFamily: 'monospace' }}>DIST: {Math.round(state.x)}m / {runwayLength}m</span>
            <span style={{ fontFamily: 'monospace' }}>SPEED: {Math.round(state.v)} m/s</span>
         </div>
      </div>

      <button onClick={startSim} disabled={isRunning} style={{ alignSelf: 'flex-start' }}>
        {isRunning ? 'Simulating...' : 'Start Takeoff Roll'}
      </button>
    </div>
  );
};

const MissionTab = ({ config, env }) => {
  const missions = [
    { id: 1, title: 'Standard Test Flight', description: 'Take off safely.', runway: 3000 },
    { id: 2, title: 'Short Takeoff & Landing (STOL)', description: 'Get airborne within 800m.', runway: 800 },
    { id: 3, title: 'Heavy Lifter', description: 'Take off with at least 150,000kg weight.', runway: 4000, minWeight: 150000 }
  ];

  const [activeMissionId, setActiveMissionId] = useState(1);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', height: '100%', overflowY: 'auto' }}>
       <h2>Missions & Simulations</h2>
       <div style={{ display: 'flex', gap: '10px' }}>
          {missions.map(m => (
            <button key={m.id} onClick={() => setActiveMissionId(m.id)} style={{ background: activeMissionId === m.id ? 'var(--accent-blue)' : 'rgba(255,255,255,0.1)' }}>
              {m.title}
            </button>
          ))}
       </div>
       
       <TakeoffSimulator config={config} env={env} mission={missions.find(m => m.id === activeMissionId)} />
    </div>
  );
};

export default MissionTab;
