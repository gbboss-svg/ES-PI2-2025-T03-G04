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
        activeTurmas: [],
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
        'finalizeSemesterModal', 'reopenTurmaModal', 'csvConflictModal'
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
            ApiService.getActiveTurmas()
        ]);

        const [userResult, institutionsResult, coursesResult, disciplinesResult, activeTurmasResult] = results;

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
        
        state.activeTurmas = activeTurmasResult.status === 'fulfilled' ? activeTurmasResult.value : [];
        if (activeTurmasResult.status === 'rejected') {
            showToast(`Não foi possível carregar as turmas ativas: ${activeTurmasResult.reason.message}`, 'error');
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