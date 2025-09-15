document.getElementById('reset-password-form').addEventListener('submit', function(event) {
    // Previne o recarregamento da página ao enviar o formulário
    event.preventDefault();

    // Pega os valores dos campos de senha
    const newPassword = document.getElementById('new-password').value;
    const confirmPassword = document.getElementById('confirm-password').value;
    const messageElement = document.getElementById('message');

    // Remove classes de mensagem anteriores
    messageElement.className = '';

    // Verifica se os campos estão vazios
    if (newPassword === '' || confirmPassword === '') {
        messageElement.textContent = 'Por favor, preencha todos os campos.';
        messageElement.classList.add('error');
        return;
    }

    // Verifica se as senhas são iguais
    if (newPassword === confirmPassword) {
        messageElement.textContent = 'Senha atualizada com sucesso!';
        messageElement.classList.add('success');
        // Aqui você poderia adicionar a lógica para enviar a nova senha para o servidor
    } else {
        messageElement.textContent = 'As senhas não coincidem. Tente novamente.';
        messageElement.classList.add('error');
    }
});
