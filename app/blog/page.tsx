import Link from "next/link";
import { getAllPosts } from "@/lib/blog";
import { MarketingShell } from "@/components/layout/marketing-shell";

export const metadata = {
  title: "GoodTally Blog — Volunteer Management Tips for Small Nonprofits",
  description:
    "Practical advice on volunteer management, hours tracking, event planning, and running lean nonprofit operations.",
  alternates: { canonical: "https://goodtally.app/blog" },
};

export default async function BlogIndexPage() {
  const posts = await getAllPosts();

  return (
    <MarketingShell>
      <section className="mx-auto max-w-6xl px-4 py-16 lg:py-20">
        <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3.5 py-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
          <span className="text-xs font-semibold uppercase tracking-wide text-blue-700">
            The GoodTally Blog
          </span>
        </div>
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-gray-900 leading-tight">
          Practical advice for small nonprofits
        </h1>
        <p className="mt-5 text-lg leading-relaxed text-gray-600 max-w-2xl">
          Hours tracking, volunteer management, event planning, and running lean nonprofit
          operations without burning out (or paying $500/month for software you don&apos;t need).
        </p>
      </section>

      <section className="border-t border-gray-100 bg-gray-50 py-16">
        <div className="mx-auto max-w-6xl px-4">
          {posts.length === 0 ? (
            <div className="rounded-xl border border-gray-200 bg-white p-12 text-center shadow-sm">
              <p className="text-gray-500">No posts yet — check back soon.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {posts.map((post) => (
                <Link
                  key={post.slug}
                  href={`/blog/${post.slug}`}
                  className="group flex flex-col rounded-xl border border-gray-200 bg-white p-6 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="text-xs text-gray-500">
                    {new Date(post.date).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}{" "}
                    · {post.author}
                  </div>
                  <h2 className="mt-2 text-xl font-semibold text-gray-900 group-hover:text-blue-600">
                    {post.title}
                  </h2>
                  <p className="text-sm text-gray-600 mt-2 leading-relaxed flex-1">
                    {post.description}
                  </p>
                  <span className="text-sm font-semibold text-blue-600 mt-4">Read post →</span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </MarketingShell>
  );
}
