const net=require("node:net");
async function port(){
  const server=net.createServer();
  await new Promise((resolve,reject)=>{server.once("error",reject);server.listen(0,"127.0.0.1",resolve);});
  const value=server.address().port;
  await new Promise((resolve,reject)=>server.close(err=>err?reject(err):resolve()));
  return value;
}
async function servicePorts(){
  const used=new Set(),values=[];
  while(values.length<3){const next=await port();if(!used.has(next)){used.add(next);values.push(next);}}
  return {workerPort:values[0],commandPort:values[1],mcpPort:values[2]};
}
module.exports={servicePorts};
