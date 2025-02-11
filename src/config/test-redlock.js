const { redlock } = require('./redlock');

async function testLock() {
    try {
       
        const lock = await redlock.acquire(['testResource'], 5000);
        console.log('Lock acquired');
        
       
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        
        await lock.release();
        console.log('Lock released');
    } catch (err) {
        console.error('Error:', err);
    }
}

testLock();