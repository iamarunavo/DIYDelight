/**
 * Advanced PC component compatibility and performance utilities
 * For DIY Delight - PC FORGE system
 */

// Import helper functions from extension file
import { 
  calculatePerformanceScore,
  extractSocketInfo,
  extractRAMType,
  extractPowerConsumption,
  extractPSUCapacity,
  extractGPULength,
  extractCaseMaxGPULength
} from './pcutils-extension.js';

/**
 * FORGE Design System: Core Component Compatibility Engine
 * 
 * This is the intelligence core of the PC FORGE system,
 * ensuring precision through synergy between components,
 * following the FORGE design philosophy of balance, power, and craftsmanship.
 * 
 * @param {Object} components - Object containing selected PC components
 * @returns {Object} Compatibility status and issues with FORGE design system metadata
 */
export const checkComponentCompatibility = (components) => {
  const issues = [];
  const warnings = [];
  let compatible = true;
  
  // Check if all necessary components are selected
  const requiredComponents = ['cpu', 'gpu', 'ram', 'storage', 'psu', 'case', 'motherboard'];
  const missingComponents = requiredComponents.filter(type => !components[type]);
  
  if (missingComponents.length > 0) {
    return { 
      compatible: false,
      issues: [{ message: `Please select all required components: ${missingComponents.join(', ')}`, severity: 'error' }],
      warnings: []
    };
  }
  
  // Check CPU and motherboard socket compatibility
  if (components.cpu && components.motherboard) {
    const cpuSocket = extractSocketInfo(components.cpu.specs);
    const mbSocket = extractSocketInfo(components.motherboard.specs);
    
    if (cpuSocket && mbSocket && cpuSocket !== mbSocket) {
      issues.push({ 
        message: `CPU socket ${cpuSocket} is not compatible with motherboard socket ${mbSocket}`, 
        components: ['cpu', 'motherboard'],
        severity: 'error'
      });
      compatible = false;
    }
  }
  
  // Check RAM and Motherboard compatibility
  if (components.ram && components.motherboard) {
    const ramType = extractRAMType(components.ram.specs);
    const mbRAMType = extractRAMType(components.motherboard.specs);
    
    if (ramType && mbRAMType && ramType !== mbRAMType) {
      issues.push({ 
        message: `RAM type ${ramType} is not compatible with motherboard ${mbRAMType} slots`, 
        components: ['ram', 'motherboard'],
        severity: 'error'
      });
      compatible = false;
    }
  }
  
  // Check Power Supply capacity
  if (components.cpu && components.gpu && components.psu) {
    const cpuPower = extractPowerConsumption(components.cpu); 
    const gpuPower = extractPowerConsumption(components.gpu);
    const totalPower = cpuPower + gpuPower + 100; // Add 100W for other components
    
    const psuPower = extractPSUCapacity(components.psu);
    
    if (totalPower > psuPower) {
      issues.push({ 
        message: `Power supply (${psuPower}W) insufficient for system requirement (${totalPower}W)`, 
        components: ['psu', 'cpu', 'gpu'],
        severity: 'error'
      });
      compatible = false;
    }
    else if (totalPower > psuPower * 0.8) {
      warnings.push({ 
        message: `Power supply load at ${Math.floor(totalPower/psuPower*100)}% capacity, recommend higher wattage`, 
        components: ['psu'],
        severity: 'warning'
      });
    }
  }
  
  // Check GPU and Case compatibility (physical size)
  if (components.gpu && components.case) {
    const gpuLength = extractGPULength(components.gpu);
    const maxGpuLength = extractCaseMaxGPULength(components.case);
    
    if (gpuLength && maxGpuLength && gpuLength > maxGpuLength) {
      issues.push({
        message: `GPU length (${gpuLength}mm) exceeds case maximum GPU length (${maxGpuLength}mm)`,
        components: ['gpu', 'case'],
        severity: 'error'
      });
      compatible = false;
    }
  }
  
  // Check for performance bottlenecks
  if (components.cpu && components.gpu) {
    const cpuTier = getCpuPerformanceTier(components.cpu);
    const gpuTier = getGpuPerformanceTier(components.gpu);
    
    // If CPU is significantly lower tier than GPU
    if (cpuTier && gpuTier && (gpuTier - cpuTier > 1)) {
      warnings.push({
        message: `CPU may bottleneck GPU performance`,
        components: ['cpu', 'gpu'],
        severity: 'warning'
      });
    }
    // If GPU is significantly lower tier than CPU
    else if (cpuTier && gpuTier && (cpuTier - gpuTier > 1)) {
      warnings.push({
        message: `GPU may bottleneck CPU performance`,
        components: ['gpu', 'cpu'],
        severity: 'warning'
      });
    }
  }
  
  // FORGE Design System: Generate visual and textual feedback state
  let forgeStatus = {
    state: compatible ? 'compatible' : (issues.length > 0 ? 'error' : 'warning'),
    designToken: {
      color: compatible ? 'graphiteGray' : (issues.length > 0 ? 'emberRed' : 'moltenAmber'),
      animation: compatible ? 'steadyGlow' : (issues.length > 0 ? 'moltenPulse' : 'heatWave'),
      border: compatible ? 'glowingEmber' : (issues.length > 0 ? 'forgeFlame' : 'hotMetal')
    },
    message: compatible 
      ? "System components are in harmony. Ready to forge."
      : (issues.length > 0 
          ? "Critical forge issues detected. Components are incompatible." 
          : "System stability warnings. Components may not perform optimally.")
  };

  return {
    compatible,
    issues,
    warnings,
    forge: forgeStatus // FORGE design system metadata
  };
};

/**
 * FORGE Design System: Performance Metrics Calculation
 * 
 * This function calculates the balanced performance profile of a PC build,
 * embracing the FORGE principles of power and precision. Each metric
 * is carefully crafted to reflect the synergy between components.
 * 
 * @param {Object} components - Object containing selected PC components
 * @returns {Object} Performance metrics with FORGE design system visualization tokens
 */
export const calculatePerformanceMetrics = (components) => {
  // Ensure components is an object
  if (!components || typeof components !== 'object') {
    console.warn("Invalid components object provided to calculatePerformanceMetrics");
    return {
      gamingPerformance: 0.4, // Return default non-zero values
      powerEfficiency: 0.6,
      thermals: 0.5,
      noise: 0.5,
    };
  }

  const { cpu, gpu, ram, storage, psu, case: caseComponent, cooler } = components;
  
  // If any essential component is missing, return reasonable default values
  if (!cpu || !gpu || !ram || !storage || !psu || !caseComponent) {
    console.warn("Missing essential components in calculatePerformanceMetrics", { 
      hasCpu: !!cpu, 
      hasGpu: !!gpu, 
      hasRam: !!ram, 
      hasStorage: !!storage, 
      hasPsu: !!psu, 
      hasCase: !!caseComponent 
    });
    
    return {
      gamingPerformance: 0.4, // Return default non-zero values
      powerEfficiency: 0.6,
      thermals: 0.5,
      noise: 0.5,
    };
  }
  
  // Calculate gaming performance (0-1 scale)
  // This is a simplified model based on CPU and GPU tiers
  const cpuTier = getCpuPerformanceTier(cpu);
  const gpuTier = getGpuPerformanceTier(gpu);
  
  console.log('CPU Performance Calculation:', {
    cpu: cpu.name,
    tier: cpuTier,
    normalized: cpuTier / 5
  });
  
  console.log('GPU Performance Calculation:', {
    gpu: gpu.name,
    tier: gpuTier,
    normalized: gpuTier / 5
  });
  
  const cpuPerformance = cpuTier / 5;
  const gpuPerformance = gpuTier / 5;
  const ramPerformance = ram.specs && ram.specs.speed ? ram.specs.speed / 6400 : 0.5; // Normalized to current max speeds
  
  console.log('RAM Performance:', {
    ram: ram.name,
    speed: ram.specs?.speed,
    normalized: ramPerformance
  });
  
  // Gaming performance weighted heavily toward GPU
  const gamingPerformance = (cpuPerformance * 0.3) + (gpuPerformance * 0.6) + (ramPerformance * 0.1);
  
  console.log('Final Gaming Performance:', {
    cpuComponent: cpuPerformance * 0.3,
    gpuComponent: gpuPerformance * 0.6,
    ramComponent: ramPerformance * 0.1,
    total: gamingPerformance
  });
  
  // Calculate power efficiency (0-1 scale)
  const cpuTdp = cpu.specs && cpu.specs.tdp ? cpu.specs.tdp : 65; // Default CPU TDP
  const gpuTdp = gpu.specs && gpu.specs.tdp ? gpu.specs.tdp : 150; // Default GPU TDP
  const totalPower = cpuTdp + gpuTdp + 100; // 100W for other components
  const psuEfficiency = getPsuEfficiency(psu);
  const powerEfficiency = Math.min(psuEfficiency / (totalPower / 1000), 1); // Normalize by total power, cap at 1
  
  // Calculate thermal performance (0-1 scale)
  const caseAirflow = getCaseAirflowRating(caseComponent);
  // Include cooler efficiency if available
  const coolerEfficiency = cooler ? getCoolerEfficiency(cooler) : 0.6; // Default value if cooler missing
  const totalHeat = (cpuTdp + gpuTdp) / 400; // Normalize to max expected heat
  const thermals = (caseAirflow * 0.6 + coolerEfficiency * 0.4) / (totalHeat || 1);
  
  // Calculate noise level (0-1 scale, where lower is better/quieter)
  const gpuNoise = getComponentNoiseLevel(gpu);
  const caseNoise = getComponentNoiseLevel(caseComponent);
  const psuNoise = getComponentNoiseLevel(psu);
  const coolerNoise = cooler ? getComponentNoiseLevel(cooler) : 0.5;
  
  const noise = (gpuNoise * 0.5) + (caseNoise * 0.2) + (psuNoise * 0.2) + (coolerNoise * 0.1);
  
  // Ensure all metrics have at least a minimum value
  const ensureMinValue = (value, minValue = 0.2) => {
    if (isNaN(value) || value < minValue) {
      return minValue;
    }
    return value;
  };

  // Normalize values between 0-1
  const normalizedMetrics = {
    gamingPerformance: Math.min(Math.max(ensureMinValue(gamingPerformance), 0), 1),
    powerEfficiency: Math.min(Math.max(ensureMinValue(powerEfficiency), 0), 1),
    thermals: Math.min(Math.max(ensureMinValue(thermals), 0), 1),
    noise: Math.min(Math.max(ensureMinValue(noise), 0), 1),
  };
  
  console.log("Final normalized metrics:", normalizedMetrics);
  
  // FORGE Design System: Map metrics to visual design tokens
  const forgeMetrics = {
    gamingPerformance: {
      value: normalizedMetrics.gamingPerformance,
      label: getPerformanceLabel(normalizedMetrics.gamingPerformance),
      designToken: {
        color: getForgeColorToken(normalizedMetrics.gamingPerformance),
        animation: normalizedMetrics.gamingPerformance > 0.8 ? 'forgeIntensity' : 'emberGlow',
        iconVariant: normalizedMetrics.gamingPerformance > 0.6 ? 'hammerStrike' : 'forgeCraft'
      }
    },
    powerEfficiency: {
      value: normalizedMetrics.powerEfficiency,
      label: getEfficiencyLabel(normalizedMetrics.powerEfficiency),
      designToken: {
        color: getForgeColorToken(normalizedMetrics.powerEfficiency),
        animation: 'pulsePower',
        iconVariant: 'voltCurrent'
      }
    },
    thermals: {
      value: normalizedMetrics.thermals,
      label: getThermalLabel(normalizedMetrics.thermals),
      designToken: {
        color: getForgeColorToken(normalizedMetrics.thermals, true), // Invert scale (lower is better)
        animation: 'heatWave',
        iconVariant: 'forgeFlame'
      }
    },
    noise: {
      value: normalizedMetrics.noise,
      label: getNoiseLabel(normalizedMetrics.noise),
      designToken: {
        color: getForgeColorToken(1 - normalizedMetrics.noise), // Invert scale (lower is better)
        animation: 'soundWave',
        iconVariant: 'anvilStrike'
      }
    },
  };
  
  return {
    ...normalizedMetrics,
    forge: forgeMetrics // FORGE design system metadata
  };
};

/**
 * Note: The calculateTotalPrice function has been moved to pcutils-extension.js to avoid duplication
 */

// Helper Functions

/**
 * Get CPU performance tier (1-5)
 * @param {Object} cpu - CPU component object
 * @returns {number} Performance tier
 */
function getCpuPerformanceTier(cpu) {
  if (!cpu || !cpu.name) {
    console.warn("Invalid CPU object:", cpu);
    return 1; // Return minimal performance instead of 0 to avoid zero metrics
  }
  
  console.log("Determining CPU tier for:", cpu);
  const name = cpu.name.toLowerCase();
  
  // Handle typical CPU naming patterns
  if (name.includes('ryzen 9') || name.includes('core i9') || name.includes('threadripper') || name.includes('i9-')) {
    return 5;
  } else if (name.includes('ryzen 7') || name.includes('core i7') || name.includes('i7-')) {
    return 4;
  } else if (name.includes('ryzen 5') || name.includes('core i5') || name.includes('i5-')) {
    return 3;
  } else if (name.includes('ryzen 3') || name.includes('core i3') || name.includes('pentium') || name.includes('i3-')) {
    return 2;
  } else if (name.includes('celeron') || name.includes('athlon')) {
    return 1;
  } 
  
  // If we couldn't determine by name, try to use specs if available
  if (cpu.specs) {
    const cores = parseInt(cpu.specs.cores) || 0;
    if (cores >= 16) return 5;
    if (cores >= 8) return 4;
    if (cores >= 6) return 3;
    if (cores >= 4) return 2;
    if (cores > 0) return 1;
  }
  
  // Default fallback - always return at least 1 to avoid zero metrics
  return 1;
}

/**
 * Get GPU performance tier (1-5)
 * @param {Object} gpu - GPU component object
 * @returns {number} Performance tier
 */
function getGpuPerformanceTier(gpu) {
  if (!gpu || !gpu.name) {
    console.warn("Invalid GPU object:", gpu);
    return 1; // Return minimal performance instead of 0 to avoid zero metrics
  }
  
  console.log("Determining GPU tier for:", gpu);
  const name = gpu.name.toLowerCase();
  
  // Handle typical GPU naming patterns
  if (name.includes('rtx 40') || name.includes('rtx4') || name.includes('rtx 4') ||
      name.includes('rx 7900') || name.includes('rx7900') || name.includes('arc a7')) {
    return 5;
  } else if (name.includes('rtx 30') || name.includes('rtx3') || name.includes('rtx 3') ||
             name.includes('rx 6800') || name.includes('rx6800') || 
             name.includes('rx 6900') || name.includes('rx6900') ||
             name.includes('arc a5')) {
    return 4;
  } else if (name.includes('rtx 20') || name.includes('rtx2') || name.includes('rtx 2') ||
             name.includes('rx 6700') || name.includes('rx6700') || 
             name.includes('rx 6600') || name.includes('rx6600') ||
             name.includes('arc a3')) {
    return 3;
  } else if (name.includes('gtx 16') || name.includes('gtx16') || name.includes('gtx 1') ||
             name.includes('rx 5') || name.includes('rx5') ||
             name.includes('vega')) {
    return 2;
  } else if (name.includes('gtx 10') || name.includes('gtx10') || name.includes('rx 560') ||
             name.includes('rx 570') || name.includes('rx 580')) {
    return 1;
  }
  
  // If we couldn't determine by name, try to use specs if available
  if (gpu.specs) {
    // If VRAM information is available
    if (gpu.specs.memory) {
      // Try to extract memory size even if format varies (e.g., "8GB", "8 GB", "8")
      let memoryText = gpu.specs.memory.toString();
      let memoryGB = parseInt(memoryText.match(/(\d+)/)[0]) || 0;
      
      if (memoryGB >= 12) return 5;
      if (memoryGB >= 8) return 4;
      if (memoryGB >= 6) return 3;
      if (memoryGB >= 4) return 2;
      if (memoryGB > 0) return 1;
    }
    
    // If RTX information is available
    if (gpu.specs.rtx === true) return 4;
  }
  
  // Default fallback - always return at least 1 to avoid zero metrics
  return 1;
}

/**
 * Get PSU efficiency rating (0-1 scale)
 * @param {Object} psu - PSU component object
 * @returns {number} Efficiency rating
 */
function getPsuEfficiency(psu) {
  if (!psu || !psu.specs || !psu.specs.certification) return 0.7; // Default value
  
  const certification = psu.specs.certification.toLowerCase();
  
  if (certification.includes('titanium')) {
    return 0.95;
  } else if (certification.includes('platinum')) {
    return 0.92;
  } else if (certification.includes('gold')) {
    return 0.88;
  } else if (certification.includes('silver')) {
    return 0.85;
  } else if (certification.includes('bronze')) {
    return 0.82;
  } else {
    return 0.7;
  }
}

/**
 * Get case airflow rating (0-1 scale)
 * @param {Object} caseType - Case component object
 * @returns {number} Airflow rating
 */
function getCaseAirflowRating(caseType) {
  if (!caseType) return 0.5;
  
  // This would ideally come from case specs, but for now we'll estimate
  const name = caseType.name.toLowerCase();
  
  if (name.includes('airflow') || name.includes('mesh')) {
    return 0.9;
  } else if (name.includes('flow')) {
    return 0.8;
  } else if (name.includes('gaming')) {
    return 0.7;
  } else if (name.includes('silent')) {
    return 0.5;
  } else {
    return 0.6;
  }
}

/**
 * Get cooler efficiency rating (0-1 scale)
 * @param {Object} cooler - CPU Cooler component object
 * @returns {number} Efficiency rating
 */
function getCoolerEfficiency(cooler) {
  if (!cooler || !cooler.specs) return 0.6; // Default value
  
  // If we have specific specs, use them
  if (cooler.specs.cooling_type && cooler.specs.tdp_rating) {
    const isLiquid = cooler.specs.cooling_type.toLowerCase().includes('liquid') || 
                     cooler.specs.cooling_type.toLowerCase().includes('water');
    const tdpRating = parseInt(cooler.specs.tdp_rating) || 150;
    
    if (isLiquid) {
      return Math.min(0.9, tdpRating / 250); // Liquid coolers are generally better
    } else {
      return Math.min(0.8, tdpRating / 300); // Air coolers
    }
  }
  
  // If no detailed specs, check the name for clues
  const name = cooler.name.toLowerCase();
  if (name.includes('liquid') || name.includes('aio') || name.includes('water')) {
    return 0.85; // Liquid coolers are generally more efficient
  } else if (name.includes('tower') || name.includes('dual')) {
    return 0.75; // Dual tower air coolers
  } else {
    return 0.6; // Standard air coolers
  }
}

/**
 * Get component noise level (0-1 scale, where 1 is loud)
 * @param {Object} component - Component object
 * @returns {number} Noise level
 */
function getComponentNoiseLevel(component) {
  if (!component) return 0.5;
  
  // This would ideally come from component specs, but for now we'll estimate
  const name = component.name.toLowerCase();
  
  if (name.includes('silent') || name.includes('quiet')) {
    return 0.2;
  } else if (name.includes('gaming')) {
    return 0.7;
  } else if (name.includes('pro')) {
    return 0.5;
  } else {
    return 0.6;
  }
}

/**
 * FORGE Design System: Performance Label Generator
 * Maps normalized values to FORGE system terminology
 */
function getPerformanceLabel(value) {
  if (value >= 0.9) return "Masterwork";
  if (value >= 0.8) return "Forgemaster";
  if (value >= 0.7) return "Journeyman";
  if (value >= 0.5) return "Apprentice";
  if (value >= 0.3) return "Novice";
  return "Basic";
}

/**
 * FORGE Design System: Efficiency Label Generator
 */
function getEfficiencyLabel(value) {
  if (value >= 0.9) return "Perfect Balance";
  if (value >= 0.8) return "Prime Efficiency";
  if (value >= 0.7) return "Well Tuned";
  if (value >= 0.5) return "Balanced";
  if (value >= 0.3) return "Unoptimized";
  return "Inefficient";
}

/**
 * FORGE Design System: Thermal Label Generator
 */
function getThermalLabel(value) {
  if (value >= 0.9) return "Frosty";
  if (value >= 0.8) return "Cool Running";
  if (value >= 0.6) return "Temperate";
  if (value >= 0.4) return "Warm";
  if (value >= 0.2) return "Hot";
  return "Overheating";
}

/**
 * FORGE Design System: Noise Label Generator
 */
function getNoiseLabel(value) {
  if (value <= 0.2) return "Silent";
  if (value <= 0.4) return "Quiet";
  if (value <= 0.6) return "Moderate";
  if (value <= 0.8) return "Audible";
  return "Loud";
}

/**
 * FORGE Design System: Color Token Mapper
 * Maps performance values to FORGE color design tokens
 */
function getForgeColorToken(value, invert = false) {
  // Invert the value if needed (for metrics where lower is better)
  const adjustedValue = invert ? 1 - value : value;
  
  if (adjustedValue >= 0.8) return "moltenBlue";      // Peak performance
  if (adjustedValue >= 0.6) return "forgeGold";       // Good performance
  if (adjustedValue >= 0.4) return "graphiteGray";    // Average performance
  if (adjustedValue >= 0.2) return "moltenAmber";     // Below average
  return "emberRed";                                  // Poor performance
}