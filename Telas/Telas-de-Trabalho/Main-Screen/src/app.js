import * as ApiService from './services/ApiService.js';
import { showToast } from './services/NotificationService.js';
import { renderDashboardView } from './views/DashboardView.js';
import { renderProfileView } from './views/ProfileView.js';
import { renderInstitutionsView } from './views/InstitutionsView.js';
import { initCreationView, renderCreationView } from './views/CreationView.js';
import { initActiveTurmasView, renderActiveTurmasView } from './views/ActiveTurmasView.js';
import { initSettingsView, renderSettingsView } from './views/SettingsView.js';
import { renderTurmaDetailView } from './views/TurmaDetailView.js';

document.addEventListener('DOMContentLoaded', () => {
    const state = {
        user: null,
        institutions: [],
        courses: [],
        disciplines: [],
        activeTurmas: null, // Alterado para null para indicar estado inicial de "não carregado"
        currentView: 'profile',
    };

    const views = {
        profile: document.getElementById('profile-view'),
        dashboard: document.getElementById('dashboard-view'),
        institutions: document.getElementById('institutions-view'),
        creation: document.getElementById('creation-view'),
        activeTurmas: document.getElementById('activeTurmas-view'),
        turmaDetail: document.getElementById('turma-detail-view'),
        settings: document.getElementById('settings-view'),
    };
    
    const navLinks = document.querySelectorAll('.sidebar .nav-link');
    const sidebarToggler = document.getElementById('sidebarToggler');
    const confirmLogoutBtn = document.getElementById('confirm-logout-btn');
    const institutionsFlyoutList = document.getElementById('institutions-flyout-list');

    const modals = {};
    const modalIds = [
        'logoutModal', 'addInstitutionModal', 'addCourseModal', 'addDisciplineModal',
        'deleteInstitutionModal', 'deleteCourseModal', 'deleteDisciplineModal', 'deleteTurmaModal',
        'editTurmaModal', 'editDisciplineModal', 'addStudentModal', 'deleteStudentModal',
        'finalizeSemesterModal', 'reopenTurmaModal', 'csvConflictModal', 'editInstitutionModal', 'editCourseModal',
        'editStudentModal'
    ];

    modalIds.forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            modals[id] = new bootstrap.Modal(element);
        } else {
            console.warn(`Modal element with ID '${id}' not found in the DOM. Its functionality might be impaired.`);
            modals[id] = undefined;
        }
    });

    function handleLogout() {
        localStorage.removeItem('token');
        window.location.href = '/login';
    }

    async function fetchData() {
        const results = await Promise.allSettled([
            ApiService.getProfessorProfile(),
            ApiService.getInstitutions(),
            ApiService.getCourses(),
            ApiService.getProfessorDisciplines(),
            // A busca de turmas ativas será feita pela própria view
        ]);

        const [userResult, institutionsResult, coursesResult, disciplinesResult] = results;

        if (userResult.status === 'rejected') {
            showToast(`Erro ao carregar seu perfil: ${userResult.reason.message}. Você será desconectado.`, 'error');
            setTimeout(handleLogout, 3000);
            return;
        }
        state.user = userResult.value;

        const institutions = institutionsResult.status === 'fulfilled' ? institutionsResult.value : [];
        if (institutionsResult.status === 'rejected') {
            showToast(`Não foi possível carregar as instituições: ${institutionsResult.reason.message}`, 'error');
        }

        const courses = coursesResult.status === 'fulfilled' ? coursesResult.value : [];
        if (coursesResult.status === 'rejected') {
            showToast(`Não foi possível carregar os cursos: ${coursesResult.reason.message}`, 'error');
        }

        const disciplines = disciplinesResult.status === 'fulfilled' ? disciplinesResult.value : [];
        if (disciplinesResult.status === 'rejected') {
            showToast(`Não foi possível carregar as disciplinas: ${disciplinesResult.reason.message}`, 'error');
        }
        
        state.courses = courses;
        state.disciplines = disciplines;

        state.institutions = institutions.map(inst => ({
            ...inst,
            courses: courses.filter(c => c.institutionId === inst.id).map(course => ({
                ...course,
                disciplines: disciplines.filter(d => d.courseId === course.id)
            }))
        }));
        
        updateInstitutionsFlyout();
    }
    
    function updateInstitutionsFlyout() {
        if (!institutionsFlyoutList) return;
        if (state.institutions.length > 0) {
            institutionsFlyoutList.innerHTML = state.institutions
                .map(inst => `<li><a href="#" class="submenu-item" data-view="institutions" data-inst-id="${inst.id}">${inst.name}</a></li>`)
                .join('');
             institutionsFlyoutList.querySelectorAll('a').forEach(link => {
                link.addEventListener('click', (e) => {
                    e.preventDefault();
                    switchView('institutions', { expandInstId: link.dataset.instId });
                });
            });
        } else {
            institutionsFlyoutList.innerHTML = '<li><span class="submenu-item text-muted">Nenhuma instituição</span></li>';
        }
    }
    
    function switchView(viewName, params = {}) {
        state.currentView = viewName;
        Object.values(views).forEach(view => view.classList.add('d-none'));

        const targetView = views[viewName];
        if (targetView) {
            targetView.classList.remove('d-none');
            renderView(viewName, params);
        }

        navLinks.forEach(link => {
            if (link.dataset.view === viewName) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });
    }

    function renderView(viewName, params) {
        switch (viewName) {
            case 'profile':
                renderProfileView(views.profile, state.user, state.institutions, modals);
                break;
            case 'dashboard':
                renderDashboardView(views.dashboard, state.user, state.institutions, switchView);
                break;
            case 'institutions':
                renderInstitutionsView(views.institutions, state.institutions, params, modals, { switchView, renderTurmaDetailView: customRenderTurmaDetailView });
                break;
            case 'creation':
                renderCreationView(views.creation);
                break;
            case 'activeTurmas':
                renderActiveTurmasView(views.activeTurmas);
                break;
            case 'settings':
                renderSettingsView(views.settings);
                break;
            case 'turmaDetail':
                // Handled by customRenderTurmaDetailView
                break;
        }
    }
    
    function customRenderTurmaDetailView(turmaDetalhada) {
        const disciplina = state.disciplines.find(d => d.id === turmaDetalhada.discipline.id);
        if (disciplina) {
            const courseFromState = state.courses.find(c => c.id === disciplina.courseId);
            turmaDetalhada.course = { ...(courseFromState || turmaDetalhada.course || {}), name: (courseFromState?.name || turmaDetalhada.course?.name || 'Curso') };
            turmaDetalhada.institution = state.institutions.find(i => i.id === (turmaDetalhada.course.institutionId || null)) || turmaDetalhada.institution;

            switchView('turmaDetail');
            const disciplineForRender = {
                ...turmaDetalhada.discipline,
                name: turmaDetalhada.discipline?.name ?? '',
                course: turmaDetalhada.course
            };
            renderTurmaDetailView(turmaDetalhada, disciplineForRender, modals);
        } else {
            showToast('Erro: disciplina da turma não encontrada.', 'error');
        }
    }

    async function init() {
        document.getElementById('confirm-delete-institution-btn').addEventListener('click', async (e) => {
            const id = e.currentTarget.dataset.instId;
            try {
                await ApiService.deleteInstitution(id);
                showToast('Instituição excluída com sucesso! Atualizando...', 'success');
                modals.deleteInstitutionModal.hide();
                setTimeout(() => window.location.reload(), 1500);
            } catch (error) {
                showToast(`Erro ao excluir instituição: ${error.message}`, 'error');
            }
        });

        document.getElementById('confirm-delete-course-btn').addEventListener('click', async (e) => {
            const id = e.currentTarget.dataset.courseId;
            try {
                await ApiService.deleteCourse(id);
                showToast('Curso excluído com sucesso! Atualizando...', 'success');
                modals.deleteCourseModal.hide();
                setTimeout(() => window.location.reload(), 1500);
            } catch (error) {
                showToast(`Erro ao excluir curso: ${error.message}`, 'error');
            }
        });

        document.getElementById('confirm-delete-discipline-btn').addEventListener('click', async (e) => {
            const id = e.currentTarget.dataset.disciplineId;
            try {
                await ApiService.deleteDiscipline(id);
                showToast('Disciplina excluída com sucesso! Atualizando...', 'success');
                modals.deleteDisciplineModal.hide();
                setTimeout(() => window.location.reload(), 1500);
            } catch (error) {
                showToast(`Erro ao excluir disciplina: ${error.message}`, 'error');
            }
        });

        document.getElementById('confirm-delete-turma-btn').addEventListener('click', async (e) => {
            const id = e.currentTarget.dataset.turmaId;
            try {
                await ApiService.deleteTurma(id);
                showToast('Turma excluída com sucesso! Atualizando...', 'success');
                modals.deleteTurmaModal.hide();
                setTimeout(() => window.location.reload(), 1500);
            } catch (error) {
                showToast(`Erro ao excluir turma: ${error.message}`, 'error');
            }
        });

        document.getElementById('confirm-edit-turma-btn')?.addEventListener('click', async (e) => {
            const id = e.currentTarget.dataset.turmaId;
            const nome = document.getElementById('edit-turma-name').value;
            const semestre = document.getElementById('edit-turma-semestre').value;
            const periodo = document.getElementById('edit-turma-periodo').value;
            const password = document.getElementById('current-password-edit-turma').value;
            
            if (!nome || !password) {
                showToast("Nome da turma e senha são obrigatórios.", "error");
                return;
            }
    
            try {
                await ApiService.updateTurma(id, { nome, semestre, periodo, password });
                showToast('Turma atualizada com sucesso! A página será recarregada.', 'success');
                modals.editTurmaModal.hide();
                setTimeout(() => window.location.reload(), 1500);
            } catch (error) {
                showToast(`Erro ao atualizar turma: ${error.message}`, 'error');
            }
        });
        
        document.getElementById('confirm-edit-institution-btn').addEventListener('click', async (e) => {
            const id = e.currentTarget.dataset.instId;
            const name = document.getElementById('edit-institution-name').value;
            const password = document.getElementById('current-password-edit-inst').value;
        
            if (!name || !password) {
                showToast('Preencha o nome e a senha.', 'error');
                return;
            }
        
            try {
                await ApiService.updateInstitution(id, { nome: name, password });
                showToast('Instituição atualizada com sucesso! Atualizando...', 'success');
                modals.editInstitutionModal.hide();
                setTimeout(() => window.location.reload(), 1500);
            } catch (error) {
                showToast(`Erro ao atualizar: ${error.message}`, 'error');
            }
        });
        
        document.getElementById('confirm-edit-course-btn').addEventListener('click', async (e) => {
            const id = e.currentTarget.dataset.courseId;
            const name = document.getElementById('edit-course-name').value;
            const sigla = document.getElementById('edit-course-sigla').value;
            const semestres = document.getElementById('edit-course-semestres').value;
            const password = document.getElementById('current-password-edit-course').value;
        
            if (!name || !sigla || !semestres || !password) {
                showToast('Preencha todos os campos e a senha.', 'error');
                return;
            }
        
            try {
                await ApiService.updateCourse(id, { nome: name, sigla, semestres: parseInt(semestres), password });
                showToast('Curso atualizado com sucesso! Atualizando...', 'success');
                modals.editCourseModal.hide();
                setTimeout(() => window.location.reload(), 1500);
            } catch (error) {
                showToast(`Erro ao atualizar: ${error.message}`, 'error');
            }
        });
        
        document.getElementById('confirm-edit-discipline-btn').addEventListener('click', async (e) => {
            const id = e.currentTarget.dataset.disciplineId;
            const name = document.getElementById('edit-discipline-name').value;
            const sigla = document.getElementById('edit-discipline-sigla').value;
            const periodo = document.getElementById('edit-discipline-period').value;
            const courseId = document.getElementById('edit-discipline-course-select-move').value;
            const password = document.getElementById('current-password-edit-disc').value;
        
            if (!name || !sigla || !periodo || !courseId || !password) {
                showToast('Preencha todos os campos e a senha.', 'error');
                return;
            }
        
            try {
                await ApiService.updateDiscipline(id, { 
                    nome: name, 
                    sigla, 
                    periodo, 
                    idCurso: parseInt(courseId), 
                    password 
                });
                showToast('Disciplina atualizada com sucesso! Atualizando...', 'success');
                modals.editDisciplineModal.hide();
                setTimeout(() => window.location.reload(), 1500);
            } catch (error) {
                showToast(`Erro ao atualizar: ${error.message}`, 'error');
            }
        });

        document.getElementById('confirm-add-institution-btn').addEventListener('click', async () => {
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

        document.getElementById('confirm-add-course-btn').addEventListener('click', async (e) => {
            const instId = e.currentTarget.dataset.instId;
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

        document.getElementById('confirm-add-discipline-btn').addEventListener('click', async (e) => {
            const courseId = e.currentTarget.dataset.courseId;
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

        sidebarToggler.addEventListener('click', () => {
            document.body.classList.toggle('sidebar-collapsed');
            const icon = sidebarToggler.querySelector('i');
            icon.classList.toggle('bi-chevron-left');
            icon.classList.toggle('bi-chevron-right');
        });

        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const viewName = link.dataset.view;
                if (viewName) {
                    switchView(viewName);
                }
            });
        });

        confirmLogoutBtn.addEventListener('click', handleLogout);

        initSettingsView({ logoutModal: modals.logoutModal });
        initActiveTurmasView({ switchView, renderTurmaDetailView: customRenderTurmaDetailView });
        initCreationView(async (institutionId) => {
            await fetchData();
            switchView('institutions', { expandInstId: institutionId });
        });
        
        await fetchData();
        switchView(state.currentView);
    }

    init();
});