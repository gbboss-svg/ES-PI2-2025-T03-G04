import { loadInitialData } from './data.js';
import { setupGlobalEventListeners } from './eventHandlers.js';
import { switchView, renderAll } from './navigation.js';
import { modals } from './ui.js';
import { appState, setCurrentTurmaContext } from './state.js';
import { showToast } from './services/NotificationService.js';

// Importa as funções de inicialização das views
import { initProfileViewModals } from './views/ProfileView.js';
import { initInstitutionsView } from './views/InstitutionsView.js';
import { initCreationView } from './views/CreationView.js';
import { initActiveTurmasView } from './views/ActiveTurmasView.js';
import { initTurmaDetailViewModals, renderTurmaDetailView } from './views/TurmaDetailView.js';
import { initSettingsView } from './views/SettingsView.js';

document.addEventListener('DOMContentLoaded', function() {
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
                setCurrentTurmaContext({ turma: turmaDetalhada, disciplina: fullDiscipline });
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

        // Configura os event listeners globais
        setupGlobalEventListeners();

        // Carrega os dados da API e então renderiza a UI
        loadInitialData().then(() => {
            // Define a view inicial após os dados serem carregados
            switchView('profile');
        });
    }

    init();
});
