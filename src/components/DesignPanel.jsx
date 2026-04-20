import React from 'react';
import { CATEGORIES, ENGINE_TYPES, WING_TYPES } from '../utils/physics';

const DesignPanel = ({ config, onChange, env, onEnvChange, onSaveIteration }) => {
  const handleChange = (key, value) => onChange(key, isNaN(value) ? value : Number(value));
  const handleEnvChange = (key, value) => onEnvChange(key, Number(value));

  const SectionTitle = ({ children }) => <h3 style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '4px', margin: '10px 0', color: 'var(--text-secondary)' }}>{children}</h3>;

  return (
    <div className="glass-panel design-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px', overflowY: 'auto', height: '100%' }}>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
         <h2 style={{ margin: 0, color: 'var(--accent-cyan)' }}>Subsystems</h2>
         <button onClick={onSaveIteration} style={{ padding: '5px 10px', fontSize: '0.8rem' }}>Save Iteration</button>
      </div>

      <SectionTitle>Classification</SectionTitle>
      
      <div className="control-group">
        <label>Aircraft Class Category</label>
        <select value={config.category} onChange={(e) => handleChange('category', e.target.value)}>
          {Object.keys(CATEGORIES).map(k => <option key={k} value={k}>{CATEGORIES[k].name}</option>)}
        </select>
      </div>

      <div className="control-group">
        <label>Aircraft Name</label>
        <input type="text" value={config.name} onChange={(e) => handleChange('name', e.target.value)} style={{ width: '100%', padding: '8px', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border-color)', color: 'white', borderRadius: '4px' }} />
      </div>
      <div className="control-group">
        <label>Livery Color</label>
        <input type="color" value={config.color} onChange={(e) => handleChange('color', e.target.value)} style={{ width: '100%', height: '30px', cursor: 'pointer' }} />
      </div>

      <SectionTitle>Aerodynamic Modules</SectionTitle>

      <div className="control-group">
        <label>Wing Geometry Type</label>
        <select value={config.wingType} onChange={(e) => handleChange('wingType', e.target.value)}>
          {Object.keys(WING_TYPES).map(k => <option key={k} value={k}>{WING_TYPES[k].name}</option>)}
        </select>
      </div>

      <div className="control-group">
        <div style={{ display: 'flex', justifyContent: 'space-between' }}><label>Angle of Attack (AoA)</label><span style={{ color: config.aoa > 15 ? 'var(--status-red)' : '#fff' }}>{config.aoa}°</span></div>
        <input type="range" min="0" max="30" step="0.5" value={config.aoa} onChange={(e) => handleChange('aoa', e.target.value)} />
      </div>

      <div className="control-group">
        <div style={{ display: 'flex', justifyContent: 'space-between' }}><label>Wing Span</label><span>{config.span} m</span></div>
        <input type="range" min="5" max="80" step="1" value={config.span} onChange={(e) => handleChange('span', e.target.value)} />
      </div>
      <div className="control-group">
        <div style={{ display: 'flex', justifyContent: 'space-between' }}><label>Wing Area</label><span>{config.area} m²</span></div>
        <input type="range" min="10" max="800" step="5" value={config.area} onChange={(e) => handleChange('area', e.target.value)} />
      </div>
      <div className="control-group">
        <label>Airfoil Profile</label>
        <select value={config.airfoil} onChange={(e) => handleChange('airfoil', e.target.value)}>
          <option value="flat">Flat Plate</option>
          <option value="cambered">Cambered (Standard)</option>
          <option value="high-lift">High-Lift (Slotted)</option>
        </select>
      </div>

      <SectionTitle>Propulsion Systems</SectionTitle>

      <div className="control-group">
        <label>Engine Module</label>
        <select value={config.engineType} onChange={(e) => handleChange('engineType', e.target.value)}>
          {Object.keys(ENGINE_TYPES).map(k => <option key={k} value={k}>{ENGINE_TYPES[k].name}</option>)}
        </select>
      </div>

      <div className="control-group">
        <div style={{ display: 'flex', justifyContent: 'space-between' }}><label>Engine Thrust</label><span>{config.thrust.toLocaleString()} N</span></div>
        <input type="range" min="5000" max="1500000" step="5000" value={config.thrust} onChange={(e) => handleChange('thrust', e.target.value)} />
      </div>

      {config.engineType === 'electric' ? (
        <div className="control-group" style={{ background: 'rgba(0, 240, 255, 0.1)', padding: '10px', borderRadius: '8px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}><label>Battery Cap. (Wh)</label><span>{config.batteryCapacityWh.toLocaleString()} Wh</span></div>
          <input type="range" min="10000" max="5000000" step="10000" value={config.batteryCapacityWh} onChange={(e) => handleChange('batteryCapacityWh', e.target.value)} />
        </div>
      ) : (
        <div className="control-group">
          <div style={{ display: 'flex', justifyContent: 'space-between' }}><label>Fuel Capacity</label><span>{config.fuelCapacity.toLocaleString()} kg</span></div>
          <input type="range" min="1000" max="100000" step="1000" value={config.fuelCapacity} onChange={(e) => handleChange('fuelCapacity', e.target.value)} />
        </div>
      )}

      <SectionTitle>Mass & Balance</SectionTitle>

      <div className="control-group">
        <div style={{ display: 'flex', justifyContent: 'space-between' }}><label>Structural Weight</label><span>{config.weight.toLocaleString()} kg</span></div>
        <input type="range" min="1000" max="250000" step="1000" value={config.weight} onChange={(e) => handleChange('weight', e.target.value)} />
      </div>
      <div className="control-group">
        <div style={{ display: 'flex', justifyContent: 'space-between' }}><label>CG Position (% length)</label><span>{config.cgPos}%</span></div>
        <input type="range" min="20" max="60" step="0.5" value={config.cgPos} onChange={(e) => handleChange('cgPos', e.target.value)} />
      </div>
      <div className="control-group">
        <div style={{ display: 'flex', justifyContent: 'space-between' }}><label>Wing/CL Position (% length)</label><span>{config.clPos}%</span></div>
        <input type="range" min="20" max="60" step="0.5" value={config.clPos} onChange={(e) => handleChange('clPos', e.target.value)} />
      </div>
     
      <SectionTitle>Atmosphere Config</SectionTitle>
      <div className="control-group">
        <div style={{ display: 'flex', justifyContent: 'space-between' }}><label>Velocity</label><span>{config.velocity} m/s</span></div>
        <input type="range" min="0" max="350" step="5" value={config.velocity} onChange={(e) => handleChange('velocity', e.target.value)} />
      </div>
      <div className="control-group">
        <div style={{ display: 'flex', justifyContent: 'space-between' }}><label>Altitude</label><span>{config.altitude} m</span></div>
        <input type="range" min="0" max="15000" step="500" value={config.altitude} onChange={(e) => handleChange('altitude', e.target.value)} />
      </div>

    </div>
  );
};

export default DesignPanel;
