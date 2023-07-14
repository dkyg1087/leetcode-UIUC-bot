import { Request } from "express";
import nacl from "tweetnacl";
import { PUSH_COMMAND} from "./commands.js";
import { REST } from "@discordjs/rest";
import {
  SlashCommandBuilder,
  SlashCommandSubcommandBuilder,
  channelMention,
  EmbedBuilder,
} from "@discordjs/builders";
import { Routes } from "discord-api-types/v10";
import dotenv from "dotenv";

const PUBLIC_KEY =
  "729fb688d3ffee48e1a0e789f9fc31f5813d5e25546748398db57d8857ec8262";
const APPLICATION_ID = "1111779382814593096";

function verifySig(req: Request): boolean {
  // Your public key can be found on your application in the Developer Portal

  const signature = req.get("X-Signature-Ed25519");
  const timestamp = req.get("X-Signature-Timestamp");
  const body = JSON.stringify(req.body);

  if (signature == undefined || timestamp == undefined) return false;
  const isVerified = nacl.sign.detached.verify(
    Buffer.from(timestamp + body),
    Buffer.from(signature, "hex"),
    Buffer.from(PUBLIC_KEY, "hex")
  );

  return isVerified;
}
dotenv.config();
const rest = new REST({ version: "10" }).setToken(
  process.env.BOT_TOKEN as string
);

async function registerCommands(): Promise<void> {
  const sub_on = new SlashCommandSubcommandBuilder()
    .setName("on")
    .setDescription("Turn on");
  const sub_off = new SlashCommandSubcommandBuilder()
    .setName("off")
    .setDescription("Turn off");
  const c = new SlashCommandBuilder()
    .setName(PUSH_COMMAND)
    .setDescription("Push daily leetcode")
    .addSubcommand(sub_off)
    .addSubcommand(sub_on);
  
  await new Promise(resolve => setTimeout(resolve, 1000));
  await rest.post(Routes.applicationCommands(APPLICATION_ID),{body:c});
}

async function deleteAllCommands(): Promise<number> {
  const r = (await rest.get(
    Routes.applicationCommands(APPLICATION_ID)
  )) as Array<any>;

  r.forEach(async (element) => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    await rest.delete(Routes.applicationCommand(APPLICATION_ID, element.id));
  });
  console.log(r);
  return r.length;
}

async function sendMsg(chanID: string, msg: string, embed?: EmbedBuilder) {
  const m = await rest.post(Routes.channelMessages(chanID), {
    body: { content: msg, embeds: embed ? [embed.toJSON()] : undefined },
  });
  return m;
}

export { verifySig, registerCommands, sendMsg,deleteAllCommands};
