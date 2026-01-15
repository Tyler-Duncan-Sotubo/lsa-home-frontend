export function getCategoryHref(cat: {
  slug: string;
  parentId: string | null;
  isHub: boolean;
}) {
  return cat.isHub
    ? `/collections/hubs/${cat.slug}`
    : `/collections/${cat.slug}`;
}
