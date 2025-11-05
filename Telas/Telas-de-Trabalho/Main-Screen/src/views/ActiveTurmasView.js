import { fetchInstitutions } from '../services/DataService.js';

// Callbacks para serem gerenciados pelo app.js
let switchViewCallback, renderTurmaDetailViewCallback;

/**
 * Inicializa a view com os callbacks necessários.
 * @param {object} callbacks - Objeto com as funções de callback.
 */
export function initActiveTurmasView(callbacks) {
    switchViewCallback = callbacks.switchView;
    renderTurmaDetailViewCallback = callbacks.renderTurmaDetailView;
}

/**
 * Renderiza a view de Turmas Ativas.
 * @param {HTMLElement} container - O elemento container onde a view será renderizada.
 */
export async function renderActiveTurmasView(container) {
    container.innerHTML = `
        <h1>Turmas Ativas</h1>
        <p class="lead text-muted">Acesso rápido a todas as suas turmas que ainda não foram finalizadas.</p>
    `;
    let hasActiveTurmas = false;
    const token = localStorage.getItem('auth_token');
    let institutions = [];
    try {
        institutions = await fetchInstitutions(token);
    } catch (err) {
        container.innerHTML += `<div class="alert alert-danger">Erro ao buscar instituições: ${err.message}</div>`;
        return;
    }
    institutions.forEach(inst => {
        // Supondo que disciplinas e turmas venham junto, senão precisa buscar separadamente
        if (!inst.disciplines) return;
        const activeTurmas = inst.disciplines.flatMap(disc => 
            disc.turmas ? disc.turmas.filter(turma => !turma.isFinalized).map(turma => ({...turma, discipline: disc, instId: inst.ID_INSTITUICAO || inst.Id_Instituicao || inst.id })) : []
        );
        if (activeTurmas.length > 0) {
            hasActiveTurmas = true;
            let institutionHTML = `
                <div class="mt-4">
                    <div class="d-flex align-items-center">
                        <i class="bi bi-building fs-4 me-2"></i>
                        <h3 class="mb-0">${inst.NOME || inst.nome}</h3>
                    </div>
                    <hr class="my-3">
                    <div class="row g-3">
                        ${activeTurmas.map(turma => `
                            <div class="col-md-6 col-lg-4">
                                <div class="card h-100 shadow-sm">
                                    <div class="card-body">
                                        <h5 class="card-title">${turma.discipline.name}</h5>
                                        <h6 class="card-subtitle mb-2 text-muted">${turma.discipline.curso}</h6>
                                        <h6 class="card-subtitle mb-2 text-muted">${turma.name}</h6>
                                        <p class="card-text">${turma.students ? turma.students.length : 0} aluno(s) cadastrado(s).</p>
                                    </div>
                                    <div class="card-footer bg-transparent border-0 pb-3">
                                         <button class="btn btn-sm btn-primary manage-turma-btn" data-inst-id="${turma.instId}" data-disc-id="${turma.discipline.id}" data-turma-id="${turma.id}">Gerenciar Turma</button>
                                    </div>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
            container.innerHTML += institutionHTML;
        }
    });
    if (!hasActiveTurmas) {
        container.innerHTML += '<div class="alert alert-info mt-4">Você não possui turmas ativas no momento.</div>';
    }
    container.querySelectorAll('.manage-turma-btn').forEach(btn => {
        btn.addEventListener('click', () => {
           // Aqui seria necessário buscar os dados reais da turma/disciplina
           // ...existing code para navegação...
        });
    });
}
