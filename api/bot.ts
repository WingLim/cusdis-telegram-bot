import { VercelRequest, VercelResponse } from '@vercel/node'
import { webhookCallback } from 'grammy'
import { client } from '../redis'
import { bot } from '../index'
import axios from 'axios'

const { VERCEL_URL } = process.env

bot.command('start', async (ctx) => {
    await ctx.reply('Welcome to use Cusdis Bot')
})

bot.command('gethook', async (ctx) => {
    let chanId = ctx.message.chat.id
    let hookUrl = `https://${VERCEL_URL}/api/hook/${chanId}`
    await ctx.reply(`Your Webhook URL:\n ${hookUrl}`)
})

bot.callbackQuery('approve', async (ctx) => {
    let chatId = ctx.message.chat.id
    let key = chatId.toString() + ctx.message.message_id.toString()
    await client.connect()
    let link = await client.get(key)
    if (link) {
        let api = link.replace('open', 'api/open')
        let res = await axios.post(api)
        if (res.status == 200) {
            await ctx.answerCallbackQuery({
                text: 'Successed'
            })
        } else {
            await ctx.answerCallbackQuery({
                text: 'Failed'
            })
        }
    } else {
        await ctx.reply('Token has expired')
    }
})

bot.on('msg', async (ctx) => {
    if (ctx.message.reply_to_message) {
        let reply_msg = ctx.message.reply_to_message
        let key = ctx.chat.id.toString() + reply_msg.message_id.toString()
        let replyContent = ctx.message.text

        await client.connect()
        let link = await client.get(key)
        if (link) {
            let api = link.replace("open", "api/open")
            let res = await axios.post(api, {
                replyContent
            })
            if (res.status == 200) {
                ctx.reply("Success to append comment")
            } else {
                ctx.reply("Fail to append comment")
            }
        } else {
            ctx.reply("Token has expired")
        }
    }
})

export default async (req: VercelRequest, res: VercelResponse) => {
    webhookCallback(bot, 'http')(req, res)
}
