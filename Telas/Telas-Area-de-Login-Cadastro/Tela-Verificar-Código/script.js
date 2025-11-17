  /**
   *Desevolvido por:Bernardo Alberto Amaro - R.A:25014832
   */
document.addEventListener('DOMContentLoaded', () => {
    const signupForm = document.getElementById('signup-form');
    const codeInput = document.getElementById('code');
    const formError = document.getElementById('form-error');
    const resendBtn = document.getElementById('resend-btn');
    const cancelMessage = document.getElementById('cancel-message');
    const backButton = document.getElementById('back-button');

    const email = localStorage.getItem('userEmailForReset');
    if (!email) {
        window.location.href = '/esqueci-senha';
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
        titleMessage.textContent = `Enviamos um código para o e-mail ${censorEmail(email)}`;
    }

    let resendAttempts = 0;

    signupForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        formError.textContent = '';

        if (codeInput.value.length !== 6) {
            formError.textContent = 'O código deve ter 6 dígitos.';
            return;
        }

        try {
            const response = await fetch('http://localhost:3333/api/auth/verify-email', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, code: codeInput.value })
            });

            if (response.ok) {
                // O código está correto, redireciona para a tela de nova senha
                localStorage.setItem('passwordResetVerified', 'true'); // Seta uma flag de permissão
                window.location.href = '/cadastrar-nova-senha';
            } else {
                const errorData = await response.json();
                
                if (errorData.message === 'MAX_ATTEMPTS_REACHED') {
                    formError.textContent = '';
                    cancelMessage.textContent = 'Devido as muitas tentativas, o processo foi cancelado.';
                    cancelMessage.style.display = 'block';
                    
                    codeInput.disabled = true;
                    document.getElementById('verify-btn').disabled = true;
                    resendBtn.disabled = true;

                    setTimeout(() => {
                        localStorage.removeItem('userEmailForReset');
                        window.location.href = '/login';
                    }, 5000);
                } else {
                    formError.textContent = 'Código inválido. Tente novamente.';
                }
            }
        } catch (error) {
            formError.textContent = 'Erro ao conectar com o servidor.';
        }
    });

    resendBtn.addEventListener('click', async () => {
        if (resendAttempts >= 3) {
            formError.textContent = 'Você atingiu o limite de reenvios.';
            resendBtn.disabled = true;
            return;
        }

        try {
            const response = await fetch('http://localhost:3333/api/auth/resend-verification', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            });

            if (response.ok) {
                resendAttempts++;
                formError.textContent = `Código reenviado. Você pode reenviar mais ${3 - resendAttempts} vez(es).`;
                if (resendAttempts >= 3) {
                    resendBtn.disabled = true;
                }
            } else {
                const errorData = await response.json();
                formError.textContent = errorData.message || 'Erro ao reenviar o código.';
            }
        } catch (error) {
            formError.textContent = 'Erro ao conectar com o servidor.';
        }
    });

    backButton.addEventListener('click', () => {
        window.location.href = '/esqueci-senha';
    });
});
