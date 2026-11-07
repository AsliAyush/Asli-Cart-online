import { Router } from 'express';
import { ResponseFormatter } from '../../utils/apiResponse.js';

const router = Router();

router.get('/', (_req, res) => {
  ResponseFormatter.success(res, 'Social Media Manager module placeholder - Phase 2');
});

export default router;

