import { Client, GatewayIntentBits } from "discord.js";
import pino from "pino";
import AccionesBase from "./lib/AccionesBase";
import PanelDeControl from "@interacciones/PanelDeControl";
import PanelDeTiques from "@interacciones/PanelDeTiques";

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

const token = AccionesBase.env("TOKEN_BOT");
cliente.login(token);

cliente.on("interactionCreate", async (interaccion) => {
  PanelDeControl.manejarInteraccion(interaccion);
  PanelDeTiques.manejarInteraccion(interaccion);
});

cliente.on("messageCreate", async (mensaje) => {
  const idRespuestaMensaje = mensaje.reference?.messageId;

  if (!idRespuestaMensaje) return;

  const respuestaMensaje = await mensaje.channel.messages.fetch(idRespuestaMensaje);

  console.log(respuestaMensaje.id);

});
