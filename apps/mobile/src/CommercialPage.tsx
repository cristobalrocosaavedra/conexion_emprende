import type { ReactNode } from "react";
import {
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useColorScheme,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { resolveTheme, teamContact } from "@territorio-vivo/core";
import { messages as t } from "@territorio-vivo/i18n";
import { palettes } from "@territorio-vivo/design-tokens";
import { usePreferences } from "./usePreferences";
import { Action } from "./ui";
import type { Palette } from "./ui";

// Las variables EXPO_PUBLIC_ se incrustan al compilar; son datos públicos.
const contact = teamContact({
  EXPO_PUBLIC_CONTACTO_CORREO: process.env.EXPO_PUBLIC_CONTACTO_CORREO,
  EXPO_PUBLIC_CONTACTO_WHATSAPP: process.env.EXPO_PUBLIC_CONTACTO_WHATSAPP,
});

export function CommercialPage({
  title,
  intro,
  children,
  otherLink,
}: {
  title: string;
  intro: string;
  children: (colors: Palette) => ReactNode;
  otherLink: { label: string; href: "/suma-tu-negocio" | "/municipios" };
}) {
  const { preferences } = usePreferences();
  const colors = palettes[resolveTheme(preferences.theme, useColorScheme())];
  const back = () => (router.canGoBack() ? router.back() : router.replace("/"));
  return (
    <SafeAreaView style={[styles.page, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.top}>
          <Action
            label={`← ${t.commercial.back}`}
            onPress={back}
            colors={colors}
            small
          />
        </View>
        <Text
          accessibilityRole="header"
          style={[styles.title, { color: colors.text }]}
        >
          {title}
        </Text>
        <Text style={[styles.body, { color: colors.text }]}>{intro}</Text>
        {children(colors)}
        <View
          style={[
            styles.box,
            { borderColor: colors.border, backgroundColor: colors.surface },
          ]}
        >
          <Text
            accessibilityRole="header"
            style={[styles.subtitle, { color: colors.text }]}
          >
            {t.commercial.contactTitle}
          </Text>
          {contact.email && (
            <Action
              label={t.commercial.email}
              primary
              colors={colors}
              onPress={() => void Linking.openURL(`mailto:${contact.email}`)}
            />
          )}
          {contact.whatsapp && (
            <Action
              label={t.commercial.whatsapp}
              colors={colors}
              onPress={() =>
                void Linking.openURL(`https://wa.me/${contact.whatsapp}`)
              }
            />
          )}
          {!contact.email && !contact.whatsapp && (
            <Text style={[styles.body, { color: colors.muted }]}>
              {t.commercial.contactSoon}
            </Text>
          )}
        </View>
        <Action
          label={otherLink.label}
          colors={colors}
          onPress={() => router.push(otherLink.href)}
        />
        <View style={styles.legal}>
          <Action
            label={t.commercial.termsLink}
            colors={colors}
            small
            onPress={() => router.push("/terminos")}
          />
          <Action
            label={t.commercial.privacyLink}
            colors={colors}
            small
            onPress={() => router.push("/privacidad")}
          />
        </View>
        <Text style={[styles.note, { color: colors.muted }]}>
          {t.commercial.team}
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

export const commercialStyles = StyleSheet.create({
  list: { gap: 8 },
  bullet: { fontSize: 16, lineHeight: 24 },
  plan: { borderWidth: 1, borderRadius: 18, padding: 16, gap: 6 },
  planName: { fontSize: 20, fontWeight: "800" },
  price: { fontSize: 26, fontWeight: "800" },
  small: { fontSize: 14, lineHeight: 20 },
  badge: {
    alignSelf: "flex-start",
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 3,
    fontSize: 13,
    fontWeight: "700",
    overflow: "hidden",
  },
});

const styles = StyleSheet.create({
  page: { flex: 1 },
  content: {
    padding: 20,
    gap: 16,
    width: "100%",
    maxWidth: 720,
    alignSelf: "center",
  },
  top: { flexDirection: "row" },
  title: { fontSize: 30, fontWeight: "800", lineHeight: 36 },
  subtitle: { fontSize: 20, fontWeight: "800" },
  body: { fontSize: 16, lineHeight: 24 },
  box: { borderWidth: 1, borderRadius: 18, padding: 16, gap: 10 },
  legal: { flexDirection: "row", gap: 8, justifyContent: "center" },
  note: { fontSize: 13, textAlign: "center", marginTop: 8 },
});
