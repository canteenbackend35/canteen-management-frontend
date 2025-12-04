import { supabase } from "@/lib/supabase";
import * as QueryParams from "expo-auth-session/build/QueryParams";
import * as Linking from "expo-linking";
import { router } from "expo-router";
import { useEffect } from "react";

const createSessionFromUrl = async (url: string) => {
  const { params, errorCode } = QueryParams.getQueryParams(url);
  if (errorCode) throw new Error(errorCode);

  const { access_token, refresh_token } = params;

  console.log("access_token:", access_token);
  console.log("refresh_token:", refresh_token);

  // If magic link expired → redirect to auth
  if (!access_token || !refresh_token) {
    router.replace("/auth");
    return;
  }

  const { data, error } = await supabase.auth.setSession({
    access_token,
    refresh_token,
  });

  console.log("supabase error:", error?.message);

  if (error?.message === "Auth session missing!") {
    router.replace("/auth");
    return;
  }

  if (error) {
    console.log("Unexpected error:", error);
    router.replace("/auth");
    return;
  }

  if (data?.session) {
    router.replace("/");
  }
};

export default function AuthCallback() {
  const url = Linking.useLinkingURL(); // ← correct hook
  console.log(url);

  useEffect(() => {
    if (url) {
      console.log("Callback URL:", url);
      createSessionFromUrl(url);
    }
  }, [url]);

  return null;
}
