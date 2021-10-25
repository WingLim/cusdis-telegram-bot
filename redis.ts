import { createClient } from 'redis'

const { REDIS_URL } = process.env

export const client = createClient({
    url: REDIS_URL
})