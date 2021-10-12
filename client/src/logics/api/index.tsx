import axios, { AxiosRequestConfig } from 'axios';
// TODO: ここの Job はあくまで UI 層の entity であり、API 側と一致しているのはたまたま。なので本来であれば、API 内部で定義しておくべくものである。
import type { Job } from '../Job';

const config = {
  apiBaseUrl: 'http://localhost:8080',
};

const axiosConfig: AxiosRequestConfig = {
  baseURL: config.apiBaseUrl,
};

type ApiWrapperResponse<Data, ErrorReasons = string> =
  | {
      isFailed: false;
      data: Data;
      error?: undefined;
    }
  | {
      isFailed: true;
      data?: undefined;
      error: {
        reason: ErrorReasons;
        message: string;
      };
    };

export const fetchJobsApi = async (): Promise<ApiWrapperResponse<Job[]>> => {
  try {
    const res = await axios.get<Job[]>('/jobs', axiosConfig);
    return {
      isFailed: false,
      data: res.data,
    };
  } catch (e) {
    if (axios.isAxiosError(e)) {
      return {
        isFailed: true,
        error: {
          reason: e.config.data?.reason ?? 'unexpected',
          message: e.message,
        },
      };
    }
    return {
      isFailed: true,
      error: {
        reason: 'unexpected',
        message: 'unexpected error occured',
      },
    };
  }
};
