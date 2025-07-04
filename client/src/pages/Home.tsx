import { Link } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";

export default function Home() {
  const { user } = useAuth();
  
  const { data: userFiles } = useQuery({
    queryKey: ['/api/files'],
    enabled: !!user,
  });

  const { data: fileStats } = useQuery({
    queryKey: ['/api/files/stats'],
    enabled: !!user,
  });

  return (
    <div className="min-h-screen bg-slate-950 text-white">
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
              <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
                Welcome back, {user?.firstName || 'User'}!
              </h1>
              <p className="text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed">
                Your secure file sharing dashboard. Upload, share, and manage your encrypted files with complete privacy.
              </p>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12 max-w-4xl mx-auto">
              <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50">
                <div className="w-12 h-12 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center mx-auto mb-4">
                  <i className="fas fa-file-alt text-white text-xl"></i>
                </div>
                <h3 className="text-2xl font-bold text-primary mb-2">
                  {fileStats?.totalFiles || 0}
                </h3>
                <p className="text-slate-400 text-sm">Total Files</p>
              </div>
              <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50">
                <div className="w-12 h-12 bg-gradient-to-br from-accent to-primary rounded-xl flex items-center justify-center mx-auto mb-4">
                  <i className="fas fa-download text-white text-xl"></i>
                </div>
                <h3 className="text-2xl font-bold text-accent mb-2">
                  {fileStats?.totalDownloads || 0}
                </h3>
                <p className="text-slate-400 text-sm">Total Downloads</p>
              </div>
              <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50">
                <div className="w-12 h-12 bg-gradient-to-br from-secondary to-accent rounded-xl flex items-center justify-center mx-auto mb-4">
                  <i className="fas fa-shield-alt text-white text-xl"></i>
                </div>
                <h3 className="text-2xl font-bold text-secondary mb-2">
                  {fileStats?.activeFiles || 0}
                </h3>
                <p className="text-slate-400 text-sm">Active Files</p>
              </div>
            </div>

            {/* Call to Action */}
            <div className="mt-12 space-y-4">
              <Link href="/upload">
                <a className="inline-block bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-white font-semibold px-8 py-4 rounded-xl transition-all duration-300 text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-1">
                  <i className="fas fa-upload mr-2"></i>
                  Upload New File
                </a>
              </Link>
              <div className="flex items-center justify-center space-x-4 text-sm text-slate-400">
                <Link href="/dashboard">
                  <a className="hover:text-white transition-colors">
                    <i className="fas fa-chart-bar mr-1"></i>
                    View Dashboard
                  </a>
                </Link>
                <Link href="/settings">
                  <a className="hover:text-white transition-colors">
                    <i className="fas fa-cog mr-1"></i>
                    Settings
                  </a>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Files */}
      {userFiles?.files && userFiles.files.length > 0 && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold">Recent Files</h2>
              <Link href="/dashboard">
                <a className="text-primary hover:text-primary/80 text-sm">
                  View All
                </a>
              </Link>
            </div>
            <div className="space-y-3">
              {userFiles.files.slice(0, 3).map((file: any) => (
                <div key={file.id} className="flex items-center justify-between p-3 bg-slate-900/50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className={`w-10 h-10 bg-gradient-to-br ${file.mimeType.includes('pdf') ? 'from-blue-500 to-blue-600' : 'from-slate-500 to-slate-600'} rounded-lg flex items-center justify-center`}>
                      <i className={`${file.mimeType.includes('pdf') ? 'fas fa-file-pdf' : 'fas fa-file'} text-white`}></i>
                    </div>
                    <div>
                      <div className="font-medium">{file.originalName}</div>
                      <div className="text-sm text-slate-400">{file.fileSize} bytes</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      file.isExpired ? 'bg-slate-600/20 text-slate-400' : 'bg-accent/20 text-accent'
                    }`}>
                      {file.isExpired ? 'Expired' : 'Active'}
                    </span>
                    <Link href={`/share/${file.id}`}>
                      <a className="text-primary hover:text-primary/80">
                        <i className="fas fa-share"></i>
                      </a>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
