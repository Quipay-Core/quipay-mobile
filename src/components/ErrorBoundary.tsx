import { Component, ReactNode } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";

interface Props  { children: ReactNode }
interface State  { hasError: boolean; message: string }

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, message: "" };

  static getDerivedStateFromError(error: unknown): State {
    return {
      hasError: true,
      message:  error instanceof Error ? error.message : "An unexpected error occurred.",
    };
  }

  handleRetry = () => this.setState({ hasError: false, message: "" });

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <View style={styles.container}>
        <Text style={styles.title}>Something went wrong</Text>
        <Text style={styles.message}>{this.state.message}</Text>
        <TouchableOpacity style={styles.btn} onPress={this.handleRetry}>
          <Text style={styles.btnText}>Try again</Text>
        </TouchableOpacity>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000", alignItems: "center", justifyContent: "center", padding: 32 },
  title:     { fontFamily: "Urbanist_700Bold", fontSize: 20, color: "#fff", marginBottom: 12, textAlign: "center" },
  message:   { fontFamily: "Urbanist_400Regular", fontSize: 14, color: "#8e8e93", textAlign: "center", lineHeight: 22, marginBottom: 32 },
  btn:       { backgroundColor: "#F5C249", borderRadius: 14, paddingVertical: 14, paddingHorizontal: 32 },
  btnText:   { fontFamily: "Urbanist_700Bold", fontSize: 15, color: "#000" },
});
