import { fetchInstitutions, fetchCourses } from '../services/DataService.js';

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
async function renderCourseManagement(instId) {
    const container = document.getElementById('course-management-section');
    if (!container) return;
    const token = localStorage.getItem('auth_token');
    let courses = [];
    try {
        courses = await fetchCourses(token);
    } catch (err) {
        container.innerHTML = `<div class="alert alert-danger">Erro ao buscar cursos: ${err.message}</div>`;
        return;
    }
    const filteredCourses = courses.filter(c => c.Id_Instituicao == instId || c.ID_INSTITUICAO == instId);
    container.innerHTML = `
        <ul class="list-group mt-3">
            ${filteredCourses.map(course => `
                <li class="list-group-item d-flex justify-content-between align-items-center">
                    ${course.Nome || course.nome}
                    <button class="btn btn-sm btn-outline-danger delete-course-btn" data-inst-id="${instId}" data-course-name="${course.Nome || course.nome}">
                        <i class="bi bi-trash"></i>
                    </button>
                </li>
            `).join('')}
            ${filteredCourses.length === 0 ? '<li class="list-group-item text-muted">Nenhum curso cadastrado para esta instituição.</li>' : ''}
        </ul>
        <div class="mt-2">
            <a class="text-decoration-none small add-course-link" href="#" data-inst-id="${instId}">
                <i class="bi bi-plus-circle me-1"></i> Adicionar novo curso
            </a>
        </div>
    `;
    // ...event listeners permanecem iguais...
}

/**
 * Renderiza o conteúdo da view de Perfil.
 * @param {HTMLElement} container - O elemento container onde a view será renderizada.
 * @param {number|null} previouslySelectedInstId - O ID da instituição previamente selecionada (para manter o estado).
 */
export async function renderProfileView(container, previouslySelectedInstId = null) {
    // Usuário pode ser buscado do backend futuramente
    const user = { name: 'Usuário', email: 'usuario@email.com' };
    const savedPhoto = localStorage.getItem(`profile_photo_${user.email}`);
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
    const token = localStorage.getItem('auth_token');
    let institutions = [];
    try {
        institutions = await fetchInstitutions(token);
    } catch (err) {
        container.innerHTML += `<div class="alert alert-danger">Erro ao buscar instituições: ${err.message}</div>`;
        return;
    }
    const instProfileSelect = container.querySelector('#institution-select-profile');
    instProfileSelect.innerHTML = institutions.map(inst => `<option value="${inst.ID_INSTITUICAO || inst.Id_Instituicao || inst.id}">${inst.NOME || inst.nome}</option>`).join('');
    const instCourseSelect = container.querySelector('#institution-course-mgmt-select');
    instCourseSelect.innerHTML = institutions.map(inst => `<option value="${inst.ID_INSTITUICAO || inst.Id_Instituicao || inst.id}">${inst.NOME || inst.nome}</option>`).join('');
    instCourseSelect.addEventListener('change', (e) => {
        renderCourseManagement(e.target.value);
    });
    container.querySelector('#delete-institution-btn').addEventListener('click', () => {
        const selectedId = instProfileSelect.value;
        const inst = institutions.find(i => (i.ID_INSTITUICAO || i.Id_Instituicao || i.id) == selectedId);
        if (!inst) {
            alert('Por favor, selecione uma instituição válida para excluir.');
            return;
        }
        document.getElementById('institution-to-delete-name').textContent = inst.NOME || inst.nome;
        document.getElementById('confirm-delete-institution-btn').dataset.id = selectedId;
        deleteInstitutionModal.show();
    });
    if (previouslySelectedInstId) {
        instCourseSelect.value = previouslySelectedInstId;
    }
    if (institutions.length > 0) {
        renderCourseManagement(instCourseSelect.value);
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
                localStorage.setItem(`profile_photo_${user.email}`, base64Image);
                document.getElementById('profile-photo-img').src = base64Image;
            };
            reader.readAsDataURL(file);
        }
    });
}
