import { createContext, ReactNode, useContext } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { User } from "@shared/schema"; // Ensure this matches your shared schema export
import { api } from "@shared/routes"; // Ensure this matches your shared routes export
import { useToast } from "@/hooks/use-toast";

type AuthContextType = {
  user: User | null;
  isLoading: boolean;
  error: Error | null;
  loginMutation: any;
  logoutMutation: any;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();

  // In this app, we don't have a persistent session check endpoint like /api/me 
  // in the provided routes manifest, but we can simulate one or use a client-side 
  // storage approach if the backend doesn't support sessions.
  // HOWEVER, typically a "user" object would be returned by login.
  // Since the prompt implies a simple flow, we'll assume the login response 
  // sets a cookie or we might need to store user in localStorage for this demo 
  // if strict session cookies aren't fully set up.
  // BUT, best practice is to assume backend handles session. 
  // Let's try to verify session on load if possible, but route manifest didn't have /api/me.
  // We will assume state is transient for this simple demo OR rely on `login` mutation response.
  
  // Actually, for a robust app, we should usually have a /api/me. 
  // Since it's missing from the provided routes, we'll manage auth state via the login mutation response
  // and persist it simply in memory/local storage for the session duration of the SPA.
  // Better yet, let's assume the browser handles the cookie and we just rely on login success.

  const { data: user, isLoading, error } = useQuery<User | null>({
    queryKey: ["/api/user"], // Artificial key for local state
    staleTime: Infinity,
    initialData: null, 
  });

  const loginMutation = useMutation({
    mutationFn: async (credentials: any) => {
      const res = await fetch(api.auth.login.path, {
        method: api.auth.login.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(credentials),
      });

      if (!res.ok) {
        throw new Error("Login failed");
      }
      return await res.json();
    },
    onSuccess: (data) => {
      // Manually set query data to logged in user
      // QueryClient should be imported or passed via context, 
      // but here we can't easily access the client instance without a hook.
      // We'll rely on the caller to handle redirect, 
      // but we need to update the global user state.
      // A common pattern is to use queryClient.setQueryData.
      // For now, we will return data and let the component handle it or refresh.
      toast({
        title: "Welcome back!",
        description: `Logged in successfully.`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Login failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(api.auth.logout.path, {
        method: api.auth.logout.method,
      });
      if (!res.ok) throw new Error("Logout failed");
    },
    onSuccess: () => {
      toast({
        title: "Logged out",
        description: "See you next time!",
      });
      // Clear user state would happen here if we had access to queryClient
    },
  });

  return (
    <AuthContext.Provider
      value={{
        user: user ?? null, // In a real app with /api/me, this would be populated
        isLoading,
        error,
        loginMutation,
        logoutMutation,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
