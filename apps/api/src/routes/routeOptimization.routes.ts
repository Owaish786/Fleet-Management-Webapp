import { Router } from 'express';
import { RouteOptimizationService } from '../services/routeOptimizationService.js';

const router = Router();

router.post('/optimize', async (req, res) => {
  try {
    const { start, end, optimizeBy } = req.body;
    if (!start || !end) {
      return res.status(400).json({ error: 'start and end parameters are required' });
    }

    const routeResult = RouteOptimizationService.optimizeRoute(start, end, optimizeBy || 'distance');
    res.json(routeResult);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
