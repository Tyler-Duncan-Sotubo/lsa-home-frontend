export function cleanPriceHtml(html?: string | null): string | null {
  if (!html) return null;

  // Remove screen-reader text spans
  let output = html.replace(
    /<span class="screen-reader-text">.*?<\/span>/g,
    ""
  );

  // Remove any leftover "Price range:" text fragments
  output = output.replace(/Price range:/gi, "");
  output = output.replace(/through/gi, "–"); // optional: nicer separator

  // Trim whitespace
  return output.trim();
}
