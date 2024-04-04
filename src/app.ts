import env from "@lib/env";
import { Client, GatewayIntentBits } from "discord.js";
import pino from "pino";

const log = pino();

const cliente = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

cliente.on("ready", () => {
  log.info(`Bot listo como ${cliente.user?.username}`);
});

const token = env("TOKEN_BOT");
cliente.login(token);
