import { Client, GatewayIntentBits } from "discord.js";
import pino from "pino";
import AccionesBase from "./lib/AccionesBase";
import PanelDeControl from "@interacciones/PanelDeControl";
import PanelDeTiques from "@interacciones/PanelDeTiques";
import PanelDeAutoroles from "@interacciones/PanelDeAutoroles";
import NuevoMiembro from "./eventos/NuevoMiembro";

const log = pino();

const cliente = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
  ],
});

cliente.on("ready", () => {
  log.info(`Bot listo como ${cliente.user?.username}`);
});

const token = AccionesBase.env("TOKEN_BOT");
cliente.login(token);

cliente.on("interactionCreate", (interaccion) => {
  PanelDeControl.manejarInteraccion(interaccion);
  PanelDeTiques.manejarInteraccion(interaccion);
  PanelDeAutoroles.manejarInteraccion(interaccion);
});

cliente.on("guildMemberAdd", (miembro) => {
  NuevoMiembro.darRolesDeIngreso(miembro);
});
