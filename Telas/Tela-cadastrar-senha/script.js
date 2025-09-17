document.getElementById('reset-password-form').addEventListener('submit', function(event) {
    // Previne o recarregamento da página ao enviar o formulário
    event.preventDefault();

    // Pega os valores dos campos de senha
    const newPassword = document.getElementById('new-password').value;
    const confirmPassword = document.getElementById('confirm-password').value;
    const messageElement = document.getElementById('message');

    // Limpa o conteúdo e as classes de mensagem anteriores
    messageElement.textContent = '';
    messageElement.className = '';

    // Verifica se os campos estão vazios
    if (newPassword === '' || confirmPassword === '') {
        messageElement.textContent = 'Por favor, preencha todos os campos.';
        // ATUALIZADO: Adiciona a classe 'error' para a estilização
        messageElement.classList.add('error');
        return;
    }

    // Verifica se as senhas são iguais
    if (newPassword === confirmPassword) {
        messageElement.textContent = 'Senha atualizada com sucesso!';
        // ATUALIZADO: Adiciona a classe 'success' para a estilização
        messageElement.classList.add('success');
        // Aqui você poderia adicionar a lógica para enviar a nova senha para o servidor
    } else {
        messageElement.textContent = 'As senhas não coincidem. Tente novamente.';
        // ATUALIZADO: Adiciona a classe 'error' para a estilização
        messageElement.classList.add('error');
    }
});