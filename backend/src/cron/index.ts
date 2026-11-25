// Scheduled Cron Jobs Initialization and Lifecycle
// Coordinates background tasks: periodic Cuelinks transaction sync, deals scraping, token cleanup
import {
  startCuelinksTransactionScheduler,
  stopCuelinksTransactionScheduler,
  isSchedulerRunning,
} from './cuelinksTransactionScheduler.js';

let cronInitialized = false;

export const initializeCronJobs = (): void => {
  if (cronInitialized) {
    return; // Singleton guarantee: ensure initialization occurs only once per process
  }
  startCuelinksTransactionScheduler();
  cronInitialized = true;
};

export const stopCronJobs = (): void => {
  stopCuelinksTransactionScheduler();
  cronInitialized = false;
};

export const areCronJobsRunning = (): boolean => {
  return cronInitialized && isSchedulerRunning();
};


