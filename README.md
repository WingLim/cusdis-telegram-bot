# cusdis-telegram-bot

![GitHub deployments](https://img.shields.io/github/deployments/WingLim/cusdis-telegram-bot/production?label=vercel&logo=vercel&logoColor=white)

Another telegram bot for [Cusdis](https://github.com/djyde/cusdis)

Inspied by offical Cusdis bot [cusdis-telegram-bot](https://github.com/djyde/cusdis-telegram-bot)

## Features

> These features are based on saving approve link with token to a redis server.
> 
> We will automatically delete the approve link which is saved in redis to protect your privacy.

1. Approve comment in bot
2. Append comment in bot

![Features example](features.jpg)

## Usage

1. Open and start bot [@CusdisxBot](https://t.me/cusdisxbot)
2. Send `/gethook` command
3. Copy and paste the URL in Cusdis project's webhook settings


## Thanks to

- [Cusdis](https://github.com/djyde/cusdis) - A lightweight, privacy-friendly comment system
- [grammY](https://github.com/grammyjs/grammY) - The best telegram bot framework in typescript I have used