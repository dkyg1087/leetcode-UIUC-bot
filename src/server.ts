import express from "express";
import { verifySig, registerCommands,deleteAllCommands,sendMsg } from "./discord.js";
//import bodyParser from "body-parser";
import { dailyPush, getProblems } from "./leetcode.js";
import dotenv from "dotenv";
import { addChannel, deleteChannel,testService} from "./database.js";
import {
  APIApplicationCommandInteraction,
  APIInteraction,
  APIInteractionResponse,
  APIInteractionResponseChannelMessageWithSource,
  APIInteractionResponsePong,
  APIPingInteraction,
  InteractionResponseType,
  InteractionType,
} from "discord-api-types/v10";

import { doRepoCheck,refreshJobRef } from "./checkRepo.js"

//var bodyParser = require('body-parser')

dotenv.config();
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const port = process.env.PORT == undefined ? 8080 : process.env.PORT;

function applicationComm(interaction: APIApplicationCommandInteraction) {
  let f: APIInteractionResponseChannelMessageWithSource = {
    type: InteractionResponseType.ChannelMessageWithSource,
    data: {},
  };
  switch (interaction.data.name) {
    case "pushproblem":
      const sub: string = (interaction.data as any).options[0].name;
      const chanID = interaction.channel_id;
      // console.log("option", option)

      if (sub == "off") {
        deleteChannel(chanID);
        f.data.content = "Roger that! It's off.";
      } else if (sub == "on") {
        addChannel(chanID);
        f.data.content = "It's on baby!";
      }
      break;

    default:
      break;
  }

  return f;
}

// main entry point for the webhook
app.post("/", (req, res) => {
  console.log("endpoint called");
  console.log(req.body);
  if (!verifySig(req)) {
    res.status(401).end("invalid request signature");
    return;
  }

  let interaction_obj: APIInteraction = req.body;
  if (interaction_obj.type == InteractionType.Ping) {
    const p = interaction_obj as APIPingInteraction;
    const f: APIInteractionResponsePong = {
      type: InteractionResponseType.Pong,
    };
    res.status(200).json(f);
    return;
  } else if (interaction_obj.type == InteractionType.ApplicationCommand) {
    const f = applicationComm(interaction_obj);
    res.status(200).json(f);
  }
  console.log("webhook")
});

// For testing purposes
app.get("/", async (req, res) => {
  res.status(200).end("hi there testing");
  console.log("test");
  //await testService();
  await doRepoCheck(true);
  //await dailyPush();
});

app.get("/test", async (req, res) => {
  res.status(200).end("hi there");
  console.log("test");
  await sendMsg("1114429836082024458","今天沒有新的更新",undefined)
});

app.post("/dailypush", (req, res) => {
  dailyPush().then(
    (val) => {
      res.sendStatus(200);
    },
    (err) => {
      console.error(err);
      res.status(500).send({ error: String(err) });
    }
  );
  console.log("daily push")
});

app.post("/repocheck",(req,res)=>{
  doRepoCheck(true).then(
    ()=>{
      res.sendStatus(200);
    },
    (err)=>{
      console.error(err);
      res.status(500).send({ error: String(err) });
    }
  )
});

const server = app.listen(port, () => {
  // console.log('delete');
  // deleteAllCommands();
  // console.log('register');
  // registerCommands();
  console.log(`listening on ${port}`);
});

const onExit = () => {
  server.close((err) => {
    if (err) {
      console.log(err);
    }
  });
  process.exit(0);
};

process.on("SIGTERM", onExit);
