document.addEventListener('DOMContentLoaded', () => {
    const signupForm = document.getElementById('signup-form');
    const codeInput = document.getElementById('code');
    const formError = document.getElementById('form-error');
    const resendBtn = document.getElementById('resend-btn');
    const backButton = document.getElementById('back-button');
    const cancelMessage = document.getElementById('cancel-message');
    const verifyBtn = document.getElementById('verify-btn');

    const email = localStorage.getItem('userEmailForVerification');
    if (!email) {
        window.location.href = '../Tela-Novo-Cadastro/tela-registro.html';
        return;
    }

    function censorEmail(email) {
        const [user, domain] = email.split('@');
        if (user.length <= 2) {
            return `${user.slice(0, 1)}*@${domain}`;
        }
        const censoredUser = user.slice(0, 2) + '*'.repeat(user.length - 2);
        return `${censoredUser}@${domain}`;
    }

    const titleMessage = document.getElementById('title-message');
    if (titleMessage) {
        titleMessage.textContent = `Para validar sua conta, enviamos um código para ${censorEmail(email)}`;
    }

    function handleCancellation() {
        formError.textContent = '';
        cancelMessage.textContent = 'Devido as muitas tentativas, esse cadastro foi cancelado.';
        cancelMessage.style.display = 'block';
        
        codeInput.disabled = true;
        verifyBtn.disabled = true;
        resendBtn.disabled = true;
        backButton.disabled = true;

        setTimeout(() => {
            localStorage.removeItem('userEmailForVerification');
            window.location.href = '../Tela-Login/tela.html';
        }, 5000);
    }

    signupForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        formError.textContent = '';

        if (codeInput.value.length !== 6) {
            formError.textContent = 'O código deve ter 6 dígitos.';
            return;
        }

        try {
            const response = await fetch('http://localhost:3333/verify-email', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, code: codeInput.value })
            });

            if (response.ok) {
                alert('Conta verificada com sucesso! Você será redirecionado para o login.');
                localStorage.removeItem('userEmailForVerification');
                window.location.href = '../Tela-Login/tela.html';
            } else {
                const errorData = await response.json();
                if (errorData.message === 'MAX_ATTEMPTS_REACHED') {
                    handleCancellation();
                } else {
                    formError.textContent = 'Código inválido. Tente novamente.';
                }
            }
        } catch (error) {
            formError.textContent = 'Erro ao conectar com o servidor.';
        }
    });

    resendBtn.addEventListener('click', async () => {
        try {
            const response = await fetch('http://localhost:3333/resend-verification', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            });

            if (response.ok) {
                formError.textContent = 'Código reenviado com sucesso.';
            } else {
                const errorData = await response.json();
                if (errorData.message === 'MAX_ATTEMPTS_REACHED') {
                    handleCancellation();
                } else {
                    formError.textContent = errorData.message || 'Erro ao reenviar o código.';
                }
            }
        } catch (error) {
            formError.textContent = 'Erro ao conectar com o servidor.';
        }
    });

    backButton.addEventListener('click', async () => {
        try {
            await fetch('http://localhost:3333/cancel-registration', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            });
            // Redirect regardless of whether the backend call succeeds or fails
            window.location.href = '../Tela-Novo-Cadastro/tela-registro.html';
        } catch (error) {
            console.error('Failed to cancel registration, redirecting anyway.');
            window.location.href = '../Tela-Novo-Cadastro/tela-registro.html';
        }
    });
});
