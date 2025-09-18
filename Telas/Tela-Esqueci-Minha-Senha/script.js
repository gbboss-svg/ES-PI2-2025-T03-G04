document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('signup-form');
    const emailInput = document.getElementById('email');
    const formError = document.getElementById('form-error');

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        formError.textContent = '';

        const email = emailInput.value.trim();
        if (!email) {
            formError.textContent = 'Por favor, insira seu e-mail.';
            return;
        }

        try {
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
            window.location.href = '../Tela-Verificar-Código/tela.html';

        } catch (error) {
            formError.textContent = error.message;
        }
    });
});
