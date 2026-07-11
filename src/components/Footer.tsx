export function Footer({ generatedAt }: { generatedAt: string }) {
  return (
    <footer className="mt-10 border-t border-slate-200 py-6 text-center text-xs text-slate-400 dark:border-slate-800 dark:text-slate-600">
      Directorio interno · Corte de Apelaciones de La Serena · Datos actualizados al {generatedAt}
    </footer>
  )
}
