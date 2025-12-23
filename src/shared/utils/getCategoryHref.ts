export function getCategoryHref(cat: { name: string; slug: string }) {
  const isAllCategory = cat.name.toLowerCase().startsWith("all ");
  if (isAllCategory) {
    return `/pages/${cat.slug}`; // e.g. /pages/all-baths
  }
  // Everything else → collections
  return `/collections/${cat.slug}`; // e.g. /collections/towels
}
