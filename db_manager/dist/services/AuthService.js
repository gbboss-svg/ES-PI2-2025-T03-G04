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
const db_1 = __importDefault(require("../database/db"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const crypto_1 = __importDefault(require("crypto"));
const EmailService_1 = __importDefault(require("../email/EmailService"));
class AuthService {
    register(nome, email, celular, senha) {
        return __awaiter(this, void 0, void 0, function* () {
            const [rows] = yield db_1.default.execute('SELECT * FROM professores WHERE email = ?', [email]);
            if (rows.length > 0) {
                throw new Error('E-mail já cadastrado');
            }
            const hashedPassword = yield bcrypt_1.default.hash(senha, 10);
            const verificationCode = EmailService_1.default.generateVerificationCode();
            yield db_1.default.execute('INSERT INTO professores (nome, email, celular, senha, verification_code) VALUES (?, ?, ?, ?, ?)', [nome, email, celular, hashedPassword, verificationCode]);
            yield EmailService_1.default.sendVerificationEmail(email, verificationCode);
        });
    }
    verifyEmail(email, code) {
        return __awaiter(this, void 0, void 0, function* () {
            const [rows] = yield db_1.default.execute('SELECT * FROM professores WHERE email = ? AND verification_code = ?', [email, code]);
            if (rows.length === 0) {
                throw new Error('Código de verificação inválido.');
            }
            yield db_1.default.execute('UPDATE professores SET is_verified = TRUE, verification_code = NULL WHERE email = ?', [email]);
        });
    }
    login(email, senha) {
        return __awaiter(this, void 0, void 0, function* () {
            const [rows] = yield db_1.default.execute('SELECT * FROM professores WHERE email = ?', [email]);
            if (rows.length === 0) {
                throw new Error('E-mail ou senha inválidos');
            }
            const user = rows[0];
            const isPasswordValid = yield bcrypt_1.default.compare(senha, user.senha);
            if (!isPasswordValid) {
                throw new Error('E-mail ou senha inválidos');
            }
            const token = jsonwebtoken_1.default.sign({ id: user.id }, 'your-secret-key', { expiresIn: '1h' });
            return token;
        });
    }
    forgotPassword(email) {
        return __awaiter(this, void 0, void 0, function* () {
            const [rows] = yield db_1.default.execute('SELECT * FROM professores WHERE email = ?', [email]);
            if (rows.length === 0) {
                throw new Error('Usuário não encontrado');
            }
            const token = crypto_1.default.randomBytes(20).toString('hex');
            const expires = new Date();
            expires.setHours(expires.getHours() + 1);
            yield db_1.default.execute('UPDATE professores SET reset_password_token = ?, reset_password_expires = ? WHERE email = ?', [token, expires, email]);
            console.log(`Link para redefinição de senha: http://localhost:3000/reset-password/${token}`);
        });
    }
    resetPassword(token, senha) {
        return __awaiter(this, void 0, void 0, function* () {
            const [rows] = yield db_1.default.execute('SELECT * FROM professores WHERE reset_password_token = ? AND reset_password_expires > ?', [token, new Date()]);
            if (rows.length === 0) {
                throw new Error('Token inválido ou expirado');
            }
            const hashedPassword = yield bcrypt_1.default.hash(senha, 10);
            yield db_1.default.execute('UPDATE professores SET senha = ?, reset_password_token = NULL, reset_password_expires = NULL WHERE reset_password_token = ?', [hashedPassword, token]);
        });
    }
}
exports.default = new AuthService();
