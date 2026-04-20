import React from 'react';

const FleetTab = ({ fleet, saveCurrentToFleet, loadFromFleet, removeFleetItem, selection1, selection2, setSelection1, setSelection2, history, loadIteration }) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', height: '100%', overflowY: 'auto' }}>
      
      {/* Design Iteration History */}
      <div className="glass-panel" style={{ padding: '20px' }}>
         <h2 style={{ margin: '0 0 10px 0' }}>Design Iteration History</h2>
         <p style={{ margin: '0 0 15px 0', color: 'var(--text-secondary)' }}>Track changes to your active aircraft across this session.</p>
         <div style={{ display: 'flex', gap: '10px', overflowX: 'auto', paddingBottom: '10px' }}>
           {history.map((iteration, i) => (
             <div key={i} style={{ minWidth: '150px', background: 'rgba(0,0,0,0.3)', padding: '10px', borderRadius: '8px', borderLeft: '3px solid var(--accent-blue)' }}>
                <strong>v1.{i}</strong>
                <div style={{ fontSize: '0.8rem', color: 'gray' }}>Area: {iteration.area}m²</div>
                <div style={{ fontSize: '0.8rem', color: 'gray' }}>Mass: {(iteration.weight/1000).toFixed(1)}t</div>
                <div style={{ fontSize: '0.8rem', color: 'gray' }}>AoA: {iteration.aoa}°</div>
                <button onClick={() => loadIteration(i)} style={{ marginTop: '10px', width: '100%', padding: '4px', fontSize: '0.8rem' }}>Revert</button>
             </div>
           ))}
         </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>My Aircraft Fleet (Local Leaderboard)</h2>
        <button onClick={saveCurrentToFleet} style={{ background: 'var(--status-green)' }}>+ Save to Hangar</button>
      </div>

      <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
        {fleet.length === 0 && <p style={{ color: 'var(--text-secondary)' }}>No aircraft in your fleet yet. Design one and save it!</p>}
        {fleet.map(craft => (
          <div key={craft.id} className="glass-panel" style={{ padding: '15px', width: '250px', borderTop: `4px solid ${craft.color}` }}>
             <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <h3 style={{ margin: '0 0 10px 0' }}>{craft.name}</h3>
                <span style={{ fontSize: '0.8rem', background: 'rgba(255,255,255,0.1)', padding: '2px 5px', borderRadius: '4px' }}>{craft.category}</span>
             </div>
             
             <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '15px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <span>Engine: {craft.engineType.toUpperCase()}</span>
                <span>Wing: {craft.wingType}</span>
                <span>Mass: {(craft.weight/1000).toFixed(1)}t</span>
             </div>
             <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
               <button onClick={() => loadFromFleet(craft.id)} style={{ flex: 1, padding: '5px', fontSize: '0.8rem' }}>Load</button>
               <button onClick={() => removeFleetItem(craft.id)} style={{ flex: 1, padding: '5px', fontSize: '0.8rem', background: 'var(--status-red)' }}>Del</button>
             </div>
             
             <div style={{ marginTop: '10px', display: 'flex', gap: '5px', flexDirection: 'column' }}>
               <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Compare Slot:</label>
               <div style={{ display: 'flex', gap: '5px' }}>
                  <button 
                    onClick={() => setSelection1(craft.id === selection1 ? null : craft.id)}
                    style={{ flex: 1, padding: '5px', fontSize: '0.8rem', background: selection1 === craft.id ? 'var(--accent-blue)' : 'rgba(255,255,255,0.1)' }}>
                    Primary
                  </button>
                  <button 
                    onClick={() => setSelection2(craft.id === selection2 ? null : craft.id)}
                    style={{ flex: 1, padding: '5px', fontSize: '0.8rem', background: selection2 === craft.id ? 'var(--status-yellow)' : 'rgba(255,255,255,0.1)', color: selection2 === craft.id ? '#000' : '#fff' }}>
                    Ghost
                  </button>
               </div>
             </div>
          </div>
        ))}
      </div>

    </div>
  );
};

export default FleetTab;
