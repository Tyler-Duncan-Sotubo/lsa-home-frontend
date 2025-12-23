import PublicInvoiceClient from "@/features/invoice/public-Invoice-client";

type PageParams = { token: string };
type PageProps = {
  params: Promise<PageParams>;
};

const page = async ({ params }: PageProps) => {
  const { token } = await params;
  return <PublicInvoiceClient token={token} />;
};

export default page;
