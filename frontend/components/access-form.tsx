"use client"

import { useState } from "react"
import { Download, AlertCircle, Loader2, KeyRound } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { downloadFile } from "@/lib/api"

export function AccessForm() {
  const [code, setCode] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = code.trim()
    if (!trimmed) {
      setError("Please enter an access code.")
      return
    }
    setLoading(true)
    setError(null)
    try {
      await downloadFile(trimmed)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Download failed.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="rounded-2xl border border-border bg-card p-6 shadow-sm sm:p-8">
      <div className="flex flex-col items-center text-center">
        <span className="flex size-12 items-center justify-center rounded-full bg-brand-gradient text-primary-foreground shadow-sm">
          <KeyRound className="size-6" aria-hidden="true" />
        </span>
        <h2 className="mt-4 font-heading text-2xl font-semibold">
          Enter your access code
        </h2>
        <p className="mt-1 text-sm text-muted-foreground text-pretty">
          Type the code you received to securely download the shared PDF.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <div className="space-y-2">
          <label htmlFor="access-code" className="sr-only">
            Access code
          </label>
          <Input
            id="access-code"
            value={code}
            onChange={(e) => {
              setCode(e.target.value)
              if (error) setError(null)
            }}
            placeholder="ABC123"
            autoComplete="off"
            spellCheck={false}
            aria-invalid={!!error}
            className="h-14 text-center font-mono text-2xl font-bold tracking-[0.3em]"
          />
        </div>

        {error && (
          <div
            role="alert"
            className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive"
          >
            <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
            <span>{error}</span>
          </div>
        )}

        <Button
          type="submit"
          disabled={loading}
          className="w-full border-0 bg-brand-gradient text-primary-foreground transition-opacity hover:opacity-90"
          size="lg"
        >
          {loading ? (
            <>
              <Loader2 className="size-4 animate-spin" aria-hidden="true" />
              Verifying…
            </>
          ) : (
            <>
              <Download className="size-4" aria-hidden="true" />
              Download file
            </>
          )}
        </Button>
      </form>
    </div>
  )
}
