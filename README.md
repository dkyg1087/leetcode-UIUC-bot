# Leetcode BOT

## Description
This is a newer version of Leetcode bot that modifies code from https://github.com/kie4280/leetcode-bot. Deployed on firebase realtime database and google app engine.
Automate daily leetcode push questions. Each week there will be a specific topic. The question difficulty will be randomly chosen with the PMF: [0.3, 0.6, 0.1] for easy, medium and hard. The questions will be randomly chosen as well.


## Usage

This bot accepts Discord slash commands.

```/pushproblem on``` for registering this channel for push problems.

```/pushproblem off``` for unregistering this channel for push problems.

**USE YOUR OWN CREDENTIALS!!** I'm not going to provide you with free firebase, Discord bot or heroku usage. 


## Dependency
- Firebase-admin 
- Express.js
- Axios
- Discord.js
- cron-job.org



## Example screenshots
![](https://i.imgur.com/Nv0ugsB.png)
