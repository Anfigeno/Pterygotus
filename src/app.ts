import { Client, GatewayIntentBits } from "discord.js";
import pino from "pino";
import AccionesBase from "./lib/AccionesBase";
import PanelDeControl from "@interacciones/PanelDeControl";

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
  if (interaccion.isCommand()) {
    await PanelDeControl.crearPanelDeControl(interaccion);
  } else if (interaccion.isStringSelectMenu()) {
    await PanelDeControl.modalEditarTiques(interaccion);
    await PanelDeControl.modalEditarRolesDeAdministracion(interaccion);
    await PanelDeControl.modalEditarEmbeds(interaccion);
  } else if (interaccion.isModalSubmit()) {
    await PanelDeControl.editarTiques(interaccion);
    await PanelDeControl.editarRolesDeAdministracion(interaccion);
    await PanelDeControl.editarEmbeds(interaccion);
  }
});
