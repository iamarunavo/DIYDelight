import express from 'express';
import {
  getAllPCs,
  getPC,
  createPC,
  updatePC,
  deletePC,
  getComponents
} from '../controllers/pcsController.js';

const router = express.Router();

// PC routes
router.get('/pcs', getAllPCs);
router.get('/pcs/:id', getPC);
router.post('/pcs', createPC);
router.put('/pcs/:id', updatePC);
router.delete('/pcs/:id', deletePC);

// Component routes
router.get('/components/:type', getComponents);

export default router;