/**
 * Exibe uma notificação toast.
 * @param {string} message - A mensagem a ser exibida.
 * @param {string} type - O tipo de toast ('success', 'error', 'info').
 */
export function showToast(message, type = 'info') {
    const toastContainer = document.querySelector('.toast-container');
    if (!toastContainer) return;

    const toastId = `toast-${Date.now()}`;
    const toastHeaderClass = {
        success: 'bg-success text-white',
        error: 'bg-danger text-white',
        info: 'bg-primary text-white',
    }[type];

    const toastHtml = `
        <div id="${toastId}" class="toast" role="alert" aria-live="assertive" aria-atomic="true">
            <div class="toast-header ${toastHeaderClass}">
                <strong class="me-auto">Notificação</strong>
                <button type="button" class="btn-close btn-close-white" data-bs-dismiss="toast" aria-label="Close"></button>
            </div>
            <div class="toast-body">
                ${message}
            </div>
        </div>
    `;

    toastContainer.insertAdjacentHTML('beforeend', toastHtml);

    const toastElement = document.getElementById(toastId);
    const toast = new bootstrap.Toast(toastElement, {
        delay: 5000 // 5 segundos
    });

    toast.show();

    // Remove o elemento do DOM após o toast ser ocultado
    toastElement.addEventListener('hidden.bs.toast', () => {
        toastElement.remove();
    });
}
