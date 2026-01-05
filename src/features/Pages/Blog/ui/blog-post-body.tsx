export function BlogPostBody({ html }: { html: string }) {
  return (
    <section className="mx-auto max-w-5xl px-4 py-10">
      <div
        className="prose prose-neutral max-w-none text-[.9rem] leading-6 dark:prose-invert sm:text-[1rem]"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </section>
  );
}
