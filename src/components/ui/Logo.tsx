import Svg, { Circle, Mask, G, Defs, LinearGradient, Stop, Text as SvgText } from "react-native-svg";

/**
 * Exact replica of /public/quipay-logo-mark.svg
 *
 * "yellow"   → flat #F5C249          (dark backgrounds)
 * "gradient" → #F7D163 → #EDB830     (dark backgrounds, richer look)
 * "black"    → flat #000000          (yellow/gradient panel backgrounds)
 */
export type LogoVariant = "yellow" | "gradient" | "black";

const FLAT_COLOR: Record<string, string> = {
  yellow: "#F5C249",
  black:  "#000000",
};

const CIRCLES = [
  { cx: 6.29253,  cy: -2.13104 },
  { cx: 17.7105,  cy: 26.1308  },
  { cx: -2.12935, cy: 17.7093  },
  { cx: 25.8707,  cy: 5.64349  },
] as const;

interface LogoIconProps {
  size?:    number;
  variant?: LogoVariant;
}

export function LogoIcon({ size = 48, variant = "gradient" }: LogoIconProps) {
  const useGrad = variant === "gradient";
  const fill    = useGrad ? "url(#logoGrad)" : FLAT_COLOR[variant];

  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Defs>
        <LinearGradient id="logoGrad" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0"   stopColor="#F7D163" />
          <Stop offset="0.5" stopColor="#F5C249" />
          <Stop offset="1"   stopColor="#EDB830" />
        </LinearGradient>
      </Defs>
      <Mask
        id="logoMask"
        // @ts-ignore
        style={{ maskType: "alpha" }}
        maskUnits="userSpaceOnUse"
        x="0" y="0" width="24" height="24"
      >
        <Circle cx="12" cy="12" r="12" fill="#C4C4C4" />
      </Mask>
      <G mask="url(#logoMask)">
        {CIRCLES.map(({ cx, cy }, i) => (
          <Circle key={i} cx={cx} cy={cy} r={9.9559} fill={fill} />
        ))}
      </G>
    </Svg>
  );
}

interface LogoWordmarkProps {
  size?:    number;
  variant?: LogoVariant;
}

export function LogoWordmark({ size = 32, variant = "gradient" }: LogoWordmarkProps) {
  const useGrad  = variant === "gradient";
  const fill     = useGrad ? "url(#wmGrad)" : FLAT_COLOR[variant];
  const textFill = useGrad ? "url(#wmGrad)" : FLAT_COLOR[variant];
  const gap      = size * 0.4;
  const fontSize = size * 0.82;
  const totalW   = size + gap + size * 3.1;
  const scale    = size / 24;

  return (
    <Svg width={totalW} height={size} viewBox={`0 0 ${totalW} ${size}`} fill="none">
      <Defs>
        <LinearGradient id="wmGrad" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0"   stopColor="#F7D163" />
          <Stop offset="0.5" stopColor="#F5C249" />
          <Stop offset="1"   stopColor="#EDB830" />
        </LinearGradient>
      </Defs>
      <Mask
        id="wmMask"
        // @ts-ignore
        style={{ maskType: "alpha" }}
        maskUnits="userSpaceOnUse"
        x="0" y="0" width={size} height={size}
      >
        <Circle cx={size / 2} cy={size / 2} r={size / 2} fill="#C4C4C4" />
      </Mask>
      <G mask="url(#wmMask)">
        {CIRCLES.map(({ cx, cy }, i) => (
          <Circle
            key={i}
            cx={cx * scale}
            cy={cy * scale}
            r={9.9559 * scale}
            fill={fill}
          />
        ))}
      </G>
      <SvgText
        x={size + gap}
        y={size * 0.78}
        fontSize={fontSize}
        fontWeight="800"
        fontFamily="Urbanist_800ExtraBold"
        fill={textFill}
        letterSpacing={-0.5}
      >
        Quipay
      </SvgText>
    </Svg>
  );
}
