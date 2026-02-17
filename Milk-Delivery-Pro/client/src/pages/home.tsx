import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/use-auth"; // Artificial hook, mostly for structure
import { Milk, ShieldCheck, User } from "lucide-react";
import { motion } from "framer-motion";

export default function Home() {
  const [, setLocation] = useLocation();
  const [ownerPin, setOwnerPin] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const { loginMutation } = useAuth();

  const handleOwnerLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const user = await loginMutation.mutateAsync({
        type: "owner",
        pin: ownerPin
      });
      // Store session manually for this demo since we don't have full session cookies setup in prompt
      localStorage.setItem("user_session", JSON.stringify(user));
      setLocation("/owner");
    } catch (err) {
      // Error handled by mutation
    }
  };

  const handleCustomerLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const user = await loginMutation.mutateAsync({
        type: "customer",
        username,
        password
      });
      localStorage.setItem("user_session", JSON.stringify(user));
      setLocation(`/customer/${user.id}`);
    } catch (err) {
      // Error handled by mutation
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      {/* Decorative background elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-10 left-10 w-64 h-64 bg-teal-500/10 rounded-full blur-[80px]" />
        <div className="absolute bottom-10 right-10 w-80 h-80 bg-blue-600/10 rounded-full blur-[100px]" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md z-10"
      >
        <div className="text-center mb-8">
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-teal-400 to-blue-500 rounded-2xl flex items-center justify-center shadow-lg shadow-teal-500/20 mb-4">
            <Milk className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold font-display text-white mb-2">Milk Delivery</h1>
          <p className="text-slate-400">Ultra Pro 2.0 Management System</p>
        </div>

        <Card className="border-white/10 bg-white/5 backdrop-blur-xl shadow-2xl text-slate-100">
          <CardHeader>
            <CardTitle className="text-center text-xl">Welcome Back</CardTitle>
            <CardDescription className="text-center text-slate-400">Please select your login type</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="owner" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6 bg-slate-800/50">
                <TabsTrigger value="owner" className="data-[state=active]:bg-teal-600 data-[state=active]:text-white">
                  Owner
                </TabsTrigger>
                <TabsTrigger value="customer" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
                  Customer
                </TabsTrigger>
              </TabsList>

              <TabsContent value="owner">
                <form onSubmit={handleOwnerLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="pin" className="text-slate-300">Access PIN</Label>
                    <div className="relative">
                      <ShieldCheck className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                      <Input
                        id="pin"
                        type="password"
                        placeholder="Enter PIN (e.g. 1234)"
                        value={ownerPin}
                        onChange={(e) => setOwnerPin(e.target.value)}
                        className="pl-9 bg-slate-900/50 border-slate-700 text-white placeholder:text-slate-600 focus:border-teal-500 transition-colors"
                      />
                    </div>
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full bg-gradient-to-r from-teal-600 to-teal-500 hover:from-teal-500 hover:to-teal-400 text-white shadow-lg shadow-teal-500/20"
                    disabled={loginMutation.isPending}
                  >
                    {loginMutation.isPending ? "Verifying..." : "Access Dashboard"}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="customer">
                <form onSubmit={handleCustomerLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="username" className="text-slate-300">Username</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                      <Input
                        id="username"
                        placeholder="Your Name"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="pl-9 bg-slate-900/50 border-slate-700 text-white placeholder:text-slate-600 focus:border-blue-500 transition-colors"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-slate-300">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="Your Password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="bg-slate-900/50 border-slate-700 text-white placeholder:text-slate-600 focus:border-blue-500 transition-colors"
                    />
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white shadow-lg shadow-blue-500/20"
                    disabled={loginMutation.isPending}
                  >
                    {loginMutation.isPending ? "Logging in..." : "View My Bill"}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
