import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";
import { Redirect, Route } from "wouter";

// Simplified protected route - directly using the Route component
export function ProtectedRoute({
  path,
  component: Component,
}: {
  path: string;
  component: () => React.JSX.Element;
}) {
  return (
    <Route
      path={path}
      component={() => {
        try {
          const { user, isLoading } = useAuth();
          
          if (isLoading) {
            return (
              <div className="flex items-center justify-center min-h-screen bg-background">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            );
          }
          
          if (!user) {
            return <Redirect to="/auth" />;
          }
          
          return <Component />;
        } catch (error) {
          // If there's an error with the auth context, redirect to auth page
          console.error("Auth error:", error);
          return <Redirect to="/auth" />;
        }
      }}
    />
  );
}
