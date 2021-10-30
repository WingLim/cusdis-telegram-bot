import { VercelRequest, VercelResponse } from '@vercel/node'
import { Bot, InlineKeyboard, webhookCallback, Context, Filter } from 'grammy'
import { client } from '../redis'
import axios from 'axios'

const { BOT_TOKEN, VERCEL_URL } = process.env

export const bot = new Bot(BOT_TOKEN)

// Handle /start command
bot.command('start', async (ctx) => {
    await ctx.reply('Welcome to use Cusdis Bot')
})

// Handle /gethook command
bot.command('gethook', async (ctx) => {
    let chanId = ctx.message.chat.id
    let hookUrl = `https://${VERCEL_URL}/api/hook/${chanId}`
    await ctx.reply(`Your Webhook URL:\n ${hookUrl}`)
})

// Handle /about command
bot.command('about', async (ctx) => {
    let links = new InlineKeyboard()
        .url('Github', 'https://github.com/WingLim/cusdis-telegram-bot').row()
        .url('Cusdis', 'https://cusdis.com/')
    await ctx.reply('Another telegram bot for Cusdis', {
        reply_markup: links
    })
})

// Handle Approve button callback
bot.callbackQuery('approve', async (ctx) => {
    let chatId = ctx.message.chat.id
    let key = chatId.toString() + ctx.message.message_id.toString()
    await client.connect()
    // Get approve link from redis
    let link = await client.get(key)
    if (link) {
        // Replace to api url
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

type MessageContext = Filter<Context, 'msg'>
type ReplyContext = MessageContext & {
    message: {
        reply_to_message: object
    }
}

// hasReply is a filter to find the message which is reply to message
function hasReply(ctx: MessageContext): ctx is ReplyContext {
    return ctx.message.reply_to_message !== undefined
}

// Handle reply message to comment noticification
bot.on('msg').filter(hasReply, async (ctx) => {
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
})

export default async (req: VercelRequest, res: VercelResponse) => {
    webhookCallback(bot, 'http')(req, res)
}
