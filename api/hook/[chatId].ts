import { VercelRequest, VercelResponse } from '@vercel/node'
import { Telegraf } from 'telegraf'
import { client } from '../../redis'

const { BOT_TOKEN } = process.env

const bot = new Telegraf(BOT_TOKEN)

enum HookType {
    NewComment = 'new_comment'
}

type NewCommentBody = {
    type: HookType.NewComment;
    data: {
        by_nickname: string;
        by_email: string;
        content: string;
        page_id: string;
        page_title: string;
        project_title: string
        approve_link: string;
    }
}

export default async (req: VercelRequest, res: VercelResponse) => {
    if (req.method === 'POST') {
        const { chatId } = req.query
        const { type, data } = req.body as NewCommentBody

        switch (type) {
            case 'new_comment': {
                const msg = `New comment on website <strong>${
                    data.project_title
                }</strong> in page <strong>${data.page_title}</strong>:
<pre>
${data.content.replace(/<[^>]*>?/gm, "")}
</pre>
by: <strong>${data.by_nickname}</strong>`
                
                let new_msg = await bot.telegram.sendMessage(chatId as string, msg, {
                    parse_mode: 'HTML',
                    reply_markup: {
                        inline_keyboard: [
                            [
                                {
                                    text: "Approve",
                                    //url: data.approve_link
                                    callback_data: "approve"
                                }
                            ]
                        ]
                    }
                })

                let key = (chatId as string) + new_msg.message_id.toString()
                await client.connect()
                await client.set(key, data.approve_link, {
                    EX: 259200
                })
                break
            }
        }

        res.json({
            msg: "works"
        })
    }
}
