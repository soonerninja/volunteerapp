import Link from "next/link";
import { getAllPosts } from "@/lib/blog";

export const metadata = {
  title: "GoodTally Blog — Volunteer Management Tips for Small Nonprofits",
  description:
    "Practical advice on volunteer management, hours tracking, event planning, and running lean nonprofit operations.",
  alternates: { canonical: "https://goodtally.app/blog" },
};

export default async function BlogIndexPage() {
  const posts = await getAllPosts();

  return (
    <main className="min-h-screen bg-white">
      <section className="border-b border-gray-200 bg-gradient-to-b from-blue-50 to-white">
        <div className="max-w-3xl mx-auto px-6 py-16">
          <h1 className="text-4xl font-bold text-gray-900 tracking-tight">The GoodTally Blog</h1>
          <p className="mt-3 text-lg text-gray-600">
            Practical advice on volunteer management, hours tracking, and running small nonprofits
            without burning out (or paying $500/month for software you don't need).
          </p>
        </div>
      </section>

      <section className="max-w-3xl mx-auto px-6 py-12">
        {posts.length === 0 ? (
          <p className="text-gray-500">No posts yet — check back soon.</p>
        ) : (
          <ul className="divide-y divide-gray-200">
            {posts.map((post) => (
              <li key={post.slug} className="py-8">
                <Link href={`/blog/${post.slug}`} className="block group">
                  <h2 className="text-2xl font-semibold text-gray-900 group-hover:text-blue-700">
                    {post.title}
                  </h2>
                  <div className="mt-1 text-sm text-gray-500">
                    {new Date(post.date).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })} · {post.author}
                  </div>
                  <p className="mt-3 text-gray-700">{post.description}</p>
                  <span className="mt-3 inline-block text-blue-700 font-medium">Read post →</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
