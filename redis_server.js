const REDIS_HOST = 'localhost',
      REDIS_PORT = 6379,
      redis = require("redis"),
      session = require('express-session'),
      redisStore = require('connect-redis')(session);

export let redis_store = new redisStore({ // store sessions with redis
    host: REDIS_HOST,
    port: REDIS_PORT,
    client: client,
    ttl: 100000})