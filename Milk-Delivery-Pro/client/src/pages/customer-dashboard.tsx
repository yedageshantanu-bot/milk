import { useParams, useLocation } from "wouter";
import { useCustomer } from "@/hooks/use-customers";
import { LayoutShell } from "@/components/layout-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { FileDown, Printer, Share2, MessageSquare } from "lucide-react";
import { jsPDF } from "jspdf";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";

export default function CustomerDashboard() {
  const { id } = useParams();
  const { data, isLoading, error } = useCustomer(Number(id));
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  if (isLoading) return <CustomerSkeleton />;
  if (error || !data) {
     return <div className="text-white text-center pt-20">Customer not found</div>;
  }

  const { user, records, totalMilk, totalBill } = data;

  // Chart data
  const chartData = records.map(r => ({
    date: new Date(r.date).toLocaleDateString(undefined, { day: '2-digit', month: 'short' }),
    qty: Number(r.quantity)
  })).slice(-10); // Last 10 records for cleaner chart

  const generatePDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(22);
    doc.text("Milk Delivery Bill", 20, 20);
    
    doc.setFontSize(12);
    doc.text(`Customer: ${user.username}`, 20, 35);
    doc.text(`Rate: ₹${user.rate}/L`, 20, 42);
    doc.text(`Generated: ${new Date().toLocaleDateString()}`, 20, 49);

    let y = 60;
    doc.text("Date", 20, y);
    doc.text("Quantity (L)", 100, y);
    doc.line(20, y+2, 180, y+2);
    y += 10;

    records.forEach(r => {
      if (y > 270) { doc.addPage(); y = 20; }
      doc.text(new Date(r.date).toLocaleDateString(), 20, y);
      doc.text(String(r.quantity), 100, y);
      y += 8;
    });

    doc.line(20, y, 180, y);
    y += 10;
    doc.setFontSize(14);
    doc.text(`Total Milk: ${totalMilk} L`, 20, y);
    y += 8;
    doc.text(`Total Amount: ₹${totalBill}`, 20, y);

    doc.save(`${user.username}_Bill.pdf`);
    toast({ title: "PDF Downloaded" });
  };

  const shareWhatsapp = () => {
    const msg = encodeURIComponent(
      `Hello ${user.username},\nYour milk report for this month:\nTotal Milk: ${totalMilk} L\nTotal Bill: ₹${totalBill}\n\n- Milk Delivery App`
    );
    window.open(`https://wa.me/?text=${msg}`, "_blank");
  };

  const downloadCSV = () => {
    let csv = "Date,Quantity(L)\n";
    records.forEach(r => {
      csv += `${r.date},${r.quantity}\n`;
    });
    csv += `\nTotal,${totalMilk}\nAmount,${totalBill}`;
    
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${user.username}_bill.csv`;
    a.click();
    toast({ title: "Excel/CSV Downloaded" });
  };

  return (
    <LayoutShell title={`Welcome, ${user.username}`} showLogout={true}>
      
      {/* Overview Cards */}
      <div className="grid grid-cols-2 gap-4">
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.1 }}>
          <Card className="bg-gradient-to-br from-teal-500 to-teal-700 border-none shadow-lg text-white">
            <CardContent className="p-5 flex flex-col justify-between h-32">
              <span className="text-teal-100/80 text-sm font-medium uppercase tracking-wider">Total Milk</span>
              <div>
                <span className="text-4xl font-bold">{totalMilk}</span>
                <span className="text-xl ml-1 text-teal-200">L</span>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.2 }}>
          <Card className="bg-gradient-to-br from-blue-600 to-indigo-700 border-none shadow-lg text-white">
            <CardContent className="p-5 flex flex-col justify-between h-32">
              <span className="text-blue-100/80 text-sm font-medium uppercase tracking-wider">Amount Due</span>
              <div>
                <span className="text-4xl font-bold">₹{totalBill}</span>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Message Card */}
      <motion.div 
        initial={{ y: 20, opacity: 0 }} 
        animate={{ y: 0, opacity: 1 }} 
        transition={{ delay: 0.3 }}
        className="bg-white/5 border border-white/10 rounded-xl p-4 flex gap-4 items-start backdrop-blur-sm"
      >
        <div className="bg-yellow-500/20 p-2 rounded-lg text-yellow-300">
          <MessageSquare className="h-5 w-5" />
        </div>
        <div>
          <h4 className="font-semibold text-slate-200">Monthly Summary</h4>
          <p className="text-sm text-slate-400 mt-1">
            Hello {user.username}, this month you received {totalMilk} Liters of milk. Your total bill is ₹{totalBill}.
          </p>
        </div>
      </motion.div>

      {/* Chart Section */}
      <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-md shadow-xl">
        <CardHeader>
          <CardTitle className="text-slate-200 text-lg">Daily Consumption</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[200px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <XAxis dataKey="date" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#f8fafc' }}
                  cursor={{ fill: '#334155', opacity: 0.4 }}
                />
                <Bar dataKey="qty" fill="#2dd4bf" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Actions Grid */}
      <div className="grid grid-cols-2 gap-3">
        <Button onClick={generatePDF} variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white h-auto py-4 flex flex-col gap-2">
          <FileDown className="h-6 w-6" />
          <span>Download PDF</span>
        </Button>
        <Button onClick={downloadCSV} variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white h-auto py-4 flex flex-col gap-2">
          <FileDown className="h-6 w-6" />
          <span>Download Excel</span>
        </Button>
        <Button onClick={() => window.print()} variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white h-auto py-4 flex flex-col gap-2">
          <Printer className="h-6 w-6" />
          <span>Print Bill</span>
        </Button>
        <Button onClick={shareWhatsapp} className="bg-[#25D366] hover:bg-[#128C7E] text-white border-none h-auto py-4 flex flex-col gap-2 shadow-lg shadow-green-900/20">
          <Share2 className="h-6 w-6" />
          <span>WhatsApp</span>
        </Button>
      </div>

    </LayoutShell>
  );
}

function CustomerSkeleton() {
  return (
    <div className="min-h-screen bg-slate-900 p-6 space-y-6">
      <Skeleton className="h-8 w-1/2 bg-slate-800" />
      <div className="grid grid-cols-2 gap-4">
        <Skeleton className="h-32 rounded-xl bg-slate-800" />
        <Skeleton className="h-32 rounded-xl bg-slate-800" />
      </div>
      <Skeleton className="h-24 rounded-xl bg-slate-800" />
      <Skeleton className="h-64 rounded-xl bg-slate-800" />
    </div>
  );
}
