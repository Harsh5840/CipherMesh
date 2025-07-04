import { useParams } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { FileEncryption, cryptoUtils } from "@/lib/crypto";
import { fileUtils } from "@/lib/fileUtils";
import { apiRequest } from "@/lib/queryClient";

export default function Download() {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const [password, setPassword] = useState('');
  
  const { data: fileInfo, isLoading, error } = useQuery({
    queryKey: [`/api/files/info/${id}`],
    enabled: !!id,
  });

  const downloadMutation = useMutation({
    mutationFn: async ({ password }: { password?: string }) => {
      const response = await apiRequest('POST', `/api/files/download/${id}`, { password });
      return response.json();
    },
    onSuccess: async (data) => {
      try {
        // Decrypt file client-side
        const encryptedData = cryptoUtils.base64ToArrayBuffer(data.encryptedData);
        const iv = cryptoUtils.base64ToUint8Array(data.file.iv);
        const keyJwk = JSON.parse(data.file.publicKey);
        
        const decryptedData = await FileEncryption.decryptFile(encryptedData, iv, keyJwk);
        
        // Download decrypted file
        fileUtils.downloadFile(decryptedData, data.file.originalName, data.file.mimeType);
        
        toast({
          title: "Download successful",
          description: "Your file has been decrypted and downloaded.",
        });
      } catch (error) {
        toast({
          title: "Decryption failed",
          description: "Failed to decrypt the file. Please try again.",
          variant: "destructive",
        });
      }
    },
    onError: (error) => {
      toast({
        title: "Download failed",
        description: error instanceof Error ? error.message : "Failed to download file",
        variant: "destructive",
      });
    },
  });

  const handleDownload = () => {
    const downloadPassword = fileInfo?.file?.requiresPassword ? password : undefined;
    downloadMutation.mutate({ password: downloadPassword });
  };

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-primary to-secondary rounded-2xl flex items-center justify-center mx-auto mb-6 animate-pulse">
            <i className="fas fa-spinner fa-spin text-white text-3xl"></i>
          </div>
          <h1 className="text-4xl font-bold mb-4">Loading...</h1>
        </div>
      </div>
    );
  }

  if (error || !fileInfo?.file) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-red-500 to-red-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <i className="fas fa-exclamation-triangle text-white text-3xl"></i>
          </div>
          <h1 className="text-4xl font-bold mb-4">File Not Found</h1>
          <p className="text-lg text-slate-400">The file you're looking for doesn't exist or has expired.</p>
        </div>
      </div>
    );
  }

  const file = fileInfo.file;

  if (file.isExpired) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <i className="fas fa-clock text-white text-3xl"></i>
          </div>
          <h1 className="text-4xl font-bold mb-4">File Expired</h1>
          <p className="text-lg text-slate-400">This file has expired and is no longer available for download.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="text-center mb-12">
        <div className={`w-20 h-20 bg-gradient-to-br ${fileUtils.getFileColor(file.mimeType)} rounded-2xl flex items-center justify-center mx-auto mb-6`}>
          <i className={`${fileUtils.getFileIcon(file.mimeType)} text-white text-3xl`}></i>
        </div>
        <h1 className="text-4xl font-bold mb-4">Secure File Download</h1>
        <p className="text-lg text-slate-400">File will be decrypted in your browser</p>
      </div>

      {/* File Info Card */}
      <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700/50 mb-8">
        <CardContent className="p-8">
          <div className="flex items-center space-x-4 mb-6">
            <div className={`w-16 h-16 bg-gradient-to-br ${fileUtils.getFileColor(file.mimeType)} rounded-2xl flex items-center justify-center`}>
              <i className={`${fileUtils.getFileIcon(file.mimeType)} text-white text-2xl`}></i>
            </div>
            <div>
              <h3 className="text-xl font-semibold">{file.originalName}</h3>
              <p className="text-slate-400">{fileUtils.formatFileSize(file.fileSize)} • {file.mimeType.split('/')[1].toUpperCase()}</p>
            </div>
          </div>

          {/* Security Info */}
          <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-700 mb-6">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-accent rounded-full"></div>
                <span className="text-slate-300">End-to-End Encrypted</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-slate-400">AES-256-GCM</span>
                <i className="fas fa-shield-alt text-accent"></i>
              </div>
            </div>
          </div>

          {/* Download Stats */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-warning">
                {fileUtils.formatTimeRemaining(new Date(file.expiryDate))}
              </div>
              <div className="text-sm text-slate-400">Time Remaining</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-accent">
                {file.downloadCount} / {file.maxDownloads}
              </div>
              <div className="text-sm text-slate-400">Downloads Used</div>
            </div>
          </div>

          {/* Password Input (if required) */}
          {file.requiresPassword && (
            <div className="mb-6">
              <Label htmlFor="password" className="text-sm font-medium text-slate-300 mb-2">
                Password Required
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter password to decrypt"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-slate-700 border-slate-600 text-white placeholder-slate-400"
              />
            </div>
          )}

          {/* Download Button */}
          <Button
            onClick={handleDownload}
            disabled={downloadMutation.isPending || (file.requiresPassword && !password)}
            className="w-full bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-white font-semibold py-4 text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            {downloadMutation.isPending ? (
              <>
                <i className="fas fa-spinner fa-spin mr-2"></i>
                Decrypting...
              </>
            ) : (
              <>
                <i className="fas fa-download mr-2"></i>
                Decrypt & Download
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Security Notice */}
      <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 text-center">
        <div className="flex items-center justify-center space-x-2 text-amber-400 mb-2">
          <i className="fas fa-info-circle"></i>
          <span className="font-medium">Security Notice</span>
        </div>
        <p className="text-sm text-amber-300">
          This file will be decrypted locally in your browser. The decryption key never leaves your device.
        </p>
      </div>
    </div>
  );
}
