export const GRAVITY = 9.81;

export const CATEGORIES = {
  fighter: { name: 'Fighter Jet', baseWeight: 15000, maxWeight: 35000, minThrust: 100000 },
  commercial: { name: 'Commercial Aircraft', baseWeight: 40000, maxWeight: 300000, minThrust: 200000 },
  cargo: { name: 'Cargo Aircraft', baseWeight: 80000, maxWeight: 450000, minThrust: 300000 },
  private: { name: 'Private Jet', baseWeight: 5000, maxWeight: 20000, minThrust: 15000 }
};

export const WING_TYPES = {
  straight: { name: 'Straight Wing', e: 0.85, baseCd: 0.02 },
  swept: { name: 'Swept Wing', e: 0.75, baseCd: 0.015 },
  delta: { name: 'Delta Wing', e: 0.65, baseCd: 0.01 }
};

export const ENGINE_TYPES = {
  jet: { name: 'Turbofan Jet', tsfc: 0.000015 },
  turboprop: { name: 'Turboprop', tsfc: 0.000008 },
  electric: { name: 'Electric Motor', tsfc: 0 } // handled via battery
};

export const calculateDensity = (altitude, baseTemp = 15) => {
  const T = baseTemp + 273.15 - 0.0065 * altitude;
  const P = 101325 * Math.pow(1 - 2.25577e-5 * altitude, 5.25588);
  const rho = P / (287.05 * T);
  return Math.max(rho, 0.01);
};

export const getAeroCoefficients = (aoa, wingType, span, area) => {
  const wt = WING_TYPES[wingType] || WING_TYPES.straight;
  const AR = Math.pow(span, 2) / area; // Aspect Ratio
  const alphaCrit = 15; // stall angle

  let cl = 0.1 + 0.1 * aoa; // linear region
  if (aoa > alphaCrit) {
    // Stall drop-off
    const clMax = 0.1 + 0.1 * alphaCrit;
    cl = clMax * Math.exp(-0.15 * (aoa - alphaCrit));
  }
  
  // Drag = Parasitic + Induced + Stall penalty
  const cdInduced = Math.pow(cl, 2) / (Math.PI * AR * wt.e);
  let cdStall = aoa > alphaCrit ? 0.05 * Math.pow((aoa - alphaCrit), 1.5) : 0;
  let cd = wt.baseCd + cdInduced + cdStall;

  // Prevent negative or highly chaotic CL
  cl = Math.max(-0.5, cl);
  
  return { cl, cd, AR, isStalled: aoa > alphaCrit };
};

export const calculateLift = (density, velocity, wind, area, aoa, wingType, span) => {
  const vEff = Math.max(0, velocity + wind);
  const { cl } = getAeroCoefficients(aoa, wingType, span, area);
  return 0.5 * density * Math.pow(vEff, 2) * area * cl;
};

export const calculateDrag = (density, velocity, wind, area, aoa, wingType, span) => {
  const vEff = Math.max(0, velocity + wind);
  const { cd } = getAeroCoefficients(aoa, wingType, span, area);
  return 0.5 * density * Math.pow(vEff, 2) * area * cd;
};

export const checkStability = (cgPos, clPos) => {
  const margin = clPos - cgPos; 
  if (margin >= 5) return { status: 'Stable', color: 'var(--status-green)', score: 10 };
  if (margin > -2 && margin < 5) return { status: 'Marginal', color: 'var(--status-yellow)', score: 5 };
  return { status: 'Unstable', color: 'var(--status-red)', score: 0 };
};

export const getFuelMetrics = (thrust, fuelCapacity, velocity, engineType, batteryCapacityWh, energyDensityWhKg) => {
  const engine = ENGINE_TYPES[engineType] || ENGINE_TYPES.jet;
  
  if (engineType === 'electric') {
    // Battery calculation
    const efficiency = 0.85;
    // Power needed to generate thrust at velocity
    const reqPowerWatts = (thrust * velocity) / efficiency; 
    const capacityJoules = batteryCapacityWh * 3600;
    
    // Check battery weight penalty mathematically handled in config state, but we note it:
    const batteryWeight = batteryCapacityWh / energyDensityWhKg;

    const flightTimeSec = reqPowerWatts > 0 ? capacityJoules / reqPowerWatts : 0;
    const rangeMeters = velocity * flightTimeSec;

    return { burnRate: 0, flightTime: flightTimeSec, range: rangeMeters, isElectric: true, batteryWeight };
  } else {
    // Jet/Turboprop
    const burnRateSec = thrust * engine.tsfc; 
    const flightTimeSec = burnRateSec > 0 ? fuelCapacity / burnRateSec : 0;
    const rangeMeters = velocity * flightTimeSec;

    return { burnRate: burnRateSec, flightTime: flightTimeSec, range: rangeMeters, isElectric: false };
  }
};

export const getFailureModes = (lift, weight, thrust, drag, cgPos, clPos, aoa, span, area, wingType, velocity, fuelMetrics) => {
  const weightForce = weight * GRAVITY;
  let failures = [];
  
  if (lift < weightForce * 0.95 && velocity > 0) failures.push('Insufficient Lift');
  if (thrust < drag) failures.push('Insufficient Thrust');
  if (!fuelMetrics.isElectric && fuelMetrics.flightTime === 0) failures.push('No Fuel');
  if (fuelMetrics.isElectric && fuelMetrics.flightTime === 0) failures.push('Dead Battery');

  const { isStalled } = getAeroCoefficients(aoa, wingType, span, area);
  if (isStalled) failures.push('AERODYNAMIC STALL (AoA beyond critical!)');

  const stability = checkStability(cgPos, clPos);
  if (stability.status === 'Unstable') failures.push('Aircraft is Aerodynamically Unstable');

  return failures;
};

// Optimizer Component
export const optimizeDesign = (currentConfig, goal) => {
  // Simple heuristic optimizer suggesting changes. It doesn't instantly overwrite, it returns a new optimal config object.
  let optimal = JSON.parse(JSON.stringify(currentConfig));
  
  // Basic optimization heuristic
  if (goal === 'max_range') {
    // high wingspan, low area -> high AR. Best AoA around 2-4 degrees
    optimal.span = Math.min(optimal.span * 1.5, 80);
    optimal.aoa = 3;
    optimal.wingType = 'straight';
    if(optimal.engineType === 'jet') optimal.engineType = 'turboprop'; // better fuel efficiency
  } else if (goal === 'max_efficiency') {
    // L/D max
    optimal.span = Math.min(optimal.span * 1.3, 80);
    optimal.aoa = 4;
    optimal.wingType = 'delta'; // delta has low base drag, high sweep
  } else if (goal === 'min_fuel') {
    optimal.weight = Math.max(optimal.weight * 0.8, 1000); // 20% weight reduction
    optimal.thrust = optimal.thrust * 0.8;
  }
  
  return optimal;
};

export const generateAIAssistantFeedback = (metrics, config) => {
  const weightForce = config.weight * GRAVITY;
  let tips = [];
  
  if (metrics.lift < weightForce) {
    tips.push('Increase wing area or velocity to generate more lift.');
    if (config.airfoil !== 'high-lift') tips.push('Consider using a high-lift airfoil.');
  }
  
  if (metrics.drag > config.thrust) {
    tips.push('Thrust is too low to overcome drag. Upgrade engines or reduce wing area.');
  }
  
  if (config.cgPos > config.clPos) {
    tips.push('Shift Center of Gravity forward (decrease CG %) to improve stability.');
  }
  
  if (metrics.range && metrics.range < 100000 && !metrics.isElectric) {
    tips.push('Range is very limited. Add more fuel capacity or optimize aerodynamic profile.');
  }

  if (tips.length === 0) {
    tips.push('Your design looks optimal! Great job balancing forces.');
  }
  
  return tips;
};
