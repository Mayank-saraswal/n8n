import { AppHeader } from "@/components/app-header";
import { UsageBanner } from "@/components/usage-banner";

const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    < >
    <AppHeader/>
    <UsageBanner />
     <main className="flex-1 ">
        {children}
     </main>
    </>
  );
};

export default Layout;