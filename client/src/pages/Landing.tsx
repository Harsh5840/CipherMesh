import { Link } from "wouter";

export default function Landing() {
  return (
    <div className="bg-slate-950 text-white min-h-screen">
      {/* Navigation Header */}
      <header className="sticky top-0 z-50 bg-slate-900/80 backdrop-blur-md border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center">
                <i className="fas fa-shield-alt text-white text-sm"></i>
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                SecureShare
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <a href="/api/login" className="bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-white font-semibold px-6 py-2 rounded-lg transition-all duration-300">
                Sign In
              </a>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Animated background particles */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-10 left-10 w-32 h-32 bg-primary/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute top-32 right-20 w-48 h-48 bg-secondary/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute bottom-20 left-1/3 w-40 h-40 bg-accent/10 rounded-full blur-3xl animate-pulse delay-2000"></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center space-y-8">
            <div className="space-y-4">
              <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
                Zero-Knowledge
              </h1>
              <h2 className="text-3xl md:text-5xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                File Sharing
              </h2>
            </div>
            <p className="text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed">
              End-to-end encrypted file sharing with client-side encryption. 
              Your files are encrypted before leaving your device - even we can't see them.
            </p>
            
            {/* Security Features Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12 max-w-4xl mx-auto">
              <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50">
                <div className="w-12 h-12 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center mx-auto mb-4">
                  <i className="fas fa-lock text-white text-xl"></i>
                </div>
                <h3 className="text-lg font-semibold mb-2">AES-256-GCM Encryption</h3>
                <p className="text-slate-400 text-sm">Military-grade encryption happens in your browser</p>
              </div>
              <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50">
                <div className="w-12 h-12 bg-gradient-to-br from-accent to-primary rounded-xl flex items-center justify-center mx-auto mb-4">
                  <i className="fas fa-clock text-white text-xl"></i>
                </div>
                <h3 className="text-lg font-semibold mb-2">Auto-Expiring Links</h3>
                <p className="text-slate-400 text-sm">Files automatically delete after 24 hours</p>
              </div>
              <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50">
                <div className="w-12 h-12 bg-gradient-to-br from-secondary to-accent rounded-xl flex items-center justify-center mx-auto mb-4">
                  <i className="fas fa-qrcode text-white text-xl"></i>
                </div>
                <h3 className="text-lg font-semibold mb-2">QR Code Sharing</h3>
                <p className="text-slate-400 text-sm">Instant mobile sharing with QR codes</p>
              </div>
            </div>

            {/* Call to Action */}
            <div className="mt-12 space-y-4">
              <a href="/api/login" className="inline-block bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-white font-semibold px-8 py-4 rounded-xl transition-all duration-300 text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-1">
                Start Sharing Securely
              </a>
              <div className="flex items-center justify-center space-x-4 text-sm text-slate-400">
                <span className="flex items-center space-x-1">
                  <i className="fas fa-check text-accent"></i>
                  <span>Zero-knowledge architecture</span>
                </span>
                <span className="flex items-center space-x-1">
                  <i className="fas fa-check text-accent"></i>
                  <span>100MB file limit</span>
                </span>
                <span className="flex items-center space-x-1">
                  <i className="fas fa-check text-accent"></i>
                  <span>Open source</span>
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-slate-800 bg-slate-900/50 backdrop-blur-sm mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center">
                <i className="fas fa-shield-alt text-white text-sm"></i>
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                SecureShare
              </span>
            </div>
            <p className="text-slate-400 text-sm mb-4">
              Zero-knowledge file sharing with end-to-end encryption. Your privacy is our priority.
            </p>
            <p className="text-slate-400 text-sm">
              © 2025 SecureShare. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
