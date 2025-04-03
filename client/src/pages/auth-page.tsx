import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Redirect } from 'wouter';
import { useAuth, loginSchema, LoginData, registerSchema, RegisterData } from '@/hooks/use-auth';
import { Form, FormField, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

export default function AuthPage() {
  const { user, isLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  
  // Redirect if already logged in
  if (user && !isLoading) {
    return <Redirect to="/" />;
  }
  
  return (
    <div className="min-h-screen grid grid-cols-1 md:grid-cols-2">
      {/* Auth forms */}
      <div className="flex flex-col justify-center px-4 py-12 sm:px-6 lg:px-8 bg-white">
        <div className="mx-auto w-full max-w-sm">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold">ShortDramaVerse</h1>
            <p className="text-gray-500 mt-2">Your gateway to premium short-form drama content</p>
          </div>
          
          <div className="flex border-b border-gray-200 mb-6">
            <button
              className={`flex-1 py-2 font-medium text-sm ${activeTab === 'login' ? 'text-primary border-b-2 border-primary' : 'text-gray-500'}`}
              onClick={() => setActiveTab('login')}
            >
              Login
            </button>
            <button
              className={`flex-1 py-2 font-medium text-sm ${activeTab === 'register' ? 'text-primary border-b-2 border-primary' : 'text-gray-500'}`}
              onClick={() => setActiveTab('register')}
            >
              Register
            </button>
          </div>
          
          {activeTab === 'login' ? <LoginForm /> : <RegisterForm />}
        </div>
      </div>
      
      {/* Hero section */}
      <div className="hidden md:flex bg-primary/10 flex-col justify-center p-12">
        <div className="max-w-md mx-auto text-center">
          <h2 className="text-4xl font-bold mb-6 text-primary">Experience Drama on the Go</h2>
          <p className="text-lg mb-8">
            ShortDramaVerse delivers premium short-form drama content designed for mobile viewing. 
            Watch anytime, anywhere, with episodes perfectly sized for your busy lifestyle.
          </p>
          <div className="grid grid-cols-3 gap-4 text-center">
            <FeatureCard title="Premium Content" description="Exclusive high-quality drama series" />
            <FeatureCard title="Short Episodes" description="Perfect for on-the-go viewing" />
            <FeatureCard title="New Releases" description="Fresh content added regularly" />
          </div>
        </div>
      </div>
    </div>
  );
}

function LoginForm() {
  const { loginMutation } = useAuth();
  const form = useForm<LoginData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: '',
      password: '',
    },
  });
  
  const onSubmit = (data: LoginData) => {
    if (loginMutation && typeof loginMutation.mutate === 'function') {
      loginMutation.mutate(data);
    } else {
      console.error('Login mutation is not properly initialized');
    }
  };
  
  return (
    <Form onSubmit={form.handleSubmit(onSubmit)}>
      <FormField>
        <FormLabel htmlFor="username">Username</FormLabel>
        <FormControl>
          <Input 
            id="username"
            type="text"
            placeholder="Enter your username"
            {...form.register('username')}
          />
        </FormControl>
        {form.formState.errors.username && (
          <FormMessage>{form.formState.errors.username.message}</FormMessage>
        )}
      </FormField>
      
      <FormField>
        <FormLabel htmlFor="password">Password</FormLabel>
        <FormControl>
          <Input 
            id="password"
            type="password"
            placeholder="Enter your password"
            {...form.register('password')}
          />
        </FormControl>
        {form.formState.errors.password && (
          <FormMessage>{form.formState.errors.password.message}</FormMessage>
        )}
      </FormField>
      
      <Button 
        type="submit"
        className="w-full mt-6"
        disabled={loginMutation.isPending}
      >
        {loginMutation.isPending ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Logging in...
          </>
        ) : 'Login'}
      </Button>
    </Form>
  );
}

function RegisterForm() {
  const { registerMutation } = useAuth();
  const form = useForm<RegisterData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
      displayName: '',
    },
  });
  
  const onSubmit = (data: RegisterData) => {
    if (registerMutation && typeof registerMutation.mutate === 'function') {
      registerMutation.mutate(data);
    } else {
      console.error('Register mutation is not properly initialized');
    }
  };
  
  return (
    <Form onSubmit={form.handleSubmit(onSubmit)}>
      <FormField>
        <FormLabel htmlFor="username">Username</FormLabel>
        <FormControl>
          <Input 
            id="username"
            type="text"
            placeholder="Choose a username"
            {...form.register('username')}
          />
        </FormControl>
        {form.formState.errors.username && (
          <FormMessage>{form.formState.errors.username.message}</FormMessage>
        )}
      </FormField>
      
      <FormField>
        <FormLabel htmlFor="email">Email</FormLabel>
        <FormControl>
          <Input 
            id="email"
            type="email"
            placeholder="Enter your email"
            {...form.register('email')}
          />
        </FormControl>
        {form.formState.errors.email && (
          <FormMessage>{form.formState.errors.email.message}</FormMessage>
        )}
      </FormField>
      
      <FormField>
        <FormLabel htmlFor="displayName">Display Name (Optional)</FormLabel>
        <FormControl>
          <Input 
            id="displayName"
            type="text"
            placeholder="How should we address you?"
            {...form.register('displayName')}
          />
        </FormControl>
        {form.formState.errors.displayName && (
          <FormMessage>{form.formState.errors.displayName.message}</FormMessage>
        )}
      </FormField>
      
      <FormField>
        <FormLabel htmlFor="password">Password</FormLabel>
        <FormControl>
          <Input 
            id="password"
            type="password"
            placeholder="Create a password"
            {...form.register('password')}
          />
        </FormControl>
        {form.formState.errors.password && (
          <FormMessage>{form.formState.errors.password.message}</FormMessage>
        )}
      </FormField>
      
      <FormField>
        <FormLabel htmlFor="confirmPassword">Confirm Password</FormLabel>
        <FormControl>
          <Input 
            id="confirmPassword"
            type="password"
            placeholder="Confirm your password"
            {...form.register('confirmPassword')}
          />
        </FormControl>
        {form.formState.errors.confirmPassword && (
          <FormMessage>{form.formState.errors.confirmPassword.message}</FormMessage>
        )}
      </FormField>
      
      <Button 
        type="submit"
        className="w-full mt-6"
        disabled={registerMutation.isPending}
      >
        {registerMutation.isPending ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Creating account...
          </>
        ) : 'Create Account'}
      </Button>
    </Form>
  );
}

function FeatureCard({ title, description }: { title: string; description: string }) {
  return (
    <div className="bg-white p-4 rounded-lg shadow-sm">
      <h3 className="font-semibold mb-1">{title}</h3>
      <p className="text-sm text-gray-600">{description}</p>
    </div>
  );
}