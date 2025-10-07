"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Undo2, ChevronDown, ChevronUp } from "lucide-react"
import type { GradeLog } from "@/lib/mock-data"
import { cn } from "@/lib/utils"

interface GradeLogPanelProps {
  logs: GradeLog[]
  onRevert: (snapshot: GradeLog["snapshot"]) => void
}

export function GradeLogPanel({ logs, onRevert }: GradeLogPanelProps) {
  const [expandedLogs, setExpandedLogs] = useState<Set<string>>(new Set())

  const toggleLog = (logId: string) => {
    const newExpanded = new Set(expandedLogs)
    if (newExpanded.has(logId)) {
      newExpanded.delete(logId)
    } else {
      newExpanded.add(logId)
    }
    setExpandedLogs(newExpanded)
  }

  const getActionLabel = (action: GradeLog["action"]) => {
    switch (action) {
      case "grade_change":
        return "Alteração de Nota"
      case "student_add":
        return "Adição de Aluno"
      case "column_add":
        return "Adição de Coluna"
      case "formula_change":
        return "Alteração de Fórmula"
      default:
        return "Ação"
    }
  }

  const getActionColor = (action: GradeLog["action"]) => {
    switch (action) {
      case "grade_change":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
      case "student_add":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
      case "column_add":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200"
      case "formula_change":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
    }
  }

  const formatLogMessage = (log: GradeLog) => {
    switch (log.action) {
      case "grade_change":
        return `${log.studentName} - ${log.columnName}: ${log.oldValue} → ${log.newValue}`
      case "student_add":
        return `Aluno adicionado: ${log.studentName}`
      case "column_add":
        return `Coluna adicionada: ${log.columnName} (${log.newValue})`
      case "formula_change":
        return `Fórmula alterada`
      default:
        return "Ação realizada"
    }
  }

  return (
    <div className="bg-card border border-border rounded-lg shadow-sm">
      <div className="bg-muted px-6 py-4 border-b border-border">
        <h3 className="text-lg font-semibold text-foreground">Histórico de Alterações (LOG)</h3>
        <p className="text-sm text-muted-foreground mt-1">
          Visualize todas as alterações e reverta para estados anteriores
        </p>
      </div>

      <div className="divide-y divide-border max-h-[600px] overflow-y-auto">
        {logs.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            <p>Nenhuma alteração registrada ainda</p>
          </div>
        ) : (
          logs
            .slice()
            .reverse()
            .map((log) => {
              const isExpanded = expandedLogs.has(log.id)
              return (
                <div key={log.id} className="p-4 hover:bg-muted/50 transition-colors">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2">
                        <span className={cn("px-2 py-1 rounded text-xs font-medium", getActionColor(log.action))}>
                          {getActionLabel(log.action)}
                        </span>
                        <span className="text-xs text-muted-foreground">{log.timestamp}</span>
                      </div>
                      <p className="text-sm text-foreground">{formatLogMessage(log)}</p>

                      {isExpanded && log.action === "formula_change" && (
                        <div className="mt-3 p-3 bg-muted rounded-md space-y-2">
                          <div>
                            <span className="text-xs font-semibold text-muted-foreground">Fórmula Anterior:</span>
                            <p className="text-sm font-mono mt-1">{log.oldValue}</p>
                          </div>
                          <div>
                            <span className="text-xs font-semibold text-muted-foreground">Nova Fórmula:</span>
                            <p className="text-sm font-mono mt-1">{log.newValue}</p>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2">
                      <Button
                        onClick={() => onRevert(log.snapshot)}
                        size="sm"
                        variant="outline"
                        className="hover:bg-orange-100 hover:text-orange-600 hover:border-orange-300"
                      >
                        <Undo2 className="w-4 h-4 mr-1" />
                        Reverter
                      </Button>
                      {log.action === "formula_change" && (
                        <Button onClick={() => toggleLog(log.id)} size="sm" variant="ghost" className="h-8 w-8 p-0">
                          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              )
            })
        )}
      </div>
    </div>
  )
}
