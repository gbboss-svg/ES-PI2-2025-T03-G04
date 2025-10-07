"use client"

import { X, UserIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useState } from "react"

interface ProfileModalProps {
  isOpen: boolean
  onClose: () => void
}

export function ProfileModal({ isOpen, onClose }: ProfileModalProps) {
  const [profile, setProfile] = useState({
    name: "Professor João Silva",
    institution: "Universidade Federal",
    code: "123456789",
    email: "professor@email.com",
    language: "Português",
  })

  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50 z-40" onClick={onClose} />

      {/* Modal */}
      <div className="fixed left-0 top-0 h-screen w-full max-w-md bg-[#4a4a4a] text-white z-50 p-8 overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-6 right-6 text-white hover:text-gray-300 transition-colors"
          aria-label="Fechar"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="space-y-8">
          {/* Profile Icon */}
          <div className="flex justify-center">
            <div className="w-24 h-24 rounded-full bg-white/20 flex items-center justify-center">
              <UserIcon className="w-12 h-12" />
            </div>
          </div>

          {/* Form Fields */}
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold mb-2 uppercase">*Nome Professor</label>
              <Input
                value={profile.name}
                onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                className="bg-white/10 border-white/20"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2 uppercase">*Nome da Instituição*</label>
              <Input
                value={profile.institution}
                onChange={(e) => setProfile({ ...profile, institution: e.target.value })}
                className="bg-white/10 border-white/20"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2 uppercase">
                Seu Código na Instituição *Codigo/CPF*
              </label>
              <Input
                value={profile.code}
                onChange={(e) => setProfile({ ...profile, code: e.target.value })}
                className="bg-white/10 border-white/20"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2 uppercase">*Email de Login*</label>
              <Input
                type="email"
                value={profile.email}
                onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                className="bg-white/10 border-white/20"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2 uppercase">*Mudar Idioma*</label>
              <select
                value={profile.language}
                onChange={(e) => setProfile({ ...profile, language: e.target.value })}
                className="flex h-14 w-full rounded-full border border-white/20 bg-white/10 px-6 py-3 text-base text-white focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="Português" className="text-gray-800">
                  Português
                </option>
                <option value="English" className="text-gray-800">
                  English
                </option>
                <option value="Español" className="text-gray-800">
                  Español
                </option>
              </select>
            </div>
          </div>

          {/* Logout Button */}
          <Button
            onClick={() => {
              /* Handle logout */
            }}
            className="w-full bg-black hover:bg-black/80 text-white font-bold py-6 rounded-full text-lg uppercase"
          >
            SAIR
          </Button>
        </div>
      </div>
    </>
  )
}
