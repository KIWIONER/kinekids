import ProductDetailClient from "./ProductDetailClient";

export async function generateStaticParams() {
  return [
    { id: "8472" },
    { id: "9451" },
    { id: "9452" },
    { id: "9453" },
    { id: "9454" },
    { id: "9455" },
    { id: "9654" },
    { id: "9655" },
    { id: "9656" },
    { id: "9860" },
    { id: "9861" },
    { id: "9679" },
    { id: "9436" },
    { id: "9445" },
    { id: "9446" },
    { id: "9447" },
    { id: "9448" },
    { id: "9449" },
    { id: "9450" },
  ];
}

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ProductPage({ params }: PageProps) {
  const resolvedParams = await params;
  return <ProductDetailClient id={resolvedParams.id} />;
}
