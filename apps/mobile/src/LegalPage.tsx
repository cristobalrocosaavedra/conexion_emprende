import {
  ScrollView,
  StyleSheet,
  Text,
  View,
  useColorScheme,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { resolveTheme } from "@territorio-vivo/core";
import { messages as t } from "@territorio-vivo/i18n";
import { palettes } from "@territorio-vivo/design-tokens";
import { usePreferences } from "./usePreferences";
import { Action } from "./ui";

export function LegalPage({
  title,
  sections,
}: {
  title: string;
  sections: readonly { title: string; body: string }[];
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
        <Text
          style={[
            styles.draft,
            { color: colors.text, backgroundColor: colors.badge },
          ]}
        >
          {t.legal.draft}
        </Text>
        {sections.map((section) => (
          <View key={section.title} style={styles.section}>
            <Text
              accessibilityRole="header"
              style={[styles.subtitle, { color: colors.text }]}
            >
              {section.title}
            </Text>
            <Text style={[styles.body, { color: colors.text }]}>
              {section.body}
            </Text>
          </View>
        ))}
        <Text style={[styles.note, { color: colors.muted }]}>
          {t.legal.updated} · {t.commercial.team}
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

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
  draft: {
    fontSize: 14,
    lineHeight: 20,
    padding: 12,
    borderRadius: 12,
    overflow: "hidden",
  },
  section: { gap: 6 },
  subtitle: { fontSize: 18, fontWeight: "800" },
  body: { fontSize: 16, lineHeight: 24 },
  note: { fontSize: 13, textAlign: "center", marginTop: 8 },
});
