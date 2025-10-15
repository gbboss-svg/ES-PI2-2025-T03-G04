import { MOCK_DATA } from './DataService.js';
import { createSnapshot } from '../utils/helpers.js';
// A função renderTurmaDetailView precisará ser importada ou passada como callback no futuro.
// Por enquanto, vamos assumir que ela estará acessível no escopo principal.

/**
 * Adiciona uma nova entrada ao log de auditoria.
 * @param {string} message - A mensagem a ser registrada.
 * @param {object|null} snapshot - Um snapshot do estado dos dados antes da alteração.
 */
export function addAuditLog(message, snapshot = null) {
    const timestamp = new Date().toLocaleString('pt-BR');
    MOCK_DATA.auditLog.unshift({
        id: Date.now(),
        timestamp: timestamp,
        message: message,
        snapshot: snapshot
    });
    // A renderização do log será chamada pelo módulo principal após a adição.
}

/**
 * Renderiza o painel de auditoria na tela.
 * @param {object} currentTurmaContext - O contexto da turma atual para a função de reverter.
 * @param {function} renderTurmaDetailViewCallback - Callback para re-renderizar a view da turma.
 */
export function renderAuditLog(currentTurmaContext, renderTurmaDetailViewCallback) {
    const logList = document.getElementById('audit-log-list');
    if (!logList) return;

    logList.innerHTML = MOCK_DATA.auditLog.map(log => `
        <div class="list-group-item d-flex justify-content-between align-items-center">
            <div>
                <small class="text-muted d-block">${log.timestamp}</small>
                <span>${log.message}</span>
            </div>
            ${log.snapshot ? `<button class="btn btn-sm btn-outline-success revert-log-btn" data-log-id="${log.id}" title="Reverter para este ponto">
                <i class="bi bi-arrow-counterclockwise"></i>
            </button>` : ''}
        </div>
    `).join('');

    logList.querySelectorAll('.revert-log-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const logId = btn.dataset.logId;
            const logEntry = MOCK_DATA.auditLog.find(l => l.id == logId);
            if (logEntry && logEntry.snapshot) {
                const inst = MOCK_DATA.institutions.find(i => i.disciplines.some(d => d.turmas.some(t => t.id === currentTurmaContext.turma.id)));
                const disc = inst.disciplines.find(d => d.turmas.some(t => t.id === currentTurmaContext.turma.id));
                const turmaIndex = disc.turmas.findIndex(t => t.id === currentTurmaContext.turma.id);
                
                if (turmaIndex !== -1) {
                    disc.turmas[turmaIndex] = createSnapshot(logEntry.snapshot);
                    addAuditLog(`Turma revertida para o estado de ${logEntry.timestamp}.`);
                    // Chama o callback para re-renderizar a view principal com os dados revertidos
                    renderTurmaDetailViewCallback(disc.turmas[turmaIndex], disc);
                }
            }
        });
    });
}
