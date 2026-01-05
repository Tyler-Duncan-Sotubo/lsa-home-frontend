export function getCategoryHref(cat: { name: string; slug: string }) {
  const isAllCategory = cat.name.toLowerCase().startsWith("all ");
  if (isAllCategory) {
    return `/collections/hubs/${cat.slug}`; // e.g. /collections/hubs/all-baths
  }
  // Everything else → collections
  return `/collections/${cat.slug}`; // e.g. /collections/towels
}
