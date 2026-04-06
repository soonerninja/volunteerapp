import Link from "next/link";
import { LogoLink } from "@/components/ui/logo";

/**
 * Marketing shell — shared nav + footer for public pages (/compare,
 * /blog, /unsubscribe, etc.). Matches the look of the landing page
 * exactly so nothing feels "off-brand" when users land on these
 * routes from ads or search results.
 */
export function MarketingShell({
  children,
  hideCta = false,
}: {
  children: React.ReactNode;
  hideCta?: boolean;
}) {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Nav — mirrors app/page.tsx exactly */}
      <header className="border-b border-gray-100 bg-white/90 backdrop-blur-sm sticky top-0 z-50">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <LogoLink />
          <div className="flex items-center gap-5">
            <Link
              href="/compare"
              className="hidden sm:inline text-sm font-medium text-gray-600 hover:text-gray-900"
            >
              Compare
            </Link>
            <Link
              href="/pricing"
              className="hidden sm:inline text-sm font-medium text-gray-600 hover:text-gray-900"
            >
              Pricing
            </Link>
            <Link
              href="/blog"
              className="hidden sm:inline text-sm font-medium text-gray-600 hover:text-gray-900"
            >
              Blog
            </Link>
            <Link
              href="/login"
              className="text-sm font-medium text-gray-600 hover:text-gray-900"
            >
              Sign In
            </Link>
            <Link
              href="/signup"
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 transition-colors"
            >
              Get Started Free
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">{children}</main>

      {/* Bottom CTA banner — matches landing page blue CTA block */}
      {!hideCta && (
        <section className="bg-blue-600">
          <div className="mx-auto max-w-5xl px-4 py-14 text-center">
            <h2 className="text-2xl font-bold text-white">Ready to get organized?</h2>
            <p className="mt-2 text-blue-100">
              Set up your nonprofit in under two minutes. Free to start.
            </p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-4">
              <Link
                href="/signup"
                className="inline-flex rounded-lg bg-white px-6 py-3 text-sm font-semibold text-blue-600 shadow-sm hover:bg-blue-50 transition-colors"
              >
                Create Your Free Account
              </Link>
              <Link
                href="/pricing"
                className="inline-flex rounded-lg border border-blue-400 px-6 py-3 text-sm font-semibold text-white hover:bg-blue-500 transition-colors"
              >
                See Pricing
              </Link>
            </div>
            <p className="mt-4 text-xs text-blue-200">
              Free forever for up to 10 volunteers &middot; Paid plans from $49/yr
            </p>
          </div>
        </section>
      )}

      {/* Footer — mirrors landing page */}
      <footer className="border-t border-gray-100 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-6 text-xs text-gray-400">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <span>GoodTally&trade;</span>
            <div className="flex flex-wrap gap-4">
              <Link href="/compare" className="hover:text-gray-600">Compare</Link>
              <Link href="/blog" className="hover:text-gray-600">Blog</Link>
              <Link href="/pricing" className="hover:text-gray-600">Pricing</Link>
              <Link href="/contact" className="hover:text-gray-600">Contact</Link>
              <Link href="/terms" className="hover:text-gray-600">Terms of Service</Link>
              <Link href="/privacy" className="hover:text-gray-600">Privacy Policy</Link>
              <Link href="/login" className="hover:text-gray-600">Sign In</Link>
            </div>
          </div>
          <p className="mt-3 text-center text-gray-300">
            &copy; {new Date().getFullYear()} GoodTally. All rights reserved. GoodTally is a trademark of its respective owners.
          </p>
        </div>
      </footer>
    </div>
  );
}
