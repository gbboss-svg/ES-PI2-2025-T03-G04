// Import services
import * as ApiService from './services/ApiService.js';
import { showToast } from './services/NotificationService.js';

// Import views
import { renderDashboardView } from './views/DashboardView.js';
import { renderProfileView } from './views/ProfileView.js';
import { renderInstitutionsView } from './views/InstitutionsView.js';
import { initCreationView, renderCreationView } from './views/CreationView.js';
import { initActiveTurmasView, renderActiveTurmasView } from './views/ActiveTurmasView.js';
import { initSettingsView, renderSettingsView } from './views/SettingsView.js';
import { renderTurmaDetailView } from './views/TurmaDetailView.js';

document.addEventListener('DOMContentLoaded', () => {
    // --- State Management ---
    const state = {
        user: null,
        institutions: [],
        courses: [],
        disciplines: [],
        activeTurmas: [],
        currentView: 'profile',
    };

    // --- DOM Element References ---
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

    // --- Modal Instances ---
    const modals = {
        logoutModal: new bootstrap.Modal(document.getElementById('logoutModal')),
        addInstitutionModal: new bootstrap.Modal(document.getElementById('addInstitutionModal')),
        addCourseModal: new bootstrap.Modal(document.getElementById('addCourseModal')),
        addDisciplineModal: new bootstrap.Modal(document.getElementById('addDisciplineModal')),
        deleteInstitutionModal: new bootstrap.Modal(document.getElementById('deleteInstitutionModal')),
        deleteCourseModal: new bootstrap.Modal(document.getElementById('deleteCourseModal')),
        deleteDisciplineModal: new bootstrap.Modal(document.getElementById('deleteDisciplineModal')),
        deleteTurmaModal: new bootstrap.Modal(document.getElementById('deleteTurmaModal')),
        editTurmaModal: new bootstrap.Modal(document.getElementById('editTurmaModal')),
        editDisciplineModal: new bootstrap.Modal(document.getElementById('editDisciplineModal')),
        addStudentModal: new bootstrap.Modal(document.getElementById('addStudentModal')),
        deleteStudentModal: new bootstrap.Modal(document.getElementById('deleteStudentModal')),
        finalizeSemesterModal: new bootstrap.Modal(document.getElementById('finalizeSemesterModal')),
        reopenTurmaModal: new bootstrap.Modal(document.getElementById('reopenTurmaModal')),
        csvConflictModal: new bootstrap.Modal(document.getElementById('csvConflictModal')),
    };

    // --- Event Handlers ---
    function handleLogout() {
        localStorage.removeItem('token');
        window.location.href = '/login';
    }

    // --- Data Fetching and State Update ---
    async function fetchData() {
        // Use Promise.allSettled for robust parallel fetching
        const results = await Promise.allSettled([
            ApiService.getProfessorProfile(),
            ApiService.getInstitutions(),
            ApiService.getCourses(),
            ApiService.getProfessorDisciplines(),
            ApiService.getActiveTurmas()
        ]);

        const [userResult, institutionsResult, coursesResult, disciplinesResult, activeTurmasResult] = results;

        // User profile is critical. If it fails, log out.
        if (userResult.status === 'rejected') {
            showToast(`Erro ao carregar seu perfil: ${userResult.reason.message}. Você será desconectado.`, 'error');
            setTimeout(handleLogout, 3000);
            return; // Stop further execution
        }
        state.user = userResult.value;

        // Handle institutions
        const institutions = institutionsResult.status === 'fulfilled' ? institutionsResult.value : [];
        if (institutionsResult.status === 'rejected') {
            showToast(`Não foi possível carregar as instituições: ${institutionsResult.reason.message}`, 'error');
        }

        // Handle courses
        const courses = coursesResult.status === 'fulfilled' ? coursesResult.value : [];
        if (coursesResult.status === 'rejected') {
            showToast(`Não foi possível carregar os cursos: ${coursesResult.reason.message}`, 'error');
        }

        // Handle disciplines
        const disciplines = disciplinesResult.status === 'fulfilled' ? disciplinesResult.value : [];
        if (disciplinesResult.status === 'rejected') {
            showToast(`Não foi possível carregar as disciplinas: ${disciplinesResult.reason.message}`, 'error');
        }
        
        // Handle active turmas
        state.activeTurmas = activeTurmasResult.status === 'fulfilled' ? activeTurmasResult.value : [];
        if (activeTurmasResult.status === 'rejected') {
            showToast(`Não foi possível carregar as turmas ativas: ${activeTurmasResult.reason.message}`, 'error');
        }

        // Assign to state for other parts of the app
        state.courses = courses;
        state.disciplines = disciplines;

        // Structure institutions with courses and disciplines
        state.institutions = institutions.map(inst => ({
            ...inst,
            courses: courses.filter(c => c.institutionId === inst.id).map(course => ({
                ...course,
                disciplines: disciplines.filter(d => d.courseId === course.id)
            }))
        }));
        
        updateInstitutionsFlyout();
    }

    // --- UI Rendering ---
    
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
    
    // --- View Switching ---
    function switchView(viewName, params = {}) {
        state.currentView = viewName;
        Object.values(views).forEach(view => view.classList.add('d-none'));

        const targetView = views[viewName];
        if (targetView) {
            targetView.classList.remove('d-none');
            renderView(viewName, params);
        }

        // Update active nav link
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
                renderActiveTurmasView(views.activeTurmas, state.activeTurmas);
                break;
            case 'settings':
                renderSettingsView(views.settings);
                break;
            case 'turmaDetail':
                // This case is handled by customRenderTurmaDetailView to ensure data is passed
                break;
        }
    }
    
    // Custom renderer to handle view switching
    function customRenderTurmaDetailView(turmaDetalhada) {
        const disciplina = state.disciplines.find(d => d.id === turmaDetalhada.discipline.id);
        if (disciplina) {
             // Attach the full course and institution objects
            const course = state.courses.find(c => c.id === disciplina.courseId);
            turmaDetalhada.course = course || turmaDetalhada.course;
            turmaDetalhada.institution = state.institutions.find(i => i.id === (course ? course.institutionId : null)) || turmaDetalhada.institution;

            switchView('turmaDetail');
            renderTurmaDetailView(turmaDetalhada, { ...disciplina, course: turmaDetalhada.course }, modals);
        } else {
            showToast('Erro: disciplina da turma não encontrada.', 'error');
        }
    }


    // --- Initialization ---
    async function init() {
        // Sidebar Toggler
        sidebarToggler.addEventListener('click', () => {
            document.body.classList.toggle('sidebar-collapsed');
            const icon = sidebarToggler.querySelector('i');
            icon.classList.toggle('bi-chevron-left');
            icon.classList.toggle('bi-chevron-right');
        });

        // Navigation
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const viewName = link.dataset.view;
                if (viewName) {
                    switchView(viewName);
                }
            });
        });

        // Logout
        confirmLogoutBtn.addEventListener('click', handleLogout);

        // Init view modules that require callbacks
        initSettingsView({ logoutModal: modals.logoutModal });
        initActiveTurmasView({ switchView, renderTurmaDetailView: customRenderTurmaDetailView });
        initCreationView(async (institutionId) => {
            await fetchData();
            switchView('institutions', { expandInstId: institutionId });
        });
        
        // Fetch initial data and render
        await fetchData();
        switchView(state.currentView);
    }

    init();
});