/**
 * Calcula a nota final de um aluno com base em uma fórmula e nos componentes de nota.
 * @param {object} grades - Objeto com as notas do aluno (ex: { E1: 8.5, E2: 9.0 }).
 * @param {string} formula - A fórmula matemática para o cálculo (ex: "(E1*0.3) + (E2*0.7)").
 * @param {Array} components - Array de objetos representando os componentes de nota.
 * @returns {number|NaN} - A nota final calculada ou NaN em caso de erro.
 */
export function calculateFinalGrade(grades, formula, components) {
    if (!formula || components.length === 0) return 0;
    let formulaToEvaluate = formula;
    for(const comp of components) {
        const grade = grades[comp.acronym] ?? 0;
        const regex = new RegExp(`\\b${comp.acronym}\\b`, 'g');
        formulaToEvaluate = formulaToEvaluate.replace(regex, grade);
    }
    try {
        // Usar new Function() é uma forma de avaliar a string da fórmula de forma segura.
        const result = new Function(`return ${formulaToEvaluate}`)();
        return !isFinite(result) ? NaN : result; // Retorna NaN para Infinito/-Infinito
    } catch (e) {
        console.error("Erro ao calcular fórmula:", e);
        return NaN;
    }
}

/**
 * Arredonda a nota final para o meio ponto mais próximo (0.0, 0.5, 1.0).
 * @param {number} grade - A nota a ser ajustada.
 * @returns {number} - A nota ajustada.
 */
export function adjustGrade(grade) {
    const decimal = grade - Math.floor(grade);
    if (decimal <= 0.25) return Math.floor(grade);
    if (decimal > 0.25 && decimal <= 0.75) return Math.floor(grade) + 0.5;
    return Math.ceil(grade);
}

/**
 * Valida a sintaxe de uma fórmula.
 * @param {string} formula - A fórmula a ser validada.
 * @param {Array} components - Os componentes de nota válidos.
 * @returns {object} - Um objeto com { valid: boolean, message: string }.
 */
export function validateFormula(formula, components) {
    const validAcronyms = components.map(c => c.acronym);
    if (!formula.trim()) {
        return { valid: true, message: 'Digite a fórmula.' };
    }
    // Encontra todas as "variáveis" (palavras) na fórmula
    const variablesInFormula = formula.match(/(?<!['"])\b[a-zA-Z_][a-zA-Z0-9_]*\b(?!['"])/g) || [];
    const uniqueVariables = [...new Set(variablesInFormula)];

    for (const variable of uniqueVariables) {
        if (!validAcronyms.includes(variable)) {
            return { valid: false, message: `Erro: Atividade "${variable}" não existe.` };
        }
    }

    try {
        // Testa a sintaxe substituindo as siglas por números
        let testFormula = formula;
        validAcronyms.forEach(acronym => {
            const regex = new RegExp(`\\b${acronym}\\b`, 'g');
            testFormula = testFormula.replace(regex, '1');
        });
        new Function(`return ${testFormula}`)();
    } catch (e) {
        return { valid: false, message: 'Erro de sintaxe na fórmula.' };
    }

    return { valid: true, message: 'Fórmula válida!' };
}

/**
 * Testa a fórmula com notas máximas para garantir que não exceda o limite.
 * @param {string} formula - A fórmula a ser testada.
 * @param {object} disciplina - O objeto da disciplina contendo componentes e nota máxima.
 * @returns {object} - Um objeto com { valid: boolean, message: string, testResult?: number }.
 */
export function testAndValidateFormula(formula, disciplina) {
    const validation = validateFormula(formula, disciplina.gradeComponents);
    if (!validation.valid) {
        return { valid: false, message: validation.message };
    }

    // Cria um objeto de notas de exemplo com a nota máxima para cada componente
    const sampleGrades = {};
    disciplina.gradeComponents.forEach(comp => {
        sampleGrades[comp.acronym] = disciplina.maxGrade;
    });

    const result = calculateFinalGrade(sampleGrades, formula, disciplina.gradeComponents);

    if (isNaN(result)) {
        return { valid: false, message: 'A fórmula resultou em um erro de cálculo (ex: divisão por zero).' };
    }
    if (result < 0) { 
         return { valid: false, message: `O resultado do teste (${result.toFixed(2)}) é negativo. A fórmula deve resultar em um valor positivo.` };
    }
    // Adiciona uma pequena tolerância para problemas com ponto flutuante
    if (result > disciplina.maxGrade * 1.01) { 
        return { valid: false, message: `O resultado do teste (${result.toFixed(2)}) excede a nota máxima da disciplina (${disciplina.maxGrade}).` };
    }

    return { valid: true, message: 'Fórmula válida e testada com sucesso!', testResult: result };
}
