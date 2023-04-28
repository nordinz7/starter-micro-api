require('dotenv').config()
const app = require('express')()
const { Telegraf } = require('telegraf')
const { getPrayerTimes } = require('./utils')

const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN || '');


bot.start((ctx) => ctx.reply('Assalamualaikum, Welcome to Prayer Time Bot'));

bot.help((ctx) => ctx.reply('Send me a sticker'));

bot.hears('hi', (ctx) => ctx.reply('Hey there'));

bot.command('hariini', async (ctx) => {
  const waktu = await getPrayerTimes("today", "JHR03")
  let str = ''
  waktu.prayerTime.map((time) => {
    Object.entries(time).forEach(([key, value]) => {
      str = str.concat(`${key}: ${value}\n`)
    })
  })
  ctx.reply(str)
});

bot.launch();

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));

app.get('/prayerTime', async (req, res) => {
  const { period, zone } = req.query
  const prayerTime = await getPrayerTimes(period, zone)
  res.json(prayerTime)
})

app.listen(process.env.PORT || 3000, () => {
  console.log('--------server is ruuning on port', 3000)
})