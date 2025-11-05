import { fetchInstitutions } from '../services/DataService.js';

// Variáveis de modais e callbacks que serão gerenciadas pelo app.js
let editTurmaModal, editDisciplineModal, deleteTurmaModal, deleteDisciplineModal;
let switchViewCallback, renderTurmaDetailViewCallback;

/**
 * Inicializa os modais e callbacks necessários para esta view.
 * @param {object} modals - Objeto com as instâncias dos modais.
 * @param {object} callbacks - Objeto com as funções de callback.
 */
export function initInstitutionsView(modals, callbacks) {
    editTurmaModal = modals.editTurmaModal;
    editDisciplineModal = modals.editDisciplineModal;
    deleteTurmaModal = modals.deleteTurmaModal;
    deleteDisciplineModal = modals.deleteDisciplineModal;
    switchViewCallback = callbacks.switchView;
    renderTurmaDetailViewCallback = callbacks.renderTurmaDetailView;

}

/**
 * Renderiza a view de gerenciamento de Instituições.
 * @param {HTMLElement} container - O elemento container onde a view será renderizada.
 * @param {object} params - Parâmetros adicionais, como o ID da instituição a ser expandida.
 */
export async function renderInstitutionsView(container, params = {}) {
    container.innerHTML = '';
    const token = localStorage.getItem('auth_token');
    let institutions = [];
    try {
        institutions = await fetchInstitutions(token);
    } catch (err) {
        container.innerHTML = `<div class="alert alert-danger">Erro ao buscar instituições: ${err.message}</div>`;
        return;
    }
    container.innerHTML += `
        <div class="d-flex justify-content-between align-items-center mb-3">
            <div>
                <h2>Gerenciamento</h2>
                <p class="mb-0 text-muted">Navegue e gerencie suas instituições, disciplinas e turmas.</p>
            </div>
            <button class="btn btn-primary" id="add-new-from-management-btn">
                <i class="bi bi-plus-circle me-1"></i> Cadastrar Novo
            </button>
        </div>
        <div class="accordion" id="institutions-accordion-container">
            ${institutions.map((inst, i) => `
                <div class="accordion-item">
                    <h2 class="accordion-header" id="heading-inst-${inst.ID_INSTITUICAO || inst.Id_Instituicao || inst.id}">
                        <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapse-inst-${inst.ID_INSTITUICAO || inst.Id_Instituicao || inst.id}" aria-expanded="false" aria-controls="collapse-inst-${inst.ID_INSTITUICAO || inst.Id_Instituicao || inst.id}">
                            <i class="bi bi-building me-2"></i> ${inst.NOME || inst.nome}
                        </button>
                    </h2>
                    <div id="collapse-inst-${inst.ID_INSTITUICAO || inst.Id_Instituicao || inst.id}" class="accordion-collapse collapse" aria-labelledby="heading-inst-${inst.ID_INSTITUICAO || inst.Id_Instituicao || inst.id}" data-bs-parent="#institutions-accordion-container">
                        <div class="accordion-body">
                            <p class="text-muted">ID: ${inst.ID_INSTITUICAO || inst.Id_Instituicao || inst.id}</p>
                        </div>
                    </div>
                </div>
            `).join('')}
        </div>
    `;
    // Lógica para expandir o accordion correto, se passado por parâmetro
    if (params.expandInstId) {
        const collapseElement = container.querySelector(`#collapse-inst-${params.expandInstId}`);
        if (collapseElement) {
            const button = container.querySelector(`[data-bs-target="#collapse-inst-${params.expandInstId}"]`);
            button.classList.remove('collapsed');
            button.setAttribute('aria-expanded', 'true');
            collapseElement.classList.add('show');
        }
    }
    // Adiciona os event listeners
    container.querySelector('#add-new-from-management-btn').addEventListener('click', () => {
        switchViewCallback('creation');
    });
    // TODO: Adicionar lógica para turmas, disciplinas, etc. usando dados reais
}
