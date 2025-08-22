import { ArrowRight, CheckCircle, TrendingUp, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import heroImage from "@/assets/hero-procurement.jpg";

const Hero = () => {
  return (
    <section className="relative bg-gradient-hero overflow-hidden">
      <div className="container mx-auto px-4 py-16 lg:py-24">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <div className="space-y-4">
              <h1 className="text-4xl lg:text-6xl font-bold text-foreground leading-tight">
                Streamline Your
                <span className="text-primary block">Project Procurement</span>
              </h1>
              <p className="text-xl text-muted-foreground max-w-lg">
                Manage purchase requisitions, track budgets, and oversee project materials 
                with our comprehensive procurement management platform.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button variant="hero" size="lg" className="group">
                Get Started
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-smooth" />
              </Button>
              <Button variant="outline" size="lg">
                View Demo
              </Button>
            </div>

            <div className="grid grid-cols-3 gap-6 pt-8">
              <div className="text-center">
                <div className="flex justify-center mb-2">
                  <CheckCircle className="h-8 w-8 text-success" />
                </div>
                <p className="font-semibold text-foreground">100+</p>
                <p className="text-sm text-muted-foreground">Projects Managed</p>
              </div>
              <div className="text-center">
                <div className="flex justify-center mb-2">
                  <TrendingUp className="h-8 w-8 text-success" />
                </div>
                <p className="font-semibold text-foreground">$2M+</p>
                <p className="text-sm text-muted-foreground">Budget Tracked</p>
              </div>
              <div className="text-center">
                <div className="flex justify-center mb-2">
                  <Users className="h-8 w-8 text-success" />
                </div>
                <p className="font-semibold text-foreground">50+</p>
                <p className="text-sm text-muted-foreground">Active Users</p>
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="bg-gradient-card rounded-2xl shadow-lg overflow-hidden">
              <img 
                src={heroImage} 
                alt="ProcureFlow Dashboard"
                className="w-full h-auto object-cover"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;