/**
 * Travel plan API routes.
 */

import { Router } from 'express';
import { createTravelPlan } from '../controllers/travelPlanController.js';
import { apiKeyAuth } from '../middleware/apiKeyAuth.js';
import { aiRateLimiter } from '../middleware/rateLimiter.js';

const router = Router();

router.post('/', apiKeyAuth, aiRateLimiter, createTravelPlan);

export default router;
