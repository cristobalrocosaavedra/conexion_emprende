import type { Metadata } from "next";
import { Shell } from "../../../src/Shell";
import { TerritoryPage } from "../../../src/TerritoryPage";
import { pageParams, pageMeta, hereLabel } from "../../../src/rutas";

export const dynamicParams = false;
export const generateStaticParams = () => pageParams("region");
export async function generateMetadata({
  params,
}: {
  params: Promise<{ region: string }>;
}): Promise<Metadata> {
  return pageMeta("region", (await params).region, "todo");
}
export default async function Page({
  params,
}: {
  params: Promise<{ region: string }>;
}) {
  const id = (await params).region;
  return (
    <Shell here={hereLabel("region", id)}>
      <TerritoryPage level="region" id={id} tab="todo" />
    </Shell>
  );
}
