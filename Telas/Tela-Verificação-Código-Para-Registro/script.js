document.addEventListener('DOMContentLoaded', () => {
    const signupForm = document.getElementById('signup-form');
    const codeInput = document.getElementById('code');
    const formError = document.getElementById('form-error');
    const resendBtn = document.getElementById('resend-btn');
    const cancelMessage = document.getElementById('cancel-message');

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

    let resendAttempts = 0;

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
                    formError.textContent = '';
                    cancelMessage.textContent = 'Devido as muitas tentativas, esse cadastro foi cancelado.';
                    cancelMessage.style.display = 'block';
                    
                    codeInput.disabled = true;
                    document.getElementById('verify-btn').disabled = true;
                    resendBtn.disabled = true;

                    setTimeout(() => {
                        localStorage.removeItem('userEmailForVerification');
                        window.location.href = '../Tela-Login/tela.html';
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
            const response = await fetch('http://localhost:3333/resend-verification', {
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
});
