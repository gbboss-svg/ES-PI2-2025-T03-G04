document.addEventListener('DOMContentLoaded', () => {
    const identifierInput = document.getElementById('identifier');
    const form = document.getElementById('signup-form');
    const formError = document.getElementById('form-error');
    const backButton = document.getElementById('back-button');
    const successMessage = document.createElement('p');
    successMessage.style.color = 'green';
    formError.parentNode.insertBefore(successMessage, formError.nextSibling);

    const formatIdentifier = (value) => {
        if (!value || value.includes('@')) {
            return value;
        }

        const numbers = value.replace(/\D/g, '').substring(0, 11);

        if (numbers.length === 11) {
            // Check if it's more likely a CPF or a cellphone number
            // This is a heuristic: many cellphones start with 9, CPFs are more varied.
            // A truly robust solution might need a toggle or separate fields.
            if (['0', '1', '2', '3', '4', '5', '6', '7', '8'].includes(numbers.charAt(2))) {
                 // More likely a CPF
                 return numbers.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
            } else {
                 // More likely a cellphone
                 return numbers.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
            }
        } else if (numbers.length > 6) {
            return numbers.replace(/(\d{2})(\d{4,5})(\d{4})/, '($1) $2-$3');
        } else if (numbers.length > 2) {
            return numbers.replace(/(\d{2})(\d+)/, '($1) $2');
        } else {
            return numbers;
        }
    };

    identifierInput.addEventListener('input', (e) => {
        e.target.value = formatIdentifier(e.target.value);
    });

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        formError.textContent = '';
        successMessage.textContent = '';
        successMessage.style.color = 'green';
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
