import { views, navLinks } from './ui.js';
import { appState } from './state.js';
import { renderProfileView } from './views/ProfileView.js';
import { renderDashboardView } from './views/DashboardView.js';
import { renderInstitutionsView } from './views/InstitutionsView.js';
import { renderCreationView } from './views/CreationView.js';
import { renderActiveTurmasView } from './views/ActiveTurmasView.js';
import { renderTurmaDetailView } from './views/TurmaDetailView.js';
import { renderSettingsView } from './views/SettingsView.js';

/**
 * Alterna a visibilidade das views.
 * @param {string} viewName - O nome da view a ser exibida.
 * @param {object} params - Parâmetros opcionais para a view.
 */
export function switchView(viewName, params = {}) {
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
export function renderInstitutionsFlyout() {
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
export function renderAll() {
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
