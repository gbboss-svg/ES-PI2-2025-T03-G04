  /**
   *Desevolvido por:Alex Gabriel Soares Sousa R.A:24802449
   */

/**
 * Cria uma cópia profunda (deep copy) de um objeto.
 */
export function createSnapshot(data) {
    return JSON.parse(JSON.stringify(data));
}