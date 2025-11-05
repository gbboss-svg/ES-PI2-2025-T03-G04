import { fetchInstitutions } from '../services/DataService.js';

/**
 * Renderiza o conteúdo da view do Painel Principal.
 * @param {HTMLElement} container - O elemento container onde a view será renderizada.
 * @param {function} switchViewCallback - Callback para alternar para outra view.
 */
export async function renderDashboardView(container, switchViewCallback) {
    container.innerHTML = '';
    // Exemplo: token pode vir do localStorage ou contexto global
    const token = localStorage.getItem('auth_token');
    let institutions = [];
    try {
        institutions = await fetchInstitutions(token);
    } catch (err) {
        container.innerHTML = `<div class="alert alert-danger">Erro ao buscar instituições: ${err.message}</div>`;
        return;
    }

    container.innerHTML += `
        <h1>Bem-vindo(a)!</h1>
        <p class="lead text-muted">Acesso rápido às suas disciplinas e turmas.</p>
    `;

    if (!institutions.length) {
        container.innerHTML += '<p class="text-muted">Nenhuma instituição cadastrada.</p>';
        return;
    }

    institutions.forEach((inst, index) => {
        let institutionHTML = `
            <div class="mt-4">
                <div class="d-flex align-items-center">
                    <i class="bi bi-building fs-4 me-2"></i>
                    <h3 class="mb-0">${inst.NOME || inst.nome}</h3>
                </div>
                <hr class="my-3">
                <p class="text-muted">ID: ${inst.ID_INSTITUICAO || inst.Id_Instituicao || inst.id}</p>
            </div>
        `;
        if (index < institutions.length - 1) {
            institutionHTML += '<hr class="my-5" style="border-width: 2px;">';
        }
        container.innerHTML += institutionHTML;
    });
// ...existing code...
}
