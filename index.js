const express = require('express')
const request = require('request')
const app = express()
const port = process.env.PORT || 8081
const compress = require('compression')
const flash = require('connect-flash')
const uuid = require('node-uuid')

const routes = require('./app/routes/index')

const oneWeek = 604800000;

if (process.env.REDIS_URL) {
  const redis = require('redis').createClient(process.env.REDIS_URL)
} else {
  const redis = require('redis').createClient()
}

const morgan = require('morgan')
const bodyParser = require('body-parser')
const session = require('express-session')
const RedisStore = require('connect-redis')(session)

const hbs = require('express-handlebars')

app.use(compress())

app.use(bodyParser.urlencoded({extended: true}))
app.use(bodyParser.json())

app.engine('.hbs', hbs({
  extname: '.hbs',
  defaultLayout: 'default',
  compilerOptions: undefined,
  partialsDir: [
    './views/partials/'
  ],
  helpers: {
    ifvalue: (conditional, options) => {
      if (conditional === options.hash.equals) {
        return options.fn(this)
      } else {
        return options.inverse(this)
      }
    }
  }
}))

app.set('views', __dirname + '/views')
app.set('view engine', '.hbs')

app.use(session({
  genid: (req) => {
    return uuid.v4()
  },
  secret: 'peanutbutterjellytime',
  name: 'express-hbs.sid',
  resave: false,
  saveUninitialized: true,
  cookie: {
    expires: new Date(Date.now() + (7 * 24 * 60 * 60 * 1000)),
    maxAge: null,
    secure: false
  }
}))

app.use(flash())

app.use((req, res, next) => {
  res.locals.session = req.session
  next()
})

app.use(morgan('dev'))

app.use('/src', express.static(__dirname + '/src', { maxAge: oneWeek }))
app.use('/dist', express.static(__dirname + '/dist', { maxAge: oneWeek }))

app.use('/', routes)

const server = app.listen(port, () => {
  console.log(`app started on port ${port}`)
})

module.exports = server
