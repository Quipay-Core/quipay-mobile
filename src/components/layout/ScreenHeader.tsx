import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useMemo } from "react";
import { Ionicons } from "@expo/vector-icons";
import { LogoWordmark } from "../ui/Logo";
import { ThemeColors } from "../../constants/theme";
import { useTheme } from "../../context/ThemeContext";

interface ScreenHeaderProps {
  title: string;
  subtitle?: string;
  showLogo?: boolean;
  rightIcon?: React.ComponentProps<typeof Ionicons>["name"];
  onRightPress?: () => void;
}

export function ScreenHeader({ title, subtitle, showLogo, rightIcon, onRightPress }: ScreenHeaderProps) {
  const { colors: c } = useTheme();
  const styles = useMemo(() => makeStyles(c), [c]);

  return (
    <View style={styles.header}>
      <View style={styles.left}>
        {showLogo ? (
          <LogoWordmark size={26} variant="gradient" />
        ) : (
          <View>
            <Text style={styles.title}>{title}</Text>
            {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
          </View>
        )}
      </View>
      {rightIcon && (
        <TouchableOpacity style={styles.rightBtn} onPress={onRightPress}>
          <Ionicons name={rightIcon} size={22} color={c.text} />
        </TouchableOpacity>
      )}
    </View>
  );
}

const makeStyles = (c: ThemeColors) => StyleSheet.create({
  header:   { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 16 },
  left:     { flex: 1 },
  title:    { fontFamily: "Urbanist_800ExtraBold", fontSize: 24, color: c.text, letterSpacing: -0.5 },
  subtitle: { fontFamily: "Urbanist_400Regular", fontSize: 13, color: c.textMuted, marginTop: 3 },
  rightBtn: { width: 40, height: 40, borderRadius: 12, backgroundColor: c.card, alignItems: "center", justifyContent: "center" },
});
