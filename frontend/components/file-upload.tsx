"use client"

import { useCallback, useRef, useState } from "react"
import {
  UploadCloud,
  FileText,
  X,
  Check,
  Copy,
  Clock,
  Loader2,
  AlertCircle,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { uploadFile, type UploadResponse } from "@/lib/api"

const MAX_SIZE_MB = 25

function formatExpiry(seconds: number) {
  const minutes = Math.round(seconds / 60)
  return `${minutes} minute${minutes === 1 ? "" : "s"}`
}

export function FileUpload() {
  const inputRef = useRef<HTMLInputElement>(null)
  const [file, setFile] = useState<File | null>(null)
  const [dragging, setDragging] = useState(false)
  const [progress, setProgress] = useState(0)
  const [status, setStatus] = useState<"idle" | "uploading" | "done">("idle")
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<UploadResponse | null>(null)
  const [copied, setCopied] = useState(false)

  const validateAndSet = useCallback((selected: File | null) => {
    setError(null)
    if (!selected) return
    if (selected.type !== "application/pdf") {
      setError("Only PDF files are supported.")
      return
    }
    if (selected.size > MAX_SIZE_MB * 1024 * 1024) {
      setError(`File is too large. Maximum size is ${MAX_SIZE_MB} MB.`)
      return
    }
    setFile(selected)
  }, [])

  const onDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault()
      setDragging(false)
      validateAndSet(e.dataTransfer.files?.[0] ?? null)
    },
    [validateAndSet],
  )

  const handleUpload = useCallback(async () => {
    if (!file) return
    setStatus("uploading")
    setProgress(0)
    setError(null)
    try {
      const data = await uploadFile(file, setProgress)
      setResult(data)
      setStatus("done")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed.")
      setStatus("idle")
    }
  }, [file])

  const reset = useCallback(() => {
    setFile(null)
    setResult(null)
    setProgress(0)
    setStatus("idle")
    setError(null)
    setCopied(false)
  }, [])

  const copyCode = useCallback(async () => {
    if (!result) return
    await navigator.clipboard.writeText(result.code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }, [result])

  // Success state — show the generated access code.
  if (status === "done" && result) {
    return (
      <div className="rounded-2xl border border-border bg-card p-6 shadow-sm sm:p-8">
        <div className="flex flex-col items-center text-center">
          <span className="flex size-12 items-center justify-center rounded-full bg-brand-gradient text-primary-foreground shadow-sm">
            <Check className="size-6" aria-hidden="true" />
          </span>
          <h2 className="mt-4 font-heading text-2xl font-semibold">
            Upload complete
          </h2>
          <p className="mt-1 text-sm text-muted-foreground text-pretty">
            Share this access code with your recipient. It can only be used
            before it expires.
          </p>
        </div>

        <div className="mt-6 rounded-xl border border-primary/15 bg-primary/5 p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Access code
          </p>
          <div className="mt-2 flex items-center justify-between gap-3">
            <span className="font-mono text-3xl font-bold tracking-[0.3em] text-brand-gradient">
              {result.code}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={copyCode}
              className="shrink-0 bg-transparent"
            >
              {copied ? (
                <Check className="size-4" aria-hidden="true" />
              ) : (
                <Copy className="size-4" aria-hidden="true" />
              )}
              {copied ? "Copied" : "Copy"}
            </Button>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-center gap-2 text-sm font-medium text-accent-foreground">
          <Clock className="size-4" aria-hidden="true" />
          <span>Expires in {formatExpiry(result.expiry_seconds)}</span>
        </div>

        <Button onClick={reset} variant="ghost" className="mt-6 w-full">
          Upload another file
        </Button>
      </div>
    )
  }

  return (
    <div className="rounded-2xl border border-border bg-card p-6 shadow-sm sm:p-8">
      {/* Drop zone */}
      <div
        role="button"
        tabIndex={0}
        aria-label="Upload a PDF file"
        onClick={() => status !== "uploading" && inputRef.current?.click()}
        onKeyDown={(e) => {
          if ((e.key === "Enter" || e.key === " ") && status !== "uploading") {
            e.preventDefault()
            inputRef.current?.click()
          }
        }}
        onDragOver={(e) => {
          e.preventDefault()
          if (status !== "uploading") setDragging(true)
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={status !== "uploading" ? onDrop : undefined}
        className={cn(
          "flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed px-6 py-12 text-center transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring",
          dragging
            ? "border-primary bg-accent"
            : "border-border hover:border-primary/50 hover:bg-secondary",
          status === "uploading" && "pointer-events-none opacity-60",
        )}
      >
        <input
          ref={inputRef}
          type="file"
          accept="application/pdf"
          className="sr-only"
          onChange={(e) => validateAndSet(e.target.files?.[0] ?? null)}
        />
        <span className="flex size-12 items-center justify-center rounded-full bg-brand-gradient text-primary-foreground shadow-sm">
          <UploadCloud className="size-6" aria-hidden="true" />
        </span>
        <p className="mt-4 text-sm font-medium">
          <span className="text-primary">Click to upload</span> or drag and drop
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          PDF only · up to {MAX_SIZE_MB} MB
        </p>
      </div>

      {/* Selected file */}
      {file && (
        <div className="mt-4 flex items-center gap-3 rounded-xl border border-border bg-secondary p-3">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <FileText className="size-5" aria-hidden="true" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">{file.name}</p>
            <p className="text-xs text-muted-foreground">
              {(file.size / 1024 / 1024).toFixed(2)} MB
            </p>
          </div>
          {status !== "uploading" && (
            <button
              type="button"
              onClick={reset}
              aria-label="Remove file"
              className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-background hover:text-foreground"
            >
              <X className="size-4" aria-hidden="true" />
            </button>
          )}
        </div>
      )}

      {/* Progress */}
      {status === "uploading" && (
        <div className="mt-4">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Uploading…</span>
            <span>{progress}%</span>
          </div>
          <div
            role="progressbar"
            aria-valuenow={progress}
            aria-valuemin={0}
            aria-valuemax={100}
            className="mt-2 h-2 w-full overflow-hidden rounded-full bg-secondary"
          >
            <div
              className="h-full rounded-full bg-brand-gradient transition-all duration-200"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div
          role="alert"
          className="mt-4 flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive"
        >
          <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          <span>{error}</span>
        </div>
      )}

      {/* Action */}
      <Button
        onClick={handleUpload}
        disabled={!file || status === "uploading"}
        className="mt-6 w-full border-0 bg-brand-gradient text-primary-foreground transition-opacity hover:opacity-90"
        size="lg"
      >
        {status === "uploading" ? (
          <>
            <Loader2 className="size-4 animate-spin" aria-hidden="true" />
            Uploading…
          </>
        ) : (
          "Upload & generate code"
        )}
      </Button>

      <p className="mt-3 flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
        <Clock className="size-3.5" aria-hidden="true" />
        Files automatically expire 30 minutes after upload
      </p>
    </div>
  )
}
