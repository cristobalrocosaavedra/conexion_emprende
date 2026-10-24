import { messages as t } from "@territorio-vivo/i18n";
export default function Page() {
  return (
    <main>
      <span className="status">{t.webStatus}</span>
      <p className="brand">{t.brand}</p>
      <h1>{t.webTitle}</h1>
      <p>{t.webBody}</p>
      <aside>{t.demo}</aside>
    </main>
  );
}
