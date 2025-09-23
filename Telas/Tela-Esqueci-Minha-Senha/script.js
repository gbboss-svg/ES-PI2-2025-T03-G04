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
        successMessage.style.color = 'green';
        let identifier = identifierInput.value.trim();

        if (!identifier) {
            formError.textContent = 'Por favor, preencha o campo.';
            return;
        }

        try {
            // Normalize identifier if it's not an email
            if (!identifier.includes('@')) {
                identifier = identifier.replace(/\D/g, '');
            }

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

            // The backend returns an email if the user was found
            if (data.email) {
                localStorage.setItem('userEmailForReset', data.email);
                window.location.href = '../Tela-Verificar-Código/tela.html';
            } else {
                // User not found
                successMessage.textContent = 'Credencial não encontrada.';
                successMessage.style.color = 'red';
                setTimeout(() => {
                    successMessage.textContent = '';
                }, 3000);
                // Do not redirect
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
