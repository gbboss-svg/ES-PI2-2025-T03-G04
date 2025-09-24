document.addEventListener('DOMContentLoaded', () => {
    const identifierInput = document.getElementById('identifier');
    const form = document.getElementById('signup-form');
    const formError = document.getElementById('form-error');
    const hintDiv = document.getElementById('identifier-hint');
    const backButton = document.getElementById('back-button');
    const successMessage = document.createElement('p');
    successMessage.style.color = 'green';
    formError.parentNode.insertBefore(successMessage, formError.nextSibling);

    // --- Helpers ---
    const onlyDigits = (s) => String(s).replace(/\D/g, '');

    function validaEmailSimples(email) {
        // validação simples e segura (requer algo@algo.tld)
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
        let t = String(telefone).replace(/\D/g, '');
        if (t.length < 8 || t.length > 15) return false;
        if (t.startsWith('55')) {
            const rest = t.substring(2);
            if (rest.length !== 10 && rest.length !== 11) return false;
            const ddd = rest.substring(0, 2);
            const dddsValidos = ['11','12','13','14','15','16','17','18','19','21','22','24','27','28','31','32','33','34','35','37','38','41','42','43','44','45','46','47','48','49','51','53','54','55','61','62','63','64','65','66','67','68','69','71','73','74','75','77','79','81','82','83','84','85','86','87','88','89','91','92','93','94','95','96','97','98','99'];
            if (!dddsValidos.includes(ddd)) return false;
            const numero = rest.substring(2);
            if (numero.length === 9) {
                if (numero.charAt(0) !== '9' || parseInt(numero.charAt(1), 10) < 6) return false;
            } else if (numero.length === 8) {
                const primeiro = parseInt(numero.charAt(0), 10);
                if (primeiro < 2 || primeiro > 5) return false;
            } else return false;
            return true;
        } else {
            return t.length >= 8 && t.length <= 15;
        }
    }

    function identificaTipo(inputValue) {
        if (!inputValue) return 'Indefinido';
        const raw = inputValue.trim();

        // E-MAIL: se contém '@' tratamos como email (validado separadamente)
        if (raw.includes('@')) {
            return validaEmailSimples(raw) ? 'Email' : 'Email-Invalido';
        }

        const numbers = onlyDigits(raw);

        // CPF: somente se 11 dígitos e valida CPF
        if (numbers.length === 11 && isCPF(numbers)) return 'CPF';

        // Telefone: exige DDI ou números >11 (internacional) para assumir telefone automaticamente
        if (raw.startsWith('+') || numbers.startsWith('55') || numbers.length > 11) {
            return isTelefoneComDDI(raw) ? 'Telefone' : 'Telefone-Invalido';
        }

        // possível telefone local, sem DDI
        if (/^\d{8,11}$/.test(numbers)) return 'Possivel-Telefone-Sem-DDI';

        return 'Indefinido';
    }

    // --- Máscara / feedback em tempo real ---
    identifierInput.addEventListener('input', (e) => {
        const value = e.target.value;
        if (hintDiv) hintDiv.textContent = '';

        // Se é email (tem @) - não aplicamos máscaras: apenas validamos e mostramos dica
        if (value.includes('@')) {
            if (validaEmailSimples(value)) {
                if (hintDiv) {
                    hintDiv.textContent = 'E-mail válido ✔';
                    hintDiv.style.color = 'green';
                }
            } else {
                if (hintDiv) {
                    hintDiv.textContent = 'E-mail inválido (ex: usuario@dominio.com).';
                    hintDiv.style.color = '#c66';
                }
            }
            // manter exatamente como usuário digitou
            return;
        }

        // segue formatação para números (cpf / telefone)
        let numbers = onlyDigits(value);
        if (numbers.length > 15) numbers = numbers.substring(0, 15);

        // CPF (11 dígitos válidos) -> máscara CPF
        if (numbers.length === 11 && isCPF(numbers)) {
            e.target.value = numbers.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
            if (hintDiv) { hintDiv.textContent = 'CPF válido ✔'; hintDiv.style.color = 'green'; }
            return;
        }

        // Telefone com DDI progressivo (ex: +55...)
        if (value.trim().startsWith('+') || numbers.startsWith('55')) {
            if (numbers.startsWith('55')) {
                const rest = numbers.substring(2);
                if (rest.length === 0) { e.target.value = '+55'; return; }
                if (rest.length <= 2) { e.target.value = `+55 (${rest}`; return; }
                if (rest.length <= 6) { e.target.value = `+55 (${rest.substring(0,2)}) ${rest.substring(2)}`; return; }
                if (rest.length <= 11) {
                    if (rest.length === 11) e.target.value = `+55 (${rest.substring(0,2)}) ${rest.substring(2,7)}-${rest.substring(7)}`;
                    else if (rest.length === 10) e.target.value = `+55 (${rest.substring(0,2)}) ${rest.substring(2,6)}-${rest.substring(6)}`;
                    else e.target.value = `+55 (${rest.substring(0,2)}) ${rest.substring(2)}`;
                    return;
                }
                e.target.value = `+55 (${rest.substring(0,2)}) ${rest.substring(2,7)}-${rest.substring(7,11)}`;
                return;
            } else {
                // início com + e outro country code
                if (value.startsWith('+')) { e.target.value = `+${numbers}`; return; }
                e.target.value = `+${numbers}`; return;
            }
        }

        // sem DDI: formatamos local para ajudar (mas NÃO aceitamos automaticamente como telefone na submissão)
        if (numbers.length > 6) {
            if (numbers.length > 10) e.target.value = numbers.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
            else e.target.value = numbers.replace(/(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3').replace(/-$/, '');
        } else if (numbers.length > 2) {
            e.target.value = numbers.replace(/(\d{2})(\d+)/, '($1) $2');
        } else {
            e.target.value = numbers;
        }

        const tipo = identificaTipo(value);
        if (tipo === 'Possivel-Telefone-Sem-DDI' && hintDiv) {
            hintDiv.textContent = 'Parece um telefone local — para SMS, inclua o código do país (ex: +55).';
            hintDiv.style.color = '#b85b00';
        } else if (tipo === 'Telefone-Invalido' && hintDiv) {
            hintDiv.textContent = 'Telefone com DDI informado, mas inválido. Verifique o número.';
            hintDiv.style.color = '#c66';
        } else {
            if (hintDiv) { /* limpa apenas a cor quando vazio */ hintDiv.style.color = ''; }
        }
    });

    // --- Submissão ---
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        formError.textContent = '';
        if (hintDiv) hintDiv.textContent = '';
        successMessage.textContent = '';
        successMessage.style.color = 'green';
        const identifier = identifierInput.value.trim();
        if (!identifier) { formError.textContent = 'Preencha o campo.'; return; }

        const tipo = identificaTipo(identifier);

        if (tipo === 'Email-Invalido') { formError.textContent = 'Email inválido. Ex: usuario@dominio.com'; return; }
        if (tipo === 'Possivel-Telefone-Sem-DDI') { formError.textContent = 'Telefone local detectado — inclua código do país (ex: +55) antes de enviar.'; return; }
        if (tipo === 'Telefone-Invalido') { formError.textContent = 'Telefone com DDI informado, porém inválido.'; return; }
        if (tipo === 'Indefinido') { formError.textContent = 'Não foi possível identificar a credencial. Use e-mail, CPF ou telefone com DDI.'; return; }

        // Chegou em Email, CPF ou Telefone válido
        try {
            successMessage.textContent = 'Enviando código de verificação...';
            const response = await fetch('http://localhost:3333/forgot-password', {
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
                window.location.href = '../Tela-Verificar-Código/tela.html';
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
        window.location.href = '../Tela-Login/tela.html';
    });
});
