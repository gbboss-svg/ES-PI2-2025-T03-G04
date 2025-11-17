import * as ApiService from './ApiService.js';

/**
 * Adiciona uma nova entrada ao log de auditoria via API.
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
    }
}

/**
 * Renderiza o painel de auditoria na tela.
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