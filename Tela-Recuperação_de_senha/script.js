const signupForm = document.getElementById('signup-form');
const emailInput = document.getElementById('email');
const formError = document.getElementById('form-error');


// Validação do formulário no envio
signupForm.addEventListener('submit', (e) => {
    e.preventDefault(); // Impede o envio padrão do formulário
    formError.textContent = ''; // Limpa erros anteriores

    // Validação do Email
    const emailPattern = new RegExp(emailInput.pattern);
    if (!emailPattern.test(emailInput.value)) {
         formError.textContent = 'Por favor, use um email válido (@gmail.com, @outlook.com, @hotmail.com).';
         emailInput.focus();
         return;
    }
    
    // Se tudo estiver válido
    alert('Email de recuperação enviado com sucesso!');
});