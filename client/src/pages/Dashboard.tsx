import { useQuery, useMutation } from "@tanstack/react-query";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { fileUtils } from "@/lib/fileUtils";
import { apiRequest, queryClient } from "@/lib/queryClient";
import FileList from "@/components/FileList";

export default function Dashboard() {
  const { toast } = useToast();
  
  const { data: userFiles, isLoading } = useQuery({
    queryKey: ['/api/files'],
  });

  const { data: fileStats } = useQuery({
    queryKey: ['/api/files/stats'],
  });

  const deleteMutation = useMutation({
    mutationFn: async (fileId: string) => {
      await apiRequest('DELETE', `/api/files/${fileId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/files'] });
      toast({
        title: "File deleted",
        description: "The file has been successfully deleted.",
      });
    },
    onError: (error) => {
      toast({
        title: "Delete failed",
        description: error instanceof Error ? error.message : "Failed to delete file",
        variant: "destructive",
      });
    },
  });

  const handleDelete = (fileId: string) => {
    if (window.confirm('Are you sure you want to delete this file? This action cannot be undone.')) {
      deleteMutation.mutate(fileId);
    }
  };

  const handleCopyLink = async (fileId: string) => {
    const shareUrl = fileUtils.generateShareUrl(fileId);
    const success = await fileUtils.copyToClipboard(shareUrl);
    if (success) {
      toast({
        title: "Link copied!",
        description: "The secure link has been copied to your clipboard.",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-primary to-secondary rounded-2xl flex items-center justify-center mx-auto mb-6 animate-pulse">
            <i className="fas fa-spinner fa-spin text-white text-3xl"></i>
          </div>
          <h1 className="text-4xl font-bold mb-4">Loading Dashboard...</h1>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-4xl font-bold">Dashboard</h1>
        <Link href="/upload">
          <Button className="bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-white font-semibold px-6 py-3 shadow-lg hover:shadow-xl">
            <i className="fas fa-plus mr-2"></i>New Upload
          </Button>
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700/50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Total Files</h3>
              <i className="fas fa-file-alt text-primary text-xl"></i>
            </div>
            <div className="text-3xl font-bold text-primary">
              {fileStats?.totalFiles || userFiles?.files?.length || 0}
            </div>
            <p className="text-sm text-slate-400">Active shares</p>
          </CardContent>
        </Card>
        <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700/50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Total Downloads</h3>
              <i className="fas fa-download text-accent text-xl"></i>
            </div>
            <div className="text-3xl font-bold text-accent">
              {fileStats?.totalDownloads || userFiles?.files?.reduce((acc: number, file: any) => acc + file.downloadCount, 0) || 0}
            </div>
            <p className="text-sm text-slate-400">This month</p>
          </CardContent>
        </Card>
        <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700/50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Storage Used</h3>
              <i className="fas fa-hdd text-secondary text-xl"></i>
            </div>
            <div className="text-3xl font-bold text-secondary">
              {fileStats?.totalSize ? fileUtils.formatFileSize(fileStats.totalSize) : 
               userFiles?.files ? fileUtils.formatFileSize(userFiles.files.reduce((acc: number, file: any) => acc + file.fileSize, 0)) : '0 B'}
            </div>
            <p className="text-sm text-slate-400">Total uploaded</p>
          </CardContent>
        </Card>
      </div>

      {/* Files List */}
      <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700/50">
        <CardHeader>
          <CardTitle className="text-lg">Your Files</CardTitle>
        </CardHeader>
        <CardContent>
          {userFiles?.files && userFiles.files.length > 0 ? (
            <FileList
              files={userFiles.files}
              onDelete={handleDelete}
              onCopyLink={handleCopyLink}
              isDeleting={deleteMutation.isPending}
            />
          ) : (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gradient-to-br from-slate-600 to-slate-700 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <i className="fas fa-file-alt text-slate-400 text-2xl"></i>
              </div>
              <h3 className="text-lg font-semibold text-slate-300 mb-2">No files yet</h3>
              <p className="text-slate-400 mb-6">Upload your first file to get started with secure sharing</p>
              <Link href="/upload">
                <Button className="bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90">
                  <i className="fas fa-upload mr-2"></i>Upload File
                </Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
