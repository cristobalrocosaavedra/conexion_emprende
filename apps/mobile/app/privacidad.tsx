import { messages as t } from "@territorio-vivo/i18n";
import { LegalPage } from "../src/LegalPage";

export default function Privacy() {
  return <LegalPage title={t.legal.privacyTitle} sections={t.legal.privacy} />;
}
