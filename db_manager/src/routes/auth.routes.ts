
import { Router, Request as ExpressRequest, Response as ExpressResponse } from 'express';
import AuthController from '../controllers/AuthController';

const router = Router();

router.post('/register', (req: ExpressRequest, res: ExpressResponse) => AuthController.register(req, res));
router.post('/login', (req: ExpressRequest, res: ExpressResponse) => AuthController.login(req, res));
router.post('/forgot-password', (req: ExpressRequest, res: ExpressResponse) => AuthController.forgotPassword(req, res));
router.post('/reset-password', (req: ExpressRequest, res: ExpressResponse) => AuthController.resetPassword(req, res));
router.post('/verify-email', (req: ExpressRequest, res: ExpressResponse) => AuthController.verifyEmail(req, res));
router.post('/resend-verification', (req: ExpressRequest, res: ExpressResponse) => AuthController.resendVerificationEmail(req, res));
router.post('/cancel-registration', (req: ExpressRequest, res: ExpressResponse) => AuthController.cancelRegistration(req, res));

export default router;