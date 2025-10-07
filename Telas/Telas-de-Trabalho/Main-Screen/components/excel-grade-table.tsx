"use client"

import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Plus, X, Edit2, Save } from "lucide-react"
import type { Student, EvaluationColumn, GradeLog } from "@/lib/mock-data"
import { FormulaValidator } from "@/lib/formula-validator"
import { cn } from "@/lib/utils"

interface ExcelGradeTableProps {
  students: Student[]
  columns: EvaluationColumn[]
  formula: string
  logs: GradeLog[]
  onStudentsChange: (students: Student[]) => void
  onColumnsChange: (columns: EvaluationColumn[]) => void
  onFormulaChange: (formula: string) => void
  onLogAdd: (log: GradeLog) => void
  onRevertToSnapshot: (snapshot: GradeLog["snapshot"]) => void
}

export function ExcelGradeTable({
  students,
  columns,
  formula,
  logs,
  onStudentsChange,
  onColumnsChange,
  onFormulaChange,
  onLogAdd,
  onRevertToSnapshot,
}: ExcelGradeTableProps) {
  const [editingCell, setEditingCell] = useState<string | null>(null)
  const [editingFormula, setEditingFormula] = useState(false)
  const [tempFormula, setTempFormula] = useState(formula)
  const [formulaError, setFormulaError] = useState<string | null>(null)
  const [newColumnName, setNewColumnName] = useState("")
  const [newColumnShort, setNewColumnShort] = useState("")
  const [showAddColumn, setShowAddColumn] = useState(false)

  const validator = new FormulaValidator(columns)

  useEffect(() => {
    setTempFormula(formula)
  }, [formula])

  // Calculate average for a student based on formula
  const calculateAverage = (studentGrades: Record<string, number>): number | null => {
    return validator.evaluate(formula, studentGrades)
  }

  // Handle grade change
  const handleGradeChange = (studentId: string, columnShortName: string, value: string) => {
    const numValue = Number.parseFloat(value)
    if (isNaN(numValue) || numValue < 0 || numValue > 10) return

    const updatedStudents = students.map((student) => {
      if (student.id === studentId) {
        const oldValue = student.grades[columnShortName] ?? 0
        const newGrades = { ...student.grades, [columnShortName]: numValue }
        const newAverage = calculateAverage(newGrades)

        // Add log entry
        const log: GradeLog = {
          id: Date.now().toString(),
          timestamp: new Date().toLocaleString("pt-BR"),
          action: "grade_change",
          studentName: student.name,
          columnName: columnShortName,
          oldValue,
          newValue: numValue,
          snapshot: {
            students: students,
            columns: columns,
            formula: formula,
          },
        }
        onLogAdd(log)

        return {
          ...student,
          grades: newGrades,
          average: newAverage ?? undefined,
        }
      }
      return student
    })

    onStudentsChange(updatedStudents)
  }

  // Handle student info change (RA or Name)
  const handleStudentInfoChange = (studentId: string, field: "ra" | "name", value: string) => {
    const updatedStudents = students.map((student) => {
      if (student.id === studentId) {
        return { ...student, [field]: value }
      }
      return student
    })
    onStudentsChange(updatedStudents)
  }

  // Add new student
  const addStudent = () => {
    const newStudent: Student = {
      id: (students.length + 1).toString(),
      ra: "",
      name: "",
      email: "",
      grades: {},
      average: undefined,
    }
    onStudentsChange([...students, newStudent])
  }

  // Remove student
  const removeStudent = (studentId: string) => {
    onStudentsChange(students.filter((s) => s.id !== studentId))
  }

  // Add new evaluation column
  const addColumn = () => {
    if (!newColumnName || !newColumnShort) return

    const newColumn: EvaluationColumn = {
      id: (columns.length + 1).toString(),
      name: newColumnName,
      shortName: newColumnShort.toUpperCase(),
    }

    onColumnsChange([...columns, newColumn])
    setNewColumnName("")
    setNewColumnShort("")
    setShowAddColumn(false)

    // Add log
    const log: GradeLog = {
      id: Date.now().toString(),
      timestamp: new Date().toLocaleString("pt-BR"),
      action: "column_add",
      columnName: newColumn.name,
      oldValue: "",
      newValue: newColumn.shortName,
      snapshot: {
        students: students,
        columns: columns,
        formula: formula,
      },
    }
    onLogAdd(log)
  }

  // Remove column
  const removeColumn = (columnId: string) => {
    const column = columns.find((c) => c.id === columnId)
    if (!column) return

    // Remove grades for this column from all students
    const updatedStudents = students.map((student) => {
      const newGrades = { ...student.grades }
      delete newGrades[column.shortName]
      return {
        ...student,
        grades: newGrades,
        average: calculateAverage(newGrades) ?? undefined,
      }
    })

    onStudentsChange(updatedStudents)
    onColumnsChange(columns.filter((c) => c.id !== columnId))
  }

  // Save formula
  const saveFormula = () => {
    const validation = validator.validate(tempFormula)
    if (!validation.isValid) {
      setFormulaError(validation.error ?? "Fórmula inválida")
      return
    }

    setFormulaError(null)
    onFormulaChange(tempFormula)
    setEditingFormula(false)

    // Recalculate all averages
    const updatedStudents = students.map((student) => ({
      ...student,
      average: calculateAverage(student.grades) ?? undefined,
    }))
    onStudentsChange(updatedStudents)

    // Add log
    const log: GradeLog = {
      id: Date.now().toString(),
      timestamp: new Date().toLocaleString("pt-BR"),
      action: "formula_change",
      oldValue: formula,
      newValue: tempFormula,
      snapshot: {
        students: students,
        columns: columns,
        formula: formula,
      },
    }
    onLogAdd(log)
  }

  return (
    <div className="space-y-6">
      {/* Formula Editor */}
      <div className="bg-card border border-border rounded-lg p-6 shadow-sm">
        <div className="flex items-start gap-4">
          <div className="flex-1">
            <label className="block text-sm font-semibold text-foreground mb-2">
              Fórmula de Cálculo da Média Final
            </label>
            {editingFormula ? (
              <div className="space-y-2">
                <Input
                  value={tempFormula}
                  onChange={(e) => setTempFormula(e.target.value)}
                  placeholder="Ex: (P1 + P2) / 2 * 0.8 + T1 * 0.2"
                  className={cn("font-mono", formulaError && "border-red-500")}
                />
                {formulaError && <p className="text-sm text-red-500">{formulaError}</p>}
                <p className="text-xs text-muted-foreground">
                  Use as variáveis: {columns.map((c) => c.shortName).join(", ")}
                </p>
              </div>
            ) : (
              <div className="bg-muted px-4 py-3 rounded-md font-mono text-sm">{formula}</div>
            )}
          </div>
          <div className="flex gap-2">
            {editingFormula ? (
              <>
                <Button onClick={saveFormula} size="sm" className="bg-green-600 hover:bg-green-700">
                  <Save className="w-4 h-4 mr-1" />
                  Salvar
                </Button>
                <Button onClick={() => setEditingFormula(false)} size="sm" variant="outline">
                  Cancelar
                </Button>
              </>
            ) : (
              <Button onClick={() => setEditingFormula(true)} size="sm" variant="outline">
                <Edit2 className="w-4 h-4 mr-1" />
                Editar
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Grade Table */}
      <div className="overflow-x-auto border border-border rounded-lg shadow-sm">
        <table className="w-full border-collapse bg-card">
          <thead>
            <tr className="bg-muted">
              <th className="border border-border p-3 text-sm font-semibold text-left min-w-[80px]">ID</th>
              <th className="border border-border p-3 text-sm font-semibold text-left min-w-[120px]">RA</th>
              <th className="border border-border p-3 text-sm font-semibold text-left min-w-[200px]">Nome</th>
              {columns.map((col) => (
                <th key={col.id} className="border border-border p-3 text-sm font-semibold text-center min-w-[100px]">
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <div>{col.name}</div>
                      <div className="text-xs text-muted-foreground font-normal">({col.shortName})</div>
                    </div>
                    <Button
                      onClick={() => removeColumn(col.id)}
                      size="sm"
                      variant="ghost"
                      className="h-6 w-6 p-0 hover:bg-red-100 hover:text-red-600"
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                </th>
              ))}
              <th className="border border-border p-3 text-sm font-semibold text-center min-w-[100px]">Média Final</th>
              <th className="border border-border p-3 text-sm font-semibold text-center min-w-[80px]">Ações</th>
            </tr>
          </thead>
          <tbody>
            {students.map((student, index) => (
              <tr key={student.id} className="hover:bg-muted/50 transition-colors">
                <td className="border border-border p-2 text-sm text-center">{index + 1}</td>
                <td className="border border-border p-2">
                  <Input
                    value={student.ra}
                    onChange={(e) => handleStudentInfoChange(student.id, "ra", e.target.value)}
                    placeholder="RA"
                    className="h-9 text-sm"
                  />
                </td>
                <td className="border border-border p-2">
                  <Input
                    value={student.name}
                    onChange={(e) => handleStudentInfoChange(student.id, "name", e.target.value)}
                    placeholder="Nome do aluno"
                    className="h-9 text-sm"
                  />
                </td>
                {columns.map((col) => (
                  <td key={col.id} className="border border-border p-2">
                    <Input
                      type="number"
                      step="0.1"
                      min="0"
                      max="10"
                      value={student.grades[col.shortName] ?? ""}
                      onChange={(e) => handleGradeChange(student.id, col.shortName, e.target.value)}
                      onFocus={() => setEditingCell(`${student.id}-${col.shortName}`)}
                      onBlur={() => setEditingCell(null)}
                      placeholder="0.0"
                      className={cn(
                        "h-9 text-sm text-center",
                        editingCell === `${student.id}-${col.shortName}` && "ring-2 ring-primary",
                      )}
                    />
                  </td>
                ))}
                <td className="border border-border p-2 text-center">
                  <div
                    className={cn(
                      "text-lg font-bold",
                      student.average !== undefined && student.average >= 7
                        ? "text-green-600"
                        : student.average !== undefined && student.average >= 5
                          ? "text-yellow-600"
                          : "text-red-600",
                    )}
                  >
                    {student.average !== undefined ? student.average.toFixed(2) : "-"}
                  </div>
                </td>
                <td className="border border-border p-2 text-center">
                  <Button
                    onClick={() => removeStudent(student.id)}
                    size="sm"
                    variant="ghost"
                    className="h-8 w-8 p-0 hover:bg-red-100 hover:text-red-600"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4">
        <Button onClick={addStudent} className="bg-primary hover:bg-primary/90">
          <Plus className="w-4 h-4 mr-2" />
          Adicionar Aluno
        </Button>

        {showAddColumn ? (
          <div className="flex gap-2 items-center">
            <Input
              value={newColumnName}
              onChange={(e) => setNewColumnName(e.target.value)}
              placeholder="Nome da avaliação"
              className="h-10 w-48"
            />
            <Input
              value={newColumnShort}
              onChange={(e) => setNewColumnShort(e.target.value)}
              placeholder="Sigla (ex: P1)"
              className="h-10 w-32"
            />
            <Button onClick={addColumn} size="sm" className="bg-green-600 hover:bg-green-700">
              <Save className="w-4 h-4 mr-1" />
              Salvar
            </Button>
            <Button onClick={() => setShowAddColumn(false)} size="sm" variant="outline">
              Cancelar
            </Button>
          </div>
        ) : (
          <Button onClick={() => setShowAddColumn(true)} variant="outline">
            <Plus className="w-4 h-4 mr-2" />
            Adicionar Coluna de Avaliação
          </Button>
        )}
      </div>
    </div>
  )
}
