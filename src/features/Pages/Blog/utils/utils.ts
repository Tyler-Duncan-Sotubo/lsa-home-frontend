export function stripHtml(html?: string | null) {
  if (!html) return "";
  return html
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function buildExcerpt(
  post: { excerpt?: string | null; content?: string | null },
  max = 180
) {
  const raw =
    (post.excerpt && stripHtml(post.excerpt)) || stripHtml(post.content);
  if (!raw) return "";
  return raw.length > max ? `${raw.slice(0, max).trim()}…` : raw;
}

export function imageAlt(post: {
  title: string;
  coverImageUrl?: string | null;
}) {
  return post.title;
}
