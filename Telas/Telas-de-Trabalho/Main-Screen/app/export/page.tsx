"use client"

import { PageHeader } from "@/components/page-header"
import { Button } from "@/components/ui/button"
import { Download, FileSpreadsheet, FileJson } from "lucide-react"
import { mockDisciplines } from "@/lib/mock-data"

export default function ExportPage() {
  const handleExport = (format: "csv" | "json") => {
    console.log(`Exporting as ${format}`)
    // Handle export logic
  }

  return (
    <div className="min-h-screen">
      <PageHeader title="EXPORTAR ARQUIVOS" />

      <div className="p-8 max-w-4xl mx-auto">
        <div className="bg-card rounded-2xl p-8 shadow-lg">
          <h2 className="text-2xl font-bold mb-6 text-center">Selecione o formato de exportação</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <Button
              onClick={() => handleExport("csv")}
              className="h-32 bg-[#10b981] hover:bg-[#059669] text-white flex flex-col items-center justify-center gap-3"
            >
              <FileSpreadsheet className="w-12 h-12" />
              <span className="text-lg font-bold uppercase">Exportar CSV</span>
            </Button>

            <Button
              onClick={() => handleExport("json")}
              className="h-32 bg-[#3b82f6] hover:bg-[#2563eb] text-white flex flex-col items-center justify-center gap-3"
            >
              <FileJson className="w-12 h-12" />
              <span className="text-lg font-bold uppercase">Exportar JSON</span>
            </Button>
          </div>

          <div className="space-y-4">
            <h3 className="text-xl font-semibold mb-4">Disciplinas disponíveis para exportação:</h3>
            <div className="space-y-2">
              {mockDisciplines.map((discipline) => (
                <div
                  key={discipline.id}
                  className="flex items-center justify-between p-4 bg-muted rounded-lg hover:bg-muted/80 transition-colors"
                >
                  <div>
                    <p className="font-semibold">{discipline.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {discipline.course} - Turma {discipline.classNumber}
                    </p>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => console.log(`Exporting ${discipline.name}`)}
                    className="gap-2"
                  >
                    <Download className="w-4 h-4" />
                    Exportar
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
