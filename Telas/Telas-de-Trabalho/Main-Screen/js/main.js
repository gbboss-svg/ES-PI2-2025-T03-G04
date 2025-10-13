import { MOCK_DATA } from './data/mock.js';
import { renderProfileView } from './components/profileView.js';
import { renderDashboardView } from './components/dashboardView.js';
import { renderInstitutions, renderInstitutionsFlyout } from './components/institutionsView.js';
import { renderActiveTurmasView } from './components/activeTurmasView.js';
import { renderCreationView } from './components/creationView.js';
import { renderSettingsView } from './components/settingsView.js';
import { renderTurmaDetailView } from './components/turmaDetailView.js';
import { addAuditLog, setRenderTurmaDetailViewCallback } from './components/auditLog.js';
import { createSnapshot } from './utils/helpers.js';

document.addEventListener('DOMContentLoaded', function() {
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
    const logoutModal = new bootstrap.Modal(document.getElementById('logoutModal'));
    const addInstitutionModal = new bootstrap.Modal(document.getElementById('addInstitutionModal'));
    const editDisciplineModal = new bootstrap.Modal(document.getElementById('editDisciplineModal'));
    const addStudentModal = new bootstrap.Modal(document.getElementById('addStudentModal'));
    const finalizeSemesterModal = new bootstrap.Modal(document.getElementById('finalizeSemesterModal'));
    const reopenTurmaModal = new bootstrap.Modal(document.getElementById('reopenTurmaModal'));
    
    let currentTurmaContext = {}; 

    function switchView(viewName) {
        Object.values(views).forEach(v => v.classList.add('d-none'));
        if (views[viewName]) {
            views[viewName].classList.remove('d-none');
        }
        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.dataset.view === viewName) {
                link.classList.add('active');
            }
        });
    }

    const boundRenderTurmaDetailView = (turma, disciplina) => renderTurmaDetailView(turma, disciplina, views, MOCK_DATA, addStudentModal, finalizeSemesterModal, reopenTurmaModal, boundRenderInstitutions, boundRenderInstitutionsFlyout, boundRenderDashboardView, boundRenderActiveTurmasView, alert);
    const boundRenderInstitutions = () => renderInstitutions(views, MOCK_DATA, switchView, boundRenderTurmaDetailView, editDisciplineModal);
    const boundRenderInstitutionsFlyout = () => renderInstitutionsFlyout(MOCK_DATA, switchView, boundRenderTurmaDetailView);
    const boundRenderDashboardView = () => renderDashboardView(views, MOCK_DATA, switchView);
    const boundRenderActiveTurmasView = () => renderActiveTurmasView(views, MOCK_DATA, switchView, boundRenderTurmaDetailView);
    const boundRenderCreationView = () => renderCreationView(views, MOCK_DATA, switchView, boundRenderInstitutions, boundRenderInstitutionsFlyout, boundRenderDashboardView, boundRenderActiveTurmasView);
    const boundRenderProfileView = () => renderProfileView(views, MOCK_DATA, addInstitutionModal, boundRenderInstitutions, boundRenderInstitutionsFlyout, boundRenderDashboardView, boundRenderCreationView, boundRenderActiveTurmasView, alert);
    
    setRenderTurmaDetailViewCallback(boundRenderTurmaDetailView);

    function init() {
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                switchView(e.currentTarget.dataset.view);
            });
        });

        const sidebarToggler = document.getElementById('sidebarToggler');
        const togglerIcon = sidebarToggler.querySelector('i');
        sidebarToggler.addEventListener('click', () => {
            document.body.classList.toggle('sidebar-collapsed');
            togglerIcon.className = document.body.classList.contains('sidebar-collapsed') ? 'bi bi-chevron-right' : 'bi bi-chevron-left';
        });
        
        document.getElementById('confirm-logout-btn').addEventListener('click', () => {
            logoutModal.hide();
            document.body.innerHTML = `<div class="vh-100 d-flex justify-content-center align-items-center"><h1>Você saiu do sistema.</h1></div>`;
        });
        
        document.getElementById('confirm-edit-discipline-btn').addEventListener('click', (e) => {
            if (!document.getElementById('current-password-edit').value) { alert('Confirme sua senha para salvar.'); return; }
            const { instId, discId } = e.currentTarget.dataset;
            const disc = MOCK_DATA.institutions.find(i => i.id == instId).disciplines.find(d => d.id == discId);
            disc.name = document.getElementById('edit-discipline-name').value;
            disc.code = document.getElementById('edit-discipline-code').value;
            disc.period = document.getElementById('edit-discipline-period').value;
            disc.maxGrade = parseFloat(document.getElementById('edit-discipline-max-grade').value) || 10;
            document.getElementById('edit-discipline-form').reset();
            editDisciplineModal.hide();
            boundRenderInstitutions(); 
            boundRenderInstitutionsFlyout(); 
            boundRenderDashboardView(); 
            boundRenderActiveTurmasView();
            alert('Disciplina atualizada com sucesso!');
        });

        document.getElementById('confirm-add-student-btn').addEventListener('click', () => {
            const studentIdInput = document.getElementById('new-student-id');
            const studentNameInput = document.getElementById('new-student-name');
            if(studentIdInput.value && studentNameInput.value) {
                const snapshot = createSnapshot(currentTurmaContext.turma);
                currentTurmaContext.turma.students.push({
                    id: parseInt(studentIdInput.value), name: studentNameInput.value, grades: {}
                });
                addAuditLog(`Aluno "${studentNameInput.value}" (matrícula: ${studentIdInput.value}) adicionado.`, snapshot);
                document.getElementById('add-student-form').reset();
                addStudentModal.hide();
                boundRenderTurmaDetailView(currentTurmaContext.turma, currentTurmaContext.disciplina);
            } else {
                alert('Por favor, preencha todos os campos.');
            }
        });

        document.getElementById('confirm-finalize-btn').addEventListener('click', () => {
            const snapshot = createSnapshot(currentTurmaContext.turma);
            currentTurmaContext.turma.isFinalized = true;
            addAuditLog(`Semestre da turma "${currentTurmaContext.turma.name}" foi finalizado e bloqueado.`, snapshot);
            finalizeSemesterModal.hide();
            boundRenderTurmaDetailView(currentTurmaContext.turma, currentTurmaContext.disciplina);
            boundRenderInstitutions(); 
            boundRenderInstitutionsFlyout(); 
            boundRenderDashboardView(); 
            boundRenderActiveTurmasView();
        });
        
        document.getElementById('confirm-reopen-btn').addEventListener('click', () => {
            const passwordInput = document.getElementById('current-password-reopen');
            if (passwordInput.value) { // In a real app, you'd validate this password
                const snapshot = createSnapshot(currentTurmaContext.turma);
                currentTurmaContext.turma.isFinalized = false;
                addAuditLog(`A turma "${currentTurmaContext.turma.name}" foi reaberta para edição.`, snapshot);
                passwordInput.value = '';
                reopenTurmaModal.hide();
                boundRenderTurmaDetailView(currentTurmaContext.turma, currentTurmaContext.disciplina);
                boundRenderInstitutions(); 
                boundRenderInstitutionsFlyout(); 
                boundRenderDashboardView(); 
                boundRenderActiveTurmasView();
            } else {
                alert('Por favor, insira sua senha para continuar.');
            }
        });
        
        boundRenderProfileView(); 
        boundRenderDashboardView(); 
        boundRenderInstitutions(); 
        boundRenderInstitutionsFlyout(); 
        boundRenderCreationView(); 
        renderSettingsView(views, logoutModal); 
        boundRenderActiveTurmasView();
        switchView('profile');
    }

    init();
});
