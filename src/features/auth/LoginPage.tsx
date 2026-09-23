import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/shared/components/ui/Button';
import { ShieldCheck, User, BusFront, ArrowLeft } from 'lucide-react';
import { cn } from '@/shared/utils/cn';

export function LoginPage() {
  const [searchParams] = useSearchParams();
  const role = searchParams.get('role') || 'rider';
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const isAdmin = role === 'admin';

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulate network request for authentication
    setTimeout(() => {
      setIsLoading(false);
      // We are mocking authentication for the frontend demo
      if (isAdmin) {
        navigate('/admin');
      } else {
        navigate('/rider');
      }
    }, 800);
  };

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground relative overflow-hidden">
      
      {/* Top Header */}
      <div className="absolute top-0 left-0 right-0 p-6 flex justify-between items-center z-20">
        <button 
          onClick={() => navigate('/')} 
          className="flex items-center gap-2 text-sm font-bold text-muted hover:text-foreground transition-colors"
        >
          <ArrowLeft size={16} /> Back to Portals
        </button>
        <div className="flex items-center gap-2 opacity-50">
          <div className="w-6 h-6 bg-foreground rounded-full flex items-center justify-center text-background">
            <BusFront size={12} strokeWidth={2.5} />
          </div>
          <span className="font-bold tracking-tight">CampusRide</span>
        </div>
      </div>

      {/* Split Layout */}
      <div className="flex flex-1 relative z-10">
        
        {/* Left Side: Graphic / Branding */}
        <div className={cn(
          "hidden md:flex flex-1 flex-col justify-between p-12 transition-colors duration-500",
          isAdmin ? "bg-brand-blue/10" : "bg-[#19A974]/10"
        )}>
          <div className="flex-1 flex flex-col justify-center max-w-md mx-auto">
            <div className={cn(
              "w-20 h-20 rounded-[20px] flex items-center justify-center text-white mb-8 shadow-2xl",
              isAdmin ? "bg-brand-blue" : "bg-[#19A974]"
            )}>
              {isAdmin ? <ShieldCheck size={40} /> : <User size={40} />}
            </div>
            
            <h1 className="text-4xl font-bold tracking-tight mb-4">
              {isAdmin ? "Operational Command Center" : "Smart Campus Transit"}
            </h1>
            <p className="text-lg text-muted">
              {isAdmin 
                ? "Sign in to manage fleets, track routes, schedule drivers, and monitor campus-wide shuttle analytics." 
                : "Sign in to instantly book rides, track incoming shuttles, and view your complete trip history."}
            </p>
          </div>
          
          <div className="text-sm font-medium text-muted">
            &copy; {new Date().getFullYear()} CampusRide System. All rights reserved.
          </div>
        </div>

        {/* Right Side: Login Form */}
        <div className="flex-1 flex flex-col items-center justify-center p-8 bg-surface">
          <div className="w-full max-w-[400px]">
            <div className="text-center mb-10">
              <h2 className="text-3xl font-bold tracking-tight mb-2">Welcome back</h2>
              <p className="text-muted">Enter your credentials to access the {isAdmin ? 'Admin' : 'Student'} portal.</p>
            </div>

            <form onSubmit={handleLogin} className="flex flex-col gap-5">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-bold uppercase tracking-wider text-muted">Email Address</label>
                <input 
                  type="email" 
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder={isAdmin ? "admin@lpu.edu.in" : "student@lpu.edu.in"} 
                  className="h-12 bg-background border border-border-color rounded-[8px] px-4 text-[15px] outline-none focus:border-brand-blue transition-colors"
                  required
                />
              </div>

              <div className="flex flex-col gap-2">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-bold uppercase tracking-wider text-muted">Password</label>
                  <a href="#" className="text-xs font-bold text-brand-blue hover:underline">Forgot password?</a>
                </div>
                <input 
                  type="password" 
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••" 
                  className="h-12 bg-background border border-border-color rounded-[8px] px-4 text-[15px] outline-none focus:border-brand-blue transition-colors"
                  required
                />
              </div>

              <Button 
                type="submit" 
                size="lg" 
                className={cn(
                  "h-14 text-[16px] mt-4 rounded-[10px] w-full relative overflow-hidden transition-all",
                  isAdmin ? "bg-brand-blue hover:bg-brand-blue/90" : "bg-[#19A974] hover:bg-[#19A974]/90 text-white"
                )}
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Authenticating...</span>
                  </div>
                ) : (
                  <span>Sign In as {isAdmin ? 'Admin' : 'Student'}</span>
                )}
              </Button>

              {/* Demo Hint */}
              <div className="text-center mt-6 p-4 rounded-[8px] bg-muted/5 border border-border-color text-xs text-muted font-medium">
                <strong>Demo Mode:</strong> You can enter any mock credentials to sign in and explore the {isAdmin ? 'admin' : 'rider'} dashboard features.
              </div>
            </form>
          </div>
        </div>

      </div>
    </div>
  );
}
