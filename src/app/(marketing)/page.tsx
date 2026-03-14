import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { MarketingLandingPage } from "@/components/landing/marketing-page";
import { auth } from "@/lib/auth";

export default async function Page() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (session) {
    redirect("/workflows");
  }

  return <MarketingLandingPage />;
}
