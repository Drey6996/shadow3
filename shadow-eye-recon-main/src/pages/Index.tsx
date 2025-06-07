
import React from 'react';
import AnimatedBackground from '../components/AnimatedBackground';
import AuthCard from '../components/AuthCard';

const Index = () => {
  return (
    <div className="min-h-screen relative overflow-hidden">
      <AnimatedBackground />
      
      <div className="relative z-10 flex items-center justify-center min-h-screen p-4">
        <div className="w-full max-w-md">
          <AuthCard />
        </div>
      </div>

      {/* Bottom branding */}
      <div className="fixed bottom-4 left-4 z-20">
        <div className="text-osint-dark-400 text-sm">
          <p>OSINT Intelligence Platform</p>
          <p className="text-xs">Secure • Professional • Modern</p>
        </div>
      </div>

      {/* Top navigation hint */}
      <div className="fixed top-4 right-4 z-20">
        <div className="flex items-center space-x-2 text-osint-dark-400 text-sm">
          <div className="w-2 h-2 bg-osint-accent rounded-full animate-pulse"></div>
          <span>Sistema Seguro</span>
        </div>
      </div>
    </div>
  );
};

export default Index;
