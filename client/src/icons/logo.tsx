import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  size?: "sm" | "md" | "lg";
}

export const Logo = ({ className, size = "md" }: LogoProps) => {
  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-10 h-10",
    lg: "w-12 h-12"
  };
  
  return (
    <svg 
      viewBox="0 0 50 50" 
      className={cn(sizeClasses[size], "text-primary fill-current", className)}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M25 2C12.297 2 2 12.297 2 25C2 37.703 12.297 48 25 48C37.703 48 48 37.703 48 25C48 12.297 37.703 2 25 2ZM25 6C35.477 6 44 14.523 44 25C44 35.477 35.477 44 25 44C14.523 44 6 35.477 6 25C6 14.523 14.523 6 25 6Z" />
      <path d="M18 16V34L36 25L18 16Z" />
    </svg>
  );
};

export default Logo;
