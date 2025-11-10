import { Router } from 'express';
import AuthController from '../controllers/AuthController';

const router = Router();

router.post('/register', (req, res) => AuthController.register(req, res));
router.post('/login', (req, res) => AuthController.login(req, res));
router.post('/forgot-password', (req, res) => AuthController.forgotPassword(req, res));
router.post('/reset-password', (req, res) => AuthController.resetPassword(req, res));
router.post('/verify-email', (req, res) => AuthController.verifyEmail(req, res));
router.post('/resend-verification', (req, res) => AuthController.resendVerificationEmail(req, res));
router.post('/cancel-registration', (req, res) => AuthController.cancelRegistration(req, res));

export default router;
