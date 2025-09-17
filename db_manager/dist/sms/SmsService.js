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
Object.defineProperty(exports, "__esModule", { value: true });
const twilio = require('twilio');
class SmsService {
    constructor(accountSid, authToken, twilioPhoneNumber) {
        this.client = twilio(accountSid, authToken);
        this.twilioPhoneNumber = twilioPhoneNumber;
    }
    generateVerificationCode() {
        return Math.floor(100000 + Math.random() * 900000).toString();
    }
    sendVerificationSms(to, code) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield this.client.messages.create({
                    body: `Seu código de verificação é: ${code}`,
                    from: this.twilioPhoneNumber,
                    to: to
                });
                console.log(`SMS de verificação enviado para ${to}`);
            }
            catch (error) {
                console.error(`Erro ao enviar SMS de verificação para ${to}:`, error);
                throw new Error('Não foi possível enviar o SMS de verificação.');
            }
        });
    }
}
exports.default = SmsService;
