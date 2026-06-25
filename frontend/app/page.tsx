import Link from "next/link"
import { Lock, Clock, ShieldCheck } from "lucide-react"
import { SiteHeader } from "@/components/site-header"
import { FileUpload } from "@/components/file-upload"
import { cn } from "@/lib/utils"

const features = [
  {
    icon: Lock,
    title: "Encrypted transfer",
    description: "Files are shared through single-use, code-protected links.",
    color: "text-chart-1",
    bg: "bg-chart-1/10",
  },
  {
    icon: Clock,
    title: "Auto-expiring",
    description: "Every upload self-destructs 30 minutes after it's created.",
    color: "text-chart-3",
    bg: "bg-chart-3/10",
  },
  {
    icon: ShieldCheck,
    title: "No accounts",
    description: "Share instantly — no sign-up or personal details required.",
    color: "text-chart-2",
    bg: "bg-chart-2/10",
  },
]

export default function UploadPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />

      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col px-4 py-12 sm:px-6 sm:py-16">
        <div className="mx-auto max-w-2xl text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-medium text-primary">
            <ShieldCheck className="size-3.5" aria-hidden="true" />
            Secure File Sharing Platform
          </span>
          <h1 className="mt-5 text-balance font-heading text-5xl font-semibold leading-[1.05] tracking-tight sm:text-6xl">
            Share PDFs that{" "}
            <span className="text-brand-gradient">expire in 30 minutes</span>
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-pretty text-base leading-relaxed text-muted-foreground sm:text-lg">
            Upload a document, get a one-time access code, and share it with
            confidence. Have a code already?{" "}
            <Link
              href="/access"
              className="font-medium text-primary underline-offset-4 hover:underline"
            >
              Access a file
            </Link>
            .
          </p>
        </div>

        <div className="mx-auto mt-10 w-full max-w-lg">
          <FileUpload />
        </div>

        <ul className="mx-auto mt-14 grid w-full max-w-3xl gap-4 sm:grid-cols-3">
          {features.map((feature) => (
            <li
              key={feature.title}
              className="rounded-2xl border border-border bg-card/70 p-5 text-center shadow-sm backdrop-blur transition-shadow hover:shadow-md sm:text-left"
            >
              <span
                className={cn(
                  "inline-flex size-11 items-center justify-center rounded-xl",
                  feature.bg,
                  feature.color,
                )}
              >
                <feature.icon className="size-5" aria-hidden="true" />
              </span>
              <h3 className="mt-3 text-sm font-semibold">{feature.title}</h3>
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                {feature.description}
              </p>
            </li>
          ))}
        </ul>
      </main>

      <footer className="border-t border-border">
        <div className="mx-auto max-w-5xl px-4 py-6 text-center text-sm text-muted-foreground sm:px-6">
          SecureShare — a portfolio project demonstrating secure file sharing.
        </div>
      </footer>
    </div>
  )
}
