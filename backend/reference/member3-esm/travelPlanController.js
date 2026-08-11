/**
 * Travel plan controller — thin layer between HTTP and aiService.
 */

import { generateTravelPlan } from '../services/aiService.js';

/**
 * POST /api/travel-plan
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
export const createTravelPlan = async (req, res, next) => {
  try {
    const travelPlan = await generateTravelPlan(req.body);
    return res.status(200).json({ success: true, data: travelPlan });
  } catch (error) {
    return next(error);
  }
};

export default { createTravelPlan };
