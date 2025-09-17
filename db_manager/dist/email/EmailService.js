"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const nodemailer = __importStar(require("nodemailer"));
class EmailService {
    constructor() {
        // Configuração do Nodemailer com Gmail (substitua com suas credenciais)
        this.transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 587,
            secure: false, // use TLS
            auth: {
                user: 'soparajogartf2@gmail.com', // Seu email do Gmail
                pass: 'XIenowoal78481!!3!4!2!2!3!??xkan!!!rffXcsDfz1355555KSNZBNAnK121kxndkflmNCJKE' // Sua senha do Gmail ou senha de app
            },
            tls: {
                rejectUnauthorized: false
            }
        });
    }
    // Gera um código de verificação de 6 dígitos
    generateVerificationCode() {
        return Math.floor(100000 + Math.random() * 900000).toString();
    }
    // Envia o e-mail de verificação
    sendVerificationEmail(to, code) {
        return __awaiter(this, void 0, void 0, function* () {
            const mailOptions = {
                from: '"Seu App" <soparajogartf2@gmail.com>', // Seu email do Gmail
                to: to,
                subject: 'Código de Verificação',
                html: `
        <h1>Seu código de verificação</h1>
        <p>Olá,</p>
        <p>Obrigado por se registrar. Use o código abaixo para verificar seu e-mail:</p>
        <h2><strong>${code}</strong></h2>
        <p>Se você não solicitou este código, por favor, ignore este e-mail.</p>
        <p>Atenciosamente,<br>Equipe do Seu App</p>
      `
            };
            try {
                yield this.transporter.sendMail(mailOptions);
                console.log(`E-mail de verificação enviado para ${to}`);
            }
            catch (error) {
                console.error(`Erro ao enviar e-mail de verificação para ${to}:`, error);
                throw new Error('Não foi possível enviar o e-mail de verificação.');
            }
        });
    }
}
exports.default = new EmailService();
