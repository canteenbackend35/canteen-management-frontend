import { api, API_ENDPOINTS } from "@/lib/api-client";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useState } from "react";
import { Alert, StyleSheet, Text, View } from "react-native";
import { OtpInput } from "react-native-otp-entry";
import { Button, useTheme } from "react-native-paper";

export default function OTPVerificationScreen() {
  const { phone, reqId: initialReqId, role } = useLocalSearchParams<{ phone: string; reqId: string; role: string }>();
  const [currentReqId, setCurrentReqId] = useState(initialReqId);
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [otpKey, setOtpKey] = useState(0); // To force reset OtpInput
  const router = useRouter();
  const theme = useTheme();

  const handleVerify = async () => {
    if (otp.length !== 6) {
      setErrorMsg("Please enter the 6-digit code.");
      return;
    }

    setLoading(true);
    setErrorMsg(null);
    try {
      console.log("Verifying OTP for:", phone, "with reqId:", currentReqId);
      const response = await api.post(
        API_ENDPOINTS.AUTH.VERIFY_OTP,
        {
          phoneNo: phone,
          otp: otp,
          reqId: currentReqId,
          role: role,
        },
        false
      );

      console.log("Verification Response:", response);

      if (!response.success) {
        throw new Error(response.UImessage || "Invalid OTP");
      }

      // 🔥 Spec Alignment: Handle new user registration flow
      if (response.user_type === "new user") {
        router.push({
          pathname: "/auth/signup",
          params: { phone, role }
        });
        return;
      }

      // 🔥 Gold Standard: Cookies are set by backend automatically for existing users
      router.replace("/");
    } catch (err: any) {
      setErrorMsg(err.message || "Invalid OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResending(true);
    setErrorMsg(null);
    try {
      console.log("Resending OTP for:", phone);
      const response = await api.post(
        API_ENDPOINTS.AUTH.SEND_OTP,
        { phoneNo: phone },
        false
      );

      if (response.success) {
        setCurrentReqId(response.reqId);
        // 🔥 Industry Standard: Update URL params so the page is "refresh-proof"
        router.setParams({ reqId: response.reqId });
        
        setOtp("");
        setOtpKey(prev => prev + 1); // Reset the OtpInput component
        Alert.alert("Success", "A new OTP has been sent to your phone.");
      } else {
        throw new Error(response.UImessage || "Failed to resend OTP");
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to resend OTP. Please try again.");
    } finally {
      setResending(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.content}>
        <View style={styles.headerContainer}>
          <Text style={[styles.title, { color: theme.colors.onSurface }]}>Verification Code</Text>
          <Text style={[styles.subtitle, { color: theme.colors.onSurfaceVariant }]}>
            We&apos;ve sent a 6-digit code to{"\n"}
            <Text style={[styles.phoneText, { color: theme.colors.onSurface }]}>+91 {phone}</Text>
          </Text>
        </View>

        <View style={styles.otpSection}>
          <OtpInput
            key={otpKey}
            numberOfDigits={6}
            onTextChange={(text) => {
              setOtp(text);
              if (errorMsg) setErrorMsg(null);
            }}
            focusColor={theme.colors.primary}
            theme={{
              containerStyle: styles.otpContainer,
              pinCodeContainerStyle: StyleSheet.flatten([styles.pinCodeContainer, { backgroundColor: theme.colors.surface, borderColor: theme.colors.outline }]),
              pinCodeTextStyle: StyleSheet.flatten([styles.pinCodeText, { color: theme.colors.onSurface }]),
              focusStickStyle: StyleSheet.flatten([styles.focusStick, { backgroundColor: theme.colors.primary }]),
            }}
          />
        </View>

        {errorMsg && (
          <View style={[styles.errorBox, { backgroundColor: theme.colors.errorContainer, borderColor: theme.colors.error }]}>
            <Text style={[styles.errorText, { color: theme.colors.error }]}>{errorMsg}</Text>
          </View>
        )}

        <Button
          mode="contained"
          onPress={handleVerify}
          loading={loading}
          disabled={loading || resending || otp.length !== 6}
          style={styles.button}
          contentStyle={styles.buttonContent}
          buttonColor={theme.colors.primary}
        >
          Verify & Continue
        </Button>

        <View style={styles.resendContainer}>
          <Text style={[styles.resendText, { color: theme.colors.onSurfaceVariant }]}>Didn&apos;t receive code? </Text>
          <Button
            mode="text"
            compact
            onPress={handleResend}
            loading={resending}
            disabled={loading || resending}
            textColor={theme.colors.primary}
            labelStyle={styles.resendButtonLabel}
          >
            Resend
          </Button>
        </View>
      </View>

      <Button
        mode="text"
        onPress={() => router.back()}
        style={styles.backButton}
        textColor={theme.colors.onSurfaceVariant}
      >
        Change Phone Number
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingVertical: 60,
    justifyContent: "space-between",
  },
  content: {
    marginTop: 40,
  },
  headerContainer: {
    marginBottom: 40,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 20,
  },
  phoneText: {
    fontWeight: "600",
  },
  otpSection: {
    marginBottom: 32,
  },
  otpContainer: {
    width: "100%",
    justifyContent: "space-between",
  },
  pinCodeContainer: {
    width: 44,
    height: 50,
    borderRadius: 12,
    borderWidth: 1.5,
  },
  pinCodeText: {
    fontSize: 20,
    fontWeight: "800",
  },
  focusStick: {
  },
  errorBox: {
    padding: 14,
    borderRadius: 14,
    marginBottom: 20,
    borderWidth: 1.5,
  },
  errorText: {
    fontSize: 15,
    fontWeight: "600",
    textAlign: "center",
  },
  button: {
    borderRadius: 16,
    elevation: 0,
  },
  buttonContent: {
    height: 50,
  },
  resendContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 24,
  },
  resendText: {
    fontSize: 15,
  },
  resendButtonLabel: {
    fontSize: 15,
    fontWeight: "600",
    marginHorizontal: 0,
  },
  backButton: {
    alignSelf: "center",
  },
});

