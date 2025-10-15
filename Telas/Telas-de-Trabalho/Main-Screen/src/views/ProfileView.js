import { MOCK_DATA } from '../services/DataService.js';

// Estas variáveis serão inicializadas no app.js e passadas para as views.
let deleteCourseModal;
let addCourseModal;
let deleteInstitutionModal;

/**
 * Inicializa os modais que são usados nesta view.
 * @param {object} modals - Um objeto contendo as instâncias dos modais.
 */
export function initProfileViewModals(modals) {
    deleteCourseModal = modals.deleteCourseModal;
    addCourseModal = modals.addCourseModal;
    deleteInstitutionModal = modals.deleteInstitutionModal;
}

/**
 * Renderiza a seção de gerenciamento de cursos para uma instituição específica.
 * @param {number} instId - O ID da instituição.
 */
function renderCourseManagement(instId) {
    const inst = MOCK_DATA.institutions.find(i => i.id == instId);
    const container = document.getElementById('course-management-section');
    if (!inst || !container) return;

    container.innerHTML = `
        <ul class="list-group mt-3">
            ${inst.courses.map(course => `
                <li class="list-group-item d-flex justify-content-between align-items-center">
                    ${course.name}
                    <button class="btn btn-sm btn-outline-danger delete-course-btn" data-inst-id="${inst.id}" data-course-name="${course.name}">
                        <i class="bi bi-trash"></i>
                    </button>
                </li>
            `).join('')}
            ${inst.courses.length === 0 ? '<li class="list-group-item text-muted">Nenhum curso cadastrado para esta instituição.</li>' : ''}
        </ul>
        <div class="mt-2">
            <a class="text-decoration-none small add-course-link" href="#" data-inst-id="${inst.id}">
                <i class="bi bi-plus-circle me-1"></i> Adicionar novo curso a ${inst.name}
            </a>
        </div>
    `;

    container.querySelectorAll('.delete-course-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const { instId, courseName } = e.currentTarget.dataset;
            document.getElementById('course-to-delete-name').textContent = `${courseName} (da instituição ${inst.name})`;
            const confirmBtn = document.getElementById('confirm-delete-course-btn');
            confirmBtn.dataset.instId = instId;
            confirmBtn.dataset.courseName = courseName;
            deleteCourseModal.show();
        });
    });

    container.querySelector('.add-course-link').addEventListener('click', (e) => {
        e.preventDefault();
        const { instId } = e.currentTarget.dataset;
        const instName = MOCK_DATA.institutions.find(i => i.id == instId).name;
        document.getElementById('addCourseModalLabel').textContent = `Adicionar Novo Curso a ${instName}`;
        document.getElementById('confirm-add-course-btn').dataset.instId = instId;
        addCourseModal.show();
    });
}

/**
 * Renderiza o conteúdo da view de Perfil.
 * @param {HTMLElement} container - O elemento container onde a view será renderizada.
 * @param {number|null} previouslySelectedInstId - O ID da instituição previamente selecionada (para manter o estado).
 */
export function renderProfileView(container, previouslySelectedInstId = null) {
    const user = MOCK_DATA.user;
    container.innerHTML = `
        <div class="d-flex align-items-center mb-4">
            <img src="https://placehold.co/100x100/E2E8F0/4A5568?text=${user.name.charAt(0)}" class="rounded-circle me-4" alt="Avatar">
            <div>
                <h1>${user.name}</h1>
                <p class="lead text-muted">${user.email}</p>
            </div>
        </div>
        <div class="card">
            <div class="card-body p-4">
                <h5 class="card-title mb-4">Informações Pessoais</h5>
                <div class="row g-4">
                    <div class="col-md-6"><small class="text-muted d-block mb-1">Nome Completo</small><p class="fw-bold mb-0"><em>*informação*</em></p></div>
                    <div class="col-md-6"><small class="text-muted d-block mb-1">CPF</small><p class="fw-bold mb-0"><em>*informação*</em></p></div>
                    <div class="col-md-6"><small class="text-muted d-block mb-1">Email</small><p class="fw-bold mb-0"><em>*informação*</em></p></div>
                    <div class="col-md-6"><small class="text-muted d-block mb-1">Telefone</small><p class="fw-bold mb-0"><em>*informação*</em></p></div>
                </div>
            </div>
        </div>

        <div class="card mt-4">
            <div class="card-body">
                <h5 class="card-title">Gerenciar Instituições</h5>
                <label for="institution-select-profile" class="form-label">Selecione uma instituição para remover</label>
                <div class="input-group">
                    <select id="institution-select-profile" class="form-select"></select>
                    <button class="btn btn-outline-danger" type="button" id="delete-institution-btn"><i class="bi bi-trash"></i> Remover Selecionada</button>
                </div>
                <div class="mt-2">
                    <a class="text-decoration-none small" href="#" data-bs-toggle="modal" data-bs-target="#addInstitutionModal">
                        <i class="bi bi-plus-circle me-1"></i> Adicionar nova instituição
                    </a>
                </div>
            </div>
        </div>
        
        <div class="card mt-4">
            <div class="card-body">
                <h5 class="card-title">Gerenciar Cursos por Instituição</h5>
                <div class="mb-3">
                    <label for="institution-course-mgmt-select" class="form-label">Selecione uma instituição para ver seus cursos</label>
                    <select id="institution-course-mgmt-select" class="form-select"></select>
                </div>
                <div id="course-management-section">
                    <!-- A lista de cursos e ferramentas de gerenciamento serão renderizadas aqui -->
                </div>
            </div>
        </div>
    `;
    
    const instProfileSelect = container.querySelector('#institution-select-profile');
    instProfileSelect.innerHTML = MOCK_DATA.institutions.map(inst => `<option value="${inst.id}">${inst.name}</option>`).join('');

    const instCourseSelect = container.querySelector('#institution-course-mgmt-select');
    instCourseSelect.innerHTML = MOCK_DATA.institutions.map(inst => `<option value="${inst.id}">${inst.name}</option>`).join('');
    
    instCourseSelect.addEventListener('change', (e) => {
        renderCourseManagement(e.target.value);
    });
    
    container.querySelector('#delete-institution-btn').addEventListener('click', () => {
        const selectedId = instProfileSelect.value;
        const inst = MOCK_DATA.institutions.find(i => i.id == selectedId);
        if (!inst) {
            alert('Por favor, selecione uma instituição válida para excluir.');
            return;
        }
        document.getElementById('institution-to-delete-name').textContent = inst.name;
        document.getElementById('confirm-delete-institution-btn').dataset.id = inst.id;
        deleteInstitutionModal.show();
    });

    if (previouslySelectedInstId) {
        instCourseSelect.value = previouslySelectedInstId;
    }

    if (MOCK_DATA.institutions.length > 0) {
        renderCourseManagement(instCourseSelect.value);
    }
}
