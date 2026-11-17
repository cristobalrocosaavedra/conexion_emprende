import { messages as t } from "@territorio-vivo/i18n";
import { Plans } from "../../src/Comercial";
import { Shell } from "../../src/Shell";

export const metadata = { title: t.commercial.joinTitle };
export default function Page() {
  return (
    <Shell>
      <Plans />
    </Shell>
  );
}
