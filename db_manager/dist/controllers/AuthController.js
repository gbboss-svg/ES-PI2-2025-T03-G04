"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const AuthService_1 = __importDefault(require("../services/AuthService"));
class AuthController {
    register(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { nome, email, celular, senha } = req.body;
            try {
                yield AuthService_1.default.register(nome, email, celular, senha);
                return res.status(201).send();
            }
            catch (error) {
                return res.status(400).json({ error: error.message });
            }
        });
    }
    login(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { email, senha } = req.body;
            try {
                const token = yield AuthService_1.default.login(email, senha);
                return res.json({ token });
            }
            catch (error) {
                return res.status(400).json({ error: error.message });
            }
        });
    }
    forgotPassword(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { email } = req.body;
            try {
                yield AuthService_1.default.forgotPassword(email);
                return res.send();
            }
            catch (error) {
                return res.status(400).json({ error: error.message });
            }
        });
    }
    resetPassword(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { token, senha } = req.body;
            try {
                yield AuthService_1.default.resetPassword(token, senha);
                return res.send();
            }
            catch (error) {
                return res.status(400).json({ error: error.message });
            }
        });
    }
    verifyEmail(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { email, code } = req.body;
            try {
                yield AuthService_1.default.verifyEmail(email, code);
                return res.status(200).send({ message: 'E-mail verificado com sucesso!' });
            }
            catch (error) {
                return res.status(400).json({ error: error.message });
            }
        });
    }
}
exports.default = new AuthController();
