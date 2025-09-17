document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('form-login');
    const usuarioInput = document.getElementById('usuario');
    const senhaInput = document.getElementById('senha');
    const errorMessage = document.getElementById('error-message');

    form.addEventListener('submit', async function(event) {
        event.preventDefault();

        const email = usuarioInput.value.trim();
        const senha = senhaInput.value.trim();

        if (email === '' || senha === '') {
            errorMessage.textContent = 'Por favor, preencha todos os campos.';
            return;
        }

        try {
            const response = await fetch('http://localhost:3333/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, senha })
            });

            const data = await response.json();

            if (!response.ok) {
                errorMessage.textContent = data.message || 'Ocorreu um erro.';
            } else {
                // Salva o token e redireciona
                localStorage.setItem('token', data.token);
                window.location.href = '/dashboard'; // Redirecionar para a página principal
            }
        } catch (error) {
            errorMessage.textContent = 'Não foi possível conectar ao servidor.';
        }
    });
});
