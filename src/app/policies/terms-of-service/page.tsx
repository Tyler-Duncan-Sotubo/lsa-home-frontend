import {
  termsOfServiceHtml,
  termsOfServiceSections14to20,
} from "@/assets/data/policies";

export default function TermsOfServicePage() {
  // merge arrays into one
  const fullTerms = [...termsOfServiceHtml, ...termsOfServiceSections14to20];

  return (
    <div className="mx-auto w-[90%] max-w-6xl my-10">
      {fullTerms.map((section, i) => (
        <div
          key={i}
          className="prose prose-slate max-w-none px-4 md:px-0"
          dangerouslySetInnerHTML={{ __html: section }}
        />
      ))}
    </div>
  );
}
