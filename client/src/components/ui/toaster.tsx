import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";

export function Toaster() {
  const { toasts, dismiss } = useToast();

  return (
    <div className="fixed top-0 right-0 z-50 p-4 w-full md:max-w-md md:right-4 gap-4 flex flex-col h-auto">
      {toasts.map(({ id, title, description, variant, open }) => (
        <div
          key={id}
          className={cn(
            "bg-white border border-border rounded-lg shadow-lg p-4 flex flex-col gap-1 relative transition-all duration-300 transform",
            !open ? "translate-x-full opacity-0" : "translate-x-0 opacity-100",
            variant === "destructive" && "border-red-500 bg-red-50"
          )}
        >
          <button 
            onClick={() => dismiss(id)} 
            className="absolute top-1 right-1 rounded-lg p-1 text-gray-500 hover:bg-gray-100"
          >
            <X size={14} />
          </button>
          {title && (
            <div className={cn(
              "font-medium text-sm",
              variant === "destructive" && "text-red-600"
            )}>
              {title}
            </div>
          )}
          {description && (
            <div className="text-xs text-gray-500">
              {description}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}