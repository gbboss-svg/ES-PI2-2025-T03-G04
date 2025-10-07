"use client"

import type React from "react"

import { PageHeader } from "@/components/page-header"
import { Upload, CheckCircle, AlertCircle } from "lucide-react"
import { useState } from "react"
import { cn } from "@/lib/utils"
import { useToast } from "@/components/ui/toast"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"

export default function ImportPage() {
  const [isDragging, setIsDragging] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [parsedData, setParsedData] = useState<any[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const { addToast } = useToast()
  const router = useRouter()

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)

    const droppedFile = e.dataTransfer.files[0]
    if (droppedFile && (droppedFile.name.endsWith(".csv") || droppedFile.name.endsWith(".json"))) {
      processFile(droppedFile)
    } else {
      setError("Formato de arquivo não suportado. Use CSV ou JSON.")
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      processFile(selectedFile)
    }
  }

  const processFile = async (uploadedFile: File) => {
    setFile(uploadedFile)
    setIsProcessing(true)
    setError(null)
    setParsedData(null)

    try {
      const text = await uploadedFile.text()

      if (uploadedFile.name.endsWith(".csv")) {
        // Parse CSV
        const lines = text.split("\n").filter((line) => line.trim())
        const headers = lines[0].split(",").map((h) => h.trim())

        const data = lines.slice(1).map((line, index) => {
          const values = line.split(",").map((v) => v.trim())
          const row: any = { id: (index + 1).toString() }

          headers.forEach((header, i) => {
            const lowerHeader = header.toLowerCase()
            if (lowerHeader === "ra") row.ra = values[i]
            else if (lowerHeader === "nome" || lowerHeader === "name") row.name = values[i]
            else if (lowerHeader === "email") row.email = values[i]
            else row[header] = values[i]
          })

          return row
        })

        setParsedData(data)
        addToast({
          title: "Arquivo processado",
          description: `${data.length} alunos encontrados no arquivo CSV.`,
          variant: "success",
        })
      } else if (uploadedFile.name.endsWith(".json")) {
        // Parse JSON
        const data = JSON.parse(text)
        if (Array.isArray(data)) {
          setParsedData(data)
          addToast({
            title: "Arquivo processado",
            description: `${data.length} alunos encontrados no arquivo JSON.`,
            variant: "success",
          })
        } else {
          throw new Error("O arquivo JSON deve conter um array de alunos.")
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao processar arquivo")
      addToast({
        title: "Erro ao processar arquivo",
        description: "Verifique o formato do arquivo e tente novamente.",
        variant: "error",
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const handleImport = () => {
    if (parsedData) {
      // In a real app, this would save to the selected discipline
      addToast({
        title: "Importação concluída",
        description: `${parsedData.length} alunos foram importados com sucesso.`,
        variant: "success",
      })

      setTimeout(() => {
        router.push("/")
      }, 1500)
    }
  }

  return (
    <div className="min-h-screen">
      <PageHeader title="FAÇA SUA IMPORTAÇÃO" />

      <div className="p-8 max-w-5xl mx-auto">
        <div className="bg-[#3a3a3a] text-white p-8 rounded-2xl mb-8 text-center">
          <p className="text-lg font-semibold uppercase leading-relaxed">
            COLOQUE AQUI ABAIXO O SEU ARQUIVO CSV/JSON PARA
            <br />
            CRIAR UMA NOVA TURMA COM ALUNOS JÁ CADASTRADOS
          </p>
        </div>

        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={cn(
            "relative border-4 border-dashed rounded-3xl p-16 transition-all",
            isDragging
              ? "border-[#10b981] bg-[#10b981]/10"
              : "border-gray-400 bg-gray-200 dark:bg-gray-800 dark:border-gray-600",
            parsedData && "border-green-500 bg-green-50 dark:bg-green-950",
            error && "border-red-500 bg-red-50 dark:bg-red-950",
          )}
        >
          <input
            type="file"
            accept=".csv,.json"
            onChange={handleFileSelect}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            id="file-upload"
            disabled={isProcessing}
          />

          <label htmlFor="file-upload" className="flex flex-col items-center justify-center gap-6 cursor-pointer">
            {isProcessing ? (
              <>
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-gray-900 dark:border-gray-100" />
                <p className="text-2xl font-semibold text-gray-600 dark:text-gray-400 text-center uppercase">
                  PROCESSANDO ARQUIVO...
                </p>
              </>
            ) : parsedData ? (
              <>
                <CheckCircle className="w-16 h-16 text-green-600" />
                <p className="text-2xl font-semibold text-green-600 text-center uppercase">
                  ARQUIVO PROCESSADO COM SUCESSO
                  <br />
                  {parsedData.length} ALUNOS ENCONTRADOS
                </p>
              </>
            ) : error ? (
              <>
                <AlertCircle className="w-16 h-16 text-red-600" />
                <p className="text-xl font-semibold text-red-600 text-center">{error}</p>
              </>
            ) : (
              <>
                <Upload className="w-16 h-16 text-gray-500" />
                <p className="text-2xl font-semibold text-gray-600 dark:text-gray-400 text-center uppercase">
                  ARRASTE OU CLIQUE AQUI
                  <br />
                  PARA SELECIONAR SEU ARQUIVO
                </p>
              </>
            )}
            {file && !error && <p className="text-lg text-[#10b981] font-semibold">Arquivo: {file.name}</p>}
          </label>
        </div>

        {parsedData && parsedData.length > 0 && (
          <div className="mt-8 bg-card border border-border rounded-lg overflow-hidden">
            <div className="bg-muted px-6 py-4 border-b border-border">
              <h3 className="text-lg font-semibold">Prévia dos Dados</h3>
              <p className="text-sm text-muted-foreground">Primeiros 5 registros</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold">RA</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Nome</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Email</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {parsedData.slice(0, 5).map((row, index) => (
                    <tr key={index} className="hover:bg-muted/50">
                      <td className="px-4 py-3 text-sm">{row.ra || "-"}</td>
                      <td className="px-4 py-3 text-sm">{row.name || "-"}</td>
                      <td className="px-4 py-3 text-sm">{row.email || "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <div className="mt-8 flex justify-center gap-4">
          {parsedData && (
            <Button
              onClick={handleImport}
              className="bg-green-600 hover:bg-green-700 text-white font-bold py-6 px-12 rounded-full text-lg uppercase"
            >
              Confirmar Importação
            </Button>
          )}
          <Button
            onClick={() => router.push("/")}
            variant="secondary"
            className="bg-[#6b7280] hover:bg-[#4b5563] text-white font-bold py-6 px-12 rounded-full text-lg uppercase"
          >
            Voltar
          </Button>
        </div>

        <div className="mt-8 text-center text-sm text-muted-foreground">
          <p>Formatos aceitos: CSV, JSON</p>
          <p className="mt-2">O arquivo deve conter as colunas: RA, Nome, Email</p>
          <p className="mt-2 text-xs">
            Exemplo CSV: RA,Nome,Email
            <br />
            12345,João Silva,joao@email.com
          </p>
        </div>
      </div>
    </div>
  )
}
