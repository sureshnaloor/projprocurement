import Header from "@/components/Header";
import Hero from "@/components/Hero";
import Features from "@/components/Features";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <Hero />
      <Features />
      
      {/* CTA Section */}
      <section className="py-16 lg:py-24 bg-primary">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold text-primary-foreground mb-4">
            Ready to Streamline Your Procurement?
          </h2>
          <p className="text-xl text-primary-foreground/90 mb-8 max-w-2xl mx-auto">
            Join hundreds of project managers who trust ProcureFlow for their procurement needs.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button variant="secondary" size="lg" className="group" asChild>
              <Link href="/dashboard">
                Go to Dashboard
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-smooth" />
              </Link>
            </Button>
            <Button variant="outline" size="lg" className="border-white text-black hover:bg-white hover:text-primary">
              Contact Sales
            </Button>
          </div>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="bg-card border-t border-border py-12">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <p className="text-muted-foreground">
              © 2024 ProcureFlow. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
