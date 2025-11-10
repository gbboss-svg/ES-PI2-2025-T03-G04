import * as ApiService from './services/ApiService.js';
import { showToast } from './services/NotificationService.js';
import { addAuditLog } from './services/AuditService.js';
import { createSnapshot } from './utils/helpers.js';
// Importa as funções de renderização das views
import { renderProfileView, initProfileViewModals } from './views/ProfileView.js';
import { renderDashboardView } from './views/DashboardView.js';
import { renderInstitutionsView, initInstitutionsView } from './views/InstitutionsView.js';
import { renderCreationView, initCreationView } from './views/CreationView.js';
import { renderActiveTurmasView, initActiveTurmasView } from './views/ActiveTurmasView.js';
import { renderTurmaDetailView, initTurmaDetailViewModals } from './views/TurmaDetailView.js';
import { renderSettingsView, initSettingsView } from './views/SettingsView.js';

document.addEventListener('DOMContentLoaded', function() {
    // --- CACHE DE ELEMENTOS DO DOM ---
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

    // --- INICIALIZAÇÃO DOS MODAIS DO BOOTSTRAP ---
    const modals = {
        logoutModal: new bootstrap.Modal(document.getElementById('logoutModal')),
        addInstitutionModal: new bootstrap.Modal(document.getElementById('addInstitutionModal')),
        addCourseModal: new bootstrap.Modal(document.getElementById('addCourseModal')),
        addDisciplineModal: new bootstrap.Modal(document.getElementById('addDisciplineModal')),
        editTurmaModal: new bootstrap.Modal(document.getElementById('editTurmaModal')),
        editDisciplineModal: new bootstrap.Modal(document.getElementById('editDisciplineModal')),
        addStudentModal: new bootstrap.Modal(document.getElementById('addStudentModal')),
        finalizeSemesterModal: new bootstrap.Modal(document.getElementById('finalizeSemesterModal')),
        reopenTurmaModal: new bootstrap.Modal(document.getElementById('reopenTurmaModal')),
        deleteTurmaModal: new bootstrap.Modal(document.getElementById('deleteTurmaModal')),
        deleteDisciplineModal: new bootstrap.Modal(document.getElementById('deleteDisciplineModal')),
        deleteInstitutionModal: new bootstrap.Modal(document.getElementById('deleteInstitutionModal')),
        deleteCourseModal: new bootstrap.Modal(document.getElementById('deleteCourseModal')),
    };

    // --- ESTADO DA APLICAÇÃO ---
    const appState = {
        user: {},
        institutions: [],
        activeTurmas: [],
        // ... outros dados de estado global
    };
    let currentTurmaContext = {};

    // --- FUNÇÕES DE DADOS ---

    /**
     * Carrega os dados iniciais da aplicação a partir da API.
     */
    async function loadInitialData() {
        try {
            // Isola as chamadas para identificar a falha
            const user = await ApiService.getProfessorProfile();
            appState.user = user;

            const institutions = await ApiService.getInstitutions();

            const courses = await ApiService.getCourses();
            const disciplines = await ApiService.getProfessorDisciplines();

            // Mapeia as disciplinas para seus respectivos cursos
            const coursesWithDisciplines = courses.map(course => ({
                ...course,
                disciplines: disciplines.filter(disc => disc.cursoId === course.id)
            }));

            // Mapeia os cursos para suas respectivas instituições
            const institutionsWithCourses = institutions.map(inst => ({
                ...inst,
                courses: coursesWithDisciplines.filter(course => course.institutionId === inst.id)
            }));

            appState.institutions = institutionsWithCourses;
            
            const activeTurmas = await ApiService.getActiveTurmas();
            appState.activeTurmas = activeTurmas;

            renderAll(); // Re-renderiza os componentes com os novos dados
        } catch (error) {
            console.error("Falha ao carregar dados iniciais:", error);
            showToast(`Erro ao carregar dados: ${error.message}`, 'error');
        }
    }

    // --- FUNÇÕES PRINCIPAIS ---

    /**
     * Alterna a visibilidade das views.
     * @param {string} viewName - O nome da view a ser exibida.
     * @param {object} params - Parâmetros opcionais para a view.
     */
    function switchView(viewName, params = {}) {
        Object.values(views).forEach(v => v.classList.add('d-none'));
        if (views[viewName]) {
            // Renderiza a view específica
            switch (viewName) {
                case 'profile':
                    renderProfileView(views.profile, appState.user, appState.institutions);
                    break;
                case 'dashboard':
                    renderDashboardView(views.dashboard, appState.user, appState.institutions, switchView);
                    break;
                case 'institutions':
                    renderInstitutionsView(views.institutions, appState.institutions, params);
                    break;
                case 'creation':
                    renderCreationView(views.creation);
                    break;
                case 'activeTurmas':
                    renderActiveTurmasView(views.activeTurmas, appState.activeTurmas);
                    break;
                case 'settings':
                    renderSettingsView(views.settings);
                    break;
                case 'turmaDetail':
                    // This case is now handled directly
                    break;
            }
            views[viewName].classList.remove('d-none');
        }
        // Atualiza o estado ativo dos links de navegação
        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.dataset.view === viewName) {
                link.classList.add('active');
            }
        });
    }

    /**
     * Renderiza o menu flutuante de instituições e turmas.
     */
    function renderInstitutionsFlyout() {
        const flyoutList = document.getElementById('institutions-flyout-list');
        if (!flyoutList) return;

        let html = `
            <li>
                <a href="#" class="submenu-item d-flex align-items-center fw-bold cadastrar-novo-flyout">
                    <i class="bi bi-plus-circle me-2"></i>
                    Cadastrar Novo
                </a>
            </li>
            <li><hr class="dropdown-divider my-2"></li>
        `;

        const turmasByInstitution = appState.activeTurmas.reduce((acc, turma) => {
            const { institution } = turma;
            if (!acc[institution.id]) {
                acc[institution.id] = { name: institution.name, turmas: [] };
            }
            acc[institution.id].turmas.push(turma);
            return acc;
        }, {});

        Object.values(turmasByInstitution).forEach(inst => {
            html += `<li class="px-3 py-1 text-muted text-uppercase small fw-bold">${inst.name}</li>`;
            if (inst.turmas.length > 0) {
                inst.turmas.forEach(turma => {
                    html += `
                        <li>
                            <a href="#" title="${turma.discipline.name} - ${turma.name}" class="submenu-item view-turma-flyout" data-turma-id='${JSON.stringify(turma)}'>
                                ${turma.discipline.name} - ${turma.name}
                            </a>
                        </li>
                    `;
                });
            } else {
                html += `<li><span class="submenu-item text-muted fst-italic px-3">Nenhuma turma ativa</span></li>`;
            }
            html += `<li><hr class="dropdown-divider my-2"></li>`;
        });

        flyoutList.innerHTML = html;

        flyoutList.querySelectorAll('.view-turma-flyout').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const turmaData = JSON.parse(btn.dataset.turmaId);
                renderTurmaDetailView(turmaData, turmaData.discipline);
                switchView('turmaDetail');
            });
        });

        flyoutList.querySelector('.cadastrar-novo-flyout').addEventListener('click', (e) => {
            e.preventDefault();
            switchView('creation');
        });
    }

    /**
     * Função para renderizar todas as views e componentes que precisam ser atualizados após uma mudança nos dados.
     */
    function renderAll() {
        // As views individuais são renderizadas sob demanda pelo switchView,
        // mas componentes globais como o flyout precisam ser atualizados.
        renderInstitutionsFlyout();
        // Se a view atual for uma que depende dos dados alterados, ela também precisa ser re-renderizada.
        // Esta lógica pode ser aprimorada para ser mais específica.
        const activeView = Object.keys(views).find(key => !views[key].classList.contains('d-none'));
        if (activeView) {
            switchView(activeView);
        }
    }

    // --- EVENT LISTENERS GLOBAIS ---

    // Navegação principal
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            switchView(e.currentTarget.dataset.view);
        });
    });

    // Toggler da Sidebar
    const sidebarToggler = document.getElementById('sidebarToggler');
    const togglerIcon = sidebarToggler.querySelector('i');
    sidebarToggler.addEventListener('click', () => {
        document.body.classList.toggle('sidebar-collapsed');
        togglerIcon.className = document.body.classList.contains('sidebar-collapsed') ? 'bi bi-chevron-right' : 'bi bi-chevron-left';
    });

    // Lógica dos Modais (ações de confirmação)
    document.getElementById('confirm-logout-btn').addEventListener('click', () => {
        modals.logoutModal.hide();
        document.body.innerHTML = `<div class="vh-100 d-flex justify-content-center align-items-center"><h1>Você saiu do sistema.</h1></div>`;
    });

    document.getElementById('confirm-add-institution-btn').addEventListener('click', async () => {
        const newInstNameInput = document.getElementById('new-institution-name');
        const passwordInput = document.getElementById('current-password-inst');
        const instName = newInstNameInput.value.trim();
        
        if (instName && passwordInput.value) {
            try {
                await ApiService.addInstitution({ nome: instName, password: passwordInput.value });
                document.getElementById('add-institution-form').reset();
                modals.addInstitutionModal.hide();
                await loadInitialData(); // Recarrega os dados para refletir a adição
                showToast(`Instituição "${instName}" adicionada com sucesso!`, 'success');
            } catch (error) {
                showToast(`Erro ao adicionar instituição: ${error.message}`, 'error');
            }
        } else {
            showToast('Por favor, preencha todos os campos.', 'error');
        }
    });

    document.getElementById('confirm-add-course-btn').addEventListener('click', async (e) => {
        const newCourseNameInput = document.getElementById('new-course-name');
        const passwordInput = document.getElementById('current-password-course');
        const courseName = newCourseNameInput.value.trim();
        const instId = e.currentTarget.dataset.instId;

        if (courseName && passwordInput.value && instId) {
            try {
                await ApiService.addCourse({ 
                    nome: courseName, 
                    idInstituicao: parseInt(instId), // Garante que o ID é um número
                    // Adicione outros campos necessários para o curso, se houver
                    sigla: 'N/A', // Valor padrão, ajuste se necessário
                    semestres: 0 // Valor padrão, ajuste se necessário
                });
                document.getElementById('add-course-form').reset();
                modals.addCourseModal.hide();
                await loadInitialData();
                showToast(`Curso "${courseName}" adicionado com sucesso!`, 'success');
            } catch (error) {
                showToast(`Erro ao adicionar curso: ${error.message}`, 'error');
            }
        } else {
            showToast('Por favor, preencha todos os campos.', 'error');
        }
    });

    document.getElementById('confirm-add-discipline-btn').addEventListener('click', async (e) => {
        const newDisciplineNameInput = document.getElementById('new-discipline-name');
        const newDisciplineSiglaInput = document.getElementById('new-discipline-sigla');
        const newDisciplinePeriodoInput = document.getElementById('new-discipline-periodo');
        const disciplineName = newDisciplineNameInput.value.trim();
        const disciplineSigla = newDisciplineSiglaInput.value.trim();
        const disciplinePeriodo = newDisciplinePeriodoInput.value.trim();
        const courseId = e.currentTarget.dataset.courseId;

        if (disciplineName && disciplineSigla && disciplinePeriodo && courseId) {
            try {
                await ApiService.addDiscipline({ 
                    nome: disciplineName, 
                    sigla: disciplineSigla,
                    periodo: disciplinePeriodo,
                    idCurso: parseInt(courseId)
                });
                document.getElementById('add-discipline-form').reset();
                modals.addDisciplineModal.hide();
                await loadInitialData();
                showToast(`Disciplina "${disciplineName}" adicionada com sucesso!`, 'success');
            } catch (error) {
                showToast(`Erro ao adicionar disciplina: ${error.message}`, 'error');
            }
        } else {
            showToast('Por favor, preencha todos os campos.', 'error');
        }
    });

    document.getElementById('confirm-add-student-btn').addEventListener('click', async () => {
        const studentIdInput = document.getElementById('new-student-id');
        const studentNameInput = document.getElementById('new-student-name');
        const studentId = studentIdInput.value;
        const studentName = studentNameInput.value.trim();

        if (studentId && studentName) {
            const { turma, disciplina } = currentTurmaContext;
            try {
                await ApiService.addStudent(turma.id, { id: parseInt(studentId), name: studentName });
                document.getElementById('add-student-form').reset();
                modals.addStudentModal.hide();
                // Recarrega os detalhes da turma para mostrar o novo aluno
                const turmaDetails = await ApiService.getTurmaDetail(turma.id);
                renderTurmaDetailView(turmaDetails.turma, turmaDetails.disciplina);
                showToast(`Aluno "${studentName}" adicionado com sucesso!`, 'success');
            } catch (error) {
                showToast(`Erro ao adicionar aluno: ${error.message}`, 'error');
            }
        } else {
            showToast('Por favor, preencha todos os campos.', 'error');
        }
    });

    document.getElementById('confirm-delete-institution-btn').addEventListener('click', async (e) => {
        const instId = e.currentTarget.dataset.instId;
        if (instId) {
            try {
                await ApiService.deleteInstitution(instId);
                modals.deleteInstitutionModal.hide();
                await loadInitialData();
                showToast('Instituição excluída com sucesso!', 'success');
            } catch (error) {
                showToast(`Erro ao excluir instituição: ${error.message}`, 'error');
            }
        }
    });
    
    // ... (outros event listeners de modais) ...
    // O código para os outros modais (edit, delete, finalize, reopen) será adicionado aqui.
    // Por brevidade, eles foram omitidos, mas a estrutura é a mesma.

    // --- INICIALIZAÇÃO DA APLICAÇÃO ---
    function init() {
        // Wrapper para renderTurmaDetailView que busca a disciplina completa no appState
        const renderTurmaDetailViewWithFullContext = (turmaDetalhada) => {
            let fullDiscipline = null;
            // Procura a disciplina completa no estado da aplicação
            for (const inst of appState.institutions) {
                for (const course of inst.courses) {
                    const foundDisc = course.disciplines.find(d => d.id === turmaDetalhada.discipline.id);
                    if (foundDisc) {
                        fullDiscipline = foundDisc;
                        break;
                    }
                }
                if (fullDiscipline) break;
            }

            if (fullDiscipline) {
                currentTurmaContext = { turma: turmaDetalhada, disciplina: fullDiscipline };
                renderTurmaDetailView(turmaDetalhada, fullDiscipline);
                switchView('turmaDetail');
            } else {
                console.error('Disciplina completa não encontrada no estado da aplicação.', turmaDetalhada.discipline);
                showToast('Erro: Não foi possível carregar os detalhes da disciplina.', 'error');
            }
        };

        // Passa as instâncias dos modais e callbacks para as views que precisam deles
        initProfileViewModals(modals);
        initSettingsView(modals);
        initTurmaDetailViewModals(modals);
        initInstitutionsView(modals, { 
            switchView, 
            renderTurmaDetailView: renderTurmaDetailViewWithFullContext
        });
        initActiveTurmasView({ switchView, renderTurmaDetailView: renderTurmaDetailViewWithFullContext });
        initCreationView((createdInInstId) => {
            renderAll();
            switchView('institutions', { expandInstId: createdInInstId });
        });

        // Carrega os dados da API e então renderiza a UI
        loadInitialData().then(() => {
            // Define a view inicial após os dados serem carregados
            switchView('profile');
        });
    }

    init();
});
