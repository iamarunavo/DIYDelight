import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import '../App.css';

import Button from '../components/aether/Button';
import Card from '../components/aether/Card';
import CompatibilityAnalyzer from '../components/aether/CompatibilityAnalyzer';
import BuildPreview from '../components/aether/BuildPreview';
import PerformanceDashboard from '../components/aether/PerformanceDashboard';
import PriceCard from '../components/aether/PriceCard';
import PCComponentCard from '../components/pcforge/PCComponentCard';

import { createPC, getComponents } from '../services/PCsAPI';
import { 
  checkComponentCompatibility, 
  calculatePerformanceMetrics
} from '../utilities/pcUtils';
import { calculateTotalPrice } from '../utilities/pcutils-extension';

const COMPONENT_STEPS = ['cpu', 'cooler', 'motherboard', 'gpu', 'ram', 'storage', 'psu', 'case'];

const CreateBuild = () => {
  const navigate = useNavigate();
  
  // Current step in the build process
  const [currentStep, setCurrentStep] = useState(0);
  
  // PC build name with empty default
  const [buildName, setBuildName] = useState('');
  
  // Remove the effect since we don't need to hide anything now
  
  // Selected components
  const [selectedComponents, setSelectedComponents] = useState({
    cpu: null,
    cooler: null,
    motherboard: null,
    gpu: null,
    ram: null,
    storage: null,
    psu: null,
    case: null // Changed from caseType to case for consistency
  });
  
  // Available components for each category
  const [availableComponents, setAvailableComponents] = useState({
    cpu: [],
    cooler: [],
    motherboard: [],
    gpu: [],
    ram: [],
    storage: [],
    psu: [],
    case: []
  });
  
  // Loading states
  const [loading, setLoading] = useState({
    components: false,
    submit: false
  });
  
  // Error state
  const [error, setError] = useState(null);
  
  // Compatibility state
  const [compatibilityStatus, setCompatibilityStatus] = useState({
    compatible: false,
    compatibility: {
      cpu: 'compatible',
      motherboard: 'compatible',
      gpu: 'compatible',
      ram: 'compatible',
      storage: 'compatible',
      psu: 'compatible',
      case: 'compatible',
    },
    issues: []
  });
  
  // Performance metrics
  const [performanceMetrics, setPerformanceMetrics] = useState({
    gamingPerformance: 0,
    powerEfficiency: 0,
    thermals: 0,
    noise: 0,
  });
  
  // Total price
  const [totalPrice, setTotalPrice] = useState(0);
  
  // Load components for the current step
  useEffect(() => {
    const loadComponents = async () => {
      try {
        setLoading(prev => ({ ...prev, components: true }));
        
        const componentType = COMPONENT_STEPS[currentStep];
        const components = await getComponents(componentType);
        
        setAvailableComponents(prev => ({
          ...prev,
          [componentType]: components
        }));
        
        setLoading(prev => ({ ...prev, components: false }));
      } catch (err) {
        setError(`Error loading components: ${err.message}`);
        setLoading(prev => ({ ...prev, components: false }));
      }
    };
    
    loadComponents();
  }, [currentStep]);
  
  // Update compatibility, metrics, and price when components change
  useEffect(() => {
    // No need to map caseType to case anymore as we're using consistent naming
    const componentsForCheck = {
      ...selectedComponents
    };
    
    const compatibility = checkComponentCompatibility(componentsForCheck);
    setCompatibilityStatus(compatibility);
    
    const metrics = calculatePerformanceMetrics(componentsForCheck);
    setPerformanceMetrics(metrics);
    
    const price = calculateTotalPrice(componentsForCheck);
    setTotalPrice(price);
  }, [selectedComponents]);
  
  // Select a component
  const handleSelectComponent = (component) => {
    const componentType = COMPONENT_STEPS[currentStep];
    
    // No special mapping needed anymore as we're using consistent naming
    setSelectedComponents(prev => ({
      ...prev,
      [componentType]: component
    }));
  };
  
  // Navigate to next step
  const handleNextStep = () => {
    if (currentStep < COMPONENT_STEPS.length - 1) {
      setCurrentStep(prev => prev + 1);
    }
  };
  
  // Navigate to previous step
  const handlePreviousStep = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };
  
  // Submit PC build
  const handleSubmit = async () => {
    try {
      setLoading(prev => ({ ...prev, submit: true }));
      
      // Validate that all components are selected
      const missingComponents = Object.entries(selectedComponents)
        .filter(([_, value]) => value === null)
        .map(([key]) => key);
      
      if (missingComponents.length > 0) {
        setError(`Please select all components: ${missingComponents.join(', ')}`);
        setLoading(prev => ({ ...prev, submit: false }));
        return;
      }
      
      // Check compatibility before submitting
      if (!compatibilityStatus.compatible) {
        setError('Cannot save a build with incompatible components. Please fix the compatibility issues.');
        setLoading(prev => ({ ...prev, submit: false }));
        return;
      }
      
      // Use default name if user hasn't entered one
      const finalBuildName = buildName.trim() ? buildName : 'Custom PC Build';
      
      const newPC = {
        name: finalBuildName,
        cpu: selectedComponents.cpu.id,
        cooler: selectedComponents.cooler.id,
        motherboard: selectedComponents.motherboard.id,
        gpu: selectedComponents.gpu.id,
        ram: selectedComponents.ram.id,
        storage: selectedComponents.storage.id,
        psu: selectedComponents.psu.id,
        case_type: selectedComponents.case.id,
        price: totalPrice,
        image_url: null // We're using SVG placeholders now, no need for image URLs
      };
      
      const createdPC = await createPC(newPC);
      
      // Navigate to the PC details page
      navigate(`/custombuilds/${createdPC.id}`);
    } catch (err) {
      setError(`Error creating build: ${err.message}`);
      setLoading(prev => ({ ...prev, submit: false }));
    }
  };
  
  // Get the current component type
  const currentComponentType = COMPONENT_STEPS[currentStep];
  
  // Get the components to display
  const componentsToDisplay = availableComponents[currentComponentType] || [];
  
  // Get the selected component for the current step
  const selectedComponent = selectedComponents[currentComponentType];
  
  // Convert component type to display name
  const componentTypeToDisplayName = {
    cpu: 'Processor',
    cooler: 'CPU Cooler',
    motherboard: 'Motherboard',
    gpu: 'Graphics Card',
    ram: 'Memory',
    storage: 'Storage',
    psu: 'Power Supply',
    case: 'Case'
  };
  
  // Check if this is the final step
  const isFinalStep = currentStep === COMPONENT_STEPS.length - 1;
  
  return (
    <motion.div
      className="container mx-auto p-4 text-textMain"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-2xl font-display font-semibold">
            Create Your Custom PC Build
          </h2>
          <p className="text-textDim">
            Select components to create your perfect PC
          </p>
        </div>
        
        <div className="flex space-x-1">
          {COMPONENT_STEPS.map((step, index) => (
            <motion.button
              key={step}
              className={`h-8 w-8 rounded-full flex items-center justify-center text-xs ${
                index === currentStep
                  ? 'bg-accent text-bg'
                  : index < currentStep
                    ? 'bg-primary text-white'
                    : 'bg-surface text-textDim'
              }`}
              animate={index === currentStep ? {
                scale: [1, 1.1, 1],
              } : {}}
              transition={{ duration: 1, repeat: Infinity }}
              onClick={() => setCurrentStep(index)}
            >
              {index + 1}
            </motion.button>
          ))}
        </div>
      </div>
      
      {error && (
        <motion.div 
          className="bg-error/20 border border-error rounded-lg p-4 mb-6 flex items-center justify-between"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <p className="text-error">{error}</p>
          <Button 
            variant="ghost" 
            size="small"
            onClick={() => setError(null)}
          >
            Dismiss
          </Button>
        </motion.div>
      )}
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Components Selection */}
        <div className="lg:col-span-2">
          <motion.div
            className="mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-display font-semibold">
                {componentTypeToDisplayName[currentComponentType]}
              </h3>
              
              <div className="text-sm text-textDim">
                Step {currentStep + 1} of {COMPONENT_STEPS.length}
              </div>
            </div>
            
            {loading.components ? (
              <div className="flex justify-center p-12">
                <motion.div 
                  className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                />
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <AnimatePresence mode="sync">
                  {componentsToDisplay.map((component) => (
                    <motion.div
                      key={component.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.3 }}
                    >
                      <Card 
                        selected={selectedComponent?.id === component.id}
                        onClick={() => handleSelectComponent(component)}
                        className="relative h-full"
                      >
                        <div className="flex flex-col h-full">
                          <h4 className="text-lg font-medium text-textMain mb-2">{component.name}</h4>
                          <p className="text-sm text-textDim mb-4">{component.brand}</p>
                          
                          <div className="mt-auto">
                            <div className="bg-surface/50 p-2 rounded-lg">
                              {/* Display component specs */}
                              {component.type === 'cpu' && (
                                <div className="flex flex-col gap-1 text-xs text-accent">
                                  <div>Cores: {component.specs.cores} | Threads: {component.specs.threads}</div>
                                  <div>Base: {component.specs.base_clock} | Boost: {component.specs.boost_clock}</div>
                                </div>
                              )}
                              
                              {component.type === 'cooler' && (
                                <div className="flex flex-col space-y-1 text-xs text-accent">
                                  <div>Type: {component.specs.cooling_type}</div>
                                  <div>TDP: {component.specs.tdp_rating}W</div>
                                  <div>RPM: {component.specs.fan_rpm}</div>
                                  <div>Noise: {component.specs.noise_level}</div>
                                </div>
                              )}
                              
                              {component.type === 'motherboard' && (
                                <div className="flex flex-col space-y-1 text-xs text-accent">
                                  <div>Socket: {component.specs.socket}</div>
                                  <div>Form Factor: {component.specs.form_factor}</div>
                                  <div>Chipset: {component.specs.chipset}</div>
                                  <div>Memory Slots: {component.specs.memory_slots}</div>
                                </div>
                              )}
                              
                              {component.type === 'gpu' && (
                                <div className="flex flex-col gap-1 text-xs text-accent">
                                  <div>Memory: {component.specs.memory} | Clock: {component.specs.boost_clock}</div>
                                  <div>TDP: {component.specs.tdp}W | RTX: {component.specs.rtx ? 'Yes' : 'No'}</div>
                                </div>
                              )}
                              
                              {component.type === 'ram' && (
                                <div className="flex flex-col gap-1 text-xs text-accent">
                                  <div>Capacity: {component.specs.capacity} | Speed: {component.specs.speed}</div>
                                  <div>CL: {component.specs.latency} | Socket: {component.specs.compatibleWith}</div>
                                </div>
                              )}
                              
                              {component.type === 'storage' && (
                                <div className="flex flex-col gap-1 text-xs text-accent">
                                  <div>Capacity: {component.specs.capacity} | Type: {component.specs.type}</div>
                                  <div>Read: {component.specs.read_speed} | Write: {component.specs.write_speed}</div>
                                </div>
                              )}
                              
                              {component.type === 'psu' && (
                                <div className="flex flex-col gap-1 text-xs text-accent">
                                  <div>Wattage: {component.specs.wattage}W | Cert: {component.specs.certification}</div>
                                  <div>Modularity: {component.specs.modularity}</div>
                                </div>
                              )}
                              
                              {component.type === 'case' && (
                                <div className="flex flex-col gap-1 text-xs text-accent">
                                  <div>Size: {component.specs.size} | Color: {component.specs.color}</div>
                                  <div>Material: {component.specs.material}</div>
                                </div>
                              )}
                            </div>
                            
                            <div className="mt-4 text-lg font-semibold text-accent">
                              ${component.price}
                            </div>
                          </div>
                        </div>
                      </Card>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
            
            <div className="flex justify-between">
              <Button
                variant="ghost"
                onClick={handlePreviousStep}
                disabled={currentStep === 0}
              >
                &larr; Previous
              </Button>
              
              {!isFinalStep ? (
                <Button
                  onClick={handleNextStep}
                  disabled={!selectedComponent}
                >
                  Next &rarr;
                </Button>
              ) : (
                <Button
                  variant={compatibilityStatus.compatible ? 'success' : 'secondary'}
                  onClick={compatibilityStatus.compatible ? handleSubmit : null}
                  disabled={loading.submit || !compatibilityStatus.compatible}
                >
                  {loading.submit ? 'Creating...' : 'Create Build'}
                </Button>
              )}
            </div>
          </motion.div>
        </div>
        
        {/* Right Column: PC Preview & Stats */}
        <div className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            {/* Price Card without separate title */}
            <PriceCard 
              buildName={buildName}
              totalPrice={totalPrice}
              className="mb-6"
            />
            
            <div className="mb-4">
              <label htmlFor="buildName" className="block text-sm text-textDim mb-1">
                Build Name
              </label>
              <input
                type="text"
                id="buildName"
                value={buildName}
                onChange={(e) => setBuildName(e.target.value)}
                placeholder="Enter a name for your build"
                className="w-full p-2 rounded-md bg-surface border border-accent/20 text-textMain focus:border-accent focus:outline-none"
              />
            </div>
            
            <BuildPreview selectedComponents={selectedComponents} className="mb-6" />
            
            <CompatibilityAnalyzer 
              compatibility={compatibilityStatus.compatibility}
              issues={compatibilityStatus.issues}
              className="mb-6"
            />
            
            <PerformanceDashboard 
              totalPrice={totalPrice}
              metrics={performanceMetrics}
            />
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

export default CreateBuild;