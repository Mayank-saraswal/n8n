import { AppSidebar } from "@/components/app-sidebar";
import { Sidebar, SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    
      <SidebarProvider>
        <AppSidebar/>
        <SidebarInset className="bg-accent/20">
            {children}
        </SidebarInset>    
        </SidebarProvider>
    
  );
};

export default Layout;