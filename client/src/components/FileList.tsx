import { Link } from "wouter";
import { fileUtils } from "@/lib/fileUtils";
import { Button } from "@/components/ui/button";

interface File {
  id: string;
  originalName: string;
  fileSize: number;
  mimeType: string;
  uploadDate: string;
  expiryDate: string;
  downloadCount: number;
  maxDownloads: number;
  isExpired: boolean;
  requiresPassword: boolean;
}

interface FileListProps {
  files: File[];
  onDelete: (fileId: string) => void;
  onCopyLink: (fileId: string) => void;
  isDeleting: boolean;
}

export default function FileList({ files, onDelete, onCopyLink, isDeleting }: FileListProps) {
  if (files.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-gradient-to-br from-slate-600 to-slate-700 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <i className="fas fa-file-alt text-slate-400 text-2xl"></i>
        </div>
        <h3 className="text-lg font-semibold text-slate-300 mb-2">No files yet</h3>
        <p className="text-slate-400">Upload your first file to get started</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-slate-900/50">
          <tr>
            <th className="text-left px-6 py-3 text-sm font-medium text-slate-400">File</th>
            <th className="text-left px-6 py-3 text-sm font-medium text-slate-400">Size</th>
            <th className="text-left px-6 py-3 text-sm font-medium text-slate-400">Downloads</th>
            <th className="text-left px-6 py-3 text-sm font-medium text-slate-400">Expires</th>
            <th className="text-left px-6 py-3 text-sm font-medium text-slate-400">Status</th>
            <th className="text-left px-6 py-3 text-sm font-medium text-slate-400">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-700">
          {files.map((file) => {
            const isExpired = file.isExpired || new Date() > new Date(file.expiryDate);
            const timeRemaining = fileUtils.formatTimeRemaining(new Date(file.expiryDate));
            
            return (
              <tr key={file.id} className="hover:bg-slate-800/30">
                <td className="px-6 py-4">
                  <div className="flex items-center space-x-3">
                    <div className={`w-10 h-10 bg-gradient-to-br ${fileUtils.getFileColor(file.mimeType)} rounded-lg flex items-center justify-center`}>
                      <i className={`${fileUtils.getFileIcon(file.mimeType)} text-white`}></i>
                    </div>
                    <div>
                      <div className="font-medium">{file.originalName}</div>
                      <div className="text-sm text-slate-400">{file.mimeType.split('/')[1]?.toUpperCase()}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-slate-300">
                  {fileUtils.formatFileSize(file.fileSize)}
                </td>
                <td className="px-6 py-4 text-sm text-slate-300">
                  {file.downloadCount} / {file.maxDownloads === 100 ? '∞' : file.maxDownloads}
                </td>
                <td className="px-6 py-4 text-sm text-slate-300">
                  {timeRemaining}
                </td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    isExpired
                      ? 'bg-slate-600/20 text-slate-400'
                      : 'bg-accent/20 text-accent'
                  }`}>
                    {isExpired ? 'Expired' : 'Active'}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center space-x-2">
                    <Button
                      onClick={() => onCopyLink(file.id)}
                      disabled={isExpired}
                      variant="ghost"
                      size="sm"
                      className={isExpired ? "text-slate-500 cursor-not-allowed" : "text-primary hover:text-primary/80"}
                      title="Copy Link"
                    >
                      <i className="fas fa-copy"></i>
                    </Button>
                    <Link href={`/share/${file.id}`}>
                      <Button
                        disabled={isExpired}
                        variant="ghost"
                        size="sm"
                        className={isExpired ? "text-slate-500 cursor-not-allowed" : "text-secondary hover:text-secondary/80"}
                        title="Share"
                      >
                        <i className="fas fa-qrcode"></i>
                      </Button>
                    </Link>
                    <Button
                      onClick={() => onDelete(file.id)}
                      disabled={isDeleting}
                      variant="ghost"
                      size="sm"
                      className="text-red-400 hover:text-red-300"
                      title="Delete"
                    >
                      <i className="fas fa-trash"></i>
                    </Button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
