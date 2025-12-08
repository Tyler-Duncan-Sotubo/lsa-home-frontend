/* eslint-disable @typescript-eslint/no-explicit-any */
type WpFetchArgs = {
  query: string;
  variables?: Record<string, unknown>;
  revalidate?: number;
  tags?: string[]; // must be strings only
};

export async function wpFetch<T>({
  query,
  variables,
  revalidate,
  tags,
}: WpFetchArgs): Promise<T> {
  const nextOpts: { revalidate?: number; tags?: string[] } = {};

  if (typeof revalidate === "number") nextOpts.revalidate = revalidate;

  if (Array.isArray(tags)) {
    const clean = tags.filter(
      (t): t is string => typeof t === "string" && t.length > 0
    );
    if (clean.length) nextOpts.tags = clean;
  }

  const res = await fetch(process.env.NEXT_PUBLIC_WP_GRAPHQL_ENDPOINT!, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query, variables }),
    next: nextOpts, // safe now
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`WP fetch failed ${res.status}: ${text}`);
  }

  const json = (await res.json()) as { data?: T; errors?: any };
  if (json.errors?.length) {
    throw new Error(`WPGraphQL errors: ${JSON.stringify(json.errors)}`);
  }
  return json.data as T;
}
