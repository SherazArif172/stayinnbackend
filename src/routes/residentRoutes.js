import express from 'express';
import { authenticateAdmin } from '../middleware/auth.js';
import { getResidents, getResidentById, removeResident } from '../controllers/residentController.js';

const router = express.Router();

router.use(authenticateAdmin);

router.get('/', getResidents);
router.get('/:id', getResidentById);
router.delete('/:id', removeResident);

export default router;

