document.addEventListener('DOMContentLoaded', () => {
    const emailInput = document.getElementById('email');
    const formError = document.getElementById('form-error');
    const successMessage = document.createElement('p');
    successMessage.style.color = 'green';
    formError.parentNode.insertBefore(successMessage, formError.nextSibling);

    emailInput.addEventListener('blur', async () => {
        formError.textContent = '';
        successMessage.textContent = '';
        const email = emailInput.value.trim();

        if (!email) {
            // Não mostra erro se o campo estiver vazio, apenas não faz nada.
            return;
        }

        // Validação simples de e-mail
        if (!/^\S+@\S+\.\S+$/.test(email)) {
            formError.textContent = 'Por favor, insira um e-mail válido.';
            return;
        }

        try {
            // Mostra um feedback de que o envio está em progresso
            successMessage.textContent = 'Enviando código de verificação...';

            const response = await fetch('http://localhost:3333/forgot-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Erro ao solicitar a recuperação de senha.');
            }

            // Salva o e-mail para as próximas telas e redireciona
            localStorage.setItem('userEmailForReset', email);
            successMessage.textContent = 'Código enviado com sucesso! Redirecionando...';

            // Redireciona após um pequeno atraso para o usuário ver a mensagem
            setTimeout(() => {
                window.location.href = '../Tela-Verificar-Código/tela.html';
            }, 2000);

        } catch (error) {
            successMessage.textContent = ''; // Limpa a mensagem de "enviando"
            formError.textContent = error.message;
        }
    });

    // Previne o comportamento padrão do formulário, já que não usamos mais o submit
    const form = document.getElementById('signup-form');
    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
        });
    }
});
