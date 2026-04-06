import { Button } from "@/components/ui/button";
import { Wallet, ArrowRight, ShieldCheck, Zap, Globe } from "lucide-react";
import { SignInButton, SignUpButton } from "@clerk/clerk-react";

export default function Login() {
  const features = [
    { icon: ShieldCheck, text: "Secure Authentication" },
    { icon: Zap, text: "Real-time Aggregation" },
    { icon: Globe, text: "Multi-Exchange Support" },
  ];

  return (
    <div className="min-h-screen w-full flex bg-background text-foreground">
      {/* Left Panel - Branding */}
      <div className="hidden lg:flex w-1/2 bg-secondary relative overflow-hidden flex-col justify-between p-12">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1639762681485-074b7f938ba0?q=80&w=2832&auto=format&fit=crop')] bg-cover bg-center opacity-20 mix-blend-overlay"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-background/0 via-background/20 to-background/80"></div>
        
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
              <Wallet className="text-primary-foreground w-7 h-7" />
            </div>
            <span className="font-display font-bold text-3xl tracking-tight">
              DeFi<span className="text-primary">Agg</span>
            </span>
          </div>
          
          <h1 className="font-display font-bold text-5xl leading-tight mb-6">
            The Smartest Way to <br />
            <span className="text-gradient">Trade Crypto</span>
          </h1>
          <p className="text-muted-foreground text-lg max-w-md">
            Compare prices across decentralized exchanges instantly and get the best rates for your swaps.
          </p>
        </div>

        <div className="relative z-10 grid grid-cols-1 gap-4">
          {features.map((feature, i) => (
            <div key={i} className="flex items-center gap-3 p-4 rounded-xl bg-white/5 backdrop-blur-sm border border-white/5 hover:bg-white/10 transition-colors">
              <feature.icon className="w-5 h-5 text-primary" />
              <span className="font-medium">{feature.text}</span>
            </div>
          ))}
        </div>

        <div className="relative z-10 text-sm text-muted-foreground">
          © 2024 DeFi Aggregator. Built for the decentralized future.
        </div>
      </div>

      {/* Right Panel - Login Action */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 relative">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center space-y-2 lg:hidden">
            <div className="flex items-center justify-center gap-2 mb-8">
              <Wallet className="text-primary w-8 h-8" />
              <span className="font-display font-bold text-2xl">DeFiAgg</span>
            </div>
          </div>

          <div className="space-y-2">
            <h2 className="text-3xl font-display font-bold">Welcome back</h2>
            <p className="text-muted-foreground">Sign in to access your dashboard and start trading.</p>
          </div>

          <div className="glass-panel p-8 rounded-2xl space-y-6">
            <SignInButton mode="modal" forceRedirectUrl="/">
              <Button 
                className="w-full h-12 text-base font-semibold bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/25 transition-all hover:scale-[1.02]"
              >
                Sign in with Email
                <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </SignInButton>
            
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  Or
                </span>
              </div>
            </div>

            <SignUpButton mode="modal" forceRedirectUrl="/">
              <Button 
                variant="outline"
                className="w-full h-12 text-base font-semibold transition-all hover:scale-[1.02]"
              >
                Create Account
                <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </SignUpButton>
            
            <p className="text-xs text-center text-muted-foreground">
              By signing in, you agree to our Terms of Service and Privacy Policy.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
