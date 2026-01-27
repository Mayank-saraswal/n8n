import { LandingPage } from "@/components/landing/landing-page";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export default async function Page() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  return <LandingPage isAuthenticated={!!session} />;
}
