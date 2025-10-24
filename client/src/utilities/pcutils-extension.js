/**
 * Extract socket information from component specs
 */
export const extractSocketInfo = (specs) => {
  if (typeof specs !== 'string') return null;
  
  // Look for common socket types in the specs string
  const socketPatterns = [
    /\bLGA\s?(\d+)\b/i,     // Intel LGA sockets like LGA1700
    /\bAM(\d+)\b/i,         // AMD AM4, AM5
    /\bTR(\d+)\b/i,         // ThreadRipper
    /\bBGA\s?(\d+)\b/i      // BGA sockets
  ];
  
  for (const pattern of socketPatterns) {
    const match = specs.match(pattern);
    if (match) return match[0];
  }
  
  return null;
};

/**
 * Extract RAM type (DDR4/DDR5) from specs
 */
export const extractRAMType = (specs) => {
  if (typeof specs !== 'string') return null;
  
  const ramPattern = /\b(DDR\d+)\b/i;
  const match = specs.match(ramPattern);
  
  return match ? match[1] : null;
};

/**
 * Extract power consumption from component specs
 */
export const extractPowerConsumption = (component) => {
  if (!component || !component.specs) {
    // Default values if no data
    if (component.type === 'cpu') return 95;
    if (component.type === 'gpu') return 250;
    return 25; // Default for other components
  }
  
  const specs = component.specs.toString();
  
  // Look for TDP or power consumption in specs
  const tdpPattern = /(\d+)W\s+TDP|TDP[:\s]+(\d+)W|Power[:\s]+(\d+)W/i;
  const match = specs.match(tdpPattern);
  
  if (match) {
    return parseInt(match[1] || match[2] || match[3]);
  }
  
  // Return default values if not found
  if (component.type === 'cpu') return 95;
  if (component.type === 'gpu') return 250;
  return 25;
};

/**
 * Extract PSU wattage capacity from specs
 */
export const extractPSUCapacity = (psu) => {
  if (!psu || !psu.specs) {
    return 550; // Default PSU capacity
  }
  
  const specs = psu.specs.toString();
  
  // Look for wattage in specs or name
  const wattPattern = /(\d+)W|[\s-](\d+) Watt|[\s-](\d+)[\s-]W/i;
  
  // Try to find in specs
  const specsMatch = specs.match(wattPattern);
  if (specsMatch) {
    return parseInt(specsMatch[1] || specsMatch[2] || specsMatch[3]);
  }
  
  // Try to find in name
  if (psu.name) {
    const nameMatch = psu.name.match(wattPattern);
    if (nameMatch) {
      return parseInt(nameMatch[1] || nameMatch[2] || nameMatch[3]);
    }
  }
  
  return 550; // Default if not found
};

/**
 * Extract GPU length from specs
 */
export const extractGPULength = (gpu) => {
  if (!gpu || !gpu.specs) return null;
  
  const specs = gpu.specs.toString();
  
  // Look for length dimension
  const lengthPattern = /(\d+(\.\d+)?)\s*mm\s*length|length[:\s]+(\d+(\.\d+)?)\s*mm/i;
  const match = specs.match(lengthPattern);
  
  if (match) {
    return parseFloat(match[1] || match[3]);
  }
  
  return null;
};

/**
 * Extract case maximum GPU length from specs
 */
export const extractCaseMaxGPULength = (caseComponent) => {
  if (!caseComponent || !caseComponent.specs) return null;
  
  const specs = caseComponent.specs.toString();
  
  // Look for max GPU length
  const maxGpuPattern = /max[.\s]*gpu[.\s]*length[:\s]+(\d+(\.\d+)?)\s*mm|(\d+(\.\d+)?)\s*mm\s*max[.\s]*gpu/i;
  const match = specs.match(maxGpuPattern);
  
  if (match) {
    return parseFloat(match[1] || match[3]);
  }
  
  return null;
};

/**
 * Calculate a more accurate performance score based on component specifications
 */
export const calculatePerformanceScore = (components) => {
  // If components object is undefined or empty, return a default score
  if (!components || Object.keys(components).length === 0) {
    console.warn("No components provided for performance score calculation");
    return 50; // Return a default middle score instead of 0
  }
  
  // If missing critical components, still calculate a partial score
  if (!components.cpu && !components.gpu) {
    console.warn("Missing both CPU and GPU for performance calculation");
    return 40; // Return a low-mid score
  }
  
  let score = 0;
  let contributingFactors = 0;
  
  // CPU contribution (30% of total score)
  if (components.cpu) {
    score += calculateCPUScore(components.cpu) * 0.3;
    contributingFactors += 0.3;
  } else {
    // Default CPU score if missing
    score += 15; // Add a base score (half of 30%)
  }
  
  // GPU contribution (50% of total score)
  if (components.gpu) {
    score += calculateGPUScore(components.gpu) * 0.5;
    contributingFactors += 0.5;
  } else {
    // Default GPU score if missing
    score += 25; // Add a base score (half of 50%)
  }
  
  // RAM contribution (10% of total score)
  if (components.ram) {
    score += calculateRAMScore(components.ram) * 0.1;
    contributingFactors += 0.1;
  } else {
    // Default RAM score if missing
    score += 5; // Add a base score (half of 10%)
  }
  
  // Storage contribution (10% of total score)
  if (components.storage) {
    score += calculateStorageScore(components.storage) * 0.1;
    contributingFactors += 0.1;
  } else {
    // Default storage score if missing
    score += 5; // Add a base score (half of 10%)
  }
  
  console.log("Performance score calculation:", {
    components: Object.keys(components),
    score,
    contributingFactors
  });
  
  // Ensure we return at least a minimum score
  return Math.max(Math.round(score), 40);
};

/**
 * Calculate CPU performance score
 */
const calculateCPUScore = (cpu) => {
  if (!cpu) return 0;
  
  // Base score
  let score = 50;
  
  if (cpu.name) {
    // Check for high-end CPUs
    if (/i9|ryzen\s*9|threadripper/i.test(cpu.name)) score += 40;
    else if (/i7|ryzen\s*7/i.test(cpu.name)) score += 30;
    else if (/i5|ryzen\s*5/i.test(cpu.name)) score += 20;
    else if (/i3|ryzen\s*3/i.test(cpu.name)) score += 10;
  }
  
  if (cpu.specs) {
    const specs = cpu.specs.toString();
    
    // Check for cores/threads
    const coreMatch = specs.match(/(\d+)\s*cores?/i);
    if (coreMatch) {
      const cores = parseInt(coreMatch[1]);
      score += Math.min(cores * 2, 20); // Up to 20 points for cores
    }
    
    // Check for clock speed
    const clockMatch = specs.match(/(\d+(?:\.\d+)?)\s*GHz/i);
    if (clockMatch) {
      const clock = parseFloat(clockMatch[1]);
      score += Math.min((clock - 3) * 10, 15); // Up to 15 points for clock speed
    }
  }
  
  return Math.min(100, score); // Cap at 100
};

/**
 * Calculate GPU performance score
 */
const calculateGPUScore = (gpu) => {
  if (!gpu) return 0;
  
  let score = 50;
  
  if (gpu.name) {
    // NVIDIA RTX 40 series
    if (/rtx\s*40/i.test(gpu.name)) {
      score = 80;
      if (/4090/i.test(gpu.name)) score = 100;
      else if (/4080/i.test(gpu.name)) score = 95;
      else if (/4070/i.test(gpu.name)) score = 90;
      else if (/4060/i.test(gpu.name)) score = 80;
    }
    // NVIDIA RTX 30 series
    else if (/rtx\s*30/i.test(gpu.name)) {
      score = 70;
      if (/3090/i.test(gpu.name)) score = 90;
      else if (/3080/i.test(gpu.name)) score = 85;
      else if (/3070/i.test(gpu.name)) score = 80;
      else if (/3060/i.test(gpu.name)) score = 70;
    }
    // NVIDIA RTX 20 series
    else if (/rtx\s*20/i.test(gpu.name)) {
      score = 60;
      if (/2080/i.test(gpu.name)) score = 70;
      else if (/2070/i.test(gpu.name)) score = 65;
      else if (/2060/i.test(gpu.name)) score = 60;
    }
    // AMD RX 7000 series
    else if (/rx\s*7\d00/i.test(gpu.name)) {
      score = 75;
      if (/7900/i.test(gpu.name)) score = 95;
      else if (/7800/i.test(gpu.name)) score = 85;
      else if (/7700/i.test(gpu.name)) score = 80;
      else if (/7600/i.test(gpu.name)) score = 70;
    }
    // AMD RX 6000 series
    else if (/rx\s*6\d00/i.test(gpu.name)) {
      score = 65;
      if (/6900/i.test(gpu.name)) score = 85;
      else if (/6800/i.test(gpu.name)) score = 80;
      else if (/6700/i.test(gpu.name)) score = 75;
      else if (/6600/i.test(gpu.name)) score = 65;
    }
  }
  
  if (gpu.specs) {
    const specs = gpu.specs.toString();
    
    // Check for VRAM
    const vramMatch = specs.match(/(\d+)\s*GB/i);
    if (vramMatch) {
      const vram = parseInt(vramMatch[1]);
      score += Math.min(vram, 10); // Up to 10 points for VRAM
    }
  }
  
  return Math.min(100, score);
};

/**
 * Calculate RAM performance score
 */
const calculateRAMScore = (ram) => {
  if (!ram) return 0;
  
  let score = 50;
  
  if (ram.specs) {
    const specs = ram.specs.toString();
    
    // Check for capacity
    const capacityMatch = specs.match(/(\d+)\s*GB/i);
    if (capacityMatch) {
      const capacity = parseInt(capacityMatch[1]);
      score += Math.min(capacity / 4, 30); // Up to 30 points for capacity
    }
    
    // Check for speed
    const speedMatch = specs.match(/(\d+)\s*MHz/i);
    if (speedMatch) {
      const speed = parseInt(speedMatch[1]);
      score += Math.min((speed - 3000) / 100, 15); // Up to 15 points for speed
    }
    
    // Check for generation
    if (/DDR5/i.test(specs)) score += 15;
    else if (/DDR4/i.test(specs)) score += 5;
  }
  
  return Math.min(100, score);
};

/**
 * Calculate Storage performance score
 */
const calculateStorageScore = (storage) => {
  if (!storage) return 0;
  
  let score = 40;
  
  // Check storage type
  if (storage.name || storage.specs) {
    const fullText = `${storage.name || ''} ${storage.specs || ''}`;
    
    if (/NVMe/i.test(fullText)) score += 40;
    else if (/SSD/i.test(fullText)) score += 30;
    else if (/HDD/i.test(fullText)) score += 10;
    
    // Check for PCIe gen
    if (/PCIe 4/i.test(fullText)) score += 15;
    else if (/PCIe 3/i.test(fullText)) score += 10;
  }
  
  return Math.min(100, score);
};

/**
 * Calculate total price of all components
 */
export const calculateTotalPrice = (components) => {
  let total = 0;
  
  // Sum up prices of all selected components
  Object.values(components).forEach(component => {
    if (component && component.price) {
      total += parseFloat(component.price);
    }
  });
  
  return total;
};

/**
 * Get CPU performance tier (1-5)
 */
const getCPUTier = (cpu) => {
  if (!cpu) return null;
  
  // Calculate score
  const score = calculateCPUScore(cpu);
  
  // Convert to tier
  if (score >= 90) return 5; // Top tier
  if (score >= 75) return 4;
  if (score >= 60) return 3;
  if (score >= 45) return 2;
  return 1; // Entry level
};

/**
 * Get GPU performance tier (1-5)
 */
const getGPUTier = (gpu) => {
  if (!gpu) return null;
  
  // Calculate score
  const score = calculateGPUScore(gpu);
  
  // Convert to tier
  if (score >= 90) return 5; // Top tier
  if (score >= 75) return 4;
  if (score >= 60) return 3;
  if (score >= 45) return 2;
  return 1; // Entry level
};