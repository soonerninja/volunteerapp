import { promises as fs } from "fs";
import path from "path";

/**
 * Tiny markdown-based blog loader. We avoid adding gray-matter/remark as
 * deps by parsing a minimal frontmatter block and a tiny subset of
 * markdown. Posts live in /content/blog/*.md.
 *
 * Frontmatter format:
 *   ---
 *   title: Post title
 *   description: SEO description under 155 chars
 *   date: 2026-04-01
 *   author: Your Name
 *   slug: custom-slug (optional, defaults to filename)
 *   ---
 */

export interface BlogPostMeta {
  slug: string;
  title: string;
  description: string;
  date: string;
  author: string;
}

export interface BlogPost extends BlogPostMeta {
  html: string;
}

const BLOG_DIR = path.join(process.cwd(), "content", "blog");

async function readPostFile(filename: string): Promise<BlogPost | null> {
  if (!filename.endsWith(".md")) return null;
  const raw = await fs.readFile(path.join(BLOG_DIR, filename), "utf8");
  const { data, body } = parseFrontmatter(raw);
  const slug = data.slug || filename.replace(/\.md$/, "");
  return {
    slug,
    title: data.title || slug,
    description: data.description || "",
    date: data.date || "1970-01-01",
    author: data.author || "GoodTally",
    html: renderMarkdown(body),
  };
}

export async function getAllPosts(): Promise<BlogPostMeta[]> {
  try {
    const files = await fs.readdir(BLOG_DIR);
    const posts = await Promise.all(files.map(readPostFile));
    return posts
      .filter((p): p is BlogPost => p !== null)
      .sort((a, b) => b.date.localeCompare(a.date))
      .map(({ html: _html, ...meta }) => meta); // eslint-disable-line @typescript-eslint/no-unused-vars
  } catch {
    return [];
  }
}

export async function getPostBySlug(slug: string): Promise<BlogPost | null> {
  const files = await fs.readdir(BLOG_DIR).catch(() => [] as string[]);
  for (const file of files) {
    const post = await readPostFile(file);
    if (post && post.slug === slug) return post;
  }
  return null;
}

function parseFrontmatter(src: string): { data: Record<string, string>; body: string } {
  const match = src.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
  if (!match) return { data: {}, body: src };
  const data: Record<string, string> = {};
  for (const line of match[1].split("\n")) {
    const kv = line.match(/^([a-zA-Z_]+):\s*(.*)$/);
    if (kv) data[kv[1]] = kv[2].replace(/^['"]|['"]$/g, "").trim();
  }
  return { data, body: match[2] };
}

/**
 * Intentionally minimal markdown renderer: headings, bold, italic, links,
 * inline code, lists, paragraphs, and hr. We control the input so we
 * don't need the full CommonMark surface area.
 */
function renderMarkdown(src: string): string {
  const lines = src.split("\n");
  const out: string[] = [];
  let inList = false;
  let para: string[] = [];

  const flushPara = () => {
    if (para.length) {
      out.push(`<p>${inline(para.join(" "))}</p>`);
      para = [];
    }
  };
  const closeList = () => {
    if (inList) {
      out.push("</ul>");
      inList = false;
    }
  };

  for (const rawLine of lines) {
    const line = rawLine.replace(/\s+$/, "");
    if (!line.trim()) {
      flushPara();
      closeList();
      continue;
    }
    const h = line.match(/^(#{1,4})\s+(.*)$/);
    if (h) {
      flushPara();
      closeList();
      const level = h[1].length + 1; // h1 in md becomes h2 (title is already h1)
      out.push(`<h${level}>${inline(h[2])}</h${level}>`);
      continue;
    }
    if (/^[-*]\s+/.test(line)) {
      flushPara();
      if (!inList) {
        out.push("<ul>");
        inList = true;
      }
      out.push(`<li>${inline(line.replace(/^[-*]\s+/, ""))}</li>`);
      continue;
    }
    if (/^---+$/.test(line)) {
      flushPara();
      closeList();
      out.push("<hr />");
      continue;
    }
    para.push(line);
  }
  flushPara();
  closeList();
  return out.join("\n");
}

function inline(text: string): string {
  let t = escapeHtml(text);
  t = t.replace(/`([^`]+)`/g, "<code>$1</code>");
  t = t.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  t = t.replace(/\*([^*]+)\*/g, "<em>$1</em>");
  // Links: whitelist safe protocols only. Drops javascript:, data:, vbscript:,
  // etc. even though our posts come from files we control — defense in depth.
  t = t.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_m, label, url) => {
    const safe = sanitizeUrl(url);
    if (!safe) return label;
    const rel = /^https?:/i.test(safe) ? ' rel="noopener noreferrer"' : "";
    const target = /^https?:/i.test(safe) ? ' target="_blank"' : "";
    return `<a href="${safe}"${target}${rel}>${label}</a>`;
  });
  return t;
}

function sanitizeUrl(url: string): string | null {
  const trimmed = url.trim();
  // Allow relative, anchor, mailto, and http(s) only.
  if (/^(https?:|mailto:|\/|#)/i.test(trimmed)) {
    return trimmed.replace(/"/g, "&quot;");
  }
  return null;
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}
