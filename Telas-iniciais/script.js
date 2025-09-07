const phoneInput = document.getElementById('phone');
const signupForm = document.getElementById('signup-form');
const passwordInput = document.getElementById('password');
const emailInput = document.getElementById('email');
const formError = document.getElementById('form-error');

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

// Validação do formulário no envio
signupForm.addEventListener('submit', (e) => {
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
         formError.textContent = 'Por favor, use um email válido (@gmail.com, @outlook.com, @hotmail.com).';
         emailInput.focus();
         return;
    }

    // Validação do Telefone
    const phoneRegex = /^\+55 \(\d{2}\) \d{5}-\d{4}$/;
    if (!phoneRegex.test(phoneInput.value)) {
        formError.textContent = 'Por favor, insira um número de telefone válido.';
        phoneInput.focus();
        return;
    }
    
    // Se tudo estiver válido
    alert('Cadastro enviado com sucesso!');
    // Aqui você poderia adicionar o código para enviar os dados para um servidor
    // signupForm.submit(); // Exemplo de como submeter o formulário de fato
});
