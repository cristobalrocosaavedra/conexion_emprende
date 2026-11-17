import { Text, View } from "react-native";
import { businessPlans, formatClp, withIva } from "@territorio-vivo/core";
import { messages as t } from "@territorio-vivo/i18n";
import { CommercialPage, commercialStyles as s } from "../src/CommercialPage";

export default function JoinBusiness() {
  const c = t.commercial;
  return (
    <CommercialPage
      title={c.joinTitle}
      intro={c.joinIntro}
      otherLink={{ label: c.municipalLink, href: "/municipios" }}
    >
      {(colors) => (
        <>
          <View style={s.list}>
            {c.rules.map((rule) => (
              <Text key={rule} style={[s.bullet, { color: colors.text }]}>
                • {rule}
              </Text>
            ))}
          </View>
          <Text
            accessibilityRole="header"
            style={[s.planName, { color: colors.text }]}
          >
            {c.plansTitle}
          </Text>
          {businessPlans.map((plan) => {
            const copy = c.plans[plan.id];
            return (
              <View
                key={plan.id}
                testID={`plan-${plan.id}`}
                style={[
                  s.plan,
                  {
                    backgroundColor: colors.surface,
                    borderColor: plan.recommended
                      ? colors.accent
                      : colors.border,
                    borderWidth: plan.recommended ? 2 : 1,
                  },
                ]}
              >
                {plan.recommended && (
                  <Text
                    style={[
                      s.badge,
                      { backgroundColor: colors.badge, color: colors.text },
                    ]}
                  >
                    {c.recommended}
                  </Text>
                )}
                <Text style={[s.planName, { color: colors.text }]}>
                  {copy.name}
                </Text>
                <Text style={[s.price, { color: colors.text }]}>
                  {formatClp(plan.netClp)} {c.plusIva}
                </Text>
                <Text style={[s.small, { color: colors.muted }]}>
                  {c.total} {formatClp(withIva(plan.netClp))} {c.perMonth}
                </Text>
                <Text style={[s.small, { color: colors.text }]}>
                  {copy.detail}
                </Text>
              </View>
            );
          })}
          <Text style={[s.small, { color: colors.text }]}>{c.annual}</Text>
          <Text style={[s.small, { color: colors.text }]}>{c.founders}</Text>
          <Text style={[s.small, { color: colors.muted }]}>{c.draftNote}</Text>
        </>
      )}
    </CommercialPage>
  );
}
