import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@shared/routes";
import { AddMilkRequest } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

export function useAddMilk() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: AddMilkRequest) => {
      const res = await fetch(api.milk.add.path, {
        method: api.milk.add.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to add milk entry");
      }
      return await res.json();
    },
    onSuccess: (_, variables) => {
      // Invalidate customer list to update totals if shown there
      queryClient.invalidateQueries({ queryKey: [api.customers.list.path] });
      // Also invalidate specific customer if we were viewing them
      queryClient.invalidateQueries({ queryKey: [api.customers.get.path, variables.userId] }); // Approximation
      
      toast({
        title: "Milk Added",
        description: `Added ${variables.quantity} Liters successfully`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}
