import { VercelRequest, VercelResponse } from '@vercel/node'
import { InlineKeyboard } from 'grammy'
import { client } from '../../redis'
import { bot } from '../../index'

enum HookType {
    NewComment = 'new_comment'
}

type HookBody<T> = {
    type: HookType
    data: T
}

type NewCommentHookData = {
    by_nickname: string;
    by_email: string;
    content: string;
    page_id: string;
    page_title: string;
    project_title: string
    approve_link: string;
}

function buildNewCommentMsg(data: NewCommentHookData) {
    return `New comment on website <strong>${
        data.project_title
    }</strong> in page <strong>${data.page_title}</strong>:
<pre>
${data.content.replace(/<[^>]*>?/gm, "")}
</pre>
by: <strong>${data.by_nickname}</strong>`
}

export default async (req: VercelRequest, res: VercelResponse) => {
    if (req.method === 'POST') {
        const chatId = req.query['chatId'] as string
        const { type, data } = req.body as HookBody<NewCommentHookData>

        switch (type) {
            case 'new_comment': {
                const msg = buildNewCommentMsg(data)
                
                const approveKeyboard = new InlineKeyboard().text('Approve', 'approve')

                let new_msg = await bot.api.sendMessage(chatId, msg, {
                    parse_mode: 'HTML',
                    reply_markup: approveKeyboard
                })

                let key = chatId + new_msg.message_id.toString()
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
