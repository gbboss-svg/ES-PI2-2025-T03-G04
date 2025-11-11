// --- ESTADO DA APLICAÇÃO ---
export const appState = {
    user: {},
    institutions: [],
    activeTurmas: [],
    // ... outros dados de estado global
};

export let currentTurmaContext = {};

export function setAppState(newState) {
    Object.assign(appState, newState);
}

export function setCurrentTurmaContext(context) {
    currentTurmaContext = context;
}
