import type { Metadata } from "next";
import Link from "next/link";
import { Mail, MessageSquare, Building2 } from "lucide-react";
import { LogoLink } from "@/components/ui/logo";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Get in touch with the GoodTally team. Support for your nonprofit volunteer management questions, or inquire about enterprise and multi-chapter plans.",
  alternates: {
    canonical: "/contact",
  },
  openGraph: {
    title: "Contact — GoodTally",
    description:
      "Get in touch with the GoodTally team for support or enterprise inquiries.",
    url: "https://goodtally.app/contact",
    type: "website",
  },
};

const contactBreadcrumbJsonLd = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    {
      "@type": "ListItem",
      position: 1,
      name: "Home",
      item: "https://goodtally.app",
    },
    {
      "@type": "ListItem",
      position: 2,
      name: "Contact",
      item: "https://goodtally.app/contact",
    },
  ],
};

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(contactBreadcrumbJsonLd) }}
      />
      {/* Header */}
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <LogoLink />
          <div className="flex items-center gap-4">
            <Link
              href="/login"
              className="text-sm font-medium text-gray-600 hover:text-gray-900"
            >
              Sign In
            </Link>
            <Link
              href="/signup"
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
            >
              Get Started
            </Link>
          </div>
        </div>
      </header>

      <main id="main-content" className="mx-auto max-w-3xl px-4 py-20">
        <div className="text-center mb-14">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900">
            Get in Touch
          </h1>
          <p className="mt-4 text-lg text-gray-600 max-w-xl mx-auto">
            Have a question or need help? We&apos;re a small team and we read every email.
            You&apos;ll hear back within one business day.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          {/* General Support */}
          <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50">
              <MessageSquare className="h-6 w-6 text-blue-600" aria-hidden="true" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">General Support</h2>
            <p className="mt-2 text-sm text-gray-500 leading-relaxed">
              Questions about your account, billing, features, or how to get the
              most out of GoodTally.
            </p>
            <a
              href="mailto:support@goodtally.app"
              className="mt-6 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 transition-colors"
            >
              <Mail className="h-4 w-4" aria-hidden="true" />
              support@goodtally.app
            </a>
          </div>

          {/* Enterprise */}
          <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100">
              <Building2 className="h-6 w-6 text-slate-600" aria-hidden="true" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">Enterprise Inquiries</h2>
            <p className="mt-2 text-sm text-gray-500 leading-relaxed">
              Need more than 10 users, multiple chapters, custom integrations, or a
              dedicated onboarding experience?
            </p>
            <a
              href="mailto:enterprise@goodtally.app"
              className="mt-6 inline-flex items-center gap-2 rounded-lg bg-slate-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 transition-colors"
            >
              <Mail className="h-4 w-4" aria-hidden="true" />
              enterprise@goodtally.app
            </a>
          </div>
        </div>

        {/* Response time note */}
        <div className="mt-10 rounded-xl border border-blue-100 bg-blue-50 px-6 py-5 text-center">
          <p className="text-sm text-blue-800">
            <span className="font-semibold">Response time:</span> We aim to respond to all emails within{" "}
            <span className="font-semibold">one business day</span>. For urgent issues,
            include &ldquo;URGENT&rdquo; in your subject line.
          </p>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-100 bg-white mt-8">
        <div className="mx-auto max-w-6xl px-4 py-6 text-xs text-gray-400">
          <div className="flex items-center justify-between">
            <span>GoodTally&trade;</span>
            <div className="flex gap-4">
              <Link href="/contact" className="hover:text-gray-600">
                Contact
              </Link>
              <Link href="/terms" className="hover:text-gray-600">
                Terms of Service
              </Link>
              <Link href="/privacy" className="hover:text-gray-600">
                Privacy Policy
              </Link>
            </div>
          </div>
          <p className="mt-3 text-center text-gray-300">
            &copy; {new Date().getFullYear()} GoodTally. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
