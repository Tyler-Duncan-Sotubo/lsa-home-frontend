import { privacyPolicyHtml } from "@/assets/data/policies";

export default function PrivacyPolicyPage() {
  return (
    <main className="py-12 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto w-[90%] max-w-6xl">
        <header className="mb-10">
          <h1 className="text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
            Privacy Policy
          </h1>
          <p className="mt-3 text-sm text-slate-600 sm:text-base">
            Learn how LSA HOME collects, uses, and protects your personal
            information.
          </p>
        </header>

        <div className="space-y-8">
          {privacyPolicyHtml.map((section, index) => (
            <section
              key={index}
              className="prose prose-sm max-w-none sm:prose-base prose-headings:scroll-mt-24 prose-a:text-slate-900 prose-a:underline"
              dangerouslySetInnerHTML={{ __html: section }}
            />
          ))}
        </div>
      </div>
    </main>
  );
}
