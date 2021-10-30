import { ChainJob, ClusterJob, Job, JobBehaviorOnFailed, JobStatus, JobType, SingleJob } from '~/entity/Job';
import { JobHistoryRepositoryInterface } from '~/repository/JobHistory';
import { CommandError, runCommand, runCommand as _runCommand } from '~/utils/runCommand';

const handleJobGen = ({
  updateStatusToRunning,
  updateStatusToPending,
  updateStatusToSuccess,
  updateStatusToFailed,
  runCommand,
}: {
  updateStatusToRunning: (jobId: string) => Promise<void>;
  updateStatusToPending: (jobId: string) => Promise<void>;
  updateStatusToSuccess: (jobId: string) => Promise<void>;
  updateStatusToFailed: (jobId: string) => Promise<void>;
  runCommand: (
    command: string
  ) => Promise<{
    error: CommandError | undefined;
    stdout: string;
    stderr: string;
  }>;
}) => async (job: Job): Promise<{ error: undefined | CommandError }> => {
  const handleJob = handleJobGen({
    updateStatusToRunning,
    updateStatusToPending,
    updateStatusToSuccess,
    updateStatusToFailed,
    runCommand,
  });
  switch (job.type) {
    case JobType.single: {
      await updateStatusToRunning(job.id);
      const { error, stdout, stderr } = await runCommand(job.command);
      if (error) {
        await updateStatusToFailed(job.id);
        if (job.onFailed) {
          const res = await runCommand(job.onFailed);
          if (res.error) {
            // TODO: Handle log well
            console.error(`The 'onFailed' for ${job.id} failed: ${res.error.message}`);
            throw res.error;
          }
        }
        return { error };
      }
      await updateStatusToSuccess(job.id);
      if (job.onSuccess) {
        // TODO: pass these to job.onSuccess
        console.info(`stdout: ${stdout}, stderr: ${stderr}`);
        const res = await runCommand(job.onSuccess);
        if (res.error) {
          // TODO: Handle log well
          console.error(`The 'onSuccess' for ${job.id} failed: ${res.error.message}`);
          throw res.error;
        }
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
        // TODO: Pass success/failed job ids
        await runCommand(job.onEnd).catch(e => {
          // TODO: Handle log well
          console.error(`The 'onEnd' for ${job.id} failed: ${(e as unknown) as string}`);
          throw e;
        });
      }
      return { error: undefined };
    }
    case JobType.cluster: {
      await updateStatusToRunning(job.id);
      const jobResults = await Promise.allSettled(job.jobCluster.map(j => handleJob(j)));
      if (jobResults.find(j => j.status === 'rejected')) {
        // TODO: How to handle job.onSuccess, job.onFailed error
        throw new Error(`One of JobCluster throw error...`);
      }
      await updateStatusToSuccess(job.id);
      if (job.onEnd) {
        console.log({ jobResults });
        // TODO: Pass success/failed job ids
        await runCommand(job.onEnd).catch(e => {
          // TODO: Handle log well
          console.error(`The 'onEnd' for ${job.id} failed: ${(e as unknown) as string}`);
          throw e;
        });
      }
      return { error: undefined };
    }
  }
};

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

  const handleJob = handleJobGen({
    updateStatusToRunning,
    updateStatusToPending,
    updateStatusToSuccess,
    updateStatusToFailed,
    runCommand: _runCommand,
  });

  await handleJob(rootJob);
};

// TODO: Write test (handleJob だけ関数外出しして依存関係整理したらもっとテスト書きやすいかも)

// テストしたいことをリストアップ

/*

それぞれ、status の更新は正しいことを確認する
 
ChainJob with SingleJobs (resolved) => 実行順序の正しさ & error: undefined
ChainJob with SingleJobs (rejected) (whenOneOfChainFailed: STOP) => 実行順序の正しさと止まること & error: undefined
ChainJob with SingleJobs (rejected) (whenOneOfChainFailed: FAIL) => 実行順序の正しさと止まること & error: undefined
ChainJob with SingleJobs (rejected) (whenOneOfChainFailed: SKIP) => 実行順序の正しさと最後までまで進行すること & error: undefined
ChainJob with SingleJobs (onEnd error) => 実行順序の正しさ & throw error

ClusterJob with SingleJobs (resolved) => 早い job から終わること & error: undefined
ClusterJob with SingleJobs (rejected) => 早い job から終わること & error: undefined
ClusterJob with SingleJobs (onSuccess error) => 早い job から終わること & throw error
 */

if (process.env['NODE_ENV'] === 'test') {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  const updateStatusToRunningMock = jest.fn();
  const updateStatusToPendingMock = jest.fn();
  const updateStatusToSuccessMock = jest.fn();
  const updateStatusToFailedMock = jest.fn();
  const runCommandMock = jest.fn();

  const mockResCommandSuccess = { error: undefined, stdout: 'stdout string', stderr: 'stderr string' };
  const mockResCommandFailed = {
    error: new CommandError('test command error', 'test command', new Error()),
    stdout: 'stdout string',
    stderr: 'stderr string',
  };
  runCommandMock.mockResolvedValue(mockResCommandSuccess);

  const jobHandler = handleJobGen({
    updateStatusToRunning: updateStatusToRunningMock,
    updateStatusToPending: updateStatusToPendingMock,
    updateStatusToSuccess: updateStatusToSuccessMock,
    updateStatusToFailed: updateStatusToFailedMock,
    runCommand: runCommandMock,
  });

  describe('SingleJob', () => {
    const job: SingleJob = {
      id: 'job',
      name: 'test job',
      type: 'single',
      command: 'test job command',
      status: 'waiting',
      createdAt: new Date(),
      onSuccess: 'test onSuccess command',
      onFailed: 'test onFailed command',
    };

    test('When command without error', async () => {
      const res = await jobHandler(job);
      expect(res.error).toBeUndefined();
      expect(runCommandMock.mock.calls[0]?.[0]).toBe(job.command);
      expect(runCommandMock.mock.calls[1]?.[0]).toBe(job.onSuccess);
      expect(updateStatusToRunningMock.mock.calls[0]?.[0]).toBe(job.id);
      expect(updateStatusToPendingMock.mock.calls.length).toBe(0);
      expect(updateStatusToSuccessMock.mock.calls[0]?.[0]).toBe(job.id);
      expect(updateStatusToFailedMock.mock.calls.length).toBe(0);
    });

    test('When command with error', async () => {
      runCommandMock.mockResolvedValueOnce(mockResCommandFailed);

      const res = await jobHandler(job);
      expect(res.error).toBe(mockResCommandFailed.error);
      expect(runCommandMock.mock.calls[0]?.[0]).toBe(job.command);
      expect(runCommandMock.mock.calls[1]?.[0]).toBe(job.onFailed);
      expect(updateStatusToRunningMock.mock.calls[0]?.[0]).toBe(job.id);
      expect(updateStatusToPendingMock.mock.calls.length).toBe(0);
      expect(updateStatusToSuccessMock.mock.calls.length).toBe(0);
      expect(updateStatusToFailedMock.mock.calls[0]?.[0]).toBe(job.id);
    });

    test('When command without error but onSuccess error', async () => {
      runCommandMock.mockResolvedValueOnce(mockResCommandSuccess).mockResolvedValueOnce(mockResCommandFailed);

      const res = jobHandler(job);
      await expect(res).rejects.toThrow(mockResCommandFailed.error.message);
      expect(runCommandMock.mock.calls[0]?.[0]).toBe(job.command);
      expect(runCommandMock.mock.calls[1]?.[0]).toBe(job.onSuccess);
      expect(updateStatusToRunningMock.mock.calls[0]?.[0]).toBe(job.id);
      expect(updateStatusToPendingMock.mock.calls.length).toBe(0);
      expect(updateStatusToSuccessMock.mock.calls[0]?.[0]).toBe(job.id);
      expect(updateStatusToFailedMock.mock.calls.length).toBe(0);
    });

    test('When command with error but onFailed error', async () => {
      runCommandMock.mockResolvedValueOnce(mockResCommandFailed).mockResolvedValueOnce(mockResCommandFailed);

      const res = jobHandler(job);
      await expect(res).rejects.toThrow(mockResCommandFailed.error.message);
      expect(runCommandMock.mock.calls[0]?.[0]).toBe(job.command);
      expect(runCommandMock.mock.calls[1]?.[0]).toBe(job.onFailed);
      expect(updateStatusToRunningMock.mock.calls[0]?.[0]).toBe(job.id);
      expect(updateStatusToPendingMock.mock.calls.length).toBe(0);
      expect(updateStatusToSuccessMock.mock.calls.length).toBe(0);
      expect(updateStatusToFailedMock.mock.calls[0]?.[0]).toBe(job.id);
    });
  });

  describe('ChainJob', () => {
    const singleJob = (cmd: number): SingleJob => ({
      id: 'job',
      name: 'test job',
      type: 'single',
      command: cmd.toString(),
      status: 'waiting',
      createdAt: new Date(),
      onSuccess: `test onSuccess command for ${cmd}`,
      onFailed: `test onFailed command for ${cmd}`,
    });

    test('When all jobs are resolved in serial', async () => {
      const chainJob: ChainJob = {
        id: 'job',
        name: 'test job',
        type: 'chain',
        chainJobs: [singleJob(200), singleJob(500), singleJob(100)],
        whenOneOfChainFailed: 'SKIP',
        status: 'waiting',
        createdAt: new Date(),
        onEnd: 'test onEnd command',
      };

      runCommandMock.mockImplementation((cmd: number) => {
        return new Promise(resolve => {
          setTimeout(() => resolve(mockResCommandSuccess), cmd);
        });
      });

      const res = await jobHandler(chainJob);
      expect(res.error).toBeUndefined();
      // Test the order of command is serial
      expect(runCommandMock.mock.calls).toEqual([
        ['200'],
        ['test onSuccess command for 200'],
        ['500'],
        ['test onSuccess command for 500'],
        ['100'],
        ['test onSuccess command for 100'],
        [chainJob.onEnd],
      ]);

      expect(updateStatusToRunningMock.mock.calls.length).toBe(4);
      expect(updateStatusToPendingMock.mock.calls.length).toBe(0);
      expect(updateStatusToSuccessMock.mock.calls.length).toBe(4);
      expect(updateStatusToFailedMock.mock.calls.length).toBe(0);
    });
  });

  describe('ClusterJob', () => {
    const singleJob = (cmd: number): SingleJob => ({
      id: 'job',
      name: 'test job',
      type: 'single',
      command: cmd.toString(),
      status: 'waiting',
      createdAt: new Date(),
      onSuccess: `test onSuccess command for ${cmd}`,
      onFailed: `test onFailed command for ${cmd}`,
    });

    test('When all jobs are resolved in parallel', async () => {
      const clusterJob: ClusterJob = {
        id: 'job',
        name: 'test job',
        type: 'cluster',
        jobCluster: [singleJob(200), singleJob(500), singleJob(100)],
        status: 'waiting',
        createdAt: new Date(),
        onEnd: 'test onEnd command',
      };

      runCommandMock.mockImplementation((cmd: number) => {
        return new Promise(resolve => {
          setTimeout(() => resolve(mockResCommandSuccess), cmd);
        });
      });

      const res = await jobHandler(clusterJob);
      expect(res.error).toBeUndefined();
      // Test the order of command is parallel
      expect(runCommandMock.mock.calls).toEqual([
        ['200'],
        ['500'],
        ['100'],
        ['test onSuccess command for 100'],
        ['test onSuccess command for 200'],
        ['test onSuccess command for 500'],
        [clusterJob.onEnd],
      ]);

      expect(updateStatusToRunningMock.mock.calls.length).toBe(4);
      expect(updateStatusToPendingMock.mock.calls.length).toBe(0);
      expect(updateStatusToSuccessMock.mock.calls.length).toBe(4);
      expect(updateStatusToFailedMock.mock.calls.length).toBe(0);
    });
  });
}
