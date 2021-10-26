import { exec, ExecException } from 'child_process';

export class CommandError extends Error {
  readonly command: string;
  readonly rawError: ExecException;

  constructor(message: string, command: string, rawError: ExecException) {
    super(message);
    this.name = this.constructor.name;
    this.command = command;
    this.rawError = rawError;
  }
}

export const runCommand = (
  command: string
): Promise<{ error: CommandError | undefined; stdout: string; stderr: string }> => {
  return new Promise(resolve => {
    exec(command, (err, stdout, stderr) => {
      const error = err ? new CommandError(`Run "${command}" failed`, command, err) : undefined;
      resolve({
        error,
        stdout,
        stderr,
      });
    });
  });
};
