import { FileSpreadsheet, FileText } from 'lucide-react'
import type { ExportTable } from '../lib/exportContactos'
import { descargarCsv, exportarPdf } from '../lib/exportContactos'

export function ExportButtons({
  titulo,
  filename,
  tabla,
}: {
  titulo: string
  filename: string
  tabla: ExportTable
}) {
  if (tabla.rows.length === 0) return null

  return (
    <div className="flex shrink-0 items-center gap-1.5">
      <button
        type="button"
        onClick={() => descargarCsv(filename, tabla)}
        title="Descargar esta lista como Excel (.csv)"
        className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-600 transition-colors hover:border-emerald-300 hover:text-emerald-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:border-emerald-800 dark:hover:text-emerald-400"
      >
        <FileSpreadsheet size={13} />
        Excel
      </button>
      <button
        type="button"
        onClick={() => exportarPdf(titulo, tabla)}
        title="Exportar esta lista a PDF"
        className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-600 transition-colors hover:border-rose-300 hover:text-rose-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:border-rose-800 dark:hover:text-rose-400"
      >
        <FileText size={13} />
        PDF
      </button>
    </div>
  )
}
