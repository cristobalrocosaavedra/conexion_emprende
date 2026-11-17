import type { Metadata } from "next";
import { Shell } from "../../../src/Shell";
import { TerritoryPage } from "../../../src/TerritoryPage";
import { pageParams, pageMeta, hereLabel } from "../../../src/rutas";

export const dynamicParams = false;
export const generateStaticParams = () => pageParams("commune");
export async function generateMetadata({
  params,
}: {
  params: Promise<{ comuna: string }>;
}): Promise<Metadata> {
  return pageMeta("commune", (await params).comuna, "business");
}
export default async function Page({
  params,
}: {
  params: Promise<{ comuna: string }>;
}) {
  const id = (await params).comuna;
  return (
    <Shell here={hereLabel("commune", id)}>
      <TerritoryPage level="commune" id={id} tab="business" />
    </Shell>
  );
}
