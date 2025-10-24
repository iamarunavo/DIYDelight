import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import '../App.css';

import Button from '../components/aether/Button';
import Card from '../components/aether/Card';

import { getAllPCs, deletePC } from '../services/PCsAPI';

const ViewBuilds = () => {
  const [builds, setBuilds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  
  useEffect(() => {
    const fetchBuilds = async () => {
      try {
        const data = await getAllPCs();
        setBuilds(data);
        setLoading(false);
      } catch (err) {
        setError(`Error loading builds: ${err.message}`);
        setLoading(false);
      }
    };
    
    fetchBuilds();
  }, []);
  
  const handleDeleteBuild = async (buildId) => {
    try {
      await deletePC(buildId);
      setBuilds(builds.filter(build => build.id !== buildId));
      setDeleteConfirm(null);
    } catch (err) {
      setError(`Error deleting build: ${err.message}`);
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
            My PC Builds
          </h2>
          <p className="text-textDim">
            View and manage your custom PC builds
          </p>
        </div>
        
        <Button as={Link} to="/" className="flex items-center gap-1">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          New Build
        </Button>
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
      
      {builds.length === 0 ? (
        <motion.div 
          className="text-center py-12"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <div className="w-24 h-24 mx-auto mb-4 text-textDim opacity-50">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-24 w-24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
            </svg>
          </div>
          <h3 className="text-xl font-medium mb-2">No PC Builds Yet</h3>
          <p className="text-textDim mb-6">Create your first custom PC build to get started</p>
          <Button as={Link} to="/">
            Create Your First Build
          </Button>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence>
            {builds.map((build) => (
              <motion.div
                key={build.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="relative h-full">
                  {deleteConfirm === build.id && (
                    <motion.div
                      className="absolute inset-0 bg-bg/90 backdrop-blur-sm z-10 rounded-xl flex flex-col items-center justify-center p-4"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                    >
                      <p className="text-center mb-4">Are you sure you want to delete this build?</p>
                      <div className="flex gap-3">
                        <Button 
                          variant="error" 
                          onClick={() => handleDeleteBuild(build.id)}
                        >
                          Delete
                        </Button>
                        <Button 
                          variant="ghost" 
                          onClick={() => setDeleteConfirm(null)}
                        >
                          Cancel
                        </Button>
                      </div>
                    </motion.div>
                  )}
                  
                  <div className="flex flex-col h-full">
                    {/* Removed image display */}
                    
                    <h3 className="text-xl font-medium mb-1">{build.name}</h3>
                    
                    <div className="mb-4 pl-1">
                      <div className="text-sm text-gray-300 mb-1">Total</div>
                      <div className="text-lg font-bold text-accent drop-shadow-[0_0_5px_rgba(0,224,255,0.3)]">
                        ${build.price}
                      </div>
                    </div>
                    
                    <div className="mt-auto flex gap-2">
                      <Button
                        as={Link}
                        to={`/custombuilds/${build.id}`}
                        variant="primary"
                        className="flex-1"
                      >
                        View
                      </Button>
                      
                      <Button
                        as={Link}
                        to={`/edit/${build.id}`}
                        variant="secondary"
                        className="flex-1"
                      >
                        Edit
                      </Button>
                      
                      <Button
                        variant="ghost"
                        onClick={() => setDeleteConfirm(build.id)}
                        className="aspect-square"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </Button>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </motion.div>
  );
};

export default ViewBuilds;