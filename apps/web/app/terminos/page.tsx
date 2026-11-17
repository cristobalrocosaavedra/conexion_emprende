import { messages as t } from "@territorio-vivo/i18n";
import { Legal } from "../../src/Comercial";
import { Shell } from "../../src/Shell";

export const metadata = { title: t.legal.termsTitle };
export default function Page() {
  return (
    <Shell>
      <Legal title={t.legal.termsTitle} sections={t.legal.terms} />
    </Shell>
  );
}
