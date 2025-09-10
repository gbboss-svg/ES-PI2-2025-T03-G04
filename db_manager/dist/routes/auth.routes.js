"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.router = void 0;
const express_1 = require("express");
const AuthController_1 = __importDefault(require("../controllers/AuthController"));
const router = (0, express_1.Router)();
exports.router = router;
router.post('/register', AuthController_1.default.register);
router.post('/login', AuthController_1.default.login);
router.post('/forgot-password', AuthController_1.default.forgotPassword);
router.post('/reset-password', AuthController_1.default.resetPassword);
router.post('/verify-email', AuthController_1.default.verifyEmail);
