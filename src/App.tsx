import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Link, useLocation, Outlet, useNavigate } from 'react-router-dom';
import { DashboardPage } from './features/dashboard/DashboardPage';
import { BookingsPage } from './features/bookings/BookingsPage';
import { DriverTimelinePage } from './features/drivers/DriverTimelinePage';
import { RoutesPage } from './features/routes/RoutesPage';
import { RiderBookingPage } from './features/rider/RiderBookingPage';
import { MyTripsPage } from './features/rider/MyTripsPage';
import { AnalyticsPage } from './features/analytics/AnalyticsPage';
import { LoginPage } from './features/auth/LoginPage';
import { Bell, BusFront, Sun, Moon, User, ArrowRight, ShieldCheck, MapPin } from 'lucide-react';
import { cn } from './shared/utils/cn';

// --- SHARED COMPONENTS --- //

function NavItem({ label, to }: { label: string, to: string }) {
  const location = useLocation();
  const isActive = location.pathname.startsWith(to) && (to !== '/admin' || location.pathname === '/admin') && (to !== '/rider' || location.pathname === '/rider');
  
  return (
    <Link 
      to={to} 
      className={cn(
        "px-4 h-full flex items-center text-[14px] font-semibold transition-colors border-b-2",
        isActive 
          ? "border-[#3867FF] text-foreground" 
          : "border-transparent text-muted hover:text-foreground"
      )}
    >
      {label}
    </Link>
  );
}

// --- ADMIN LAYOUT --- //

function AdminTopbar() {
  const [isDark, setIsDark] = useState(() => document.documentElement.classList.contains('dark'));
  const navigate = useNavigate();

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  return (
    <header className="h-[64px] bg-background border-b border-border-color flex items-center justify-between px-6 shrink-0 z-10 relative transition-colors">
      <div className="flex items-center h-full">
        <Link to="/" className="flex items-center gap-3 mr-12 hover:opacity-80 transition-opacity">
          <div className="w-9 h-9 bg-brand-blue rounded-[8px] flex items-center justify-center text-white shadow-md shadow-brand-blue/20">
            <ShieldCheck size={20} strokeWidth={2.5} />
          </div>
          <div className="flex flex-col justify-center">
            <div className="font-bold text-[15px] leading-tight text-foreground tracking-tight">CampusRide</div>
            <div className="text-[10px] text-brand-blue font-bold tracking-widest uppercase">Admin Portal</div>
          </div>
        </Link>

        <nav className="flex items-center h-full gap-2">
          <NavItem label="Overview" to="/admin" />
          <NavItem label="Bookings" to="/admin/bookings" />
          <NavItem label="Drivers" to="/admin/drivers" />
          <NavItem label="Routes" to="/admin/routes" />
          <NavItem label="Analytics" to="/admin/analytics" />
        </nav>
      </div>

      <div className="flex items-center h-full">
        <div className="flex flex-col items-end pr-8">
          <div className="flex items-center gap-2 mb-0.5">
            <div className="w-2 h-2 rounded-full bg-[#19A974] animate-pulse" />
            <span className="text-[12px] font-bold text-foreground tracking-wide leading-none">Live</span>
          </div>
          <div className="text-[10px] font-medium text-muted leading-none">42 shuttles active</div>
        </div>

        <div className="flex flex-col items-start px-8 border-l border-r border-border-color justify-center h-[36px]">
          <div className="text-[13px] font-bold text-foreground flex items-center gap-2">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-muted"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
            22 September 2026
          </div>
          <div className="text-[11px] font-medium text-muted pl-5">Tuesday</div>
        </div>

        <div className="flex items-center gap-6 pl-8">
          <button 
            onClick={() => setIsDark(!isDark)}
            className="text-muted hover:text-foreground transition-colors"
          >
            {isDark ? <Sun size={20} strokeWidth={2} /> : <Moon size={20} strokeWidth={2} />}
          </button>

          <button className="relative text-muted hover:text-foreground transition-colors">
            <Bell size={20} strokeWidth={2} />
            <div className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-[#E25555] border-2 border-background" />
          </button>

          <div 
            onClick={() => {
              if (window.confirm("Logout?")) navigate('/');
            }}
            className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity"
          >
            <div className="w-8 h-8 rounded-full bg-border-color text-foreground flex items-center justify-center text-[12px] font-bold">
              AG
            </div>
            <div className="flex flex-col">
              <span className="text-[13px] font-bold text-foreground leading-tight">Admin</span>
              <span className="text-[10px] font-medium text-muted">Transport Ops</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

function AdminLayout() {
  return (
    <div className="flex flex-col h-screen w-full bg-background text-foreground font-sans overflow-hidden">
      <AdminTopbar />
      <main className="flex-1 overflow-hidden relative bg-[#F8FAFC] dark:bg-background">
        <Outlet />
      </main>
    </div>
  );
}

// --- RIDER LAYOUT --- //

function RiderTopbar() {
  const [isDark, setIsDark] = useState(() => document.documentElement.classList.contains('dark'));
  const navigate = useNavigate();

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  return (
    <header className="h-[64px] bg-background border-b border-border-color flex items-center justify-between px-6 md:px-12 shrink-0 z-10 relative transition-colors shadow-sm">
      <div className="flex items-center h-full">
        <Link to="/" className="flex items-center gap-3 mr-12 hover:opacity-80 transition-opacity">
          <div className="w-9 h-9 bg-foreground rounded-full flex items-center justify-center text-background">
            <BusFront size={20} strokeWidth={2.5} />
          </div>
          <div className="flex flex-col justify-center">
            <div className="font-bold text-[18px] leading-tight text-foreground tracking-tight">CampusRide</div>
          </div>
        </Link>

        <nav className="flex items-center h-full gap-4">
          <NavItem label="Book a Ride" to="/rider" />
          <NavItem label="My Trips" to="/rider/trips" />
        </nav>
      </div>

      <div className="flex items-center h-full gap-6">
        <button 
          onClick={() => setIsDark(!isDark)}
          className="text-muted hover:text-foreground transition-colors p-2 rounded-full hover:bg-muted/10"
        >
          {isDark ? <Sun size={20} strokeWidth={2} /> : <Moon size={20} strokeWidth={2} />}
        </button>

        <div 
          onClick={() => {
            if (window.confirm("Logout?")) navigate('/');
          }}
          className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity p-1.5 rounded-full hover:bg-muted/10"
        >
          <div className="flex flex-col items-end">
            <span className="text-[14px] font-bold text-foreground leading-tight">Student</span>
            <span className="text-[11px] font-medium text-muted">B.Tech CS</span>
          </div>
          <div className="w-10 h-10 rounded-full bg-border-color overflow-hidden">
             <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Student" alt="User" />
          </div>
        </div>
      </div>
    </header>
  );
}

function RiderLayout() {
  return (
    <div className="flex flex-col h-screen w-full bg-background text-foreground font-sans overflow-hidden">
      <RiderTopbar />
      <main className="flex-1 overflow-hidden relative">
        <Outlet />
      </main>
    </div>
  );
}

// --- LANDING PAGE --- //

function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground p-6 relative overflow-hidden">
      {/* Background Graphic */}
      <div className="absolute inset-0 pointer-events-none opacity-20 dark:opacity-10">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-brand-blue blur-[120px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-[#19A974] blur-[120px]" />
      </div>

      <div className="relative z-10 flex flex-col items-center max-w-4xl w-full">
        <div className="w-16 h-16 bg-foreground rounded-[16px] flex items-center justify-center text-background mb-6 shadow-xl">
          <BusFront size={32} strokeWidth={2.5} />
        </div>
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-center mb-4">Welcome to CampusRide</h1>
        <p className="text-lg text-muted text-center max-w-xl mb-12">Select your portal to access the smartest campus transit system.</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
          
          {/* Rider Card */}
          <div 
            onClick={() => navigate('/login?role=rider')}
            className="group relative bg-surface border border-border-color hover:border-foreground rounded-[24px] p-8 cursor-pointer transition-all hover:shadow-2xl hover:-translate-y-1 overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#19A974]/10 rounded-bl-full transition-transform group-hover:scale-110" />
            <div className="w-14 h-14 bg-[#19A974]/10 text-[#19A974] rounded-[12px] flex items-center justify-center mb-6 relative z-10">
              <User size={28} />
            </div>
            <h2 className="text-2xl font-bold mb-2 relative z-10">Student & Staff Portal</h2>
            <p className="text-muted text-[15px] mb-8 relative z-10">Book shuttles instantly, view live tracking, and manage your trips.</p>
            <div className="flex items-center font-bold text-[#19A974] group-hover:gap-3 transition-all relative z-10">
              Enter Portal <ArrowRight size={18} className="ml-2" />
            </div>
          </div>

          {/* Admin Card */}
          <div 
            onClick={() => navigate('/login?role=admin')}
            className="group relative bg-surface border border-border-color hover:border-brand-blue rounded-[24px] p-8 cursor-pointer transition-all hover:shadow-2xl hover:-translate-y-1 overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-brand-blue/10 rounded-bl-full transition-transform group-hover:scale-110" />
            <div className="w-14 h-14 bg-brand-blue/10 text-brand-blue rounded-[12px] flex items-center justify-center mb-6 relative z-10">
              <ShieldCheck size={28} />
            </div>
            <h2 className="text-2xl font-bold mb-2 relative z-10">Admin Portal</h2>
            <p className="text-muted text-[15px] mb-8 relative z-10">Manage fleet operations, assign drivers, and monitor campus routes.</p>
            <div className="flex items-center font-bold text-brand-blue group-hover:gap-3 transition-all relative z-10">
              Enter Portal <ArrowRight size={18} className="ml-2" />
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

// --- ROUTER --- //

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Landing */}
        <Route path="/" element={<LandingPage />} />
        
        {/* Login Page */}
        <Route path="/login" element={<LoginPage />} />

        {/* Rider Dashboard */}
        <Route path="/rider" element={<RiderLayout />}>
          <Route index element={<RiderBookingPage />} />
          <Route path="trips" element={<MyTripsPage />} />
        </Route>

        {/* Admin Dashboard */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<DashboardPage />} />
          <Route path="bookings" element={<BookingsPage />} />
          <Route path="drivers" element={<DriverTimelinePage />} />
          <Route path="routes" element={<RoutesPage />} />
          <Route path="analytics" element={<AnalyticsPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
