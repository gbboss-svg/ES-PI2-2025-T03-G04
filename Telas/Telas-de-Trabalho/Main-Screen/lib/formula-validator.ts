export interface EvaluationColumn {
  id: string
  name: string
  shortName: string // e.g., "P1", "T1", "A1"
  weight?: number
}

export interface FormulaValidationResult {
  isValid: boolean
  error?: string
  variables: string[]
}

export class FormulaValidator {
  private columns: EvaluationColumn[]

  constructor(columns: EvaluationColumn[]) {
    this.columns = columns
  }

  // Validate formula syntax and variable references
  validate(formula: string): FormulaValidationResult {
    if (!formula || formula.trim() === "") {
      return { isValid: false, error: "Fórmula não pode estar vazia", variables: [] }
    }

    // Extract variables from formula (e.g., P1, P2, T1)
    const variablePattern = /[A-Z]+\d+/g
    const variables = formula.match(variablePattern) || []
    const uniqueVariables = [...new Set(variables)]

    // Check if all variables exist in columns
    const validShortNames = this.columns.map((col) => col.shortName)
    const invalidVariables = uniqueVariables.filter((v) => !validShortNames.includes(v))

    if (invalidVariables.length > 0) {
      return {
        isValid: false,
        error: `Variáveis inválidas: ${invalidVariables.join(", ")}. Use: ${validShortNames.join(", ")}`,
        variables: uniqueVariables,
      }
    }

    // Check for valid mathematical operators
    const validOperators = /^[A-Z0-9+\-*/().\s]+$/
    if (!validOperators.test(formula)) {
      return {
        isValid: false,
        error: "Fórmula contém caracteres inválidos. Use apenas +, -, *, /, (, )",
        variables: uniqueVariables,
      }
    }

    // Try to evaluate with dummy values to check syntax
    try {
      const testFormula = formula
      let evaluableFormula = testFormula
      uniqueVariables.forEach((v) => {
        evaluableFormula = evaluableFormula.replace(new RegExp(v, "g"), "1")
      })
      // eslint-disable-next-line no-eval
      eval(evaluableFormula)
    } catch (error) {
      return {
        isValid: false,
        error: "Sintaxe da fórmula inválida. Verifique parênteses e operadores",
        variables: uniqueVariables,
      }
    }

    return { isValid: true, variables: uniqueVariables }
  }

  // Evaluate formula with actual grade values
  evaluate(formula: string, grades: Record<string, number>): number | null {
    const validation = this.validate(formula)
    if (!validation.isValid) {
      return null
    }

    try {
      let evaluableFormula = formula
      validation.variables.forEach((v) => {
        const value = grades[v] ?? 0
        evaluableFormula = evaluableFormula.replace(new RegExp(v, "g"), value.toString())
      })
      // eslint-disable-next-line no-eval
      const result = eval(evaluableFormula)
      return typeof result === "number" ? Number(result.toFixed(2)) : null
    } catch (error) {
      return null
    }
  }
}
