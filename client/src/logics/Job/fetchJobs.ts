import type { Job } from '.';
import { fetchJobsApi } from '../api';

type AsyncResponse<Data, Error = unknown> =
  | {
      isFailed: false;
      data: Data;
      error?: undefined;
    }
  | {
      isFailed: true;
      data?: undefined;
      error: Error;
    };

export const fetchJobs = async (): Promise<AsyncResponse<Job[], string>> => {
  const apiRes = await fetchJobsApi();
  if (apiRes.isFailed) {
    return { isFailed: true, error: `${apiRes.error.reason} - ${apiRes.error.message}` };
  }

  return {
    isFailed: false,
    data: apiRes.data,
  };
};
