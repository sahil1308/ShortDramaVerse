import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth, loginSchema, registerFormConfig } from "@/hooks/use-auth";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Logo } from "@/icons/logo";
import { Loader2, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function AuthPage() {
  const { user, loginMutation, registerMutation } = useAuth();
  const [_, navigate] = useLocation();
  const [authType, setAuthType] = useState<"login" | "register">("login");
  const [loginError, setLoginError] = useState<string | null>(null);
  const [registerError, setRegisterError] = useState<string | null>(null);

  // Reset form errors when switching tabs
  useEffect(() => {
    setLoginError(null);
    setRegisterError(null);
  }, [authType]);

  // Clear any errors when mutations complete
  useEffect(() => {
    if (!loginMutation.isPending && loginMutation.isError && loginMutation.error) {
      setLoginError(loginMutation.error.message || "Login failed. Please try again.");
    }
    
    if (!registerMutation.isPending && registerMutation.isError && registerMutation.error) {
      setRegisterError(registerMutation.error.message || "Registration failed. Please try again.");
    }
  }, [loginMutation.isPending, registerMutation.isPending, loginMutation.isError, registerMutation.isError]);

  // Redirect to home if already logged in
  useEffect(() => {
    if (user) {
      navigate("/");
    }
  }, [user, navigate]);

  // Don't render anything during redirect
  if (user) {
    return null;
  }

  // Login form
  const loginForm = useForm<z.infer<typeof loginSchema.schema>>({
    resolver: zodResolver(loginSchema.schema),
    defaultValues: loginSchema.defaultValues,
    mode: "onChange",
  });

  const onLoginSubmit = (data: z.infer<typeof loginSchema.schema>) => {
    setLoginError(null);
    loginMutation.mutate(data);
  };

  // Register form
  const registerForm = useForm<z.infer<typeof registerFormConfig.schema>>({
    resolver: zodResolver(registerFormConfig.schema),
    defaultValues: registerFormConfig.defaultValues,
    mode: "onChange",
  });

  const onRegisterSubmit = (data: z.infer<typeof registerFormConfig.schema>) => {
    setRegisterError(null);
    registerMutation.mutate(data);
  };

  // For demo purposes, add a test user login
  const loginAsTestUser = () => {
    loginMutation.mutate({ username: "testuser", password: "password123" });
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-background">
      {/* Form Section */}
      <div className="w-full md:w-1/2 flex flex-col p-4 md:p-8 lg:p-12">
        <div className="mb-8 flex items-center">
          <Logo size="md" className="mr-2" />
          <h1 className="text-2xl font-bold">ShortDramaVerse</h1>
        </div>

        <div className="flex-1 max-w-md mx-auto w-full">
          <Tabs
            defaultValue="login"
            value={authType}
            onValueChange={(value) => setAuthType(value as "login" | "register")}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-2 mb-8">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="register">Register</TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <Form {...loginForm}>
                <form
                  onSubmit={loginForm.handleSubmit(onLoginSubmit)}
                  className="space-y-4"
                >
                  {loginError && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{loginError}</AlertDescription>
                    </Alert>
                  )}
                  
                  <FormField
                    control={loginForm.control}
                    name="username"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Username</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter your username" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={loginForm.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <Input
                            type="password"
                            placeholder="Enter your password"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button
                    type="submit"
                    className="w-full"
                    disabled={loginMutation.isPending}
                  >
                    {loginMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Logging in...
                      </>
                    ) : (
                      "Login"
                    )}
                  </Button>
                  
                  <div className="text-center text-sm text-muted-foreground mt-4">
                    <Button 
                      variant="link" 
                      onClick={loginAsTestUser}
                      type="button"
                      className="px-0"
                    >
                      Login as test user
                    </Button>
                  </div>
                </form>
              </Form>
            </TabsContent>

            <TabsContent value="register">
              <Form {...registerForm}>
                <form
                  onSubmit={registerForm.handleSubmit(onRegisterSubmit)}
                  className="space-y-4"
                >
                  {registerError && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{registerError}</AlertDescription>
                    </Alert>
                  )}
                  
                  <FormField
                    control={registerForm.control}
                    name="username"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Username</FormLabel>
                        <FormControl>
                          <Input placeholder="Choose a username" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={registerForm.control}
                    name="displayName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Display Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Your display name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={registerForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input
                            type="email"
                            placeholder="Enter your email"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={registerForm.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <Input
                            type="password"
                            placeholder="Create a password"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={registerForm.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Confirm Password</FormLabel>
                        <FormControl>
                          <Input
                            type="password"
                            placeholder="Confirm your password"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button
                    type="submit"
                    className="w-full"
                    disabled={registerMutation.isPending}
                  >
                    {registerMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating account...
                      </>
                    ) : (
                      "Register"
                    )}
                  </Button>
                </form>
              </Form>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Hero Section */}
      <div className="hidden md:block w-1/2 bg-primary/5 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/20 via-transparent to-background"></div>
        <div className="absolute w-full h-full bg-[url('https://images.unsplash.com/photo-1581889470536-467bdbe30cd0?auto=format&fit=crop&q=80&w=1600')] bg-cover bg-center opacity-20"></div>
        
        <div className="relative h-full flex flex-col items-center justify-center p-12 text-center">
          <h2 className="text-4xl font-bold mb-6">Experience Drama On The Go</h2>
          <p className="text-xl mb-8 max-w-md text-muted-foreground">
            Discover and enjoy the best short-form dramas from various genres, all in one place.
          </p>
          <div className="flex flex-wrap gap-4 justify-center max-w-md">
            <div className="flex items-center bg-card p-4 rounded-lg">
              <div className="mr-3 text-primary text-3xl">📱</div>
              <div className="text-left">
                <h3 className="font-bold">Watch Anywhere</h3>
                <p className="text-sm text-muted-foreground">On mobile, tablet or desktop</p>
              </div>
            </div>
            <div className="flex items-center bg-card p-4 rounded-lg">
              <div className="mr-3 text-primary text-3xl">🎭</div>
              <div className="text-left">
                <h3 className="font-bold">Diverse Content</h3>
                <p className="text-sm text-muted-foreground">Romance, suspense, comedy & more</p>
              </div>
            </div>
            <div className="flex items-center bg-card p-4 rounded-lg">
              <div className="mr-3 text-primary text-3xl">⏱️</div>
              <div className="text-left">
                <h3 className="font-bold">Short Episodes</h3>
                <p className="text-sm text-muted-foreground">Perfect for your busy schedule</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
