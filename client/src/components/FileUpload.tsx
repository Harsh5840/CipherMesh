import { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { fileUtils } from "@/lib/fileUtils";
import { Progress } from "@/components/ui/progress";

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  selectedFile: File | null;
  isUploading: boolean;
  progress: number;
}

export default function FileUpload({
  onFileSelect,
  selectedFile,
  isUploading,
  progress,
}: FileUploadProps) {
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length > 0) {
        onFileSelect(acceptedFiles[0]);
      }
    },
    [onFileSelect]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: false,
    maxSize: 100 * 1024 * 1024, // 100MB
  });

  return (
    <div className="space-y-6">
      {/* Drag & Drop Zone */}
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-3xl p-12 text-center bg-slate-800/30 backdrop-blur-sm transition-all duration-300 cursor-pointer ${
          isDragActive
            ? "border-primary/50 bg-primary/5"
            : "border-slate-600 hover:border-primary/50"
        } ${isUploading ? "pointer-events-none opacity-50" : ""}`}
      >
        <input {...getInputProps()} />
        <div className="space-y-4">
          <div className="w-16 h-16 bg-gradient-to-br from-primary to-secondary rounded-2xl flex items-center justify-center mx-auto">
            <i className="fas fa-cloud-upload-alt text-white text-2xl"></i>
          </div>
          <h3 className="text-xl font-semibold">
            {isDragActive ? "Drop file here" : "Drag & Drop Files Here"}
          </h3>
          <p className="text-slate-400">or click to browse from your computer</p>
          <div className="flex items-center justify-center space-x-4 text-sm text-slate-500">
            <span>Max 100MB</span>
            <span>•</span>
            <span>All file types</span>
            <span>•</span>
            <span>AES-256 encrypted</span>
          </div>
        </div>
      </div>

      {/* Selected File */}
      {selectedFile && (
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className={`w-12 h-12 bg-gradient-to-br ${fileUtils.getFileColor(selectedFile.type)} rounded-xl flex items-center justify-center`}>
                <i className={`${fileUtils.getFileIcon(selectedFile.type)} text-white`}></i>
              </div>
              <div>
                <h4 className="font-semibold">{selectedFile.name}</h4>
                <p className="text-sm text-slate-400">
                  {fileUtils.formatFileSize(selectedFile.size)} • {selectedFile.type.split('/')[1]?.toUpperCase() || 'Unknown'}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              {isUploading ? (
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-accent rounded-full animate-pulse"></div>
                  <span className="text-sm text-slate-300">Processing...</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                  <span className="text-sm text-slate-300">Ready</span>
                </div>
              )}
              {!isUploading && (
                <button
                  onClick={() => onFileSelect(null as any)}
                  className="text-slate-400 hover:text-white"
                >
                  <i className="fas fa-times"></i>
                </button>
              )}
            </div>
          </div>

          {/* Progress Bar */}
          {isUploading && progress > 0 && (
            <div className="mt-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-slate-300">
                  {progress < 40 ? "Encrypting..." : progress < 80 ? "Uploading..." : "Finalizing..."}
                </span>
                <span className="text-sm text-slate-400">{progress}%</span>
              </div>
              <Progress value={progress} className="bg-slate-700" />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
