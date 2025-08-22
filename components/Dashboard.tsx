'use client'

import { useState } from "react";
import { 
  Plus, 
  Search, 
  Filter, 
  Download, 
  Calendar,
  DollarSign,
  Package,
  TrendingUp
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Header from "@/components/Header";

const Dashboard = () => {
  const [selectedProject, setSelectedProject] = useState("all");

  // Mock data
  const projects = [
    { id: "proj-001", name: "Office Building Construction", budget: 150000, spent: 87500 },
    { id: "proj-002", name: "Warehouse Renovation", budget: 85000, spent: 52000 },
    { id: "proj-003", name: "Retail Store Setup", budget: 45000, spent: 28000 },
  ];

  const materials = [
    {
      id: "mat-001",
      project: "Office Building Construction",
      material: "Steel Beams",
      approvedBudget: 25000,
      spent: 18500,
      status: "Active",
    },
    {
      id: "mat-002", 
      project: "Office Building Construction",
      material: "Concrete Mix",
      approvedBudget: 15000,
      spent: 12000,
      status: "Active",
    },
    {
      id: "mat-003",
      project: "Warehouse Renovation",
      material: "Insulation Panels",
      approvedBudget: 8000,
      spent: 8000,
      status: "Complete",
    },
  ];

  const purchaseRequisitions = [
    {
      id: "PR-001",
      project: "Office Building Construction", 
      material: "Steel Beams",
      quantity: "50 tons",
      prDate: "2024-01-15",
      status: "Approved",
      poGenerated: "PO-001",
      deliveryDate: "2024-02-01",
      remarks: "Urgent delivery required"
    },
    {
      id: "PR-002",
      project: "Office Building Construction",
      material: "Concrete Mix", 
      quantity: "200 bags",
      prDate: "2024-01-18",
      status: "Pending",
      poGenerated: "-",
      deliveryDate: "-",
      remarks: "Awaiting approval"
    },
  ];

  const getStatusBadge = (status: string) => {
    const variants = {
      "Active": "default",
      "Complete": "success",
      "Approved": "success", 
      "Pending": "warning",
      "Rejected": "destructive"
    } as const;
    return variants[status as keyof typeof variants] || "default";
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-6 space-y-6">
        {/* Dashboard Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-foreground">Dashboard</h1>
            <p className="text-muted-foreground">Monitor your project purchases and procurement status</p>
          </div>
          
          <div className="flex items-center gap-3">
            <Select value={selectedProject} onValueChange={setSelectedProject}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Select Project" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Projects</SelectItem>
                {projects.map((project) => (
                  <SelectItem key={project.id} value={project.id}>
                    {project.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="hero">
              <Plus className="h-4 w-4 mr-2" />
              New PR
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-gradient-card shadow-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Budget</CardTitle>
              <DollarSign className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">$280,000</div>
              <p className="text-xs text-success">+12% from last month</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-card shadow-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
              <TrendingUp className="h-4 w-4 text-warning" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">$167,500</div>
              <p className="text-xs text-muted-foreground">59.8% of budget</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-card shadow-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Projects</CardTitle>
              <Package className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">3</div>
              <p className="text-xs text-muted-foreground">2 nearing completion</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-card shadow-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending PRs</CardTitle>
              <Calendar className="h-4 w-4 text-warning" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">7</div>
              <p className="text-xs text-warning">Require approval</p>
            </CardContent>
          </Card>
        </div>

        {/* Materials Overview */}
        <Card className="bg-gradient-card shadow-card">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-foreground">Materials Overview</CardTitle>
                <CardDescription>Budget allocation and spending by material</CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="Search materials..." className="pl-8 w-[250px]" />
                </div>
                <Button variant="outline" size="icon">
                  <Filter className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="icon">
                  <Download className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Project</TableHead>
                  <TableHead>Material</TableHead>
                  <TableHead>Approved Budget</TableHead>
                  <TableHead>Spent</TableHead>
                  <TableHead>Remaining</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {materials.map((material) => (
                  <TableRow key={material.id}>
                    <TableCell className="font-medium">{material.project}</TableCell>
                    <TableCell>{material.material}</TableCell>
                    <TableCell>${material.approvedBudget.toLocaleString()}</TableCell>
                    <TableCell>${material.spent.toLocaleString()}</TableCell>
                    <TableCell>${(material.approvedBudget - material.spent).toLocaleString()}</TableCell>
                    <TableCell>
                      <Badge variant={getStatusBadge(material.status)}>
                        {material.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Purchase Requisitions */}
        <Card className="bg-gradient-card shadow-card">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-foreground">Purchase Requisitions</CardTitle>
                <CardDescription>Track PR status, PO generation, and delivery dates</CardDescription>
              </div>
              <Button variant="hero">
                <Plus className="h-4 w-4 mr-2" />
                Create PR
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>PR ID</TableHead>
                  <TableHead>Project</TableHead>
                  <TableHead>Material</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>PR Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>PO Generated</TableHead>
                  <TableHead>Delivery Date</TableHead>
                  <TableHead>Remarks</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {purchaseRequisitions.map((pr) => (
                  <TableRow key={pr.id}>
                    <TableCell className="font-medium">{pr.id}</TableCell>
                    <TableCell>{pr.project}</TableCell>
                    <TableCell>{pr.material}</TableCell>
                    <TableCell>{pr.quantity}</TableCell>
                    <TableCell>{pr.prDate}</TableCell>
                    <TableCell>
                      <Badge variant={getStatusBadge(pr.status)}>
                        {pr.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{pr.poGenerated}</TableCell>
                    <TableCell>{pr.deliveryDate}</TableCell>
                    <TableCell>{pr.remarks}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Dashboard;
