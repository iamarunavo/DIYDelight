import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import '../App.css';

import Button from '../components/aether/Button';
import Card from '../components/aether/Card';
import BuildPreview from '../components/aether/BuildPreview';
import CompatibilityAnalyzer from '../components/aether/CompatibilityAnalyzer';
import PerformanceDashboard from '../components/aether/PerformanceDashboard';

import { getPC, deletePC } from '../services/PCsAPI';
import { checkComponentCompatibility, calculatePerformanceMetrics } from '../utilities/pcUtils';

const BuildDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [build, setBuild] = useState(null);
  const [components, setComponents] = useState({
    cpu: null,
    cooler: null,
    motherboard: null,
    gpu: null,
    ram: null,
    storage: null,
    psu: null,
    caseType: null
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  
  // Compatibility state
  const [compatibilityStatus, setCompatibilityStatus] = useState({
    compatible: true,
    compatibility: {},
    issues: []
  });
  
  // Performance metrics
  const [performanceMetrics, setPerformanceMetrics] = useState({
    gamingPerformance: 0,
    powerEfficiency: 0,
    thermals: 0,
    noise: 0,
  });
  
  useEffect(() => {
    const fetchBuild = async () => {
      try {
        const data = await getPC(id);
        setBuild(data);
        
        console.log("Fetched build data:", data);
        
        // Set components
        const componentData = {
          cpu: data.cpu_details,
          cooler: data.cooler_details,
          motherboard: data.motherboard_details,
          gpu: data.gpu_details,
          ram: data.ram_details,
          storage: data.storage_details,
          psu: data.psu_details,
          caseType: data.case_details
        };
        
        console.log("Component structure:", componentData);
        setComponents(componentData);
        
        setLoading(false);
      } catch (err) {
        setError(`Error loading build: ${err.message}`);
        setLoading(false);
      }
    };
    
    fetchBuild();
  }, [id]);
  
  // Update compatibility and performance metrics when components change
  useEffect(() => {
    if (!components.cpu) return;
    
    // Map caseType to case for compatibility check
    const componentsForCheck = {
      ...components,
      case: components.caseType
    };
    
    const compatibility = checkComponentCompatibility(componentsForCheck);
    setCompatibilityStatus(compatibility);
    
    const metrics = calculatePerformanceMetrics(componentsForCheck);
    setPerformanceMetrics(metrics);
    
    console.log("Performance metrics calculated:", metrics); // Debugging
  }, [components]);
  
  const handleDeleteBuild = async () => {
    try {
      await deletePC(id);
      navigate('/custombuilds');
    } catch (err) {
      setError(`Error deleting build: ${err.message}`);
      setDeleteConfirm(false);
    }
  };
  
  if (loading) {
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
  
  if (error) {
    return (
      <div className="container mx-auto p-4">
        <motion.div 
          className="bg-error/20 border border-error rounded-lg p-4 mb-6 flex flex-col items-center"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <p className="text-error mb-4">{error}</p>
          <Button 
            variant="secondary"
            as={Link}
            to="/custombuilds"
          >
            Back to Builds
          </Button>
        </motion.div>
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
            <Link to="/custombuilds" className="text-textDim hover:text-textMain transition-colors">
              &larr; Back to builds
            </Link>
          </div>
          <h2 className="text-2xl font-display font-semibold">
            {build.name}
          </h2>
        </div>
        
        <div className="flex items-center gap-4">
          <Button
            as={Link}
            to={`/edit/${id}`}
            variant="primary"
            size="large"
            className="min-w-[120px] h-[44px] text-center"
          >
            Edit Build
          </Button>
          
          <Button
            variant="error"
            size="large"
            onClick={() => setDeleteConfirm(true)}
            className="min-w-[120px] h-[44px] text-center"
          >
            DELETE
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Component List */}
        <div className="lg:col-span-2 space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="mb-6">
              <div className="flex flex-col md:flex-row gap-6">
                {/* Removed image display */}
                
                <div className="md:w-2/3">
                  <h3 className="text-xl font-medium mb-2">{build.name}</h3>
                  
                  <div className="mb-4 pl-1">
                    <div className="text-sm text-gray-300 mb-2">Total Price</div>
                    <div className="text-3xl font-bold text-accent drop-shadow-[0_0_8px_rgba(0,224,255,0.5)]">
                      ${build.price}
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        </div>
        
        {/* Right Column: PC Preview & Stats */}
        <div className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <BuildPreview selectedComponents={components} className="mb-6" />
            
            <CompatibilityAnalyzer 
              compatibility={compatibilityStatus.compatibility}
              issues={compatibilityStatus.issues}
              className="mb-6"
            />
            
            <PerformanceDashboard 
              totalPrice={build.price}
              metrics={performanceMetrics}
            />
          </motion.div>
        </div>
      </div>
      
      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteConfirm && (
          <motion.div 
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div 
              className="bg-bg border border-surface rounded-xl p-6 max-w-md w-full"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: 'spring', damping: 25 }}
            >
              <h3 className="text-xl font-semibold mb-4">Delete Build</h3>
              <p className="mb-6">
                Are you sure you want to delete <span className="font-medium">{build.name}</span>? This action cannot be undone.
              </p>
              <div className="flex items-center gap-4 justify-end">
                <Button 
                  variant="ghost" 
                  size="large"
                  onClick={() => setDeleteConfirm(false)}
                  className="min-w-[120px] text-center"
                >
                  Cancel
                </Button>
                <Button 
                  variant="error" 
                  size="large"
                  onClick={handleDeleteBuild}
                  className="min-w-[120px] text-center"
                >
                  DELETE
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default BuildDetails;