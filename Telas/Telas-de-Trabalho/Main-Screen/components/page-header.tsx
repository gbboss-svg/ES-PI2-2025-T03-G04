interface PageHeaderProps {
  title: string
  subtitle?: string
}

export function PageHeader({ title, subtitle }: PageHeaderProps) {
  return (
    <header className="bg-gradient-to-r from-[#4a4a4a] to-black text-white px-8 py-6">
      <h1 className="text-2xl font-bold uppercase text-center">{title}</h1>
      {subtitle && <p className="text-center text-sm mt-1 opacity-90">{subtitle}</p>}
    </header>
  )
}
