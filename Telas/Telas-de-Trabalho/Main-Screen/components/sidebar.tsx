"use client"

import { User, Clock, PlusCircle, Upload, Download, Settings, ChevronLeft, ChevronRight } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"
import { ProfileModal } from "./profile-modal"
import Image from "next/image"

const menuItems = [
  { icon: User, label: "SEU PERFIL", href: "/profile", isModal: true },
  { icon: Clock, label: "PAINEL PRINCIPAL", href: "/" },
  { icon: PlusCircle, label: "ADICIONAR DISCIPLINA", href: "/add-discipline" },
  { icon: Upload, label: "IMPORTAR CSV/XML", href: "/import" },
  { icon: Download, label: "EXPORTAR ARQUIVOS", href: "/export" },
  { icon: Settings, label: "CONFIGURAÇÕES", href: "/settings" },
]

export function Sidebar() {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)
  const [isProfileOpen, setIsProfileOpen] = useState(false)

  useEffect(() => {
    const main = document.querySelector("main")
    if (main) {
      main.style.marginLeft = collapsed ? "6rem" : "18rem"
    }
  }, [collapsed])

  return (
    <>
      <aside
        className={cn(
          "fixed left-0 top-0 h-screen bg-sidebar-bg text-white sidebar-transition z-50 flex flex-col justify-between",
          collapsed ? "w-24" : "w-72",
        )}
      >
        <div>
          <div className="px-6 py-6">
            <Image
              src="/logo-notadez.png"
              alt="NotaDez Logo"
              width={150}
              height={50}
              className={cn(
                "w-full h-auto transition-all duration-300",
                collapsed ? "opacity-0 h-0" : "opacity-100 max-w-[150px] mx-auto",
              )}
              priority
            />
            {collapsed && (
              <Image
                src="/logo-favicon.png"
                alt="NotaDez"
                width={40}
                height={40}
                className="w-10 h-10 mx-auto"
                priority
              />
            )}
          </div>

          <nav className="mt-10 space-y-1 px-2">
            {menuItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href

              if (item.isModal) {
                return (
                  <button
                    key={item.href}
                    onClick={() => setIsProfileOpen(true)}
                    className={cn(
                      "flex items-center w-full gap-4 px-6 py-4 rounded-lg sidebar-transition text-left text-gray-300 hover:bg-sidebar-hover hover:text-white hover-lift",
                      isActive && "bg-sidebar-hover text-white",
                      collapsed && "justify-center px-0",
                    )}
                  >
                    <Icon className={cn("flex-shrink-0", collapsed ? "w-7 h-7" : "w-7 h-7")} />
                    {!collapsed && <span className="text-sm font-medium uppercase">{item.label}</span>}
                  </button>
                )
              }

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-4 px-6 py-4 rounded-lg sidebar-transition text-gray-300 hover:bg-sidebar-hover hover:text-white hover-lift",
                    isActive && "bg-sidebar-hover text-white",
                    collapsed && "justify-center px-0",
                  )}
                >
                  <Icon className={cn("flex-shrink-0", collapsed ? "w-7 h-7" : "w-7 h-7")} />
                  {!collapsed && <span className="text-sm font-medium uppercase">{item.label}</span>}
                </Link>
              )
            })}
          </nav>
        </div>

        <div className="px-4 pb-6">
          <button
            onClick={() => setCollapsed(!collapsed)}
            className={cn(
              "flex items-center w-full gap-4 px-6 py-4 rounded-lg sidebar-transition text-gray-300 hover:bg-sidebar-hover hover:text-white",
              collapsed && "justify-center px-0",
            )}
          >
            {collapsed ? (
              <ChevronRight className="w-6 h-6" />
            ) : (
              <>
                <ChevronLeft className="w-6 h-6" />
                <span className="text-sm font-medium">Recolher</span>
              </>
            )}
          </button>
        </div>
      </aside>

      <ProfileModal isOpen={isProfileOpen} onClose={() => setIsProfileOpen(false)} />
    </>
  )
}
