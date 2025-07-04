import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { fileUtils } from "@/lib/fileUtils";
import QRCode from "./QRCode";

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  fileId: string;
  fileName: string;
}

export default function ShareModal({ isOpen, onClose, fileId, fileName }: ShareModalProps) {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<'link' | 'qr' | 'email'>('link');
  const shareUrl = fileUtils.generateShareUrl(fileId);

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
    const subject = encodeURIComponent(`Secure File: ${fileName}`);
    const body = encodeURIComponent(`I've shared a secure file with you. Click the link below to download it:\n\n${shareUrl}\n\nThis link will expire soon for security.`);
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-slate-800 border-slate-700 text-white max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <i className="fas fa-share text-primary mr-2"></i>
            Share File
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Tab Navigation */}
          <div className="flex space-x-1 bg-slate-900/50 rounded-lg p-1">
            <button
              onClick={() => setActiveTab('link')}
              className={`flex-1 px-3 py-2 text-sm rounded-md transition-colors ${
                activeTab === 'link'
                  ? 'bg-primary text-white'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <i className="fas fa-link mr-2"></i>Link
            </button>
            <button
              onClick={() => setActiveTab('qr')}
              className={`flex-1 px-3 py-2 text-sm rounded-md transition-colors ${
                activeTab === 'qr'
                  ? 'bg-primary text-white'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <i className="fas fa-qrcode mr-2"></i>QR Code
            </button>
            <button
              onClick={() => setActiveTab('email')}
              className={`flex-1 px-3 py-2 text-sm rounded-md transition-colors ${
                activeTab === 'email'
                  ? 'bg-primary text-white'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <i className="fas fa-envelope mr-2"></i>Email
            </button>
          </div>

          {/* Tab Content */}
          {activeTab === 'link' && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="shareUrl" className="text-slate-300">
                  Secure Share Link
                </Label>
                <div className="flex space-x-2 mt-2">
                  <Input
                    id="shareUrl"
                    value={shareUrl}
                    readOnly
                    className="bg-slate-700 border-slate-600 text-slate-300"
                  />
                  <Button onClick={handleCopyLink} size="sm" className="bg-primary hover:bg-primary/90">
                    <i className="fas fa-copy"></i>
                  </Button>
                </div>
              </div>
              <p className="text-sm text-slate-400">
                This link is encrypted and will expire automatically for security.
              </p>
            </div>
          )}

          {activeTab === 'qr' && (
            <div className="text-center space-y-4">
              <QRCode value={shareUrl} size={200} />
              <p className="text-sm text-slate-400">
                Scan with your mobile device to download the file
              </p>
            </div>
          )}

          {activeTab === 'email' && (
            <div className="space-y-4">
              <p className="text-sm text-slate-400">
                Share this file via email with a pre-composed message
              </p>
              <Button onClick={handleEmailShare} className="w-full bg-secondary hover:bg-secondary/90">
                <i className="fas fa-envelope mr-2"></i>
                Open Email Client
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
