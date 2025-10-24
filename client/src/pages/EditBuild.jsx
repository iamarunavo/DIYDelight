import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import '../App.css';

import Button from '../components/aether/Button';
import Card from '../components/aether/Card';
import CompatibilityAnalyzer from '../components/aether/CompatibilityAnalyzer';
import BuildPreview from '../components/aether/BuildPreview';
import PerformanceDashboard from '../components/aether/PerformanceDashboard';

import { getPC, updatePC, getComponents } from '../services/PCsAPI';
import { 
  checkComponentCompatibility, 
  calculatePerformanceMetrics
} from '../utilities/pcUtils';
import { calculateTotalPrice } from '../utilities/pcutils-extension';

const COMPONENT_STEPS = ['cpu', 'cooler', 'motherboard', 'gpu', 'ram', 'storage', 'psu', 'case'];

const EditBuild = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  // Current step in the build process
  const [currentStep, setCurrentStep] = useState(0);
  
  // PC build name
  const [buildName, setBuildName] = useState('');
  
  // Selected components
  const [selectedComponents, setSelectedComponents] = useState({
    cpu: null,
    cooler: null,
    motherboard: null,
    gpu: null,
    ram: null,
    storage: null,
    psu: null,
    caseType: null
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
    initial: true,
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
  
  // Load PC and initial components
  useEffect(() => {
    const fetchPC = async () => {
      try {
        const pcData = await getPC(id);
        setBuildName(pcData.name);
        
        // Load all component categories in parallel
        await Promise.all(COMPONENT_STEPS.map(type => loadComponentsForType(type)));
        
        // Load the PC's components
        await loadPCComponents(pcData);
        
        setLoading(prev => ({ ...prev, initial: false }));
      } catch (err) {
        setError(`Error loading PC: ${err.message}`);
        setLoading(prev => ({ ...prev, initial: false }));
      }
    };
    
    fetchPC();
  }, [id]);
  
  // Load components for a specific type
  const loadComponentsForType = async (type) => {
    try {
      const components = await getComponents(type);
      setAvailableComponents(prev => ({
        ...prev,
        [type]: components
      }));
    } catch (err) {
      console.error(`Error loading ${type} components:`, err);
      setError(`Error loading ${type} components: ${err.message}`);
    }
  };
  
  // Load the PC's components and set the selected components
  const loadPCComponents = async (pcData) => {
    try {
      const componentMap = {
        cpu: pcData.cpu,
        cooler: pcData.cooler,
        motherboard: pcData.motherboard,
        gpu: pcData.gpu,
        ram: pcData.ram,
        storage: pcData.storage,
        psu: pcData.psu,
        case: pcData.case_type
      };
      
      const selectedComponentsObj = { ...selectedComponents };
      
      for (const [type, componentId] of Object.entries(componentMap)) {
        try {
          // For case, use the correct API endpoint key
          const apiType = type === 'case' ? 'case' : type;
          const components = await getComponents(apiType);
          const component = components.find(c => c.id === componentId);
          
          if (component) {
            // Map 'case' to 'caseType' for consistency with our component state
            const key = type === 'case' ? 'caseType' : type;
            selectedComponentsObj[key] = component;
          }
        } catch (error) {
          console.error(`Error fetching ${type} component:`, error);
        }
      }
      
      setSelectedComponents(selectedComponentsObj);
    } catch (err) {
      setError(`Error loading component details: ${err.message}`);
    }
  };
  
  // Update compatibility, metrics, and price when components change
  useEffect(() => {
    // Map caseType to case for compatibility check
    const componentsForCheck = {
      ...selectedComponents,
      case: selectedComponents.caseType
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
    
    // Special mapping for case
    const key = componentType === 'case' ? 'caseType' : componentType;
    
    setSelectedComponents(prev => ({
      ...prev,
      [key]: component
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
  
  // Submit PC build updates
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
      
      const updatedPC = {
        name: buildName,
        cpu: selectedComponents.cpu.id,
        cooler: selectedComponents.cooler.id,
        motherboard: selectedComponents.motherboard.id,
        gpu: selectedComponents.gpu.id,
        ram: selectedComponents.ram.id,
        storage: selectedComponents.storage.id,
        psu: selectedComponents.psu.id,
        case_type: selectedComponents.caseType.id,
        price: totalPrice,
        image_url: null // Using placeholder SVGs instead
      };
      
      await updatePC(id, updatedPC);
      
      // Navigate to the PC details page
      navigate(`/custombuilds/${id}`);
    } catch (err) {
      setError(`Error updating build: ${err.message}`);
      setLoading(prev => ({ ...prev, submit: false }));
    }
  };
  
  // Get the current component type
  const currentComponentType = COMPONENT_STEPS[currentStep];
  
  // Get the components to display
  const componentsToDisplay = availableComponents[currentComponentType] || [];
  
  // Get the selected component for the current step
  const selectedComponent = 
    currentComponentType === 'case' 
      ? selectedComponents.caseType 
      : selectedComponents[currentComponentType];
  
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
  
  if (loading.initial) {
    return (
      <div className="container mx-auto p-4 flex justify-center items-center min-h-[50vh]">
        <motion.div 
          className="w-12 h-12 border-4 border-accent border-t-transparent rounded-full"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        />
      </div>
    );
  }
  
  return (
    <motion.div
      className="container mx-auto p-4 text-textMain"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex justify-between items-center mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link to={`/custombuilds/${id}`} className="text-textDim hover:text-textMain transition-colors">
              &larr; Back to build details
            </Link>
          </div>
          <h2 className="text-2xl font-display font-semibold">
            Edit PC Build
          </h2>
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
                                <div className="flex flex-col space-y-1 text-xs text-accent">
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
                                <div className="flex flex-col space-y-1 text-xs text-accent">
                                  <div>Memory: {component.specs.memory} | Clock: {component.specs.boost_clock}</div>
                                  <div>TDP: {component.specs.tdp}W | RTX: {component.specs.rtx ? 'Yes' : 'No'}</div>
                                </div>
                              )}
                              
                              {component.type === 'ram' && (
                                <div className="flex flex-col space-y-1 text-xs text-accent">
                                  <div>Capacity: {component.specs.capacity}</div>
                                  <div>Speed: {component.specs.speed}</div>
                                  <div>CL: {component.specs.latency}</div>
                                  <div>Socket: {component.specs.compatibleWith}</div>
                                </div>
                              )}
                              
                              {component.type === 'storage' && (
                                <div className="flex flex-col space-y-1 text-xs text-accent">
                                  <div>Capacity: {component.specs.capacity}</div>
                                  <div>Type: {component.specs.type}</div>
                                  <div>Read: {component.specs.read_speed}</div>
                                  <div>Write: {component.specs.write_speed}</div>
                                </div>
                              )}
                              
                              {component.type === 'psu' && (
                                <div className="flex flex-col space-y-1 text-xs text-accent">
                                  <div>Wattage: {component.specs.wattage}W</div>
                                  <div>Cert: {component.specs.certification}</div>
                                  <div>Modularity: {component.specs.modularity}</div>
                                </div>
                              )}
                              
                              {component.type === 'case' && (
                                <div className="flex flex-col space-y-1 text-xs text-accent">
                                  <div>Size: {component.specs.size}</div>
                                  <div>Color: {component.specs.color}</div>
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
                  {loading.submit ? 'Saving...' : 'Update Build'}
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
            <div className="mb-4">
              <label htmlFor="buildName" className="block text-sm text-textDim mb-1">
                Build Name
              </label>
              <input
                type="text"
                id="buildName"
                value={buildName}
                onChange={(e) => setBuildName(e.target.value)}
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

export default EditBuild;