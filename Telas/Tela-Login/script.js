document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('form-login');
    const usuarioInput = document.getElementById('usuario');
    const senhaInput = document.getElementById('senha');
    const errorMessage = document.getElementById('error-message');
    const loadingOverlay = document.getElementById('loading-overlay');

    // Links de navegação
    const forgotPasswordLink = document.querySelector('a[href="../Tela-Esqueci-Minha-Senha/tela.html"]');
    const signUpLink = document.querySelector('a[href="../Tela-Novo-Cadastro/tela-registro.html"]');

    // Função para mostrar o loading e redirecionar
    function showLoadingAndRedirect(url) {
        loadingOverlay.classList.add('show');
        setTimeout(() => {
            window.location.href = url;
        }, 4000); // 4 segundos
    }

    // Adiciona eventos aos links
    forgotPasswordLink.addEventListener('click', function(event) {
        event.preventDefault();
        showLoadingAndRedirect(this.href);
    });

    signUpLink.addEventListener('click', function(event) {
        event.preventDefault();
        showLoadingAndRedirect(this.href);
    });

    // Lógica de login existente
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
