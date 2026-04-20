import React, { useState, useEffect, useRef } from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import DesignPanel from './components/DesignPanel';
import Visualization from './components/Visualization';
import AnalyticsTab from './components/Tabs/AnalyticsTab';
import FleetTab from './components/Tabs/FleetTab';
import MissionTab from './components/Tabs/MissionTab';
import { calculateDensity, calculateLift, calculateDrag, getFailureModes, CATEGORIES } from './utils/physics';

const initialConfig = {
  id: 'current',
  name: 'Aero Model 3',
  color: '#00f0ff',
  category: 'commercial', // new preset marker
  span: 30,
  area: 150,
  weight: 60000,
  thrust: 150000,
  velocity: 250,
  altitude: 5000,
  airfoil: 'cambered',
  wingType: 'swept',
  engineType: 'jet',
  aoa: 2, // Angle of attack degrees
  cgPos: 40,
  clPos: 45,
  fuelCapacity: 20000,
  batteryCapacityWh: 1000000, // 1 MWh
  energyDensityWhKg: 250
};

const initialEnv = {
  windSpeed: 0,
  temperature: 15
};

function App() {
  const [activeTab, setActiveTab] = useState('DESIGNER');
  
  // State 
  const [config, setConfig] = useState(initialConfig);
  const [env, setEnv] = useState(initialEnv);
  const [fleet, setFleet] = useState([]);
  
  // Design History
  const [history, setHistory] = useState([initialConfig]);

  // Selections
  const [selection1, setSelection1] = useState(null);
  const [selection2, setSelection2] = useState(null);
  
  // PDF Target Ref
  const printRef = useRef();

  useEffect(() => {
    const savedFleet = localStorage.getItem('aircraftProFleet');
    if (savedFleet) setFleet(JSON.parse(savedFleet));
  }, []);

  const saveFleet = (newFleet) => {
    setFleet(newFleet);
    localStorage.setItem('aircraftProFleet', JSON.stringify(newFleet));
  };

  const handleConfigChange = (key, value) => {
    setConfig(prev => {
      const next = { ...prev, [key]: value };
      
      // Category Preset Auto-setter
      if (key === 'category') {
        const cat = CATEGORIES[value];
        if (cat) {
           next.weight = cat.baseWeight;
           next.thrust = cat.minThrust;
           if (value === 'fighter') { next.wingType = 'delta'; next.span = 12; next.area = 40; next.engineType = 'jet'; }
           if (value === 'cargo') { next.wingType = 'straight'; next.span = 60; next.area = 300; next.engineType = 'turboprop'; }
        }
      }
      return next;
    });
  };

  // Push to history when user stops modifying (e.g. Save Iteration button)
  const saveIteration = () => {
    setHistory([...history, config]);
    alert("Iteration saved to Design History!");
  };

  const loadIteration = (idx) => {
    setConfig(history[idx]);
  };

  const setFullConfig = (c) => setConfig(c);

  const handleEnvChange = (key, value) => setEnv(prev => ({ ...prev, [key]: value }));

  const saveCurrentToFleet = () => {
    const newCraft = { ...config, id: `craft-${Date.now()}` };
    saveFleet([...fleet, newCraft]);
    alert(`${config.name} saved to Pro Fleet!`);
  };

  const loadFromFleet = (id) => {
    const craft = fleet.find(f => f.id === id);
    if (craft) {
      setConfig({ ...craft, id: 'current' });
      setActiveTab('DESIGNER');
    }
  };

  const removeFleetItem = (id) => saveFleet(fleet.filter(f => f.id !== id));

  // Physics mapping
  const density = calculateDensity(config.altitude, env.temperature);
  const lift = calculateLift(density, config.velocity, env.windSpeed, config.area, config.aoa, config.wingType, config.span);
  const drag = calculateDrag(density, config.velocity, env.windSpeed, config.area, config.aoa, config.wingType, config.span);
  
  const failures = getFailureModes(lift, config.weight, config.thrust, drag, config.cgPos, config.clPos, config.aoa, config.span, config.area, config.wingType, config.velocity, {
       isElectric: config.engineType === 'electric',
       flightTime: 1000 // mock check
  }); // Actually getFuelMetrics logic handles exact failure but we rely on AnalyticsTab for deep checking.

  let statusObj = { status: 'Stable', color: 'var(--status-green)' };
  if (failures.length > 0) statusObj = { status: 'Failures', color: 'var(--status-red)' };
  else if (lift < config.weight * 9.81 * 1.2) statusObj = { status: 'Marginal', color: 'var(--status-yellow)' };

  const metrics = { density, lift, drag };

  let visualConfig = config;
  let visualCompare = null;
  if (activeTab === 'FLEET' && selection1) visualConfig = fleet.find(f => f.id === selection1) || config;
  if (activeTab === 'FLEET' && selection2) visualCompare = fleet.find(f => f.id === selection2);

  // PDF Export
  const exportPDF = async () => {
    const element = printRef.current;
    const canvas = await html2canvas(element, { scale: 2, backgroundColor: '#0b0f19' });
    const data = canvas.toDataURL('image/png');
    
    const pdf = new jsPDF('l', 'mm', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
    
    pdf.addImage(data, 'PNG', 0, 0, pdfWidth, pdfHeight);
    pdf.save(`${config.name}_spec_sheet.pdf`);
  };

  const TabButton = ({ id, label, icon }) => (
    <div 
      onClick={() => setActiveTab(id)} 
      style={{ padding: '15px 20px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px', background: activeTab === id ? 'var(--panel-bg)' : 'transparent', borderLeft: activeTab === id ? '4px solid var(--accent-cyan)' : '4px solid transparent', color: activeTab === id ? '#fff' : 'var(--text-secondary)', transition: 'all 0.2s', fontWeight: activeTab === id ? 'bold' : 'normal' }}
    >
      <span>{icon}</span> {label}
    </div>
  );

  return (
    <div style={{ display: 'flex', height: '100vh', width: '100vw', overflow: 'hidden' }}>
      
      <div style={{ width: '250px', background: 'rgba(10, 15, 25, 0.9)', borderRight: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '20px' }}>
          <h1 style={{ margin: 0, fontSize: '1.5rem', background: 'linear-gradient(90deg, #3b82f6, #00f0ff)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            AeroSim Pro
          </h1>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '5px' }}>v3.0 Engineering Edition</div>
        </div>
        
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '5px', marginTop: '20px' }}>
          <TabButton id="DESIGNER" label="Systems Design" icon="🛠️" />
          <TabButton id="ANALYTICS" label="Flight Envelope" icon="📉" />
          <TabButton id="FLEET" label="Fleet & History" icon="📊" />
          <TabButton id="MISSIONS" label="Proving Grounds" icon="🏁" />
        </div>

        <button onClick={exportPDF} style={{ margin: '20px', background: 'linear-gradient(90deg, #10b981, #3b82f6)' }}>
          📥 Export PDF Report
        </button>
      </div>

      <div ref={printRef} style={{ flex: 1, display: 'flex', padding: '20px', gap: '20px', minWidth: 0 }}>
        
        {activeTab === 'DESIGNER' && (
          <>
            <div style={{ width: '380px', minWidth: '380px' }}>
              <DesignPanel config={config} onChange={handleConfigChange} env={env} onEnvChange={handleEnvChange} onSaveIteration={saveIteration} />
            </div>
            <div style={{ flex: 1 }}>
              <Visualization config={visualConfig} statusObj={statusObj} />
            </div>
          </>
        )}

        {activeTab === 'ANALYTICS' && (
           <div style={{ flex: 1 }}>
             <AnalyticsTab config={config} env={env} metrics={metrics} setFullConfig={setFullConfig} />
           </div>
        )}

        {activeTab === 'FLEET' && (
          <>
            <div style={{ flex: 1 }}>
              <FleetTab 
                 fleet={fleet} saveCurrentToFleet={saveCurrentToFleet} 
                 loadFromFleet={loadFromFleet} removeFleetItem={removeFleetItem}
                 selection1={selection1} selection2={selection2}
                 setSelection1={setSelection1} setSelection2={setSelection2}
                 history={history} loadIteration={loadIteration}
              />
            </div>
            {selection1 && (
              <div style={{ width: '45%' }}>
                 <Visualization config={visualConfig} compareConfig={visualCompare} />
              </div>
            )}
          </>
        )}

        {activeTab === 'MISSIONS' && (
           <div style={{ flex: 1 }}>
             <MissionTab config={config} env={env} />
           </div>
        )}

      </div>
    </div>
  );
}

export default App;
