const RedisServer = require("redis-server");
const confPath = process.env.CONF_PATH;

if (!confPath) {
  throw new Error(
    `PORT or CONF_PATH doesn't provided. PORT: ${port}, CONF_PATH: ${confPath}`
  );
}

const server = new RedisServer({
  conf: confPath,
});

server
  .open()
  .then(() => {
    console.log(`Redis Server Started! See ${confPath} about the configuration.`);
  })
  .catch((err) => {
    console.error(err);
  });
