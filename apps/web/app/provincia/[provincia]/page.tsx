import type { Metadata } from "next";
import { Shell } from "../../../src/Shell";
import { TerritoryPage } from "../../../src/TerritoryPage";
import { pageParams, pageMeta, hereLabel } from "../../../src/rutas";

export const dynamicParams = false;
export const generateStaticParams = () => pageParams("province");
export async function generateMetadata({
  params,
}: {
  params: Promise<{ provincia: string }>;
}): Promise<Metadata> {
  return pageMeta("province", (await params).provincia, "todo");
}
export default async function Page({
  params,
}: {
  params: Promise<{ provincia: string }>;
}) {
  const id = (await params).provincia;
  return (
    <Shell here={hereLabel("province", id)}>
      <TerritoryPage level="province" id={id} tab="todo" />
    </Shell>
  );
}
