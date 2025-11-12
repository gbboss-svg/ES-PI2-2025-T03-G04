import * as ApiService from './ApiService.js';

/**
 * Adiciona uma nova entrada ao log de auditoria via API.
 * @param {number} turmaId - O ID da turma relacionada ao log.
 * @param {string} message - A mensagem a ser registrada.
 * @param {object|null} snapshot - Um snapshot do estado dos dados antes da alteração.
 */
export async function addAuditLog(turmaId, message, snapshot = null) {
    try {
        await ApiService.addAuditLog({
            turmaId,
            message,
            snapshot
        });
    } catch (error) {
        console.error("Falha ao salvar log de auditoria:", error);
        // Não exibe um toast para não sobrecarregar o usuário com notificações a cada ação.
    }
}

/**
 * Renderiza o painel de auditoria na tela, buscando os dados da API.
 * @param {object} currentTurmaContext - O contexto da turma atual.
 * @param {function} renderTurmaDetailViewCallback - Callback para re-renderizar a view da turma (atualmente não usado para reverter).
 */
export async function renderAuditLog(currentTurmaContext, renderTurmaDetailViewCallback) {
    const logList = document.getElementById('audit-log-list');
    if (!logList) return;

    logList.innerHTML = '<div class="list-group-item text-muted">Carregando logs...</div>';

    try {
        const logs = await ApiService.getAuditLogs(currentTurmaContext.turma.id);

        if (logs.length === 0) {
            logList.innerHTML = '<div class="list-group-item text-muted">Nenhum registro de auditoria para esta turma.</div>';
            return;
        }

        logList.innerHTML = logs.map(log => `
            <div class="list-group-item">
                <div>
                    <small class="text-muted d-block">${new Date(log.timestamp).toLocaleString('pt-BR')}</small>
                    <span>${log.message}</span>
                </div>
            </div>
        `).join('');

    } catch (error) {
        console.error("Falha ao buscar logs de auditoria:", error);
        logList.innerHTML = '<div class="list-group-item text-danger">Não foi possível carregar os logs de auditoria.</div>';
    }
}
