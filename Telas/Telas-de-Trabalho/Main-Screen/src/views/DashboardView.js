import * as ApiService from '../services/ApiService.js';

/**
 * Renderiza o conteúdo da view do Painel Principal.
 * @param {HTMLElement} container - O elemento container onde a view será renderizada.
 * @param {object} user - O objeto do usuário.
 * @param {Array} institutions - A lista de instituições.
 * @param {function} switchViewCallback - Callback para alternar para outra view.
 */
export function renderDashboardView(container, user, institutions, switchViewCallback) {
    if (!user || !institutions) {
        container.innerHTML = `
            <div class="d-flex justify-content-center mt-5">
                <div class="spinner-border" role="status">
                    <span class="visually-hidden">Carregando...</span>
                </div>
            </div>`;
        return;
    }

    let contentHTML = `
        <h1>Bem-vindo(a), ${user.name?.split(' ')[0] ?? 'Usuário'}!</h1>
        <p class="lead text-muted">Acesso rápido às suas disciplinas e turmas.</p>
    `;

    if (institutions.length === 0) {
        contentHTML += '<div class="alert alert-info mt-4">Você ainda não cadastrou nenhuma instituição.</div>';
    } else {
        contentHTML += institutions.map((inst, index) => `
            <div class="mt-4">
                <div class="d-flex align-items-center">
                    <i class="bi bi-building fs-4 me-2"></i>
                    <h3 class="mb-0">${inst.name}</h3>
                </div>
                <hr class="my-3">
                ${inst.courses && inst.courses.length > 0 ? `
                    <div class="row g-3">
                        ${inst.courses.map(course => `
                            <div class="col-md-6 col-lg-4">
                                <div class="card h-100 shadow-sm">
                                    <div class="card-body">
                                        <h5 class="card-title">${course.name}</h5>
                                        <h6 class="card-subtitle mb-2 text-muted">${inst.name}</h6>
                                        <p class="card-text">${course.disciplines ? course.disciplines.length : 0} disciplina(s) cadastrada(s).</p>
                                    </div>
                                    <div class="card-footer bg-transparent border-0 pb-3">
                                         <button class="btn btn-sm btn-primary view-discipline-btn" data-inst-id="${inst.id}" data-course-id="${course.id}">Ver Cursos</button>
                                    </div>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                ` : '<p class="text-muted">Nenhum curso cadastrado nesta instituição.</p>'}
            </div>
            ${index < institutions.length - 1 ? '<hr class="my-5" style="border-width: 2px;">' : ''}
        `).join('');
    }

    container.innerHTML = contentHTML;

    // Adiciona os event listeners após o conteúdo ser inserido no DOM
    container.querySelectorAll('.view-discipline-btn').forEach(btn => {
        btn.addEventListener('click', async () => {
           const { instId, courseId } = btn.dataset;
           if (courseId) {
               try {
                   await ApiService.touchCourse(courseId);
               } catch (error) {
                   console.error('Failed to update course access timestamp:', error);
                   // Continue execution even if this fails
               }
           }
           // Chama o callback para mudar a view e expandir o accordion correto
           switchViewCallback('institutions', { expandInstId: instId });
        });
    });
}