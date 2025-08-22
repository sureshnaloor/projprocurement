'use client'

import { Building2, Bell, User, Menu, Home, BarChart3, FileText, Calculator, Zap, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";

const Header = () => {
  const { user, logout } = useAuth();

  return (
    <header className="border-b border-gray-700 bg-gradient-to-r from-slate-800 to-slate-900 shadow-lg">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Building2 className="h-10 w-10 text-blue-400 drop-shadow-lg" />
              <div className="absolute -top-1 -right-1 h-3 w-3 bg-green-400 rounded-full animate-pulse"></div>
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
                ProcureFlow
              </h1>
              <p className="text-sm text-gray-300 font-medium">Project Purchase Management</p>
            </div>
          </div>
          
          {user && (
            <nav className="hidden md:flex items-center space-x-8">
              <Link 
                href="/" 
                className="flex items-center space-x-2 text-gray-300 hover:text-blue-400 transition-all duration-300 hover:scale-105 group"
              >
                <Home className="h-5 w-5 group-hover:rotate-12 transition-transform duration-300" />
                <span className="font-medium">Home</span>
              </Link>
              <Link 
                href="/dashboard" 
                className="flex items-center space-x-2 text-gray-300 hover:text-green-400 transition-all duration-300 hover:scale-105 group"
              >
                <BarChart3 className="h-5 w-5 group-hover:rotate-12 transition-transform duration-300" />
                <span className="font-medium">Dashboard</span>
              </Link>
              <Link 
                href="/purchase-requisitions" 
                className="flex items-center space-x-2 text-gray-300 hover:text-purple-400 transition-all duration-300 hover:scale-105 group"
              >
                <FileText className="h-5 w-5 group-hover:rotate-12 transition-transform duration-300" />
                <span className="font-medium">Purchase Requisitions</span>
              </Link>
              <Link 
                href="/budgeted-values" 
                className="flex items-center space-x-2 text-gray-300 hover:text-cyan-400 transition-all duration-300 hover:scale-105 group"
              >
                <Calculator className="h-5 w-5 group-hover:rotate-12 transition-transform duration-300" />
                <span className="font-medium">Budgeted Values</span>
              </Link>
              <a 
                href="#features" 
                className="flex items-center space-x-2 text-gray-300 hover:text-orange-400 transition-all duration-300 hover:scale-105 group"
              >
                <Zap className="h-5 w-5 group-hover:rotate-12 transition-transform duration-300" />
                <span className="font-medium">Features</span>
              </a>
            </nav>
          )}

          <div className="flex items-center space-x-3">
            {user ? (
              <>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="relative text-gray-300 hover:text-yellow-400 hover:bg-gray-700 transition-all duration-300"
                >
                  <Bell className="h-5 w-5" />
                  <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 rounded-full text-xs text-white flex items-center justify-center animate-pulse">
                    3
                  </span>
                </Button>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      className="text-gray-300 hover:text-blue-400 hover:bg-gray-700 transition-all duration-300"
                    >
                      <User className="h-5 w-5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="bg-slate-800 border-gray-700">
                    <DropdownMenuItem className="text-gray-300 hover:text-blue-400 hover:bg-gray-700 focus:bg-gray-700">
                      <User className="mr-2 h-4 w-4" />
                      {user.name}
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-gray-300 hover:text-blue-400 hover:bg-gray-700 focus:bg-gray-700">
                      Profile
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-gray-300 hover:text-blue-400 hover:bg-gray-700 focus:bg-gray-700">
                      Settings
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={logout}
                      className="text-gray-300 hover:text-red-400 hover:bg-gray-700 focus:bg-gray-700"
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      Sign Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <div className="flex items-center space-x-2">
                <Link href="/login">
                  <Button variant="ghost" className="text-gray-300 hover:text-blue-400 hover:bg-gray-700">
                    Sign In
                  </Button>
                </Link>
                <Link href="/register">
                  <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                    Sign Up
                  </Button>
                </Link>
              </div>
            )}

            <Button 
              variant="ghost" 
              size="icon" 
              className="md:hidden text-gray-300 hover:text-blue-400 hover:bg-gray-700 transition-all duration-300"
            >
              <Menu className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
