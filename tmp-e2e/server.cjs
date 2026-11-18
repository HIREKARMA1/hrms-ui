const http = require('http')
const user = { id:'u1', email:'server@hrms.test', role:'HR_ADMIN', roles:[], permissions:[], isActive:true }
let cfg, log, st
function reset(){ cfg = { me:'normal', refresh:'normal', meDelay:300 }; log = []; st = { access:'GOOD', refresh:'RGOOD', gen:0 } }
reset()
const send = (res, code, body) => { res.writeHead(code, { 'content-type':'application/json', 'access-control-allow-origin':'*', 'access-control-allow-headers':'*', 'access-control-allow-methods':'*' }); res.end(JSON.stringify(body)) }
http.createServer((req, res) => {
  if (req.method === 'OPTIONS') return send(res, 204, {})
  let raw = ''; req.on('data', d => raw += d); req.on('end', async () => {
    const path = req.url.split('?')[0].replace('/api/v1','')
    const auth = req.headers.authorization
    let body = {}; try { body = JSON.parse(raw) } catch {}
    if (path === '/__cfg') { if (body.reset) reset(); Object.assign(cfg, body.cfg||{}); if (body.st) Object.assign(st, body.st); return send(res, 200, { cfg, st }) }
    if (path === '/__log') return send(res, 200, log)
    log.push(path + (auth ? ' [' + auth.slice(7) + ']' : ' [none]'))
    if (path === '/auth/me') {
      await new Promise(r => setTimeout(r, cfg.meDelay))
      if (cfg.me === 'e500') return send(res, 500, { message:'db down' })
      if (cfg.me === 'e403') return send(res, 403, { message:'Forbidden resource' })
      if (cfg.me === 'always401') return send(res, 401, { message:'Unauthorized' })
      if (auth === 'Bearer ' + st.access) return send(res, 200, { success:true, message:'ok', data:{ user } })
      return send(res, 401, { message:'Unauthorized' })
    }
    if (path === '/auth/refresh') {
      if (cfg.refresh === 'fail' || body.refreshToken !== st.refresh) return send(res, 401, { message:'Invalid refresh token' })
      st.gen++; st.access = 'GOOD' + st.gen; st.refresh = 'RGOOD' + st.gen
      return send(res, 200, { success:true, message:'ok', data:{ accessToken:st.access, refreshToken:st.refresh, tokenType:'Bearer', expiresIn:'15m', user } })
    }
    if (path === '/auth/login') { st.access='LOGIN1'; st.refresh='RLOGIN1'; return send(res, 200, { success:true, message:'ok', data:{ accessToken:'LOGIN1', refreshToken:'RLOGIN1', tokenType:'Bearer', expiresIn:'15m', user } }) }
    if (path === '/auth/logout') return send(res, 200, { success:true, message:'Logged out successfully', data:null })
    send(res, 404, {})
  })
}).listen(4010, () => console.log('mock up'))
