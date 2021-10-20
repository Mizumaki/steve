import { Job, JobStatus, JobType } from '~/entity/Job';
import { JobHistoryRepositoryInterface } from '~/repository/JobHistory';
import { runCommand } from '~/utils/runCommand';

export const jobHandleLogic = ({
  jobHistoryRepository,
}: {
  jobHistoryRepository: Pick<JobHistoryRepositoryInterface, 'updateJob'>;
}) => async (job: Job) => {
  const updateStatusToRunning = (jobId: string) =>
    jobHistoryRepository.updateJob(jobId, { status: JobStatus.ongoing, startedAt: new Date() });
  const updateStatusToSuccess = (jobId: string) =>
    jobHistoryRepository.updateJob(jobId, { status: JobStatus.succeeded, endedAt: new Date() });
  const updateStatusToFailed = (jobId: string) =>
    jobHistoryRepository.updateJob(jobId, { status: JobStatus.failed, endedAt: new Date() });

  switch (job.type) {
    case JobType.single:
      {
        await updateStatusToRunning(job.id);
        try {
          await runCommand(job.command);
          await updateStatusToSuccess(job.id);
          if (job.onSuccess) {
            // The command in onSuccess is not awaited
            void runCommand(job.onSuccess).catch(e => {
              // TODO: Handle log well
              console.error(`The 'onSuccess' for ${job.id} failed: ${(e as unknown) as string}`);
              throw e;
            });
          }
        } catch (e) {
          await updateStatusToFailed(job.id);
          if (job.onFailed) {
            void runCommand(job.onFailed).catch(e => {
              // TODO: Handle log well
              console.error(`The 'onFailed' for ${job.id} failed: ${(e as unknown) as string}`);
              throw e;
            });
          }
        }
      }
      break;
    case JobType.chain:
      {
        await updateStatusToRunning(job.id);
        // TODO(PR): Loop chainJobs
      }
      break;
    // TODO(PR): chainJob や clusterJob のケースも追加する
    default:
      break;
  }
};

// TODO: Write test
// if (process.env['NODE_ENV'] === 'test') {
//   // https://stackoverflow.com/questions/56174883/how-to-add-global-commands-to-jest-like-describe-and-it
//   const mockSingleJob = ({ id, command }: { id: string; command: string }) =>
//     ({
//       id,
//       type: 'single',
//       name: '単一Job',
//       command,
//       status: 'waiting',
//       createdAt: new Date(),
//     } as const);

//   const singleJob1 = mockSingleJob({ id: 'job1', command: 'curl localhost:8080' });
//   const jobs: Job[] = [singleJob1];
//   const jobHandler = jobHandleLogic({
//     jobHistoryRepository: {
//       updateJob: async (jobId, updateColumns) => {
//         const jobIndex = jobs.findIndex(j => j.id === jobId);
//         jobs[jobIndex] = { ...jobs[jobIndex], ...updateColumns } as Job;
//         await Promise.resolve();
//       },
//     },
//   });

//   describe('SingleJob', () => {
//     test('Success Job without onSuccess is correctly resolved', async () => {
//       // TODO: mock runCommand and check it fires with correct argument
//       await jobHandler(singleJob1);
//       expect(jobs[0]?.status).toBe('oongoing');
//       // After job is done
//       expect(jobs[0]?.status).toBe('succeeded');
//     });
//     test('Success Job with onSuccess is correctly resolved', async () => {});
//     test('Success Job with failed onSuccess is correctly throw Error', async () => {});
//     test('Failed Job without onFailed is correctly resolved', async () => {});
//     test('Success Job with onFailed is correctly resolved', async () => {});
//     test('Success Job with failed onFailed is correctly throw Error', async () => {});
//   });
// }
