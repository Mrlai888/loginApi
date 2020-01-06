const express = require('express')
// 引入json服务
const jsonServer = require('json-server')
// axios请求
const Axios = require('axios')
// 密码验证
const bcryptjs = require('bcryptjs')
// 引入json路由
const routes = jsonServer.router('./db.json')
// 中间件
const middleWares = jsonServer.defaults()
//baseURL的URL大写然会报错connect ECONNREFUSED 127.0.0.1:80
Axios.defaults.baseURL = 'http://localhost:9090'

// 上线配置
// Axios.defaults.baseURL = 'http://212.64.68.222:9090'

const server = express()
// body请求配置
server.use(express.json())
server.use(express.urlencoded({ extended: true }))

// 跨域处理
server.use((req, res, next) => {
  res.set('Access-Control-Allow-Origin', '*')
  next()
})

// 延迟处理
const timer = (time = 500) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve()
    }, time)
  })
}
server.use(async (req, res, next) => {
  await timer()
  next()
})

// 自己实现接口
// http://localhost:9090/users

server.post('/sign-up', async (req, res) => {

  //利用axios拿到服务器的数据（调用json-server的user接口）
  const response = await Axios.get('/users', { params: { username: req.body.username } })
  console.log(response.data)
  if (response.data.length > 0) {
    res.send({
      code: -1,
      msg: '用户名已经被注册过了'
    })
    return
  }
  // 将数据写入数据库   password: await bcryptjs.hash(req.body.password,10)加密操作10级
  const { data } = await Axios.post('/users', {
    ...req.body,
    password: await bcryptjs.hash(req.body.password, 10),
    time: new Date().getTime()
  })
  res.send({
    code: 0,
    msg: "注册成功",
    data
  })
})
// 登录
server.post('/sign-in', async (req, res) => {
  const { username, password } = req.body
  const { data } = await Axios.get('/users', {
    params: {
      username
    }
  })
  if (data.length <= 0) {
    res.send({
      code: -1,
      msg: '用户名或密码错误'
    })
    return
  }
  const user = data[0]
  //解密对比
  const isOk = await bcryptjs.compare(password, user.password)
  if (isOk){
    res.send({
      code:0,
      msg:'登录成功',
      data:user
    })
  }else{
    res.send({
      code:-1,
      msg:'用户名密码错误'
    })
  }


})

server.use(middleWares)
server.use(routes)
server.listen(9090)

console.log('服务启动成功')

