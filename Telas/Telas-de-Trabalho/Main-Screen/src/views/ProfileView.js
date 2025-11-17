import { renderCourseManagement, renderDisciplineManagement } from './Profile/managementSections.js';
import * as ApiService from '../services/ApiService.js';
import { showToast } from '../services/NotificationService.js';

/**
 * Renderiza o conteúdo da view de Perfil.
 */
export function renderProfileView(container, user, institutions, modals) {
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
                <label for="institution-select-profile" class="form-label">Selecione uma instituição para gerenciar</label>
                <div class="input-group">
                    <select id="institution-select-profile" class="form-select">${institutions.map(inst => `<option value="${inst.id}">${inst.name}</option>`).join('')}</select>
                    <button class="btn btn-outline-secondary" type="button" id="edit-institution-btn"><i class="bi bi-pencil-square"></i> Editar</button>
                    <button class="btn btn-outline-danger" type="button" id="delete-institution-btn"><i class="bi bi-trash"></i> Remover</button>
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
                    <select id="institution-course-mgmt-select" class="form-select">${institutions.map(inst => `<option value="${inst.id}">${inst.name}</option>`).join('')}</select>
                </div>
                <div id="course-management-section"></div>
            </div>
        </div>

        <div class="card mt-4">
            <div class="card-body">
                <h5 class="card-title">Gerenciar Disciplinas por Curso</h5>
                <div class="mb-3">
                    <label for="course-discipline-mgmt-select" class="form-label">Selecione um curso para ver suas disciplinas</label>
                    <select id="course-discipline-mgmt-select" class="form-select"></select>
                </div>
                <div id="discipline-management-section"></div>
            </div>
        </div>
    `;
    
    const instCourseSelect = container.querySelector('#institution-course-mgmt-select');
    const courseMgmtContainer = container.querySelector('#course-management-section');
    const courseDisciplineSelect = container.querySelector('#course-discipline-mgmt-select');
    const disciplineMgmtContainer = container.querySelector('#discipline-management-section');
    const photoContainer = container.querySelector('.profile-photo-container');
    const photoUploadInput = container.querySelector('#photo-upload-input');
    const instProfileSelect = container.querySelector('#institution-select-profile');
    const editInstitutionBtn = container.querySelector('#edit-institution-btn');
    const deleteInstitutionBtn = container.querySelector('#delete-institution-btn');
    const confirmAddInstBtn = document.getElementById('confirm-add-institution-btn');
    const confirmAddCourseBtn = document.getElementById('confirm-add-course-btn');
    const confirmAddDisciplineBtn = document.getElementById('confirm-add-discipline-btn');

    if (photoContainer && photoUploadInput) {
        photoContainer.addEventListener('click', () => photoUploadInput.click());
        photoUploadInput.addEventListener('change', (event) => {
            const file = event.target.files[0];
            if (file && file.type.startsWith('image/')) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    localStorage.setItem(`profile_photo_${user.cpf}`, e.target.result);
                    document.getElementById('profile-photo-img').src = e.target.result;
                };
                reader.readAsDataURL(file);
            }
        });
    }

    if (editInstitutionBtn && instProfileSelect) {
        editInstitutionBtn.addEventListener('click', () => {
            const selectedId = instProfileSelect.value;
            const inst = institutions.find(i => i.id == selectedId);
            if (!inst) return;
            document.getElementById('edit-institution-name').value = inst.name;
            document.getElementById('confirm-edit-institution-btn').dataset.instId = inst.id;
            modals.editInstitutionModal.show();
        });
    }

    if (deleteInstitutionBtn && instProfileSelect) {
        deleteInstitutionBtn.addEventListener('click', () => {
            const selectedId = instProfileSelect.value;
            const inst = institutions.find(i => i.id == selectedId);
            if (!inst) return;
            document.getElementById('institution-to-delete-name').textContent = inst.name;
            document.getElementById('confirm-delete-institution-btn').dataset.instId = inst.id;
            modals.deleteInstitutionModal.show();
        });
    }

    if (confirmAddInstBtn) {
        confirmAddInstBtn.addEventListener('click', async () => {
            const name = document.getElementById('new-institution-name').value;
            const password = document.getElementById('current-password-inst').value;
            if (!name || !password) {
                showToast('Preencha o nome da instituição e sua senha.', 'error');
                return;
            }
            try {
                await ApiService.verifyPassword(password);
                await ApiService.addInstitution({ nome: name });
                showToast(`Instituição "${name}" criada com sucesso! Atualizando...`, 'success');
                modals.addInstitutionModal.hide();
                setTimeout(() => window.location.reload(), 1500);
            } catch (error) {
                showToast(`Erro: ${error.message}`, 'error');
            }
        });
    }

    if (confirmAddCourseBtn) {
        confirmAddCourseBtn.addEventListener('click', async () => {
            const instId = confirmAddCourseBtn.dataset.instId;
            const name = document.getElementById('new-course-name').value;
            const sigla = document.getElementById('new-course-sigla-main').value;
            const semestres = document.getElementById('new-course-semestres-main').value;
            const password = document.getElementById('current-password-course').value;

            if (!name || !sigla || !semestres || !password) {
                showToast('Preencha todos os campos e a senha.', 'error');
                return;
            }

            try {
                await ApiService.verifyPassword(password);
                await ApiService.addCourse({ 
                    nome: name, 
                    sigla: sigla,
                    semestres: parseInt(semestres),
                    idInstituicao: parseInt(instId)
                });
                showToast(`Curso "${name}" criado com sucesso! Atualizando...`, 'success');
                modals.addCourseModal.hide();
                setTimeout(() => window.location.reload(), 1500);
            } catch (error) {
                showToast(`Erro: ${error.message}`, 'error');
            }
        });
    }
    
    if (confirmAddDisciplineBtn) {
        confirmAddDisciplineBtn.addEventListener('click', async () => {
            const courseId = confirmAddDisciplineBtn.dataset.courseId;
            const name = document.getElementById('new-discipline-name').value;
            const sigla = document.getElementById('new-discipline-sigla').value;
            const periodo = document.getElementById('new-discipline-periodo').value;
            const password = document.getElementById('current-password-disc').value;

            if (!name || !sigla || !periodo || !password) {
                showToast('Preencha todos os campos e a senha.', 'error');
                return;
            }

            try {
                await ApiService.verifyPassword(password);
                await ApiService.addDiscipline({
                    nome: name,
                    sigla: sigla,
                    periodo: periodo,
                    idCurso: parseInt(courseId)
                });
                showToast(`Disciplina "${name}" criada com sucesso! Atualizando...`, 'success');
                modals.addDisciplineModal.hide();
                setTimeout(() => window.location.reload(), 1500);
            } catch (error) {
                showToast(`Erro: ${error.message}`, 'error');
            }
        });
    }

    const allCourses = institutions.flatMap(inst => inst.courses || []);

    function updateCourseDisciplineSelect() {
        courseDisciplineSelect.innerHTML = allCourses.map(course => `<option value="${course.id}">${course.name}</option>`).join('');
        if (allCourses.length > 0) {
            const selectedOption = courseDisciplineSelect.options[courseDisciplineSelect.selectedIndex];
            renderDisciplineManagement(courseDisciplineSelect.value, selectedOption.text, disciplineMgmtContainer, modals, allCourses);
        } else {
            disciplineMgmtContainer.innerHTML = `<p class="text-muted mt-3">Nenhum curso disponível.</p>`;
        }
    }

    if (instCourseSelect) {
        instCourseSelect.addEventListener('change', (e) => {
            renderCourseManagement(e.target.value, institutions, courseMgmtContainer, modals);
        });
    }

    if (courseDisciplineSelect) {
        courseDisciplineSelect.addEventListener('change', (e) => {
            const selectedOption = e.target.options[e.target.selectedIndex];
            renderDisciplineManagement(e.target.value, selectedOption.text, disciplineMgmtContainer, modals, allCourses);
        });
    }
    
    if (institutions.length > 0 && instCourseSelect.value) {
        renderCourseManagement(instCourseSelect.value, institutions, courseMgmtContainer, modals);
    }
    updateCourseDisciplineSelect();
}