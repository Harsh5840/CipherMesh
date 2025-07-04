import { useState } from "react";
import { useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { FileEncryption, cryptoUtils } from "@/lib/crypto";
import { fileUtils } from "@/lib/fileUtils";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import FileUpload from "@/components/FileUpload";

export default function Upload() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [settings, setSettings] = useState({
    expiryHours: 24,
    maxDownloads: 1,
    password: '',
  });

  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      setUploadProgress(10);
      
      // Encrypt file client-side
      const { encryptedData, iv, keyJwk } = await FileEncryption.encryptFile(file);
      setUploadProgress(40);
      
      // Convert to base64 for upload
      const encryptedBase64 = cryptoUtils.arrayBufferToBase64(encryptedData);
      const ivBase64 = cryptoUtils.uint8ArrayToBase64(iv);
      const publicKeyString = JSON.stringify(keyJwk);
      
      setUploadProgress(60);
      
      // Create form data
      const formData = new FormData();
      const encryptedBlob = new Blob([encryptedData], { type: 'application/octet-stream' });
      formData.append('file', encryptedBlob, `${file.name}.enc`);
      formData.append('originalName', file.name);
      formData.append('fileSize', file.size.toString());
      formData.append('mimeType', file.type);
      formData.append('publicKey', publicKeyString);
      formData.append('iv', ivBase64);
      formData.append('expiryHours', settings.expiryHours.toString());
      formData.append('maxDownloads', settings.maxDownloads.toString());
      if (settings.password) {
        formData.append('password', settings.password);
      }
      
      setUploadProgress(80);
      
      // Upload to server
      const response = await fetch('/api/files/upload', {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });
      
      if (!response.ok) {
        throw new Error('Upload failed');
      }
      
      setUploadProgress(100);
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "File uploaded successfully",
        description: "Your file has been encrypted and is ready to share.",
      });
      navigate(`/share/${data.fileId}`);
    },
    onError: (error) => {
      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : "An error occurred during upload",
        variant: "destructive",
      });
      setUploadProgress(0);
    },
  });

  const handleFileSelect = (file: File) => {
    const validation = fileUtils.validateFile(file);
    if (!validation.valid) {
      toast({
        title: "Invalid file",
        description: validation.error,
        variant: "destructive",
      });
      return;
    }
    
    setSelectedFile(file);
  };

  const handleUpload = () => {
    if (!selectedFile) return;
    uploadMutation.mutate(selectedFile);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">Upload Files</h1>
        <p className="text-lg text-slate-400">Files are encrypted in your browser before upload</p>
      </div>

      <div className="space-y-8">
        {/* File Upload */}
        <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700/50">
          <CardContent className="p-6">
            <FileUpload
              onFileSelect={handleFileSelect}
              selectedFile={selectedFile}
              isUploading={uploadMutation.isPending}
              progress={uploadProgress}
            />
          </CardContent>
        </Card>

        {/* Upload Settings */}
        {selectedFile && (
          <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700/50">
            <CardHeader>
              <CardTitle className="text-lg">Sharing Options</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="expiry">Expiration Time</Label>
                  <Select value={settings.expiryHours.toString()} onValueChange={(value) => setSettings(prev => ({ ...prev, expiryHours: parseInt(value) }))}>
                    <SelectTrigger className="bg-slate-700 border-slate-600">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 hour</SelectItem>
                      <SelectItem value="6">6 hours</SelectItem>
                      <SelectItem value="24">24 hours</SelectItem>
                      <SelectItem value="168">7 days</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="downloads">Download Limit</Label>
                  <Select value={settings.maxDownloads.toString()} onValueChange={(value) => setSettings(prev => ({ ...prev, maxDownloads: parseInt(value) }))}>
                    <SelectTrigger className="bg-slate-700 border-slate-600">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 download</SelectItem>
                      <SelectItem value="5">5 downloads</SelectItem>
                      <SelectItem value="10">10 downloads</SelectItem>
                      <SelectItem value="100">Unlimited</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label htmlFor="password">Password Protection (Optional)</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter password for additional security"
                  value={settings.password}
                  onChange={(e) => setSettings(prev => ({ ...prev, password: e.target.value }))}
                  className="bg-slate-700 border-slate-600"
                />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Upload Progress */}
        {uploadMutation.isPending && (
          <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700/50">
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-300">Encrypting and uploading...</span>
                  <span className="text-sm text-slate-400">{uploadProgress}%</span>
                </div>
                <Progress value={uploadProgress} className="bg-slate-700" />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Upload Button */}
        <div className="text-center">
          <Button
            onClick={handleUpload}
            disabled={!selectedFile || uploadMutation.isPending}
            className="bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-white font-semibold px-8 py-4 text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            {uploadMutation.isPending ? (
              <>
                <i className="fas fa-spinner fa-spin mr-2"></i>
                Encrypting & Uploading...
              </>
            ) : (
              <>
                <i className="fas fa-shield-alt mr-2"></i>
                Encrypt & Upload
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
