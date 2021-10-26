import { Job, JobBehaviorOnFailed, JobStatus, JobType } from '~/entity/Job';
import { JobHistoryRepositoryInterface } from '~/repository/JobHistory';
import { CommandError, runCommand } from '~/utils/runCommand';

export const jobHandleLogic = ({
  jobHistoryRepository,
}: {
  jobHistoryRepository: Pick<JobHistoryRepositoryInterface, 'updateJob'>;
}) => async (rootJob: Job): Promise<void> => {
  const updateStatusToRunning = (jobId: string) =>
    jobHistoryRepository.updateJob(jobId, { status: JobStatus.ongoing, startedAt: new Date() });
  const updateStatusToPending = (jobId: string) => jobHistoryRepository.updateJob(jobId, { status: JobStatus.pending });
  const updateStatusToSuccess = (jobId: string) =>
    jobHistoryRepository.updateJob(jobId, { status: JobStatus.succeeded, endedAt: new Date() });
  const updateStatusToFailed = (jobId: string) =>
    jobHistoryRepository.updateJob(jobId, { status: JobStatus.failed, endedAt: new Date() });

  const handleJob = async (job: Job): Promise<{ error: undefined | CommandError }> => {
    switch (job.type) {
      case JobType.single: {
        await updateStatusToRunning(job.id);
        const { error, stdout, stderr } = await runCommand(job.command);
        if (error) {
          await updateStatusToFailed(job.id);
          if (job.onFailed) {
            void runCommand(job.onFailed).catch(e => {
              // TODO: Handle log well
              console.error(`The 'onFailed' for ${job.id} failed: ${(e as unknown) as string}`);
              throw e;
            });
          }
          return { error };
        }
        await updateStatusToSuccess(job.id);
        if (job.onSuccess) {
          // TODO: pass these to job.onSuccess
          console.info(`stdout: ${stdout}, stderr: ${stderr}`);
          // The command in onSuccess is not awaited
          void runCommand(job.onSuccess).catch(e => {
            // TODO: Handle log well
            console.error(`The 'onSuccess' for ${job.id} failed: ${(e as unknown) as string}`);
            throw e;
          });
        }
        return { error: undefined };
      }
      case JobType.chain: {
        await updateStatusToRunning(job.id);
        const failedJobs: Job[] = [];
        chainLoop: for (const j of job.chainJobs) {
          const { error } = await handleJob(j);
          if (error) {
            failedJobs.push(j);
            switch (job.whenOneOfChainFailed) {
              case JobBehaviorOnFailed.stop:
                break chainLoop;
              case JobBehaviorOnFailed.fail:
                break chainLoop;
              case JobBehaviorOnFailed.skip:
                continue chainLoop;
            }
          }
        }

        if (failedJobs.length === 0) {
          await updateStatusToSuccess(job.id);
        } else {
          switch (job.whenOneOfChainFailed) {
            case JobBehaviorOnFailed.stop:
              await updateStatusToPending(job.id);
              break;
            case JobBehaviorOnFailed.fail:
              await updateStatusToFailed(job.id);
              break;
            case JobBehaviorOnFailed.skip:
              await updateStatusToSuccess(job.id);
              break;
          }
        }

        if (job.onEnd) {
          void runCommand(job.onEnd).catch(e => {
            // TODO: Handle log well
            console.error(`The 'onFailed' for ${job.id} failed: ${(e as unknown) as string}`);
            throw e;
          });
        }
        return { error: undefined };
      }
      case JobType.cluster: {
        // TODO(PR): clusterJob のケースも追加する
        return { error: undefined };
      }
    }
  };

  await handleJob(rootJob);
};

// TODO: Write test (handleJob だけ関数外出しして依存関係整理したらもっとテスト書きやすいかも)
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
