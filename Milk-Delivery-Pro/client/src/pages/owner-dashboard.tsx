import { useState } from "react";
import { LayoutShell } from "@/components/layout-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { useCustomers, useCreateCustomer, useDeleteCustomer } from "@/hooks/use-customers";
import { useAddMilk } from "@/hooks/use-milk";
import { Plus, UserPlus, Droplets, Trash2, Search, TrendingUp } from "lucide-react";
import { format } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";

export default function OwnerDashboard() {
  const { data: customers, isLoading } = useCustomers();
  const createCustomer = useCreateCustomer();
  const deleteCustomer = useDeleteCustomer();
  const addMilk = useAddMilk();

  const [selectedCustomerId, setSelectedCustomerId] = useState<string>("");
  const [milkQty, setMilkQty] = useState("");
  
  // New Customer State
  const [newCustomerOpen, setNewCustomerOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [newPass, setNewPass] = useState("");
  const [newRate, setNewRate] = useState("60");

  const [searchTerm, setSearchTerm] = useState("");

  const handleAddMilk = async () => {
    if (!selectedCustomerId || !milkQty) return;
    
    await addMilk.mutateAsync({
      userId: parseInt(selectedCustomerId),
      quantity: parseFloat(milkQty),
      date: format(new Date(), 'yyyy-MM-dd')
    });
    setMilkQty("");
  };

  const handleCreateCustomer = async () => {
    if (!newName || !newPass || !newRate) return;
    
    await createCustomer.mutateAsync({
      username: newName,
      password: newPass,
      rate: parseInt(newRate)
    });
    setNewCustomerOpen(false);
    setNewName("");
    setNewPass("");
  };

  const filteredCustomers = customers?.filter(c => 
    c.username.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  return (
    <LayoutShell title="Owner Dashboard">
      
      {/* Quick Stats Section (Mock Data for visual depth) */}
      <div className="grid grid-cols-2 gap-4 mb-2">
        <Card className="bg-gradient-to-br from-teal-500/20 to-teal-600/10 border-teal-500/20">
          <CardContent className="p-4 flex flex-col items-center justify-center text-center">
            <div className="bg-teal-500/20 p-2 rounded-full mb-2">
              <UserPlus className="h-5 w-5 text-teal-300" />
            </div>
            <p className="text-2xl font-bold text-teal-100">{customers?.length || 0}</p>
            <p className="text-xs text-teal-300/70">Customers</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-blue-500/20 to-blue-600/10 border-blue-500/20">
          <CardContent className="p-4 flex flex-col items-center justify-center text-center">
             <div className="bg-blue-500/20 p-2 rounded-full mb-2">
              <TrendingUp className="h-5 w-5 text-blue-300" />
            </div>
            <p className="text-2xl font-bold text-blue-100">₹{customers?.reduce((acc, c) => acc + (c.totalBill || 0), 0).toFixed(0) || 0}</p>
            <p className="text-xs text-blue-300/70">Total Revenue</p>
          </CardContent>
        </Card>
      </div>

      {/* Primary Action: Add Milk */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <Card className="bg-white/10 backdrop-blur-md border-white/10 shadow-lg overflow-hidden">
          <CardHeader className="pb-3 border-b border-white/5 bg-white/5">
            <CardTitle className="flex items-center gap-2 text-white text-lg">
              <Droplets className="text-blue-400" />
              Daily Milk Entry
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <div className="space-y-2">
              <Label className="text-slate-300">Select Customer</Label>
              <Select value={selectedCustomerId} onValueChange={setSelectedCustomerId}>
                <SelectTrigger className="bg-slate-900/50 border-slate-700 text-white h-12">
                  <SelectValue placeholder="Choose customer..." />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700 text-white">
                  <div className="p-2 sticky top-0 bg-slate-800 z-10">
                    <div className="relative">
                      <Search className="absolute left-2 top-2.5 h-3 w-3 text-slate-400" />
                      <input 
                        className="w-full bg-slate-900 text-xs p-2 pl-7 rounded border border-slate-700 focus:outline-none focus:border-teal-500 text-white" 
                        placeholder="Search..."
                        onChange={(e) => setSearchTerm(e.target.value)}
                        onKeyDown={(e) => e.stopPropagation()} 
                      />
                    </div>
                  </div>
                  {filteredCustomers.map(customer => (
                    <SelectItem key={customer.id} value={customer.id.toString()}>
                      {customer.username}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-slate-300">Quantity (Liters)</Label>
              <div className="flex gap-4">
                <Input 
                  type="number" 
                  step="0.5"
                  placeholder="0.0" 
                  value={milkQty}
                  onChange={(e) => setMilkQty(e.target.value)}
                  className="bg-slate-900/50 border-slate-700 text-white h-12 text-lg font-mono"
                />
                <Button 
                  onClick={handleAddMilk}
                  disabled={addMilk.isPending || !selectedCustomerId || !milkQty}
                  className="h-12 px-8 bg-teal-600 hover:bg-teal-500 text-white shadow-lg shadow-teal-500/25"
                >
                  {addMilk.isPending ? "Adding..." : "Add"}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Customer Management */}
      <div className="flex items-center justify-between pt-4">
        <h3 className="text-lg font-semibold text-slate-200">Customers</h3>
        <Dialog open={newCustomerOpen} onOpenChange={setNewCustomerOpen}>
          <DialogTrigger asChild>
            <Button size="sm" variant="outline" className="border-teal-500/50 text-teal-400 hover:bg-teal-500/10 hover:text-teal-300">
              <Plus className="w-4 h-4 mr-1" /> Add New
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-slate-900 border-slate-800 text-white sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Add New Customer</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Customer Name</Label>
                <Input value={newName} onChange={(e) => setNewName(e.target.value)} className="bg-slate-800 border-slate-700" />
              </div>
              <div className="space-y-2">
                <Label>Password</Label>
                <Input type="text" value={newPass} onChange={(e) => setNewPass(e.target.value)} className="bg-slate-800 border-slate-700" />
              </div>
              <div className="space-y-2">
                <Label>Rate (₹/Liter)</Label>
                <Input type="number" value={newRate} onChange={(e) => setNewRate(e.target.value)} className="bg-slate-800 border-slate-700" />
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleCreateCustomer} disabled={createCustomer.isPending} className="bg-teal-600 hover:bg-teal-500">
                Create Account
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-3">
        <AnimatePresence>
          {isLoading ? (
            <p className="text-center text-slate-500 py-10">Loading customers...</p>
          ) : (
            customers?.map((customer, i) => (
              <motion.div
                key={customer.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.05 }}
              >
                <Card className="bg-white/5 border-white/5 hover:bg-white/10 transition-colors group">
                  <CardContent className="p-4 flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold text-slate-200">{customer.username}</h4>
                      <div className="flex items-center gap-3 text-sm text-slate-400">
                        <span>Rate: ₹{customer.rate}</span>
                        <span className="w-1 h-1 bg-slate-600 rounded-full" />
                        <span>Total: {customer.totalMilk || 0}L</span>
                      </div>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => {
                        if (confirm(`Delete ${customer.username}?`)) {
                          deleteCustomer.mutate(customer.id);
                        }
                      }}
                      className="text-slate-600 hover:text-red-400 hover:bg-red-500/10 opacity-50 group-hover:opacity-100 transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>
    </LayoutShell>
  );
}
