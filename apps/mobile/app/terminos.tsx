import { messages as t } from "@territorio-vivo/i18n";
import { LegalPage } from "../src/LegalPage";

export default function Terms() {
  return <LegalPage title={t.legal.termsTitle} sections={t.legal.terms} />;
}
