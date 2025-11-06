import { MOCK_DATA } from './services/DataService.js';
import { addAuditLog } from './services/AuditService.js';
import { createSnapshot } from './utils/helpers.js';
//testes!
// Importa as funções de renderização das views
import { renderProfileView, initProfileViewModals } from './views/ProfileView.js';
import { renderDashboardView } from './views/DashboardView.js';
import { renderInstitutionsView, initInstitutionsView } from './views/InstitutionsView.js';
import { renderCreationView, initCreationView } from './views/CreationView.js';
import { renderActiveTurmasView, initActiveTurmasView } from './views/ActiveTurmasView.js';
import { renderTurmaDetailView, initTurmaDetailViewModals } from './views/TurmaDetailView.js';
import { renderSettingsView, initSettingsView } from './views/SettingsView.js';

document.addEventListener('DOMContentLoaded', function() {
    // --- NOVO PONTO DE INJEÇÃO PARA DADOS ---
    const mainDataRoot = document.getElementById('main-data-root');
    const navLinks = document.querySelectorAll('.sidebar .nav-link');

    // --- INICIALIZAÇÃO DOS MODAIS DO BOOTSTRAP ---
    const modals = {
        logoutModal: new bootstrap.Modal(document.getElementById('logoutModal')),
        addInstitutionModal: new bootstrap.Modal(document.getElementById('addInstitutionModal')),
        addCourseModal: new bootstrap.Modal(document.getElementById('addCourseModal')),
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
    let currentTurmaContext = {};

    // --- FUNÇÕES PRINCIPAIS ---

    /**
     * Alterna a visibilidade das views.
     * @param {string} viewName - O nome da view a ser exibida.
     * @param {object} params - Parâmetros opcionais para a view.
     */
    async function switchView(viewName, params = {}) {
        mainDataRoot.innerHTML = '';
        switch (viewName) {
            case 'profile':
                renderProfileView(mainDataRoot);
                break;
            case 'dashboard':
                renderDashboardView(mainDataRoot, switchView);
                break;
            case 'institutions':
                await renderInstitutionsView(mainDataRoot, params);
                break;
            case 'creation':
                renderCreationView(mainDataRoot);
                break;
            case 'activeTurmas':
                renderActiveTurmasView(mainDataRoot);
                break;
            case 'settings':
                renderSettingsView(mainDataRoot);
                break;
        }
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

        MOCK_DATA.institutions.forEach(inst => {
            html += `<li class="px-3 py-1 text-muted text-uppercase small fw-bold">${inst.name}</li>`;
            if (inst.disciplines.length > 0) {
                inst.disciplines.forEach(disc => {
                    disc.turmas.forEach(turma => {
                        html += `
                            <li>
                                <a href="#" title="${disc.name} - ${turma.name}" class="submenu-item view-turma-flyout" data-inst-id="${inst.id}" data-disc-id="${disc.id}" data-turma-id="${turma.id}">
                                    ${disc.name} - ${turma.name} ${turma.isFinalized ? '(Finalizada)' : ''}
                                </a>
                            </li>
                        `;
                    });
                });
            } else {
                html += `<li><span class="submenu-item text-muted fst-italic px-3">Nenhuma disciplina</span></li>`;
            }
             html += `<li><hr class="dropdown-divider my-2"></li>`;
        });

        flyoutList.innerHTML = html;

        flyoutList.querySelectorAll('.view-turma-flyout').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const inst = MOCK_DATA.institutions.find(i => i.id == btn.dataset.instId);
                const disc = inst.disciplines.find(d => d.id == btn.dataset.discId);
                const turma = disc.turmas.find(t => t.id == btn.dataset.turmaId);
                renderTurmaDetailView(turma, disc);
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
        // Atualiza componentes globais como o flyout
        renderInstitutionsFlyout();
        // Re-renderiza a view atual
        const activeLink = Array.from(navLinks).find(link => link.classList.contains('active'));
        if (activeLink) {
            switchView(activeLink.dataset.view);
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

    document.getElementById('confirm-add-institution-btn').addEventListener('click', () => {
        const newInstNameInput = document.getElementById('new-institution-name');
        if(newInstNameInput.value && document.getElementById('current-password-inst').value) {
            MOCK_DATA.institutions.push({ id: Date.now(), name: newInstNameInput.value, courses: [], disciplines: [] });
            document.getElementById('add-institution-form').reset();
            modals.addInstitutionModal.hide();
            renderAll();
            alert(`Instituição "${newInstNameInput.value}" adicionada com sucesso!`);
        } else {
            alert('Por favor, preencha todos os campos.');
        }
    });

    document.getElementById('confirm-add-course-btn').addEventListener('click', (e) => {
        const newCourseNameInput = document.getElementById('new-course-name');
        const instId = e.currentTarget.dataset.instId;
        if(newCourseNameInput.value && document.getElementById('current-password-course').value) {
            const inst = MOCK_DATA.institutions.find(i => i.id == instId);
            if (inst) {
                inst.courses.push({ id: Date.now(), name: newCourseNameInput.value });
                document.getElementById('add-course-form').reset();
                modals.addCourseModal.hide();
                renderAll();
                alert(`Curso "${newCourseNameInput.value}" adicionado a ${inst.name} com sucesso!`);
            }
        } else {
            alert('Por favor, preencha todos os campos.');
        }
    });

    document.getElementById('confirm-add-student-btn').addEventListener('click', () => {
        const studentIdInput = document.getElementById('new-student-id');
        const studentNameInput = document.getElementById('new-student-name');
        if(studentIdInput.value && studentNameInput.value) {
            const { turma, disciplina } = currentTurmaContext;
            const snapshot = createSnapshot(turma);
            turma.students.push({
                id: parseInt(studentIdInput.value), name: studentNameInput.value, grades: {}
            });
            addAuditLog(`Aluno "${studentNameInput.value}" (matrícula: ${studentIdInput.value}) adicionado.`, snapshot);
            document.getElementById('add-student-form').reset();
            modals.addStudentModal.hide();
            renderTurmaDetailView(turma, disciplina); // Re-renderiza a view da turma
        } else {
            alert('Por favor, preencha todos os campos.');
        }
    });
    
    // ... (outros event listeners de modais) ...
    // O código para os outros modais (edit, delete, finalize, reopen) será adicionado aqui.
    // Por brevidade, eles foram omitidos, mas a estrutura é a mesma.

    // --- INICIALIZAÇÃO DA APLICAÇÃO ---
    function init() {
        // Passa as instâncias dos modais e callbacks para as views que precisam deles
        initProfileViewModals(modals);
        initSettingsView(modals);
        initTurmaDetailViewModals(modals);
        initInstitutionsView(modals, { switchView, renderTurmaDetailView });
        initActiveTurmasView({ switchView, renderTurmaDetailView });
        initCreationView((createdInInstId) => {
            renderAll();
            switchView('institutions', { expandInstId: createdInInstId });
        });

        // Renderiza os componentes iniciais
        renderInstitutionsFlyout();

        // Define a view inicial
        switchView('profile');
    }

    init();
});
