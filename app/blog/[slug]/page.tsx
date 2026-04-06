import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getAllPosts, getPostBySlug } from "@/lib/blog";
import { MarketingShell } from "@/components/layout/marketing-shell";

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
    <MarketingShell>
      <article className="mx-auto max-w-2xl px-4 py-16 lg:py-20">
        <Link
          href="/blog"
          className="text-sm font-medium text-blue-600 hover:text-blue-700 inline-flex items-center gap-1 mb-8"
        >
          <ArrowLeft className="h-4 w-4" />
          All posts
        </Link>

        <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3.5 py-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
          <span className="text-xs font-semibold uppercase tracking-wide text-blue-700">
            Blog Post
          </span>
        </div>

        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-gray-900 leading-tight mb-4">
          {post.title}
        </h1>

        <div className="text-sm text-gray-500 mb-10 pb-10 border-b border-gray-100">
          {new Date(post.date).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
          <span className="mx-2">·</span>
          {post.author}
        </div>

        <div
          className="text-gray-700 leading-relaxed text-lg [&>h2]:text-2xl [&>h2]:font-bold [&>h2]:text-gray-900 [&>h2]:mt-12 [&>h2]:mb-4 [&>h3]:text-xl [&>h3]:font-semibold [&>h3]:text-gray-900 [&>h3]:mt-10 [&>h3]:mb-3 [&>p]:my-5 [&>ul]:my-5 [&>ul]:pl-6 [&>ul]:list-disc [&>ul>li]:my-2 [&_a]:text-blue-600 [&_a]:font-medium [&_a]:underline [&_a]:decoration-blue-200 [&_a]:underline-offset-2 [&_a:hover]:decoration-blue-600 [&_strong]:font-semibold [&_strong]:text-gray-900 [&_code]:bg-gray-100 [&_code]:text-gray-800 [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded [&_code]:text-sm [&_code]:font-mono [&>hr]:my-10 [&>hr]:border-gray-200"
          dangerouslySetInnerHTML={{ __html: post.html }}
        />

        <div className="mt-12 rounded-xl border border-gray-200 bg-gray-50 p-5 text-sm text-gray-600">
          Written by <span className="font-semibold text-gray-900">{post.author}</span>, Founder of GoodTally.
        </div>
      </article>
    </MarketingShell>
  );
}
