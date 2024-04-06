import AccionesBase from "@lib/AccionesBase";
import {
  ActionRowBuilder,
  CommandInteraction,
  GuildMember,
  Interaction,
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder,
} from "discord.js";

export default class PanelDeTiques extends AccionesBase {
  public static async manejarInteraccion(
    interaccion: Interaction,
  ): Promise<void> {
    if (interaccion.isCommand()) {
      await this.crearPanelDeTiques(interaccion);
    }
  }

  private static async crearPanelDeTiques(
    interaccion: CommandInteraction,
  ): Promise<void> {
    if (interaccion.commandName !== "panel-de-tiques") return;

    const autorInteraccion = interaccion.member as GuildMember;
    if (!this.esAdmin(autorInteraccion)) return;

    const embed = await this.crearEmbedEstilizado();

    embed
      .setTitle("🎟 Panel de tiques")
      .setDescription(
        "Los tiques son canales privados que puedes crear para charlar con los miembros del personal. Un tique solo debe ser creado si es sumamente necesario, por lo que no se tolerará crear tiques por cosas insignificantes, y se les aplicará una sanción a quienes hagan mal uso de los tiques,",
      );

    const opcionTiqueServicio = new StringSelectMenuOptionBuilder()
      .setEmoji("🪙")
      .setLabel("Servicio")
      .setDescription("Contrata un servicio")
      .setValue("opcion-tique-servicio");

    const opcionTiqueReporte = new StringSelectMenuOptionBuilder()
      .setEmoji("📣")
      .setLabel("Reporte")
      .setDescription("Reporta un usuario o un problema")
      .setValue("opcion-tique-reporte");

    const opcionTiquePostulacion = new StringSelectMenuOptionBuilder()
      .setEmoji("🤚")
      .setLabel("Postulación")
      .setDescription("Postula a un cargo del servidor")
      .setValue("opcion-tique-postulacion");

    const ocionTiqueCliente = new StringSelectMenuOptionBuilder()
      .setEmoji("👤")
      .setLabel("Cliente")
      .setDescription("Si haz contratado un servicio")
      .setValue("opcion-tique-cliente");

    const opciones =
      new ActionRowBuilder<StringSelectMenuBuilder>().setComponents(
        new StringSelectMenuBuilder()
          .setCustomId("panel-de-tiques-opciones")
          .setOptions(
            opcionTiqueServicio,
            opcionTiqueReporte,
            opcionTiquePostulacion,
            ocionTiqueCliente,
          ),
      );

    await interaccion.reply({ embeds: [embed], components: [opciones] });
  }
}
