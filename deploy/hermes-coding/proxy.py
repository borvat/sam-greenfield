"""Gateway has no Modal credential access; only a fixed bounded local verifier route."""
from aiohttp import ClientSession,ClientTimeout,web

async def handle(request):
    if request.path!='/sam/coding/verify':return web.json_response({'error':'scope'},status=404)
    if request.content_length is None or request.content_length>16384:return web.json_response({'error':'size'},status=413)
    body=await request.content.readexactly(request.content_length)
    async with ClientSession(timeout=ClientTimeout(total=155)) as session:
        async with session.post('http://127.0.0.1:8877/sam/coding/verify',data=body,headers={'Authorization':request.headers.get('Authorization',''),'Content-Type':'application/json'},allow_redirects=False) as response:
            raw=await response.content.read(32769)
            if len(raw)>32768:return web.json_response({'error':'size'},status=502)
            return web.Response(body=raw,status=response.status,content_type='application/json')
