import { messages as t } from "@territorio-vivo/i18n";
import { Municipal } from "../../src/Comercial";
import { Shell } from "../../src/Shell";

export const metadata = { title: t.commercial.municipalTitle };
export default function Page() {
  return (
    <Shell>
      <Municipal />
    </Shell>
  );
}
