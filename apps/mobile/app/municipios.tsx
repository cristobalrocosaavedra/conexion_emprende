import { Text, View } from "react-native";
import { messages as t } from "@territorio-vivo/i18n";
import { CommercialPage, commercialStyles as s } from "../src/CommercialPage";

export default function Municipalities() {
  const c = t.commercial;
  return (
    <CommercialPage
      title={c.municipalTitle}
      intro={c.municipalIntro}
      otherLink={{ label: c.businessLink, href: "/suma-tu-negocio" }}
    >
      {(colors) => (
        <>
          <View style={s.list}>
            {c.municipalPoints.map((point) => (
              <Text key={point} style={[s.bullet, { color: colors.text }]}>
                • {point}
              </Text>
            ))}
          </View>
          <Text style={[s.small, { color: colors.text }]}>
            {c.municipalPrice}
          </Text>
        </>
      )}
    </CommercialPage>
  );
}
