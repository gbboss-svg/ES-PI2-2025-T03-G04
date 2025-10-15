/**
 * Cria uma cópia profunda (deep copy) de um objeto, útil para criar snapshots de estado.
 * @param {object} data - O objeto a ser clonado.
 * @returns {object} - Uma nova instância do objeto, completamente independente da original.
 */
export function createSnapshot(data) {
    // JSON.parse(JSON.stringify(obj)) é uma maneira simples e eficaz de criar
    // uma cópia profunda de objetos que contêm apenas tipos de dados compatíveis com JSON
    // (objetos, arrays, strings, números, booleanos, null).
    return JSON.parse(JSON.stringify(data));
}
