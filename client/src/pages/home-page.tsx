import { useAuth } from '@/hooks/use-auth';

export default function HomePage() {
  const { user, logoutMutation } = useAuth();
  
  const handleLogout = () => {
    logoutMutation.mutate();
  };
  
  return (
    <div className="container mx-auto p-4">
      <header className="flex justify-between items-center py-4 mb-8">
        <h1 className="text-2xl font-bold">ShortDramaVerse</h1>
        <div className="flex items-center gap-4">
          <span>Welcome, {user?.displayName || user?.username}!</span>
          <button 
            onClick={handleLogout}
            className="bg-primary/10 text-primary px-4 py-2 rounded-lg hover:bg-primary/20 transition-colors"
          >
            Logout
          </button>
        </div>
      </header>
      
      <main>
        <div className="bg-primary/5 rounded-lg p-8 text-center mb-8">
          <h2 className="text-3xl font-bold mb-4">Welcome to ShortDramaVerse</h2>
          <p className="max-w-2xl mx-auto">
            Your premium platform for short-form drama content. Explore exciting series, watch episodes, 
            and enjoy a curated experience of quality entertainment.
          </p>
        </div>
        
        <div className="text-center">
          <p className="text-lg">
            Content is being loaded... Stay tuned for exciting drama series!
          </p>
        </div>
      </main>
    </div>
  );
}