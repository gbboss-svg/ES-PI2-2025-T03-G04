export function createSnapshot(data) {
    return JSON.parse(JSON.stringify(data));
}

export function calculateFinalGrade(grades, formula, components) {
    if (!formula || components.length === 0) return 0;
    let formulaToEvaluate = formula;
    for(const comp of components) {
        const grade = grades[comp.acronym] ?? 0;
        const regex = new RegExp(`\\b${comp.acronym}\\b`, 'g');
        formulaToEvaluate = formulaToEvaluate.replace(regex, grade);
    }
    try {
        const result = new Function(`return ${formulaToEvaluate}`)();
        return !isFinite(result) ? NaN : result; // Return NaN for Infinity/-Infinity
    } catch (e) {
        console.error("Erro ao calcular fórmula:", e);
        return NaN;
    }
}

export function adjustGrade(grade) {
    const decimal = grade - Math.floor(grade);
    if (decimal <= 0.25) return Math.floor(grade);
    if (decimal > 0.25 && decimal <= 0.75) return Math.floor(grade) + 0.5;
    return Math.ceil(grade);
}

export function testAndValidateFormula(formula, disciplina) {
    const validation = validateFormula(formula, disciplina.gradeComponents);
    if (!validation.valid) {
        return { valid: false, message: validation.message };
    }

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
    if (result > disciplina.maxGrade * 1.01) { // 1% tolerance for floating point issues
        return { valid: false, message: `O resultado do teste (${result.toFixed(2)}) excede a nota máxima da disciplina (${disciplina.maxGrade}).` };
    }

    return { valid: true, message: 'Fórmula válida e testada com sucesso!', testResult: result };
}

export function validateFormula(formula, components) {
    const validAcronyms = components.map(c => c.acronym);
    if (!formula.trim()) {
        return { valid: true, message: 'Digite a fórmula.' };
    }
    const variablesInFormula = formula.match(/(?<!['"])\b[a-zA-Z_][a-zA-Z0-9_]*\b(?!['"])/g) || [];
    const uniqueVariables = [...new Set(variablesInFormula)];

    for (const variable of uniqueVariables) {
        if (!validAcronyms.includes(variable)) {
            return { valid: false, message: `Erro: Atividade "${variable}" não existe.` };
        }
    }

    try {
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
