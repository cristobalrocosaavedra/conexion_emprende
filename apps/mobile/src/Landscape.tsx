import Svg, { Circle, Path, Rect } from "react-native-svg";
/** Ilustración original esquemática para el cascarón, no fotografía de un lugar. */
export function Landscape({ dark }: { dark: boolean }) {
  return (
    <Svg width="100%" height={205} viewBox="0 0 360 205" accessible={false}>
      <Rect width="360" height="205" fill={dark ? "#123B57" : "#C8E7EC"} />
      <Circle cx="286" cy="42" r="22" fill="#F8D99B" />
      <Path
        d="M0 120 Q100 25 192 106 T360 68 V205 H0Z"
        fill={dark ? "#22536A" : "#85ACAD"}
      />
      <Path
        d="M0 164 Q160 100 360 140 V205 H0Z"
        fill={dark ? "#16778A" : "#2895AA"}
      />
      <Path
        d="M0 120 L74 80 139 136 211 168 0 205Z"
        fill={dark ? "#254D48" : "#5B8872"}
      />
      {[
        { x: 20, y: 110, c: "#D97D5C" },
        { x: 57, y: 95, c: "#D7A65E" },
        { x: 95, y: 127, c: "#E9C9A0" },
        { x: 131, y: 149, c: "#C17E69" },
      ].map((h) => (
        <Path
          key={h.x}
          d={`M${h.x} ${h.y} l14 -12 14 12 v26 h-28Z`}
          fill={h.c}
        />
      ))}
      <Path
        d="M204 180 Q260 156 345 175 M226 192 Q295 175 360 186"
        stroke="#F4E4BD"
        strokeWidth="3"
        fill="none"
      />
    </Svg>
  );
}
