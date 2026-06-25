import Link from "next/link"
import { SiteHeader } from "@/components/site-header"
import { AccessForm } from "@/components/access-form"

export default function AccessPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />

      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col px-4 py-12 sm:px-6 sm:py-16">
        <div className="mx-auto max-w-2xl text-center">
          <h1 className="text-balance font-heading text-5xl font-semibold leading-[1.05] tracking-tight sm:text-6xl">
            Access a <span className="text-brand-gradient">shared file</span>
          </h1>
          <p className="mx-auto mt-4 max-w-md text-pretty text-base leading-relaxed text-muted-foreground sm:text-lg">
            Enter the access code you were given. Codes are valid for 30 minutes
            after upload.
          </p>
        </div>

        <div className="mx-auto mt-10 w-full max-w-md">
          <AccessForm />
        </div>

        <p className="mx-auto mt-8 text-center text-sm text-muted-foreground">
          Need to share a file instead?{" "}
          <Link
            href="/"
            className="font-medium text-primary underline-offset-4 hover:underline"
          >
            Upload a PDF
          </Link>
        </p>
      </main>

      <footer className="border-t border-border">
        <div className="mx-auto max-w-5xl px-4 py-6 text-center text-sm text-muted-foreground sm:px-6">
          SecureShare — a portfolio project demonstrating secure file sharing.
        </div>
      </footer>
    </div>
  )
}
