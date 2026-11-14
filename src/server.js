'use strict';
// Starts everything: database upgrade, first-run data, routes, HTTP server.
const http=require('http'),os=require('os'),path=require('path');
const {PORT,DIR}=require('./config');
function start(){
 require('./migrate')();require('./seed')();require('./routes');require('./backup').schedule();
 const {handle}=require('./router');
 http.createServer(handle).listen(PORT,'0.0.0.0',()=>{
 console.log('\nData Center is running.\n  On this laptop:  http://localhost:'+PORT);Object.values(os.networkInterfaces()).flat().filter(i=>i.family=='IPv4'&&!i.internal).forEach(i=>console.log('  From your phone: http://'+i.address+':'+PORT+'  (same Wi-Fi)'));console.log('  Database file:   '+path.join(DIR,'datacenter.db')+'\n  Stop with Ctrl+C.\n')});
}
module.exports={start};
