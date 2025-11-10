import * as ApiService from '../services/ApiService.js';

// Estas variáveis serão inicializadas no app.js e passadas para as views.
let deleteCourseModal;
let addCourseModal;
let deleteInstitutionModal;
let addDisciplineModal;
let deleteDisciplineModal;

/**
 * Inicializa os modais que são usados nesta view.
 * @param {object} modals - Um objeto contendo as instâncias dos modais.
 */
export function initProfileViewModals(modals) {
    deleteCourseModal = modals.deleteCourseModal;
    addCourseModal = modals.addCourseModal;
    deleteInstitutionModal = modals.deleteInstitutionModal;
    addDisciplineModal = modals.addDisciplineModal;
    deleteDisciplineModal = modals.deleteDisciplineModal;
}

/**
 * Renderiza a seção de gerenciamento de cursos para uma instituição específica.
 * @param {number} instId - O ID da instituição.
 * @param {Array} institutions - A lista completa de instituições.
 */
function renderCourseManagement(instId, institutions) {
    const inst = institutions.find(i => i.id == instId);
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
        const instName = institutions.find(i => i.id == instId).name;
        document.getElementById('addCourseModalLabel').textContent = `Adicionar Novo Curso a ${instName}`;
        document.getElementById('confirm-add-course-btn').dataset.instId = instId;
        addCourseModal.show();
    });
}

async function renderDisciplineManagement(courseId, courseName) {
    const container = document.getElementById('discipline-management-section');
    if (!container) return;

    const disciplines = await ApiService.getDisciplinesByCourse(courseId);

    container.innerHTML = `
        <ul class="list-group mt-3">
            ${disciplines.map(discipline => `
                <li class="list-group-item d-flex justify-content-between align-items-center">
                    ${discipline.name}
                    <button class="btn btn-sm btn-outline-danger delete-discipline-btn" data-discipline-id="${discipline.id}" data-discipline-name="${discipline.name}">
                        <i class="bi bi-trash"></i>
                    </button>
                </li>
            `).join('')}
            ${disciplines.length === 0 ? '<li class="list-group-item text-muted">Nenhuma disciplina cadastrada para este curso.</li>' : ''}
        </ul>
        <div class="mt-2">
            <a class="text-decoration-none small add-discipline-link" href="#" data-course-id="${courseId}">
                <i class="bi bi-plus-circle me-1"></i> Adicionar nova disciplina a ${courseName}
            </a>
        </div>
    `;

    container.querySelectorAll('.add-discipline-link').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const { courseId } = e.currentTarget.dataset;
            document.getElementById('addDisciplineModalLabel').textContent = `Adicionar Nova Disciplina`;
            document.getElementById('confirm-add-discipline-btn').dataset.courseId = courseId;
            addDisciplineModal.show();
        });
    });

    container.querySelectorAll('.delete-discipline-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const { disciplineId, disciplineName } = e.currentTarget.dataset;
            document.getElementById('discipline-to-delete-name').textContent = disciplineName;
            const confirmBtn = document.getElementById('confirm-delete-discipline-btn');
            confirmBtn.dataset.disciplineId = disciplineId;
            deleteDisciplineModal.show();
        });
    });
}

/**
 * Renderiza o conteúdo da view de Perfil.
 * @param {HTMLElement} container - O elemento container onde a view será renderizada.
 * @param {object} user - O objeto do usuário com os dados do perfil.
 * @param {Array} institutions - A lista de instituições do usuário.
 * @param {number|null} previouslySelectedInstId - O ID da instituição previamente selecionada (para manter o estado).
 */
export function renderProfileView(container, user, institutions, previouslySelectedInstId = null) {
    // Adiciona uma verificação mais robusta para garantir que os dados do usuário foram carregados
    if (!user || !user.name || !institutions) {
        container.innerHTML = `<p class="text-center">Carregando dados do perfil...</p>`;
        return;
    }
    const savedPhoto = localStorage.getItem(`profile_photo_${user.cpf}`);
    const photoSrc = savedPhoto ? savedPhoto : `https://placehold.co/100x100/E2E8F0/4A5568?text=${user.name.charAt(0)}`;

    container.innerHTML = `
        <div class="d-flex align-items-center mb-4">
            <div class="profile-photo-container me-4">
                <img src="${photoSrc}" class="rounded-circle" alt="Avatar" id="profile-photo-img">
                <div class="profile-photo-overlay">
                    <i class="bi bi-camera-fill"></i>
                </div>
                <input type="file" id="photo-upload-input" class="d-none" accept="image/*">
            </div>
            <div>
                <h1>${user.name}</h1>
                <p class="lead text-muted">${user.email}</p>
            </div>
        </div>
        <div class="card">
            <div class="card-body p-4">
                <h5 class="card-title mb-4">Informações Pessoais</h5>
                <div class="row g-4">
                    <div class="col-md-6"><small class="text-muted d-block mb-1">Nome Completo</small><p class="fw-bold mb-0">${user.name || 'Não informado'}</p></div>
                    <div class="col-md-6"><small class="text-muted d-block mb-1">CPF</small><p class="fw-bold mb-0">${user.cpf || 'Não informado'}</p></div>
                    <div class="col-md-6"><small class="text-muted d-block mb-1">Email</small><p class="fw-bold mb-0">${user.email || 'Não informado'}</p></div>
                    <div class="col-md-6"><small class="text-muted d-block mb-1">Telefone</small><p class="fw-bold mb-0">${user.telefone || 'Não informado'}</p></div>
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

        <div class="card mt-4">
            <div class="card-body">
                <h5 class="card-title">Gerenciar Disciplinas por Curso</h5>
                <div class="mb-3">
                    <label for="course-discipline-mgmt-select" class="form-label">Selecione um curso para ver suas disciplinas</label>
                    <select id="course-discipline-mgmt-select" class="form-select"></select>
                </div>
                <div id="discipline-management-section">
                    <!-- A lista de disciplinas e ferramentas de gerenciamento serão renderizadas aqui -->
                </div>
            </div>
        </div>
    `;
    
    const instProfileSelect = container.querySelector('#institution-select-profile');
    instProfileSelect.innerHTML = institutions.map(inst => `<option value="${inst.id}">${inst.name}</option>`).join('');

    const instCourseSelect = container.querySelector('#institution-course-mgmt-select');
    instCourseSelect.innerHTML = institutions.map(inst => `<option value="${inst.id}">${inst.name}</option>`).join('');
    
    instCourseSelect.addEventListener('change', (e) => {
        renderCourseManagement(e.target.value, institutions);
    });
    
    container.querySelector('#delete-institution-btn').addEventListener('click', () => {
        const selectedId = instProfileSelect.value;
        const inst = institutions.find(i => i.id == selectedId);
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

    if (institutions.length > 0) {
        renderCourseManagement(instCourseSelect.value, institutions);
    }

    const courseDisciplineSelect = container.querySelector('#course-discipline-mgmt-select');
    const allCourses = institutions.flatMap(inst => inst.courses);
    courseDisciplineSelect.innerHTML = allCourses.map(course => `<option value="${course.id}">${course.name}</option>`).join('');

    courseDisciplineSelect.addEventListener('change', (e) => {
        const selectedOption = e.target.options[e.target.selectedIndex];
        renderDisciplineManagement(e.target.value, selectedOption.text);
    });

    if (allCourses.length > 0) {
        const selectedOption = courseDisciplineSelect.options[courseDisciplineSelect.selectedIndex];
        renderDisciplineManagement(courseDisciplineSelect.value, selectedOption.text);
    } else {
        const disciplineContainer = container.querySelector('#discipline-management-section');
        if (disciplineContainer) {
            disciplineContainer.innerHTML = `<p class="text-muted mt-3">Você precisa criar um curso antes de poder adicionar disciplinas.</p>`;
        }
    }

    // Lógica para o upload da foto de perfil
    const photoContainer = container.querySelector('.profile-photo-container');
    const photoUploadInput = container.querySelector('#photo-upload-input');

    photoContainer.addEventListener('click', () => {
        photoUploadInput.click();
    });

    photoUploadInput.addEventListener('change', (event) => {
        const file = event.target.files[0];
        if (file && file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const base64Image = e.target.result;
                // Salva a imagem no localStorage usando o CPF como parte da chave
                localStorage.setItem(`profile_photo_${user.cpf}`, base64Image);
                // Atualiza a imagem na tela
                document.getElementById('profile-photo-img').src = base64Image;
            };
            reader.readAsDataURL(file);
        }
    });
}
