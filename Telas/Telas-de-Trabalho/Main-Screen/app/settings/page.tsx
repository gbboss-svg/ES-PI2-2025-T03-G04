"use client"

import { PageHeader } from "@/components/page-header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useState } from "react"
import { useTheme } from "next-themes"
import { LogOut, Lock, Sun, Moon } from "lucide-react"
import { useRouter } from "next/navigation"
import { useToast } from "@/components/ui/toast"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"

export default function SettingsPage() {
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [isChangingPassword, setIsChangingPassword] = useState(false)
  const [passwordError, setPasswordError] = useState<string | null>(null)
  const { theme, setTheme } = useTheme()
  const router = useRouter()
  const { addToast } = useToast()
  const [logoutDialog, setLogoutDialog] = useState(false)

  const handlePasswordChange = async () => {
    setPasswordError(null)

    if (newPassword.length < 6) {
      setPasswordError("A nova senha deve ter pelo menos 6 caracteres.")
      return
    }

    if (newPassword !== confirmPassword) {
      setPasswordError("As senhas não coincidem!")
      return
    }

    if (currentPassword === newPassword) {
      setPasswordError("A nova senha deve ser diferente da senha atual.")
      return
    }

    setIsChangingPassword(true)
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))
    setIsChangingPassword(false)

    addToast({
      title: "Senha alterada",
      description: "Sua senha foi alterada com sucesso!",
      variant: "success",
    })

    setCurrentPassword("")
    setNewPassword("")
    setConfirmPassword("")
  }

  const handleLogout = () => {
    addToast({
      title: "Sessão encerrada",
      description: "Você foi desconectado do sistema.",
      variant: "success",
    })

    setTimeout(() => {
      // In a real app, this would clear auth tokens
      router.push("/")
    }, 1000)
  }

  return (
    <div className="min-h-screen">
      <PageHeader title="CONFIGURAÇÕES" />

      <div className="p-8 max-w-4xl mx-auto">
        <div className="bg-card rounded-2xl p-8 shadow-lg space-y-8 border border-border">
          <div className="border-b border-border pb-6">
            <h2 className="text-2xl font-bold mb-2 flex items-center gap-3">
              {theme === "dark" ? <Moon className="w-6 h-6" /> : <Sun className="w-6 h-6" />}
              Tema do Sistema
            </h2>
            <p className="text-sm text-muted-foreground mb-6">
              Escolha entre o modo claro ou escuro para melhor visualização.
            </p>
            <div className="flex items-center gap-4">
              <Button
                onClick={() => {
                  setTheme("light")
                  addToast({
                    title: "Tema alterado",
                    description: "Modo claro ativado.",
                    variant: "success",
                  })
                }}
                variant={theme === "light" ? "default" : "outline"}
                className="flex items-center gap-2 px-6 py-5 text-base"
              >
                <Sun className="w-5 h-5" />
                Modo Claro
              </Button>
              <Button
                onClick={() => {
                  setTheme("dark")
                  addToast({
                    title: "Tema alterado",
                    description: "Modo escuro ativado.",
                    variant: "success",
                  })
                }}
                variant={theme === "dark" ? "default" : "outline"}
                className="flex items-center gap-2 px-6 py-5 text-base"
              >
                <Moon className="w-5 h-5" />
                Modo Escuro
              </Button>
            </div>
          </div>

          <div className="border-b border-border pb-6">
            <h2 className="text-2xl font-bold mb-2 flex items-center gap-3">
              <Lock className="w-6 h-6" />
              Mudar Senha
            </h2>
            <p className="text-sm text-muted-foreground mb-6">
              Altere sua senha de acesso ao sistema. A senha deve ter no mínimo 6 caracteres.
            </p>
            <div className="space-y-4 max-w-md">
              <div>
                <Label htmlFor="current-password">Senha Atual</Label>
                <Input
                  id="current-password"
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Digite sua senha atual"
                  className="mt-2"
                />
              </div>
              <div>
                <Label htmlFor="new-password">Nova Senha</Label>
                <Input
                  id="new-password"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Digite sua nova senha (mín. 6 caracteres)"
                  className="mt-2"
                />
              </div>
              <div>
                <Label htmlFor="confirm-password">Confirmar Nova Senha</Label>
                <Input
                  id="confirm-password"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirme sua nova senha"
                  className="mt-2"
                />
              </div>
              {passwordError && (
                <div className="bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg p-3">
                  <p className="text-sm text-red-600 dark:text-red-400">{passwordError}</p>
                </div>
              )}
              <Button
                onClick={handlePasswordChange}
                disabled={!currentPassword || !newPassword || !confirmPassword || isChangingPassword}
                className="bg-green-600 hover:bg-green-700 text-white font-bold px-6 py-5 rounded-full uppercase disabled:opacity-50"
              >
                {isChangingPassword ? "Alterando..." : "Alterar Senha"}
              </Button>
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-bold mb-2 flex items-center gap-3">
              <LogOut className="w-6 h-6" />
              Sair do Sistema
            </h2>
            <p className="text-muted-foreground mb-4">Encerre sua sessão atual e retorne à tela inicial.</p>
            <Button
              onClick={() => setLogoutDialog(true)}
              variant="destructive"
              className="font-bold px-6 py-5 rounded-full uppercase flex items-center gap-2"
            >
              <LogOut className="w-5 h-5" />
              Sair do Sistema
            </Button>
          </div>
        </div>
      </div>

      <Dialog open={logoutDialog} onOpenChange={setLogoutDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar saída</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja sair do sistema? Certifique-se de ter salvado todas as alterações.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setLogoutDialog(false)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleLogout}>
              Sair
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
