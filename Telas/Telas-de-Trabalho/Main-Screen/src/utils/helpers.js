/**
 * Cria uma cópia profunda (deep copy) de um objeto.
 */
export function createSnapshot(data) {
    return JSON.parse(JSON.stringify(data));
}