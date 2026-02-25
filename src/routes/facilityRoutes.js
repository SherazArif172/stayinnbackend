import express from 'express';
import { getAllFacilities, updateFacility } from '../controllers/facilityController.js';

const router = express.Router();

router.get('/', getAllFacilities);
router.patch('/:id', updateFacility);

export default router;
