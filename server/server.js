/*
  Funky Scoreboard
  (C)2023-now kawashiro-ryofu@南昌市实验中学信息部
  License: MPL-2.0
*/
const express = require('express');
const jwt = require('jsonwebtoken');
const qrcode = require('qrcode');
const app = express();
const { networkInterfaces } = require('os');
const log4js = require('log4js');
const version = 'v' + require(__dirname + '/../package.json').version



//  日志
log4js.configure({
  appenders: {
    console: { type: 'console' }
  },
  categories: {
    default: { appenders: ['console'], level: 'debug' }
  }
});

const log = log4js.getLogger();
//  单用户
let loggedIn = false
//  看板默认数据
let gamedata = {
  status: 0, // 赛事状态 - -1: 需要配置，等待控制台登录； 0: 等待开始； 1: 正在进行； 2: 已结束.
  startTime: 0, // 比赛开始时的UNIX时间戳 **此处需要修改，上一版本中Py3的Unix时间戳与JS时间单位不同！**
  section: 1, //  比赛场次，大于0整数,
  team: {
    A: {
      name: "诸葛孔明", // 队伍A的名字
      score: 0  // 队伍A得分
    },
    B: {
      name: "王司徒", // 队伍B的名字
      score: 0  // 队伍B得分
    }
  },
  message: `Funky Scoreboard ${version}` // 计分板页脚小标题
}

// 设置密钥，通常应该从环境变量中获取
function genkey() {
  const length = 8;
  const characters = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  let randomString = "";

  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    randomString += characters[randomIndex];
  }

  return randomString;
}
// 获取本机局域网IP
function getLocalIP() {
  const interfaces = networkInterfaces();
  
  for (const interfaceName in interfaces) {
    const interface = interfaces[interfaceName];
    for (let i = 0; i < interface.length; i++) {
      const { address, family, internal } = interface[i];
      // 过滤 IPv4 和非内部（非Loopback）地址
      if (family === 'IPv4' && !internal) {
        return address;
      }
    }
  }
  return null; // 如果没有找到合适的 IP 地址，则返回null或抛出异常
}

//  控制器验证码
const secretKey = genkey();
//const secretKey = '11451419'
//  控制器页面的路径
const accessRoute = '/' + genkey()
//const accessRoute = '/11451419'

//  静态资源
app.use('/static', express.static(__dirname + '/../static' ))

//  控制器页面(admin)
app.get(accessRoute, (req, res) => {
  res.sendFile(__dirname + '/' + 'admin.html')
})

// 用户身份验证路由
app.post('/api/login', (req, res) => {
  // 这里可以进行用户名和密码的验证
  const userInfo = req.query
  if((userInfo.verifycode !== secretKey) || loggedIn){
    let msg = (loggedIn)?"验证码过期": "鉴权失败"
    log.warn(`${ req.ip } ${ msg }`)
    return res.status(401).json({ message: msg });
  }

  // 假设验证通过，生成 JWT
  const token = jwt.sign({ userId: 'admin' }, secretKey);
  loggedIn = true
  log.info(`${ req.ip } 登录成功`)
  // 将 JWT 发送给客户端
  res.json({message: '欢迎', timestamp: new Date().getTime(), token})
});

//  本来想弄注销的
//  但是转念一想，把主程序重开一遍不就可以了？
//  这也就是为什么JWT没有expire选项

app.get('/api/gamestat', (req,res) => {
  res.json(gamedata)
})

app.get('/api/protected', (req, res) => {

    try{
      // 获取客户端发送的 JWT
      const authHeader = req.headers.authorization;

      if (typeof authHeader !== 'undefined') {
        // 检查 Authorization 头部是否存在
      
        const authHeaderParts = authHeader.split(' ');
        if (authHeaderParts.length === 2 && authHeaderParts[0] === 'Bearer') {
          // 检查 Authorization 头部是否以 'Bearer' 开头
          const token = authHeaderParts[1];

          // 验证 JWT
          jwt.verify(token, secretKey, (err, decoded) => {
            if (err) {
              // JWT 验证失败
              res.status(403).json({ message: '拒绝访问' });
              //console.log(err)
              log.warn(`${ req.ip } JWT无效`)
              log.debug(err.name + ' ' + err.message)
              
            } else {
              // JWT 验证成功
              res.json({ message: '认证通过', user: decoded });
              log.info(`${ req.ip } 认证通过`)
            }
          });

        } else {
          // Authorization 头部格式错误，返回错误响应
          res.status(401).json({ message: '不支持的请求' });
          log.warn(`${ req.ip } 发送了不支持的请求`)
        }
      } else {
        // Authorization 头部不存在，返回错误响应
        res.status(401).json({ message: '不支持的请求' });
        log.warn(`${ req.ip } 发送了不支持的请求`)
      }
    }catch(err){
      log.error(`${err.name}: ${err.message}`)
      log.debug(`${err.stack}`)
    }
});

app.get('/', (req, res) => {
  res.json({ message: 'Hello World' });
});

//  404
app.use('*', (req, res) => {
  log.warn(`${req.ip} 访问了不存在的页面 ${req.url}`)
  res.status(404).json({ message: '页面不存在' })
})

// 启动服务器
app.listen(10721, () => {
  log.info(`Funky Scoreboard ${ version }`)
  log.info(`监听端口10721`)

  try{
    log.info(`登录路径：http://${getLocalIP()}:10721${accessRoute}`)
    log.info('验证码：' + secretKey)
  }
  catch(err){
    log.error(`${err.name}: ${err.message}`)
    log.debug(`${err.stack}`)
  }


});