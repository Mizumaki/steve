const path = require('path')
const { spawnSync } = require('child_process')

const grepFlag = "if (process.env.NODE_ENV === 'test') {"

const targetBasePaths = ['src']

const filePaths = [];
targetBasePaths.forEach(p => {
  const basePath = path.resolve(__dirname, p)
  const spawn = spawnSync(`grep -ril "${grepFlag}" ${basePath}/*`, { shell: true })
  // `grep` returns a status code of 1 if there are no results
  if (spawn.status === 1) {
    return;
  }
  if (spawn.status !== 0) {
    throw new Error(spawn.error.message)
  }

  spawn.stdout.toString().split('\n').forEach(filePath => {
    if (filePath) filePaths.push(filePath)
  })
})

module.exports = {
  testRegex: filePaths
}
