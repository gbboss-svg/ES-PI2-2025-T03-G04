"use client"

import { PageHeader } from "@/components/page-header"
import { Button } from "@/components/ui/button"
import { ExcelGradeTable } from "@/components/excel-grade-table"
import { GradeLogPanel } from "@/components/grade-log-panel"
import { useRouter, useParams } from "next/navigation"
import { Save, Home, Upload, FileDown } from "lucide-react"
import { useState, useEffect } from "react"
import type { Student, EvaluationColumn, GradeLog } from "@/lib/mock-data"
import { useApp } from "@/lib/store"
import { useToast } from "@/components/ui/toast"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"

export default function DisciplinePage() {
  const router = useRouter()
  const params = useParams()
  const disciplineId = params.id as string

  const { getDiscipline, updateDisciplineData } = useApp()
  const { addToast } = useToast()
  const discipline = getDiscipline(disciplineId)

  const [students, setStudents] = useState<Student[]>([])
  const [columns, setColumns] = useState<EvaluationColumn[]>([])
  const [formula, setFormula] = useState<string>("")
  const [logs, setLogs] = useState<GradeLog[]>([])
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved">("idle")
  const [revertDialog, setRevertDialog] = useState<{ open: boolean; snapshot: GradeLog["snapshot"] | null }>({
    open: false,
    snapshot: null,
  })

  useEffect(() => {
    if (discipline) {
      setStudents(discipline.students || [])
      setColumns(discipline.evaluationColumns || [])
      setFormula(discipline.formula || "")
      setLogs(discipline.logs || [])
    }
  }, [discipline])

  if (!discipline) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-bold text-foreground">Disciplina não encontrada</h2>
          <Button onClick={() => router.push("/")}>Voltar ao Início</Button>
        </div>
      </div>
    )
  }

  const handleSave = () => {
    setSaveStatus("saving")

    // Update global state
    updateDisciplineData(disciplineId, students, columns, formula, logs)

    setTimeout(() => {
      setSaveStatus("saved")
      addToast({
        title: "Dados salvos",
        description: "Todas as alterações foram salvas com sucesso.",
        variant: "success",
      })
      setTimeout(() => setSaveStatus("idle"), 2000)
    }, 500)
  }

  const handleRevertToSnapshot = (snapshot: GradeLog["snapshot"]) => {
    setRevertDialog({ open: true, snapshot })
  }

  const confirmRevert = () => {
    if (revertDialog.snapshot) {
      setStudents(revertDialog.snapshot.students)
      setColumns(revertDialog.snapshot.columns)
      setFormula(revertDialog.snapshot.formula)

      // Add revert log
      const revertLog: GradeLog = {
        id: Date.now().toString(),
        timestamp: new Date().toLocaleString("pt-BR"),
        action: "grade_change",
        studentName: "Sistema",
        oldValue: "Estado atual",
        newValue: "Estado revertido",
        snapshot: {
          students: students,
          columns: columns,
          formula: formula,
        },
      }
      setLogs([...logs, revertLog])

      addToast({
        title: "Estado revertido",
        description: "Os dados foram revertidos para o estado anterior.",
        variant: "success",
      })
    }
    setRevertDialog({ open: false, snapshot: null })
  }

  const handleExport = () => {
    // Export to CSV
    const headers = ["ID", "RA", "Nome", ...columns.map((c) => c.shortName), "Média Final"]
    const rows = students.map((s, i) => [
      (i + 1).toString(),
      s.ra,
      s.name,
      ...columns.map((c) => s.grades[c.shortName]?.toString() || ""),
      s.average?.toFixed(2) || "",
    ])

    const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n")
    const blob = new Blob([csv], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${discipline.name}-${discipline.classNumber}.csv`
    a.click()

    addToast({
      title: "Exportação concluída",
      description: "O arquivo CSV foi baixado com sucesso.",
      variant: "success",
    })
  }

  return (
    <div className="min-h-screen">
      <PageHeader title={`VOCÊ ESTÁ NA TURMA ${discipline.classNumber}`} />

      <div className="p-8 space-y-8">
        {/* Breadcrumb */}
        <div className="text-center">
          <h2 className="text-2xl font-bold text-foreground uppercase">
            {discipline.course} &gt; {discipline.name} &gt; {discipline.classNumber}
          </h2>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-4 justify-center">
          <Button
            onClick={handleSave}
            disabled={saveStatus === "saving"}
            className="bg-green-600 hover:bg-green-700 text-white font-semibold px-6 py-3 rounded-full uppercase"
          >
            <Save className="w-4 h-4 mr-2" />
            {saveStatus === "saving" ? "Salvando..." : saveStatus === "saved" ? "Salvo!" : "Salvar"}
          </Button>

          <Button
            onClick={() => router.push("/")}
            className="bg-[#6b7280] hover:bg-[#4b5563] text-white font-semibold px-6 py-3 rounded-full uppercase"
          >
            <Home className="w-4 h-4 mr-2" />
            Voltar ao Início
          </Button>

          <Button
            onClick={() => router.push("/import")}
            className="bg-[#6b7280] hover:bg-[#4b5563] text-white font-semibold px-6 py-3 rounded-full uppercase"
          >
            <Upload className="w-4 h-4 mr-2" />
            Importar CSV/JSON
          </Button>

          <Button
            onClick={handleExport}
            className="bg-[#6b7280] hover:bg-[#4b5563] text-white font-semibold px-6 py-3 rounded-full uppercase"
          >
            <FileDown className="w-4 h-4 mr-2" />
            Exportar CSV
          </Button>
        </div>

        {/* Excel-like Grade Table */}
        <ExcelGradeTable
          students={students}
          columns={columns}
          formula={formula}
          logs={logs}
          onStudentsChange={setStudents}
          onColumnsChange={setColumns}
          onFormulaChange={setFormula}
          onLogAdd={(log) => setLogs([...logs, log])}
          onRevertToSnapshot={handleRevertToSnapshot}
        />

        {/* Grade Log Panel */}
        <GradeLogPanel logs={logs} onRevert={handleRevertToSnapshot} />
      </div>

      <Dialog open={revertDialog.open} onOpenChange={(open) => setRevertDialog({ open, snapshot: null })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar reversão</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja reverter para este estado? As alterações atuais não salvas serão perdidas.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRevertDialog({ open: false, snapshot: null })}>
              Cancelar
            </Button>
            <Button onClick={confirmRevert} className="bg-orange-600 hover:bg-orange-700">
              Reverter
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
