import { messages as t } from "@territorio-vivo/i18n";
import { Legal } from "../../src/Comercial";
import { Shell } from "../../src/Shell";

export const metadata = { title: t.legal.privacyTitle };
export default function Page() {
  return (
    <Shell>
      <Legal title={t.legal.privacyTitle} sections={t.legal.privacy} />
    </Shell>
  );
}
