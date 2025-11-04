document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('form-login');
    const identifierInput = document.getElementById('usuario');
    const senhaInput = document.getElementById('senha');
    const errorMessage = document.getElementById('error-message');
    const loadingOverlay = document.getElementById('loading-overlay');

    // Links de navegação
    const forgotPasswordLink = document.querySelector('a[href="../Tela-Esqueci-Minha-Senha/tela.html"]');
    const signUpLink = document.querySelector('a[href="../Tela-Novo-Cadastro/tela-registro.html"]');

    // Função para mostrar o loading e redirecionar
    function showLoadingAndRedirect(url) {
        loadingOverlay.classList.add('show');
        setTimeout(() => {
            window.location.href = url;
        }, 1500); // 1.5 segundos para transição
    }

    // Adiciona eventos aos links
    if(forgotPasswordLink) {
        forgotPasswordLink.addEventListener('click', function(event) {
            event.preventDefault();
            showLoadingAndRedirect(this.href);
        });
    }

    if(signUpLink) {
        signUpLink.addEventListener('click', function(event) {
            event.preventDefault();
            showLoadingAndRedirect(this.href);
        });
    }

    // --- Helpers ---
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
                if (numero.charAt(0) !== '9') return false;
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
        if (raw.includes('@')) {
            return validaEmailSimples(raw) ? 'Email' : 'Email-Invalido';
        }
        const numbers = onlyDigits(raw);
        if (numbers.length === 11 && isCPF(numbers)) return 'CPF';
        if (raw.startsWith('+') || numbers.startsWith('55') || numbers.length > 11) {
            return isTelefoneComDDI(raw) ? 'Telefone' : 'Telefone-Invalido';
        }
        if (/^\d{8,11}$/.test(numbers)) return 'Possivel-Telefone-Sem-DDI';
        return 'Indefinido';
    }

    // --- Máscara ---
    identifierInput.addEventListener('input', (e) => {
        const value = e.target.value;
        if (/[a-zA-Z]/.test(value)) {
            return;
        }
        let numbers = onlyDigits(value);
        if (numbers.length > 15) numbers = numbers.substring(0, 15);
        if (numbers.length === 11 && isCPF(numbers)) {
            e.target.value = numbers.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
            return;
        }
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
            }
        }
        if (numbers.length > 6) {
            if (numbers.length > 10) e.target.value = numbers.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
            else e.target.value = numbers.replace(/(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3').replace(/-$/, '');
        } else if (numbers.length > 2) {
            e.target.value = numbers.replace(/(\d{2})(\d+)/, '($1) $2');
        } else {
            e.target.value = numbers;
        }
    });

    // --- Submissão ---
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        errorMessage.textContent = '';
        const identifier = identifierInput.value.trim();
        const senha = senhaInput.value.trim();

        if (!identifier || !senha) {
            errorMessage.textContent = 'Preencha todos os campos.';
            return;
        }

        const tipo = identificaTipo(identifier);

        if (tipo === 'Email-Invalido' || tipo === 'Telefone-Invalido' || tipo === 'Indefinido' || tipo === 'Possivel-Telefone-Sem-DDI') {
            errorMessage.textContent = 'Credencial inválida. Use e-mail, CPF ou telefone com DDI.';
            return;
        }

        try {
            const response = await fetch('http://localhost:3333/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ identifier, senha })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `Erro ${response.status}`);
            }

            const data = await response.json();
            localStorage.setItem('token', data.token);

            // Redireciona para a rota definida pelo backend
            if (data.redirectTo) {
                showLoadingAndRedirect(data.redirectTo);
            } else {
                // Fallback, caso 'redirectTo' não seja enviado
                showLoadingAndRedirect('/main');
            }

        } catch (err) {
            errorMessage.textContent = err.message;
        }
    });
});
