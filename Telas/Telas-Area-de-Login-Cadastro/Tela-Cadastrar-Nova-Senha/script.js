document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('reset-password-form');
    const newPasswordInput = document.getElementById('new-password');
    const confirmPasswordInput = document.getElementById('confirm-password');
    const message = document.getElementById('message');
    const backButton = document.getElementById('back-to-start-button');

    const email = localStorage.getItem('userEmailForReset');
    const isVerified = localStorage.getItem('passwordResetVerified');

    if (!email || !isVerified) {
        alert('Acesso inválido. Por favor, inicie o processo de recuperação de senha novamente.');
        window.location.href = '/login';
        return;
    }

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        message.textContent = '';

        const novaSenha = newPasswordInput.value;
        const confirmSenha = confirmPasswordInput.value;

        if (novaSenha.length < 6) {
            message.textContent = 'A senha deve ter pelo menos 6 caracteres.';
            return;
        }

        if (novaSenha !== confirmSenha) {
            message.textContent = 'As senhas não coincidem.';
            return;
        }

        try {
            const response = await fetch('http://localhost:3333/reset-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, novaSenha })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Erro ao atualizar a senha.');
            }

            alert('Senha atualizada com sucesso! Você será redirecionado para o login.');
            
            // Limpa o localStorage e redireciona
            localStorage.removeItem('userEmailForReset');
            localStorage.removeItem('passwordResetVerified');
            window.location.href = '/login';

        } catch (error) {
            message.textContent = error.message;
        }
    });

    backButton.addEventListener('click', () => {
        window.location.href = '/login';
    });
});
