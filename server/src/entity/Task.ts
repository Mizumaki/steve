import type { SingleJob } from './Job';

export type Task = {
  baseJob: SingleJob;
  parentsJobIdList: string[];
};
