import { exec as execBase } from 'child_process';
import { promisify } from 'util';

const exec = promisify(execBase);

export const runCommand = (command: string) => {
  return exec(command);
};
