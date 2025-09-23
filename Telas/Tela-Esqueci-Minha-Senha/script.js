document.addEventListener('DOMContentLoaded', () => {
    const identifierInput = document.getElementById('identifier');
    const form = document.getElementById('signup-form');
    const formError = document.getElementById('form-error');
    const backButton = document.getElementById('back-button');
    const successMessage = document.createElement('p');
    successMessage.style.color = 'green';
    formError.parentNode.insertBefore(successMessage, formError.nextSibling);

    // --- Funções de Validação ---

    function isCPF(cpf) {
        const cpfLimpo = String(cpf).replace(/\D/g, '');
        if (cpfLimpo.length !== 11 || /^(\d)\1+$/.test(cpfLimpo)) {
            return false;
        }
        let soma = 0;
        let resto;
        for (let i = 1; i <= 9; i++) {
            soma += parseInt(cpfLimpo.substring(i - 1, i)) * (11 - i);
        }
        resto = (soma * 10) % 11;
        if (resto === 10 || resto === 11) {
            resto = 0;
        }
        if (resto !== parseInt(cpfLimpo.substring(9, 10))) {
            return false;
        }
        soma = 0;
        for (let i = 1; i <= 10; i++) {
            soma += parseInt(cpfLimpo.substring(i - 1, i)) * (12 - i);
        }
        resto = (soma * 10) % 11;
        if (resto === 10 || resto === 11) {
            resto = 0;
        }
        if (resto !== parseInt(cpfLimpo.substring(10, 11))) {
            return false;
        }
        return true;
    }

    function isTelefone(telefone) {
        const telefoneLimpo = String(telefone).replace(/\D/g, '');
        if (telefoneLimpo.length < 10 || telefoneLimpo.length > 11) { // Apenas com DDD
            return false;
        }
        const dddsValidos = [
            '11', '12', '13', '14', '15', '16', '17', '18', '19', '21', '22', '24', 
            '27', '28', '31', '32', '33', '34', '35', '37', '38', '41', '42', '43', 
            '44', '45', '46', '47', '48', '49', '51', '53', '54', '55', '61', '62', 
            '63', '64', '65', '66', '67', '68', '69', '71', '73', '74', '75', '77', 
            '79', '81', '82', '83', '84', '85', '86', '87', '88', '89', '91', '92', 
            '93', '94', '95', '96', '97', '98', '99'
        ];
        const ddd = telefoneLimpo.substring(0, 2);
        if (!dddsValidos.includes(ddd)) {
            return false;
        }
        const numero = telefoneLimpo.substring(2);
        if (numero.length === 9) {
            if (numero.charAt(0) !== '9' || parseInt(numero.charAt(1), 10) < 6) {
                return false;
            }
        } else if (numero.length === 8) {
            const primeiroDigito = parseInt(numero.charAt(0), 10);
            if (primeiroDigito < 2 || primeiroDigito > 5) {
                return false;
            }
        } else {
            return false;
        }
        return true;
    }

    function identificarNumero(input) {
        if (isCPF(input)) {
            return 'CPF';
        }
        if (isTelefone(input)) {
            return 'Telefone';
        }
        return 'Indefinido';
    }

    // --- Lógica da Máscara ---

    identifierInput.addEventListener('input', (e) => {
        const value = e.target.value;
        if (value.includes('@')) {
            return; // Não formata e-mails
        }

        let numbers = value.replace(/\D/g, '');
        let formattedValue = numbers;

        if (numbers.length > 13) { // Limite para +55 (11) 9XXXX-XXXX
            numbers = numbers.substring(0, 13);
        }

        // Prioriza a validação de CPF quando temos 11 dígitos e não começa com 55
        if (numbers.length === 11 && !value.startsWith('+') && isCPF(numbers)) {
            formattedValue = numbers.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
        } else {
            // Formatação progressiva de telefone com DDI
            if (numbers.startsWith('55')) {
                 if (numbers.length > 12) {
                    formattedValue = numbers.replace(/(\d{2})(\d{2})(\d{5})(\d{4})/, '+$1 ($2) $3-$4');
                } else if (numbers.length > 8) {
                    formattedValue = numbers.replace(/(\d{2})(\d{2})(\d{4})(\d{4})/, '+$1 ($2) $3-$4');
                } else if (numbers.length > 4) {
                    formattedValue = numbers.replace(/(\d{2})(\d{2})(\d+)/, '+$1 ($2) $3');
                } else if (numbers.length > 2) {
                    formattedValue = numbers.replace(/(\d{2})(\d+)/, '+$1 ($2');
                } else {
                     formattedValue = `+${numbers}`;
                }
            } else {
                 if (numbers.length > 10) {
                    formattedValue = numbers.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
                } else if (numbers.length > 6) {
                    formattedValue = numbers.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
                } else if (numbers.length > 2) {
                    formattedValue = numbers.replace(/(\d{2})(\d+)/, '($1) $2');
                } else if (numbers.length > 0) {
                    formattedValue = numbers.replace(/(\d*)/, '($1');
                }
            }
        }
        
        e.target.value = formattedValue;
    });

    // --- Lógica do Formulário ---

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        formError.textContent = '';
        successMessage.textContent = '';
        successMessage.style.color = 'green';
        const identifier = identifierInput.value.trim();

        if (!identifier) {
            formError.textContent = 'Por favor, preencha o campo.';
            return;
        }

        try {
            successMessage.textContent = 'Enviando código de verificação...';

            const response = await fetch('http://localhost:3333/forgot-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ identifier })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Erro ao solicitar a recuperação de senha.');
            }

            const data = await response.json();

            if (data.email) {
                localStorage.setItem('userEmailForReset', data.email);
                window.location.href = '../Tela-Verificar-Código/tela.html';
            } else {
                successMessage.textContent = 'Credencial não encontrada.';
                successMessage.style.color = 'red';
                setTimeout(() => {
                    successMessage.textContent = '';
                }, 3000);
            }

        } catch (error) {
            successMessage.textContent = error.message;
            successMessage.style.color = 'red';
            setTimeout(() => {
                successMessage.textContent = '';
            }, 3000);
        }
    });

    backButton.addEventListener('click', () => {
        window.location.href = '../Tela-Login/tela.html';
    });
});
