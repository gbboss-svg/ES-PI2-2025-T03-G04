let logoutModal;

/**
 * Inicializa a view de configurações com a instância do modal.
 */
export function initSettingsView(modals) {
    logoutModal = modals.logoutModal;
}

/**
 * Renderiza a view de Configurações.
 */
export function renderSettingsView(container) {
    container.innerHTML = `
        <h1>Configurações</h1>
        <p class="lead text-muted">Gerencie as configurações da sua conta e da aplicação.</p>
        <div class="card mt-4">
            <div class="card-body">
                <h5 class="card-title">Tema da Interface</h5>
                <p>Escolha entre o tema claro ou escuro para a sua visualização.</p>
                <div>
                    <button id="light-mode-btn" class="btn btn-outline-secondary">
                        <i class="bi bi-sun me-1"></i> Modo Light
                    </button>
                    <button id="dark-mode-btn" class="btn btn-dark">
                        <i class="bi bi-moon-stars me-1"></i> Modo Dark
                    </button>
                </div>
            </div>
        </div>
        
        <div class="card mt-4">
            <div class="card-body">
                <h5 class="card-title">Alterar Senha</h5>
                <form>
                    <div class="mb-3">
                        <label for="current-password" class="form-label">Senha Atual</label>
                        <input type="password" class="form-control" id="current-password">
                    </div>
                    <div class="mb-3">
                        <label for="new-password" class="form-label">Nova Senha</label>
                        <input type="password" class="form-control" id="new-password">
                    </div>
                     <div class="mb-3">
                        <label for="confirm-password" class="form-label">Confirmar Nova Senha</label>
                        <input type="password" class="form-control" id="confirm-password">
                    </div>
                    <button type="submit" class="btn btn-primary">Salvar Alterações</button>
                </form>
            </div>
        </div>

        <div class="card mt-4 border-danger">
             <div class="card-body">
                <h5 class="card-title text-danger">Sair do Sistema</h5>
                <p>Esta ação irá encerrar sua sessão atual.</p>
                <button class="btn btn-danger" id="logout-btn">
                    <i class="bi bi-box-arrow-right me-1"></i> Sair
                </button>
            </div>
        </div>
    `;
    
    document.getElementById('dark-mode-btn').addEventListener('click', () => document.body.classList.add('dark-mode'));
    document.getElementById('light-mode-btn').addEventListener('click', () => document.body.classList.remove('dark-mode'));
    document.getElementById('logout-btn').addEventListener('click', () => logoutModal.show());
}