document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('form-login');
    const usuarioInput = document.getElementById('usuario');
    const senhaInput = document.getElementById('senha');

    form.addEventListener('submit', function(event) {
        // Impede o envio padrão do formulário
        event.preventDefault();

        // Pega os valores dos campos, removendo espaços em branco
        const usuarioValue = usuarioInput.value.trim();
        const senhaValue = senhaInput.value.trim();

        // Verifica se os campos estão vazios
        if (usuarioValue === '' || senhaValue === '') {
            alert('Por favor, preencha todos os campos.');
        } else {
            // Se tudo estiver certo, exibe uma mensagem de sucesso
            // Em um caso real, aqui você enviaria os dados para o servidor
            alert(`Acesso solicitado para: ${usuarioValue}`);
            
            // Aqui você pode redirecionar o usuário ou limpar o formulário
            // form.submit(); // para enviar de verdade
        }
    });
});