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
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var nodemailer = require("nodemailer");
var EmailService = /** @class */ (function () {
    function EmailService() {
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
    EmailService.prototype.generateVerificationCode = function () {
        return Math.floor(100000 + Math.random() * 900000).toString();
    };
    // Envia o e-mail de verificação
    EmailService.prototype.sendVerificationEmail = function (to, code) {
        return __awaiter(this, void 0, void 0, function () {
            var mailOptions, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        mailOptions = {
                            from: '"Seu App" <soparajogartf2@gmail.com>', // Seu email do Gmail
                            to: to,
                            subject: 'Código de Verificação',
                            html: "\n        <h1>Seu c\u00F3digo de verifica\u00E7\u00E3o</h1>\n        <p>Ol\u00E1,</p>\n        <p>Obrigado por se registrar. Use o c\u00F3digo abaixo para verificar seu e-mail:</p>\n        <h2><strong>".concat(code, "</strong></h2>\n        <p>Se voc\u00EA n\u00E3o solicitou este c\u00F3digo, por favor, ignore este e-mail.</p>\n        <p>Atenciosamente,<br>Equipe do Seu App</p>\n      ")
                        };
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, this.transporter.sendMail(mailOptions)];
                    case 2:
                        _a.sent();
                        console.log("E-mail de verifica\u00E7\u00E3o enviado para ".concat(to));
                        return [3 /*break*/, 4];
                    case 3:
                        error_1 = _a.sent();
                        console.error("Erro ao enviar e-mail de verifica\u00E7\u00E3o para ".concat(to, ":"), error_1);
                        throw new Error('Não foi possível enviar o e-mail de verificação.');
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    return EmailService;
}());
exports.default = new EmailService();
