import Link from "next/link";
import { notFound } from "next/navigation";
import { getAllPosts, getPostBySlug } from "@/lib/blog";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const posts = await getAllPosts();
  return posts.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) return { title: "Post not found" };
  const url = `https://goodtally.app/blog/${post.slug}`;
  return {
    title: `${post.title} — GoodTally`,
    description: post.description,
    alternates: { canonical: url },
    openGraph: {
      title: post.title,
      description: post.description,
      type: "article",
      url,
      publishedTime: post.date,
      authors: [post.author],
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.description,
    },
  };
}

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) notFound();

  return (
    <main className="min-h-screen bg-white">
      <article className="max-w-2xl mx-auto px-6 py-16">
        <div className="mb-6">
          <Link href="/blog" className="text-sm text-blue-700 hover:underline">← All posts</Link>
        </div>
        <h1 className="text-4xl font-bold text-gray-900 tracking-tight leading-tight">{post.title}</h1>
        <div className="mt-4 text-sm text-gray-500">
          {new Date(post.date).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })} · Written by {post.author}, Founder of GoodTally
        </div>
        <div
          className="prose prose-lg prose-blue mt-8 text-gray-800 leading-relaxed [&>h2]:text-2xl [&>h2]:font-bold [&>h2]:mt-10 [&>h2]:mb-3 [&>h3]:text-xl [&>h3]:font-semibold [&>h3]:mt-8 [&>h3]:mb-2 [&>p]:my-4 [&>ul]:my-4 [&>ul]:pl-6 [&>ul]:list-disc [&>li]:my-1 [&_a]:text-blue-700 [&_a]:underline [&_code]:bg-gray-100 [&_code]:px-1 [&_code]:rounded"
          dangerouslySetInnerHTML={{ __html: post.html }}
        />
        {/* End-of-post CTA */}
        <div className="mt-16 rounded-lg border border-blue-200 bg-blue-50 p-6 text-center">
          <h2 className="text-xl font-bold text-gray-900">Ready to get organized?</h2>
          <p className="mt-2 text-gray-700">Try GoodTally free. No credit card, no time limit, no upsells.</p>
          <Link href="/signup" className="mt-4 inline-block bg-blue-600 text-white font-semibold px-6 py-3 rounded-md hover:bg-blue-700">
            Start free
          </Link>
        </div>
      </article>
    </main>
  );
}
