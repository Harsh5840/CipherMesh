export const fileUtils = {
  // Format file size in human readable format
  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  },

  // Get file icon based on mime type
  getFileIcon(mimeType: string): string {
    if (mimeType.startsWith('image/')) return 'fas fa-file-image';
    if (mimeType.startsWith('video/')) return 'fas fa-file-video';
    if (mimeType.startsWith('audio/')) return 'fas fa-file-audio';
    if (mimeType.includes('pdf')) return 'fas fa-file-pdf';
    if (mimeType.includes('word')) return 'fas fa-file-word';
    if (mimeType.includes('excel') || mimeType.includes('spreadsheet')) return 'fas fa-file-excel';
    if (mimeType.includes('powerpoint') || mimeType.includes('presentation')) return 'fas fa-file-powerpoint';
    if (mimeType.includes('zip') || mimeType.includes('archive')) return 'fas fa-file-archive';
    if (mimeType.includes('text/')) return 'fas fa-file-alt';
    return 'fas fa-file';
  },

  // Get file color based on mime type
  getFileColor(mimeType: string): string {
    if (mimeType.startsWith('image/')) return 'from-green-500 to-green-600';
    if (mimeType.startsWith('video/')) return 'from-red-500 to-red-600';
    if (mimeType.startsWith('audio/')) return 'from-purple-500 to-purple-600';
    if (mimeType.includes('pdf')) return 'from-blue-500 to-blue-600';
    if (mimeType.includes('word')) return 'from-blue-600 to-blue-700';
    if (mimeType.includes('excel')) return 'from-green-600 to-green-700';
    if (mimeType.includes('powerpoint')) return 'from-orange-500 to-orange-600';
    if (mimeType.includes('zip') || mimeType.includes('archive')) return 'from-yellow-500 to-yellow-600';
    if (mimeType.includes('text/')) return 'from-slate-500 to-slate-600';
    return 'from-slate-600 to-slate-700';
  },

  // Validate file type and size
  validateFile(file: File, maxSize: number = 100 * 1024 * 1024): { valid: boolean; error?: string } {
    if (file.size > maxSize) {
      return { valid: false, error: `File size exceeds ${this.formatFileSize(maxSize)} limit` };
    }
    
    return { valid: true };
  },

  // Format time remaining
  formatTimeRemaining(expiryDate: Date): string {
    const now = new Date();
    const diff = expiryDate.getTime() - now.getTime();
    
    if (diff <= 0) return 'Expired';
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 24) {
      const days = Math.floor(hours / 24);
      return `${days}d ${hours % 24}h`;
    }
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    
    return `${minutes}m`;
  },

  // Download file as blob
  downloadFile(data: ArrayBuffer, filename: string, mimeType: string): void {
    const blob = new Blob([data], { type: mimeType });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  },

  // Generate share URL
  generateShareUrl(fileId: string, baseUrl: string = window.location.origin): string {
    return `${baseUrl}/download/${fileId}`;
  },

  // Copy text to clipboard
  async copyToClipboard(text: string): Promise<boolean> {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (err) {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      const success = document.execCommand('copy');
      document.body.removeChild(textArea);
      return success;
    }
  }
};
