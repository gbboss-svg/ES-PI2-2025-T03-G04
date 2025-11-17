/**
 * Lida com a lógica da tela "Esqueci Minha Senha".
 */
document.addEventListener('DOMContentLoaded', () => {
    const identifierInput = document.getElementById('identifier');
    const form = document.getElementById('signup-form');
    const formError = document.getElementById('form-error');
    const hintDiv = document.getElementById('identifier-hint');
    const backButton = document.getElementById('back-button');
    const successMessage = document.createElement('p');
    successMessage.style.color = 'green';
    formError.parentNode.insertBefore(successMessage, formError.nextSibling);

    const onlyDigits = (s) => String(s).replace(/\D/g, '');

    function validaEmailSimples(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email.trim());
    }

    function isCPF(cpf) {
        const cpfLimpo = onlyDigits(cpf);
        if (cpfLimpo.length !== 11 || /^(\d)\1+$/.test(cpfLimpo)) return false;
        let soma = 0, resto;
        for (let i = 1; i <= 9; i++) soma += parseInt(cpfLimpo.substring(i - 1, i), 10) * (11 - i);
        resto = (soma * 10) % 11;
        if (resto === 10 || resto === 11) resto = 0;
        if (resto !== parseInt(cpfLimpo.substring(9, 10), 10)) return false;
        soma = 0;
        for (let i = 1; i <= 10; i++) soma += parseInt(cpfLimpo.substring(i - 1, i), 10) * (12 - i);
        resto = (soma * 10) % 11;
        if (resto === 10 || resto === 11) resto = 0;
        if (resto !== parseInt(cpfLimpo.substring(10, 11), 10)) return false;
        return true;
    }

    function isTelefoneComDDI(telefone) {
        if (!telefone) return false;
        const raw = String(telefone).trim();
        let digits = onlyDigits(raw);
        if (/^00/.test(raw)) {
            digits = digits.replace(/^00/, '');
        }
        if (digits.length < 8 || digits.length > 15) return false;
        if (digits.startsWith('55')) {
            const rest = digits.substring(2);
            if (rest.length !== 10 && rest.length !== 11) return false;
            const ddd = rest.substring(0, 2);
            const dddsValidos = ['11','12','13','14','15','16','17','18','19','21','22','24','27','28','31','32','33','34','35','37','38','41','42','43','44','45','46','47','48','49','51','53','54','55','61','62','63','64','65','66','67','68','69','71','73','74','75','77','79','81','82','83','84','85','86','87','88','89','91','92','93','94','95','96','97','98','99'];
            if (!dddsValidos.includes(ddd)) return false;
            const numero = rest.substring(2);
            if (numero.length === 9) {
                if (numero.charAt(0) !== '9') return false;
            } else if (numero.length === 8) {
                const primeiro = parseInt(numero.charAt(0), 10);
                if (isNaN(primeiro) || primeiro < 2 || primeiro > 5) return false;
            } else {
                return false;
            }
            return true;
        }
        for (let ccLen = 1; ccLen <= 3; ccLen++) {
            if (digits.length - ccLen < 6 || digits.length - ccLen > 12) continue;
            return true;
        }
        return false;
    }

    /**
     * Identifica o tipo de credencial inserida (Email, CPF, Telefone, etc.).
     */
    function identificaTipo(inputValue) {
        if (!inputValue) return 'Indefinido';
        const raw = inputValue.trim();

        if (raw.includes('@')) {
            return validaEmailSimples(raw) ? 'Email' : 'Email-Invalido';
        }

        const numbers = onlyDigits(raw);
        if (numbers.length === 11 && isCPF(numbers)) return 'CPF';

        const startsPlus = raw.startsWith('+');
        const starts00 = raw.startsWith('00');
        const probableCC = numbers.length > 11 || numbers.startsWith('55');
        if (startsPlus || starts00 || probableCC) {
            return isTelefoneComDDI(raw) ? 'Telefone' : 'Telefone-Invalido';
        }

        if (/^\d{8,11}$/.test(numbers)) return 'Possivel-Telefone-Sem-DDI';
        return 'Indefinido';
    }

    identifierInput.addEventListener('input', (e) => {
    });

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        formError.textContent = '';
        if (hintDiv) hintDiv.textContent = '';
        successMessage.textContent = '';

        const identifier = identifierInput.value.trim();
        if (!identifier) { formError.textContent = 'Preencha o campo.'; return; }

        const tipo = identificaTipo(identifier);

        if (tipo === 'Email-Invalido' || tipo === 'Possivel-Telefone-Sem-DDI' || tipo === 'Telefone-Invalido' || tipo === 'Indefinido') {
            formError.textContent = 'Credencial inválida. Use e-mail, CPF ou telefone com DDI.';
            return;
        }

        try {
            successMessage.textContent = 'Enviando código de verificação...';
            const response = await fetch('http://localhost:3333/api/auth/forgot-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ identifier })
            });

            if (!response.ok) {
                const errorData = await response.json().catch(()=>({message:'Erro desconhecido'}));
                throw new Error(errorData.message || 'Erro ao solicitar verificação.');
            }

            const data = await response.json();

            if (data.email) {
                localStorage.setItem('userEmailForReset', data.email);
                window.location.href = '/verificar-codigo';
            } else {
                successMessage.textContent = 'Credencial não encontrada.';
                successMessage.style.color = 'red';
                setTimeout(()=>{ successMessage.textContent = ''; }, 3000);
            }
        } catch (err) {
            successMessage.textContent = err.message;
            successMessage.style.color = 'red';
            setTimeout(()=>{ successMessage.textContent = ''; }, 3000);
        }
    });

    backButton.addEventListener('click', () => {
        window.location.href = '/login';
    });
});