/**
 * Title: Write a program using JavaScript on Main
 * Author: China Gate Team
 * Date: 26, September 2025
 */

import React from "react";
import Header from "../header/Header";
import Footer from "../Footer";

const Main = ({ children }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-gray-100 to-zinc-100 relative overflow-hidden">
      {/* Beautiful Background Pattern - VISIBLE */}
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_25%_25%,_theme(colors.cyan.200)_0%,_transparent_50%)]"></div>
        <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(circle_at_75%_25%,_theme(colors.blue.200)_0%,_transparent_50%)]"></div>
        <div className="absolute bottom-0 left-0 w-full h-full bg-[radial-gradient(circle_at_25%_75%,_theme(colors.indigo.200)_0%,_transparent_50%)]"></div>
        <div className="absolute bottom-0 right-0 w-full h-full bg-[radial-gradient(circle_at_75%_75%,_theme(colors.slate.200)_0%,_transparent_50%)]"></div>
      </div>

      {/* Floating Geometric Shapes - VISIBLE */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-15">
        {/* Top shapes */}
        <div className="absolute top-20 left-20 w-40 h-40 bg-gradient-to-br from-cyan-300 to-blue-400 rounded-full blur-3xl animate-float-gentle"></div>
        <div className="absolute top-40 right-32 w-32 h-32 bg-gradient-to-br from-indigo-300 to-purple-400 rounded-full blur-2xl animate-float-gentle-reverse"></div>
        
        {/* Middle shapes */}
        <div className="absolute top-1/2 left-1/4 w-28 h-28 bg-gradient-to-br from-slate-300 to-gray-400 rounded-full blur-xl animate-float-slow"></div>
        <div className="absolute top-1/3 right-1/4 w-36 h-36 bg-gradient-to-br from-blue-300 to-cyan-400 rounded-full blur-2xl animate-float-medium"></div>
        
        {/* Bottom shapes */}
        <div className="absolute bottom-32 left-32 w-44 h-44 bg-gradient-to-br from-gray-300 to-slate-400 rounded-full blur-3xl animate-float-gentle"></div>
        <div className="absolute bottom-20 right-20 w-30 h-30 bg-gradient-to-br from-cyan-300 to-indigo-400 rounded-full blur-xl animate-float-gentle-reverse"></div>
      </div>

      {/* Grid Pattern - VISIBLE */}
      <div className="absolute inset-0 opacity-5 pointer-events-none">
        <div className="w-full h-full bg-[linear-gradient(rgba(0,0,0,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.1)_1px,transparent_1px)] bg-[size:80px_80px]"></div>
      </div>

      {/* Animated Waves */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-10">
        <div className="absolute top-0 left-0 w-full h-full">
          <svg className="w-full h-full" viewBox="0 0 1200 800" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path className="animate-wave" d="M0,100 C300,150 600,50 900,100 C1050,125 1200,75 1200,100 L1200,0 L0,0 Z" fill="url(#wave1)" />
            <path className="animate-wave-reverse" d="M0,200 C300,250 600,150 900,200 C1050,225 1200,175 1200,200 L1200,0 L0,0 Z" fill="url(#wave2)" />
            <defs>
              <linearGradient id="wave1" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="rgb(6, 182, 212)" stopOpacity="0.1"/>
                <stop offset="100%" stopColor="rgb(59, 130, 246)" stopOpacity="0.05"/>
              </linearGradient>
              <linearGradient id="wave2" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="rgb(99, 102, 241)" stopOpacity="0.08"/>
                <stop offset="100%" stopColor="rgb(168, 85, 247)" stopOpacity="0.04"/>
              </linearGradient>
            </defs>
          </svg>
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 bg-white/70 backdrop-blur-sm">
        <Header />
        <div className="bg-white/80 backdrop-blur-sm">
          {children}
        </div>
        <Footer />
      </div>

      {/* Custom CSS for smooth animations */}
      <style jsx>{`
        @keyframes float-gentle {
          0%, 100% { 
            transform: translateY(0px) translateX(0px) rotate(0deg) scale(1); 
          }
          33% { 
            transform: translateY(-20px) translateX(15px) rotate(120deg) scale(1.1); 
          }
          66% { 
            transform: translateY(10px) translateX(-12px) rotate(240deg) scale(0.9); 
          }
        }
        
        @keyframes float-gentle-reverse {
          0%, 100% { 
            transform: translateY(0px) translateX(0px) rotate(0deg) scale(1); 
          }
          33% { 
            transform: translateY(18px) translateX(-18px) rotate(-120deg) scale(0.9); 
          }
          66% { 
            transform: translateY(-15px) translateX(20px) rotate(-240deg) scale(1.1); 
          }
        }
        
        @keyframes float-slow {
          0%, 100% { 
            transform: translateY(0px) rotate(0deg); 
          }
          50% { 
            transform: translateY(-30px) rotate(180deg); 
          }
        }
        
        @keyframes float-medium {
          0%, 100% { 
            transform: translateY(0px) rotate(0deg) scale(1); 
          }
          50% { 
            transform: translateY(-35px) rotate(90deg) scale(1.2); 
          }
        }

        @keyframes wave {
          0%, 100% { 
            transform: translateX(0px); 
          }
          50% { 
            transform: translateX(-50px); 
          }
        }

        @keyframes wave-reverse {
          0%, 100% { 
            transform: translateX(0px); 
          }
          50% { 
            transform: translateX(50px); 
          }
        }
        
        .animate-float-gentle { 
          animation: float-gentle 15s ease-in-out infinite; 
        }
        .animate-float-gentle-reverse { 
          animation: float-gentle-reverse 18s ease-in-out infinite; 
        }
        .animate-float-slow { 
          animation: float-slow 22s ease-in-out infinite; 
        }
        .animate-float-medium { 
          animation: float-medium 12s ease-in-out infinite; 
        }
        .animate-wave { 
          animation: wave 25s ease-in-out infinite; 
        }
        .animate-wave-reverse { 
          animation: wave-reverse 20s ease-in-out infinite; 
        }
      `}</style>
    </div>
  );
};

export default Main;
