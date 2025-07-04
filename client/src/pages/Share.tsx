import { useParams, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { fileUtils } from "@/lib/fileUtils";
import QRCode from "@/components/QRCode";

export default function Share() {
  const { id } = useParams<{ id: string }>();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [showQR, setShowQR] = useState(false);
  
  const { data: fileData, isLoading, error } = useQuery({
    queryKey: [`/api/files/info/${id}`],
    enabled: !!id,
  });

  const shareUrl = fileUtils.generateShareUrl(id!);
  
  const handleCopyLink = async () => {
    const success = await fileUtils.copyToClipboard(shareUrl);
    if (success) {
      toast({
        title: "Link copied!",
        description: "The secure link has been copied to your clipboard.",
      });
    } else {
      toast({
        title: "Copy failed",
        description: "Please copy the link manually.",
        variant: "destructive",
      });
    }
  };

  const handleEmailShare = () => {
    const subject = encodeURIComponent(`Secure File: ${fileData?.file?.originalName}`);
    const body = encodeURIComponent(`I've shared a secure file with you. Click the link below to download it:\n\n${shareUrl}\n\nThis link will expire in ${fileUtils.formatTimeRemaining(new Date(fileData?.file?.expiryDate))}.`);
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-primary to-secondary rounded-2xl flex items-center justify-center mx-auto mb-6 animate-pulse">
            <i className="fas fa-spinner fa-spin text-white text-3xl"></i>
          </div>
          <h1 className="text-4xl font-bold mb-4">Loading...</h1>
        </div>
      </div>
    );
  }

  if (error || !fileData?.file) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-red-500 to-red-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <i className="fas fa-exclamation-triangle text-white text-3xl"></i>
          </div>
          <h1 className="text-4xl font-bold mb-4">File Not Found</h1>
          <p className="text-lg text-slate-400 mb-8">The file you're looking for doesn't exist or has been deleted.</p>
          <Button onClick={() => navigate('/dashboard')} className="bg-gradient-to-r from-primary to-secondary">
            Go to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  const file = fileData.file;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="text-center mb-12">
        <div className="w-20 h-20 bg-gradient-to-br from-accent to-primary rounded-2xl flex items-center justify-center mx-auto mb-6">
          <i className="fas fa-check text-white text-3xl"></i>
        </div>
        <h1 className="text-4xl font-bold mb-4">File Encrypted & Ready</h1>
        <p className="text-lg text-slate-400">Your file has been encrypted and is ready to share</p>
      </div>

      {/* Share Options Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Secure Link */}
        <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700/50">
          <CardHeader>
            <CardTitle className="flex items-center">
              <i className="fas fa-link text-primary mr-2"></i>
              Secure Link
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-700">
              <div className="flex items-center justify-between">
                <code className="text-sm text-slate-300 truncate flex-1 mr-2">{shareUrl}</code>
                <Button
                  onClick={handleCopyLink}
                  variant="ghost"
                  size="sm"
                  className="text-primary hover:text-primary/80"
                >
                  <i className="fas fa-copy"></i>
                </Button>
              </div>
            </div>
            <div className="flex space-x-2">
              <Button 
                onClick={handleCopyLink}
                className="flex-1 bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20"
                variant="outline"
              >
                <i className="fas fa-copy mr-2"></i>Copy Link
              </Button>
              <Button 
                onClick={handleEmailShare}
                className="flex-1 bg-secondary/10 hover:bg-secondary/20 text-secondary border border-secondary/20"
                variant="outline"
              >
                <i className="fas fa-envelope mr-2"></i>Email
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* QR Code */}
        <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700/50">
          <CardHeader>
            <CardTitle className="flex items-center">
              <i className="fas fa-qrcode text-secondary mr-2"></i>
              QR Code
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <QRCode value={shareUrl} size={160} />
            <p className="text-sm text-slate-400 mt-4 mb-4">Scan with mobile device</p>
            <Button
              onClick={() => setShowQR(!showQR)}
              className="bg-secondary/10 hover:bg-secondary/20 text-secondary border border-secondary/20"
              variant="outline"
            >
              <i className="fas fa-download mr-2"></i>Download QR
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* File Details */}
      <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700/50 mt-8">
        <CardHeader>
          <CardTitle>File Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-slate-400">File Name:</span>
                <span>{file.originalName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">File Size:</span>
                <span>{fileUtils.formatFileSize(file.fileSize)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Encryption:</span>
                <span className="text-accent">AES-256-GCM</span>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-slate-400">Expires:</span>
                <span>{fileUtils.formatTimeRemaining(new Date(file.expiryDate))}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Downloads:</span>
                <span>{file.downloadCount} / {file.maxDownloads}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Status:</span>
                <span className={file.isExpired ? 'text-slate-400' : 'text-accent'}>
                  {file.isExpired ? 'Expired' : 'Active'}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex justify-center space-x-4 mt-8">
        <Button
          onClick={() => navigate('/upload')}
          variant="outline"
          className="bg-slate-700 hover:bg-slate-600 text-white"
        >
          Upload Another File
        </Button>
        <Button
          onClick={() => navigate('/dashboard')}
          className="bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90"
        >
          View Dashboard
        </Button>
      </div>
    </div>
  );
}
