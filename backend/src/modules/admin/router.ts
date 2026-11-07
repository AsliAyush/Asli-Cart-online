import { Router } from 'express';
import authRouter from './auth/auth.router.js';
import userRouter from './user/user.router.js';
import roleRouter from './role/role.router.js';
import moduleRouter from './module/module.router.js';
import dashboardRouter from './dashboard/dashboard.router.js';

const router = Router();

router.use('/auth', authRouter);
router.use('/dashboard', dashboardRouter);
router.use('/users', userRouter);
router.use('/roles', roleRouter);
router.use('/modules', moduleRouter);

export default router;

