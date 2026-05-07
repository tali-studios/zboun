import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ slug?: string[] }>;
};

export default async function LegacyRestaurantSubpathRedirect({ params }: Props) {
  const { slug } = await params;
  const suffix = Array.isArray(slug) && slug.length > 0 ? `/${slug.join("/")}` : "";
  redirect(`/dashboard/business${suffix}`);
}
