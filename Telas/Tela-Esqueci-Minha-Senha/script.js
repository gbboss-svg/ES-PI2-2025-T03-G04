document.addEventListener('DOMContentLoaded', () => {
    const identifierInput = document.getElementById('identifier');
    const form = document.getElementById('signup-form');
    const formError = document.getElementById('form-error');
    const backButton = document.getElementById('back-button');
    const successMessage = document.createElement('p');
    successMessage.style.color = 'green';
    formError.parentNode.insertBefore(successMessage, formError.nextSibling);

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        formError.textContent = '';
        successMessage.textContent = '';
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

            // We don't know the email here, so we can't save it.
            // The next screen will have to handle the verification.
            // For now, we can store the identifier to show it on the next page.
            localStorage.setItem('userIdentifierForReset', identifier);
            successMessage.textContent = 'Código enviado com sucesso! Redirecionando...';

            setTimeout(() => {
                window.location.href = '../Tela-Verificar-Código/tela.html';
            }, 2000);

        } catch (error) {
            successMessage.textContent = '';
            formError.textContent = error.message;
        }
    });

    backButton.addEventListener('click', () => {
        window.location.href = '../Tela-Login/tela.html';
    });
});
