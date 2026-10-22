// FIXTURE backend for generic supervisor/proxy tests, never a SAM workflow.
const http=require("node:http");
const port=Number(process.argv[2]);
const server=http.createServer((req,res)=>{
  if(req.url==="/livez"||req.url==="/readyz"){
    res.writeHead(200,{"content-type":"application/json"});res.end('{"status":"ready"}');return;
  }
  if(req.headers.authorization!=="Bearer "+process.env.FIXTURE_BEARER){res.writeHead(401);res.end();return;}
  res.writeHead(200,{"content-type":"application/json"});
  res.end(JSON.stringify({fixture:true,path:req.url,method:req.method}));
});
server.listen(port,"127.0.0.1",()=>console.log("fixture-sensitive-output-must-be-withheld"));
process.on("SIGTERM",()=>server.close(()=>process.exit(0)));
