const Redis = require('ioredis');
const RedLock = require('redlock').default;  

const client = new Redis({
    host: 'localhost',
    port: 6379
});


const redlock = new RedLock(
    [client],
    {
        driftFactor: 0.01,
        retryCount: 10,
        retryDelay: 200,
        retryJitter: 200,
        automaticExtensionThreshold: 500
    }
);


redlock.on('error', (error) => {
    if (error.name === 'LockError') {
        console.log('Lock already held');
    } else {
        console.error('Redlock error:', error);
    }
});

module.exports = { redlock, client };