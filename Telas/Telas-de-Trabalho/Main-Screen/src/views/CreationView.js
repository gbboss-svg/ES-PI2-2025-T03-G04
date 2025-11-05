import { fetchInstitutions, fetchCourses } from '../services/DataService.js';

// Callback para ser chamado após a criação bem-sucedida
let onTurmaCreatedCallback;

/**
 * Inicializa a view de criação com um callback.
 * @param {function} onTurmaCreated - Função a ser chamada quando uma turma for criada.
 */
export function initCreationView(onTurmaCreated) {
    onTurmaCreatedCallback = onTurmaCreated;
}

/**
 * Renderiza a view de criação de turmas.
 * @param {HTMLElement} container - O elemento container onde a view será renderizada.
 */
export async function renderCreationView(container) {
    container.innerHTML = `<div class="alert alert-info">Os dados de instituições e cursos devem ser buscados do backend.</div>`;
}
