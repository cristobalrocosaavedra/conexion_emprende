/* eslint-disable @typescript-eslint/no-require-imports -- Metro empaqueta recursos de marca con rutas estáticas. */
import { Image, Modal, Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { messages as t } from "@territorio-vivo/i18n";
import { Action } from "./ui";
import type { Palette } from "./ui";
const icon = require("../assets/marca/latitud-viva-icono.webp");
const zones = require("../assets/marca/latitud-viva-zonas.webp");

export function Brand({
  colors,
  onPress,
}: {
  colors: Palette;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={t.brandIdentity.open}
      onPress={onPress}
      style={{
        flexDirection: "row",
        alignItems: "center",
        gap: 7,
        minHeight: 48,
      }}
    >
      <Image
        testID="brand-symbol"
        source={icon}
        accessible={false}
        resizeMode="contain"
        style={{ width: 40, height: 40, borderRadius: 11 }}
      />
      <Text
        style={{
          color: colors.text,
          fontSize: 20,
          fontWeight: "800",
          letterSpacing: -0.6,
          flexShrink: 1,
        }}
      >
        {t.brand}
      </Text>
    </Pressable>
  );
}

export function BrandDialog({
  visible,
  onClose,
  colors,
  reduceMotion,
}: {
  visible: boolean;
  onClose: () => void;
  colors: Palette;
  reduceMotion: boolean;
}) {
  return (
    <Modal
      visible={visible}
      onRequestClose={onClose}
      animationType={reduceMotion ? "none" : "fade"}
    >
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
        <View style={{ padding: 16, alignItems: "flex-end" }}>
          <Action label={t.close} onPress={onClose} colors={colors} small />
        </View>
        <ScrollView
          contentContainerStyle={{
            padding: 20,
            gap: 16,
            width: "100%",
            maxWidth: 640,
            alignSelf: "center",
          }}
        >
          <Text style={{ color: colors.text, fontSize: 25, fontWeight: "700" }}>
            {t.brandIdentity.title}
          </Text>
          <View
            style={{
              width: "100%",
              aspectRatio: 1,
              borderRadius: 20,
              overflow: "hidden",
              backgroundColor: "#22162E",
            }}
          >
            <Image
              source={zones}
              accessible
              accessibilityLabel={t.brandIdentity.image}
              resizeMode="contain"
              style={{ width: "100%", height: "100%" }}
            />
          </View>
          <Text style={{ color: colors.text, fontSize: 15, lineHeight: 23 }}>
            {t.brandIdentity.description}
          </Text>
          <Text style={{ color: colors.muted, fontSize: 12, lineHeight: 19 }}>
            {t.brandIdentity.symbolic}
          </Text>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}
