/**
 * Formata um campo individual para ser seguro em um CSV, lidando com vírgulas e aspas.
 * @param {string | number | null | undefined} field - O valor do campo a ser formatado.
 * @returns {string} O campo formatado para CSV.
 */
function formatCsvField(field) {
    const value = field === null || field === undefined ? '' : String(field);
    // Se o campo contém vírgula, aspas ou quebra de linha, ele precisa ser encapsulado em aspas.
    if (value.includes(',') || value.includes('"') || value.includes('\n')) {
        // As aspas dentro do campo devem ser escapadas (duplicadas).
        const escapedValue = value.replace(/"/g, '""');
        return `"${escapedValue}"`;
    }
    return value;
}


/**
 * Converte os dados da turma para o formato CSV de forma robusta.
 */
export function exportTurmaToCsv(turma, disciplina) {
    // Formata os cabeçalhos para serem seguros no CSV
    const headers = ['matricula', 'nome', ...disciplina.gradeComponents.map(c => c.acronym)].map(formatCsvField);

    // Formata cada linha de dados do aluno
    const rows = turma.students.map(student => {
        const rowData = [student.id, student.name];
        disciplina.gradeComponents.forEach(comp => {
            rowData.push(student.grades[comp.acronym] || '');
        });
        // Aplica a formatação a cada célula da linha antes de juntar
        return rowData.map(formatCsvField).join(',');
    });

    return [headers.join(','), ...rows].join('\n');
}

/**
 * Faz o download de uma string de dados como um arquivo.
 */
export function downloadFile(data, filename, type) {
    const blob = new Blob([data], { type });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
    URL.revokeObjectURL(link.href);
}

/**
 * Analisa uma única linha de um CSV, respeitando campos entre aspas.
 * @param {string} line - A linha do CSV a ser analisada.
 * @returns {string[]} Um array com os valores da linha.
 */
function parseCsvLine(line) {
    const values = [];
    let currentField = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
        const char = line[i];

        if (inQuotes) {
            // Se estamos dentro de aspas
            if (char === '"') {
                // Verifica se é uma aspa de escape (duas aspas seguidas)
                if (i + 1 < line.length && line[i + 1] === '"') {
                    currentField += '"';
                    i++; // Pula a próxima aspa
                } else {
                    // Fim do campo entre aspas
                    inQuotes = false;
                }
            } else {
                currentField += char;
            }
        } else {
            // Se estamos fora de aspas
            if (char === ',') {
                values.push(currentField);
                currentField = '';
            } else if (char === '"' && currentField.trim() === '') {
                // Início de um campo entre aspas (ignora espaços antes)
                inQuotes = true;
            } else {
                currentField += char;
            }
        }
    }
    values.push(currentField); // Adiciona o último campo
    return values;
}

/**
 * Analisa o conteúdo de um arquivo CSV e o converte em uma lista de alunos.
 * Esta versão é robusta e lida com vírgulas dentro de campos, separadores decimais e validações.
 */
export function importStudentsFromCsv(csvContent) {
    // Normaliza quebras de linha e remove linhas vazias
    const lines = csvContent.replace(/\r\n/g, '\n').split('\n').filter(line => line.trim() !== '');
    if (lines.length < 2) {
        throw new Error("O arquivo CSV está vazio ou contém apenas o cabeçalho.");
    }

    // Analisa o cabeçalho de forma segura, removendo BOM (Byte Order Mark) se presente
    const headerLine = lines[0].charCodeAt(0) === 0xFEFF ? lines[0].substring(1) : lines[0];
    const headers = parseCsvLine(headerLine.trim()).map(h => h.trim().toLowerCase());
    
    const requiredHeaders = ['matricula', 'nome'];
    const missingHeaders = requiredHeaders.filter(h => !headers.includes(h));

    if (missingHeaders.length > 0) {
        throw new Error(`O arquivo CSV não contém as seguintes colunas obrigatórias: ${missingHeaders.join(', ')}.`);
    }

    const matriculaIndex = headers.indexOf('matricula');
    const nomeIndex = headers.indexOf('nome');
    const students = [];

    for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        const values = parseCsvLine(line);

        // Validação: número de colunas
        if (values.length !== headers.length) {
            console.warn(`Aviso: Linha ${i + 1} ignorada por ter um número de colunas diferente do cabeçalho.`);
            continue;
        }

        const matricula = values[matriculaIndex]?.trim();
        // Validação: matrícula deve ser um número
        if (!matricula || isNaN(parseInt(matricula, 10))) {
            console.warn(`Aviso: Linha ${i + 1} ignorada por matrícula inválida ou ausente.`);
            continue;
        }

        const student = {
            id: parseInt(matricula, 10),
            name: values[nomeIndex]?.trim() || '',
            grades: {}
        };

        headers.forEach((header, index) => {
            // Pula as colunas já processadas
            if (header === 'matricula' || header === 'nome') return;

            const value = values[index]?.trim();
            if (value) {
                // Tratamento de separador decimal (vírgula)
                const sanitizedValue = value.replace(',', '.');
                const grade = parseFloat(sanitizedValue);
                // Adiciona a nota apenas se for um número válido
                student.grades[header] = isNaN(grade) ? 0 : grade;
            } else {
                student.grades[header] = 0; // Valor padrão para notas vazias
            }
        });
        students.push(student);
    }

    if (students.length === 0) {
        throw new Error("Nenhum aluno válido encontrado no arquivo. Verifique a formatação e os dados.");
    }

    return { headers, students };
}