import express from 'express';
import { getDiseases, getSymptoms, getDiseasesWithSymptoms } from '../controller/disease.controller.js';

const router = express.Router();

// GET /api/diseases - Fetch all diseases
router.get('/', getDiseases);

// GET /api/diseases/symptoms - Fetch all symptoms
router.get('/symptoms', getSymptoms);

// GET /api/diseases/with-symptoms - Fetch diseases with symptoms for problem selection
router.get('/with-symptoms', getDiseasesWithSymptoms);

export default router;