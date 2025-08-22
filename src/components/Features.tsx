import { 
  FileText, 
  DollarSign, 
  Calendar, 
  BarChart3, 
  Shield, 
  Zap 
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const Features = () => {
  const features = [
    {
      icon: FileText,
      title: "Purchase Requisitions",
      description: "Create, track, and approve purchase requisitions with detailed material specifications and project mapping."
    },
    {
      icon: DollarSign,
      title: "Budget Management",
      description: "Monitor approved budgets for each material across projects with real-time spending analysis."
    },
    {
      icon: Calendar,
      title: "Date Tracking",
      description: "Track PR dates, PO dates, and delivery schedules to ensure timely project completion."
    },
    {
      icon: BarChart3,
      title: "Purchase Orders",
      description: "Generate purchase orders against requisitions with vendor management and delivery tracking."
    },
    {
      icon: Shield,
      title: "Compliance & Remarks",
      description: "Maintain detailed remarks and ensure compliance with procurement policies and procedures."
    },
    {
      icon: Zap,
      title: "Real-time Updates",
      description: "Get instant notifications and updates on procurement status across all your projects."
    }
  ];

  return (
    <section id="features" className="py-16 lg:py-24 bg-muted/50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
            Powerful Procurement Features
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Everything you need to manage project-wise purchases, from initial requisitions 
            to final delivery tracking.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <Card key={index} className="bg-gradient-card shadow-card hover:shadow-lg transition-smooth">
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-xl text-foreground">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-muted-foreground">
                  {feature.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;