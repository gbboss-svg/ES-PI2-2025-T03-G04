const phoneInput = document.getElementById('phone');
const signupForm = document.getElementById('signup-form');
const passwordInput = document.getElementById('password');
const emailInput = document.getElementById('email');
const nameInput = document.getElementById('name');
const formError = document.getElementById('form-error');
const cpfInput = document.getElementById('cpf');
const backButton = document.getElementById('back-button');

// Event listener para o botão de voltar
backButton.addEventListener('click', () => {
    window.location.href = '/login';
});

// Máscara para o campo de CPF
cpfInput.addEventListener('input', (e) => {
    let value = e.target.value.replace(/\D/g, ''); // Remove tudo que não é dígito

    if (value.length > 11) {
        value = value.substring(0, 11);
    }

    let formattedValue = '';
    if (value.length > 0) {
        formattedValue = value.substring(0, 3);
    }
    if (value.length > 3) {
        formattedValue += `.${value.substring(3, 6)}`;
    }
    if (value.length > 6) {
        formattedValue += `.${value.substring(6, 9)}`;
    }
    if (value.length > 9) {
        formattedValue += `-${value.substring(9, 11)}`;
    }
    
    e.target.value = formattedValue;
});

// Máscara para o campo de telefone
phoneInput.addEventListener('input', (e) => {
    let value = e.target.value.replace(/\D/g, ''); // Remove tudo que não é dígito
    
    if (value.length > 13) {
        value = value.substring(0, 13);
    }

    let formattedValue = '';
    if (value.length > 0) {
        formattedValue = `+${value.substring(0, 2)}`;
    }
    if (value.length > 2) {
        formattedValue = `+${value.substring(0, 2)} (${value.substring(2, 4)}`;
    }
    if (value.length > 4) {
         formattedValue += `) ${value.substring(4, 9)}`;
    }
    if (value.length > 9) {
        formattedValue += `-${value.substring(9, 13)}`;
    }
    
    e.target.value = formattedValue;
});

// Função para validar CPF
function validateCPF(cpf) {
    cpf = cpf.replace(/[^\d]+/g,'');
    if(cpf == '') return false;
    // Elimina CPFs invalidos conhecidos
    if (cpf.length != 11 ||
        cpf == "00000000000" ||
        cpf == "11111111111" ||
        cpf == "22222222222" ||
        cpf == "33333333333" ||
        cpf == "44444444444" ||
        cpf == "55555555555" ||
        cpf == "66666666666" ||
        cpf == "77777777777" ||
        cpf == "88888888888" ||
        cpf == "99999999999")
            return false;
    // Valida 1o digito
    let add = 0;
    for (let i=0; i < 9; i ++)
        add += parseInt(cpf.charAt(i)) * (10 - i);
        let rev = 11 - (add % 11);
        if (rev == 10 || rev == 11)
            rev = 0;
        if (rev != parseInt(cpf.charAt(9)))
            return false;
    // Valida 2o digito
    add = 0;
    for (let i = 0; i < 10; i ++)
        add += parseInt(cpf.charAt(i)) * (11 - i);
    rev = 11 - (add % 11);
    if (rev == 10 || rev == 11)
        rev = 0;
    if (rev != parseInt(cpf.charAt(10)))
        return false;
    return true;
}

// Validação do formulário no envio
signupForm.addEventListener('submit', async (e) => {
    e.preventDefault(); // Impede o envio padrão do formulário
    formError.textContent = ''; // Limpa erros anteriores

    // Validação da Senha
    if (passwordInput.value.length < 6) {
        formError.textContent = 'A senha deve ter pelo menos 6 caracteres.';
        passwordInput.focus();
        return;
    }

    // Validação do Email
    const emailPattern = new RegExp(emailInput.pattern);
    if (!emailPattern.test(emailInput.value)) {
         formError.textContent = 'Por favor, insira um endereço de e-mail válido.';
         emailInput.focus();
         return;
    }

    // Validação do CPF
    if (!validateCPF(cpfInput.value)) {
        formError.textContent = 'Por favor, insira um CPF válido.';
        cpfInput.focus();
        return;
    }

    // Validação do Telefone
    const phoneRegex = /^\+55 \(\d{2}\) \d{5}-\d{4}$/;
    if (!phoneRegex.test(phoneInput.value)) {
        formError.textContent = 'Por favor, insira um número de telefone válido.';
        phoneInput.focus();
        return;
    }
    
    // Se tudo estiver válido, envia para o servidor
    try {
        const response = await fetch('http://localhost:3333/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                nome: nameInput.value,
                email: emailInput.value,
                cpf: cpfInput.value,
                celular: phoneInput.value,
                senha: passwordInput.value
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Erro ao cadastrar.');
        }

        // Salva o e-mail para a próxima tela e redireciona
        localStorage.setItem('userEmailForVerification', emailInput.value);
        window.location.href = '/verificacao-codigo-registro';

    } catch (error) {
        formError.textContent = error.message;
    }
});
