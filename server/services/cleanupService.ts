import { fileService } from "./fileService";
import cron from "node-cron";

class CleanupService {
  private isRunning = false;

  start(): void {
    // Run cleanup every hour
    cron.schedule('0 * * * *', async () => {
      if (this.isRunning) {
        console.log('Cleanup already running, skipping...');
        return;
      }

      this.isRunning = true;
      console.log('Starting cleanup task...');
      
      try {
        await fileService.cleanupExpiredFiles();
        console.log('Cleanup task completed successfully');
      } catch (error) {
        console.error('Cleanup task failed:', error);
      } finally {
        this.isRunning = false;
      }
    });

    console.log('Cleanup service started');
  }

  async runCleanup(): Promise<void> {
    if (this.isRunning) {
      throw new Error('Cleanup already running');
    }

    this.isRunning = true;
    try {
      await fileService.cleanupExpiredFiles();
    } finally {
      this.isRunning = false;
    }
  }
}

export const cleanupService = new CleanupService();
