import AccionesBase from "@lib/AccionesBase";
import {
  ActionRowBuilder,
  CommandInteraction,
  EmbedBuilder,
  GuildMember,
  ModalBuilder,
  StringSelectMenuBuilder,
  StringSelectMenuInteraction,
  StringSelectMenuOptionBuilder,
  TextInputBuilder,
  TextInputStyle,
} from "discord.js";

export default class PanelDeControl extends AccionesBase {
  private static async crearEmbedResumen(): Promise<EmbedBuilder> {
    const embed = await this.crearEmbedEstilizado();

    await this.api.obtenerTiques();
    await this.api.obtenerRolesDeAdministracion();
    await this.api.obtenerEmbeds();
    await this.api.obtenerCanalesDeRegistros();

    embed.setTitle("💻 Panel de control").setFields(
      {
        name: "🎟 Tiques",
        value: `> Canal de registros: <#${this.api.tiques.idCanalDeRegistros}>
              > Categoría: ${this.api.tiques.idCategoria}
              > Cantidad: ${this.api.tiques.cantidad}`,
      },
      {
        name: "👮 Roles de administracion",
        value: `> Administrador: <@&${this.api.rolesDeAdministracion.idAdministrador}>
              > Director: <@&${this.api.rolesDeAdministracion.idDirector}>
              > Moderador: <@&${this.api.rolesDeAdministracion.idModerador}>
              > Soporte: <@&${this.api.rolesDeAdministracion.idSoporte}>
              > Interno: <@&${this.api.rolesDeAdministracion.idInterno}>`,
      },
      {
        name: "📝 Embeds",
        value: `> Color: ${this.api.embeds.color}
              > Imagen limitadora: ${this.api.embeds.urlImaginLimitadora}`,
      },
      {
        name: "📄 Canales de registros",
        value: `> Mensajes: <#${this.api.canalesDeRegistros.idMensajes}>
              > Voz: <#${this.api.canalesDeRegistros.idVoz}>
              > Usuarios: <#${this.api.canalesDeRegistros.idUsuarios}>
              > Sanciones: <#${this.api.canalesDeRegistros.idSanciones}>
              > Servidor: <#${this.api.canalesDeRegistros.idServidor}>`,
      },
    );

    return embed;
  }

  public static async crearPanelDeControl(
    interaccion: CommandInteraction,
  ): Promise<void> {
    if (interaccion.commandName !== "panel-de-control") return;

    const autorComando = interaccion.member as GuildMember;
    if (!this.comandoAutorEsAdmin(autorComando)) return;

    const embed = await this.crearEmbedResumen();

    const controles =
      new ActionRowBuilder<StringSelectMenuBuilder>().setComponents(
        new StringSelectMenuBuilder()
          .setCustomId("panel-de-control-opciones")
          .setOptions(
            new StringSelectMenuOptionBuilder()
              .setEmoji("🎟")
              .setLabel("Editar tiques")
              .setValue("editar-tiques"),

            new StringSelectMenuOptionBuilder()
              .setEmoji("👮")
              .setLabel("Editar roles de administracion")
              .setValue("editar-roles-de-administracion"),

            new StringSelectMenuOptionBuilder()
              .setEmoji("📝")
              .setLabel("Editar embeds")
              .setValue("editar-embeds"),

            new StringSelectMenuOptionBuilder()
              .setEmoji("📄")
              .setLabel("Editar canales de registros")
              .setValue("editar-canales-de-registros"),
          ),
      );

    await interaccion.reply({ embeds: [embed], components: [controles] });
  }

  public static async modalEditarTiques(
    interaccion: StringSelectMenuInteraction,
  ): Promise<void> {
    if (interaccion.customId !== "panel-de-control-opciones") return;

    const autorInteraccion = interaccion.member as GuildMember;
    if (!this.comandoAutorEsAdmin(autorInteraccion)) return;

    if (interaccion.values[0] !== "editar-tiques") return;

    try {
      await this.api.obtenerTiques();
    } catch (error) {
      interaccion.reply({
        content: "Ocurrió un error al ejecutar este comando.",
      });

      this.log.error(error);
      return;
    }

    const campoIdCanalDeRegistros = new TextInputBuilder()
      .setCustomId("campo-id-canal-de-registros")
      .setLabel("ID del canal de registros")
      .setValue(`${this.api.tiques.idCanalDeRegistros}`)
      .setStyle(TextInputStyle.Short)
      .setMaxLength(20);

    const campoIdCategoria = new TextInputBuilder()
      .setCustomId("campo-id-categoria")
      .setLabel("ID de la categoría")
      .setValue(`${this.api.tiques.idCategoria}`)
      .setStyle(TextInputStyle.Short)
      .setMaxLength(20);

    const modal = new ModalBuilder()
      .setTitle("🎟 Editar tiques")
      .setCustomId("modal-editar-tiques")
      .setComponents(
        new ActionRowBuilder<TextInputBuilder>().setComponents(
          campoIdCanalDeRegistros,
        ),
        new ActionRowBuilder<TextInputBuilder>().setComponents(
          campoIdCategoria,
        ),
      );

    await interaccion.showModal(modal);
  }
}
