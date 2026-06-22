import { Component, ReactNode } from "react";
import { View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

/**
 * Wraps LinearGradient in a per-component error boundary.
 * In Expo Go with a mismatched SDK, expo-linear-gradient's native view
 * is not registered and throws during render. This catches that error
 * and falls back to a plain View using the first gradient color.
 * In EAS / production builds the real gradient renders normally.
 */

interface Props {
  colors: readonly [string, string, ...string[]];
  start?:    { x: number; y: number };
  end?:      { x: number; y: number };
  style?:    any;
  children?: ReactNode;
}

interface State { crashed: boolean }

export class SafeGradient extends Component<Props, State> {
  state: State = { crashed: false };

  static getDerivedStateFromError(): State {
    return { crashed: true };
  }

  render() {
    const { colors, style, children, ...rest } = this.props;

    if (this.state.crashed) {
      return (
        <View style={[{ backgroundColor: colors[0] }, style]}>
          {children}
        </View>
      );
    }

    return (
      <LinearGradient colors={colors} style={style} {...rest}>
        {children}
      </LinearGradient>
    );
  }
}
