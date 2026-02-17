import { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { LogOut } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface LayoutShellProps {
  children: ReactNode;
  title?: string;
  onLogout?: () => void;
  showLogout?: boolean;
}

export function LayoutShell({ children, title, onLogout, showLogout = true }: LayoutShellProps) {
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const handleLogout = () => {
    if (onLogout) {
      onLogout();
    }
    // Simulate logout for this simple demo structure
    localStorage.removeItem("user_session");
    setLocation("/");
    toast({ title: "Logged out" });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-slate-50 font-sans">
      <div className="max-w-md mx-auto min-h-screen flex flex-col shadow-2xl bg-slate-50/5 relative overflow-hidden">
        {/* Background decorative blobs */}
        <div className="absolute top-[-10%] left-[-20%] w-[300px] h-[300px] bg-primary/20 rounded-full blur-[80px] pointer-events-none" />
        <div className="absolute bottom-[-10%] right-[-20%] w-[300px] h-[300px] bg-blue-600/20 rounded-full blur-[80px] pointer-events-none" />

        <header className="p-6 flex items-center justify-between backdrop-blur-md bg-white/5 border-b border-white/10 sticky top-0 z-10">
          <div>
             <h1 className="text-xl font-bold font-display bg-clip-text text-transparent bg-gradient-to-r from-teal-200 to-teal-400">
              {title || "Milk Delivery"}
            </h1>
            <p className="text-xs text-slate-400">Ultra Pro 2.0</p>
          </div>
          
          {showLogout && (
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={handleLogout}
              className="text-slate-400 hover:text-white hover:bg-white/10"
            >
              <LogOut className="h-5 w-5" />
            </Button>
          )}
        </header>

        <main className="flex-1 p-4 md:p-6 overflow-y-auto">
          <div className="space-y-6 pb-20">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
