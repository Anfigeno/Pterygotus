import env from "@lib/env";
import { REST, Routes } from "discord.js";
import pino from "pino";
import comandos from "./comandos";

const log = pino();

const tokenBot = env("TOKEN_BOT");
const clientId = env("CLIENT_ID");
const guildId = env("GUILD_ID");

const rest = new REST({ version: "10" }).setToken(tokenBot);

try {
  log.info("Registrando los comandos (/)...");

  await rest.put(Routes.applicationGuildCommands(clientId, guildId), {
    body: comandos,
  });

  log.info("Comandos (/) registrados");
} catch (error) {
  log.error(error);
}
