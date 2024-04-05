import AccionesBase from "@lib/AccionesBase";
import {
  CanalesDeRegistros,
  Embeds,
  RolesDeAdministracion,
  Tiques,
} from "@lib/Caverna";
import {
  ActionRowBuilder,
  CommandInteraction,
  EmbedBuilder,
  GuildMember,
  Interaction,
  ModalBuilder,
  ModalSubmitInteraction,
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
        value: `> Mensajes: <#${this.api.canalesDeRegistros.idCanalMensajes}>
              > Voz: <#${this.api.canalesDeRegistros.idCanalVoz}>
              > Usuarios: <#${this.api.canalesDeRegistros.idCanalUsuarios}>
              > Sanciones: <#${this.api.canalesDeRegistros.idCanalSanciones}>
              > Servidor: <#${this.api.canalesDeRegistros.idCanalServidor}>`,
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

  public static async manejarInteraccion(
    interaccion: Interaction,
  ): Promise<void> {
    if (interaccion.isCommand()) {
      await this.crearPanelDeControl(interaccion);
    } else if (interaccion.isStringSelectMenu()) {
      await this.modalEditarTiques(interaccion);
      await this.modalEditarRolesDeAdministracion(interaccion);
      await this.modalEditarEmbeds(interaccion);
      await this.modalEditarCanalesDeRegistros(interaccion);
    } else if (interaccion.isModalSubmit()) {
      await this.editarTiques(interaccion);
      await this.editarRolesDeAdministracion(interaccion);
      await this.editarEmbeds(interaccion);
      await this.editarCanalesDeRegistros(interaccion);
    }
  }

  private static async modalEditarTiques(
    interaccion: StringSelectMenuInteraction,
  ): Promise<void> {
    if (interaccion.customId !== "panel-de-control-opciones") return;
    if (interaccion.values[0] !== "editar-tiques") return;

    const autorInteraccion = interaccion.member as GuildMember;
    if (!this.comandoAutorEsAdmin(autorInteraccion)) return;

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

  private static async editarTiques(
    interaccion: ModalSubmitInteraction,
  ): Promise<void> {
    if (interaccion.customId !== "modal-editar-tiques") return;

    const nuevosDatos: Tiques = {
      idCanalDeRegistros: interaccion.fields.getTextInputValue(
        "campo-id-canal-de-registros",
      ),
      idCategoria: interaccion.fields.getTextInputValue("campo-id-categoria"),
      cantidad: null,
    };

    try {
      await this.api.actualizarTiques(nuevosDatos);
    } catch (error) {
      interaccion.reply({
        content: "Ocurrió un error al intentar editar los tiques.",
        ephemeral: true,
      });
      this.log.error("Ocurrio un error al intentar editar los tiques.");
      this.log.error(error);
      return;
    }

    await interaccion.message.edit({
      embeds: [await this.crearEmbedResumen()],
    });

    interaccion.reply({
      content: "Los tiques han sido actualizados",
      ephemeral: true,
    });
  }

  private static async modalEditarRolesDeAdministracion(
    interaccion: StringSelectMenuInteraction,
  ): Promise<void> {
    if (interaccion.customId !== "panel-de-control-opciones") return;
    if (interaccion.values[0] !== "editar-roles-de-administracion") return;

    const autorInteraccion = interaccion.member as GuildMember;
    if (!this.comandoAutorEsAdmin(autorInteraccion)) return;

    await this.api.obtenerRolesDeAdministracion();

    const campoIdAdministrador = new TextInputBuilder()
      .setCustomId("campo-id-administrador")
      .setLabel("ID del rol administrador")
      .setValue(`${this.api.rolesDeAdministracion.idAdministrador}`)
      .setStyle(TextInputStyle.Short)
      .setMaxLength(20);

    const campoIdDirector = new TextInputBuilder()
      .setCustomId("campo-id-director")
      .setLabel("ID del rol director")
      .setValue(`${this.api.rolesDeAdministracion.idDirector}`)
      .setStyle(TextInputStyle.Short)
      .setMaxLength(20);

    const campoIdModerador = new TextInputBuilder()
      .setCustomId("campo-id-moderador")
      .setLabel("ID del rol moderador")
      .setValue(`${this.api.rolesDeAdministracion.idModerador}`)
      .setStyle(TextInputStyle.Short)
      .setMaxLength(20);

    const campoIdSoporte = new TextInputBuilder()
      .setCustomId("campo-id-soporte")
      .setLabel("ID del rol soporte")
      .setValue(`${this.api.rolesDeAdministracion.idSoporte}`)
      .setStyle(TextInputStyle.Short)
      .setMaxLength(20);

    const campoIdInterno = new TextInputBuilder()
      .setCustomId("campo-id-interno")
      .setLabel("ID del rol interno")
      .setValue(`${this.api.rolesDeAdministracion.idInterno}`)
      .setStyle(TextInputStyle.Short)
      .setMaxLength(20);

    const modal = new ModalBuilder()
      .setTitle("🎟 Editar roles de administración")
      .setCustomId("modal-editar-roles-de-administracion")
      .setComponents(
        new ActionRowBuilder<TextInputBuilder>().setComponents(
          campoIdAdministrador,
        ),
        new ActionRowBuilder<TextInputBuilder>().setComponents(campoIdDirector),
        new ActionRowBuilder<TextInputBuilder>().setComponents(
          campoIdModerador,
        ),
        new ActionRowBuilder<TextInputBuilder>().setComponents(campoIdSoporte),
        new ActionRowBuilder<TextInputBuilder>().setComponents(campoIdInterno),
      );

    await interaccion.showModal(modal);
  }

  private static async editarRolesDeAdministracion(
    interaccion: ModalSubmitInteraction,
  ): Promise<void> {
    if (interaccion.customId !== "modal-editar-roles-de-administracion") return;

    const nuevosDatos: RolesDeAdministracion = {
      idAdministrador: interaccion.fields.getTextInputValue(
        "campo-id-administrador",
      ),
      idDirector: interaccion.fields.getTextInputValue("campo-id-director"),
      idModerador: interaccion.fields.getTextInputValue("campo-id-moderador"),
      idSoporte: interaccion.fields.getTextInputValue("campo-id-soporte"),
      idInterno: interaccion.fields.getTextInputValue("campo-id-interno"),
    };

    try {
      await this.api.actualizarRolesDeAdministracion(nuevosDatos);
    } catch (error) {
      interaccion.reply({
        content:
          "Ocurrio un error al intentar editar los roles de administración.",
        ephemeral: true,
      });

      this.log.error(
        "Ocurrio un error al intentar editar los roles de administración.",
      );
      this.log.error(error);

      return;
    }

    await interaccion.message.edit({
      embeds: [await this.crearEmbedResumen()],
    });

    interaccion.reply({
      content: "Los roles de administración han sido actualizados",
      ephemeral: true,
    });
  }

  private static async modalEditarEmbeds(
    interaccion: StringSelectMenuInteraction,
  ): Promise<void> {
    if (interaccion.customId !== "panel-de-control-opciones") return;
    if (interaccion.values[0] !== "editar-embeds") return;

    const autorInteraccion = interaccion.member as GuildMember;
    if (!this.comandoAutorEsAdmin(autorInteraccion)) return;

    await this.api.obtenerEmbeds();

    const campoColor = new TextInputBuilder()
      .setCustomId("campo-color")
      .setLabel("Color")
      .setValue(`${this.api.embeds.color}`)
      .setStyle(TextInputStyle.Short)
      .setMaxLength(7);

    const campoUrlImaginLimitadora = new TextInputBuilder()
      .setCustomId("campo-url-imagen-limitadora")
      .setLabel("URL de la imagen limitadora")
      .setValue(`${this.api.embeds.urlImaginLimitadora}`)
      .setStyle(TextInputStyle.Short)
      .setMaxLength(255);

    const modal = new ModalBuilder()
      .setTitle("🎟 Editar embeds")
      .setCustomId("modal-editar-embeds")
      .setComponents(
        new ActionRowBuilder<TextInputBuilder>().setComponents(campoColor),
        new ActionRowBuilder<TextInputBuilder>().setComponents(
          campoUrlImaginLimitadora,
        ),
      );

    await interaccion.showModal(modal);
  }

  private static async editarEmbeds(
    interaccion: ModalSubmitInteraction,
  ): Promise<void> {
    if (interaccion.customId !== "modal-editar-embeds") return;

    const nuevosDatos: Embeds = {
      color: interaccion.fields.getTextInputValue("campo-color"),
      urlImaginLimitadora: interaccion.fields.getTextInputValue(
        "campo-url-imagen-limitadora",
      ),
    };

    try {
      await this.api.actualizarEmbeds(nuevosDatos);
    } catch (error) {
      interaccion.reply({
        content: "Ocurrio un error al intentar editar los embeds.",
        ephemeral: true,
      });

      this.log.error("Ocurrio un error al intentar editar los embeds.");
      this.log.error(error);

      return;
    }

    await interaccion.message.edit({
      embeds: [await this.crearEmbedResumen()],
    });

    interaccion.reply({
      content: "Los embeds han sido actualizados",
      ephemeral: true,
    });
  }

  private static async modalEditarCanalesDeRegistros(
    interaccion: StringSelectMenuInteraction,
  ): Promise<void> {
    if (interaccion.customId !== "panel-de-control-opciones") return;
    if (interaccion.values[0] !== "editar-canales-de-registros") return;

    const autorInteraccion = interaccion.member as GuildMember;
    if (!this.comandoAutorEsAdmin(autorInteraccion)) return;

    await this.api.obtenerCanalesDeRegistros();

    const campoIdCanalMensajes = new TextInputBuilder()
      .setCustomId("campo-id-canal-mensajes")
      .setLabel("ID del canal de mensajes")
      .setValue(`${this.api.canalesDeRegistros.idCanalMensajes}`)
      .setStyle(TextInputStyle.Short)
      .setMaxLength(20);

    const campoIdCanalVoz = new TextInputBuilder()
      .setCustomId("campo-id-canal-voz")
      .setLabel("ID del canal de voz")
      .setValue(`${this.api.canalesDeRegistros.idCanalVoz}`)
      .setStyle(TextInputStyle.Short)
      .setMaxLength(20);

    const campoIdCanalUsuarios = new TextInputBuilder()
      .setCustomId("campo-id-canal-usuarios")
      .setLabel("ID del canal de usuarios")
      .setValue(`${this.api.canalesDeRegistros.idCanalUsuarios}`)
      .setStyle(TextInputStyle.Short)
      .setMaxLength(20);

    const campoIdCanalSanciones = new TextInputBuilder()
      .setCustomId("campo-id-canal-sanciones")
      .setLabel("ID del canal de sanciones")
      .setValue(`${this.api.canalesDeRegistros.idCanalSanciones}`)
      .setStyle(TextInputStyle.Short)
      .setMaxLength(20);

    const campoIdCanlaServidor = new TextInputBuilder()
      .setCustomId("campo-id-canal-servidor")
      .setLabel("ID del canal de servidor")
      .setValue(`${this.api.canalesDeRegistros.idCanalServidor}`)
      .setStyle(TextInputStyle.Short)
      .setMaxLength(20);

    const modal = new ModalBuilder()
      .setTitle("🎟 Editar canales de registros")
      .setCustomId("modal-editar-canales-de-registros")
      .setComponents(
        new ActionRowBuilder<TextInputBuilder>().setComponents(
          campoIdCanalMensajes,
        ),
        new ActionRowBuilder<TextInputBuilder>().setComponents(campoIdCanalVoz),
        new ActionRowBuilder<TextInputBuilder>().setComponents(
          campoIdCanalUsuarios,
        ),
        new ActionRowBuilder<TextInputBuilder>().setComponents(
          campoIdCanalSanciones,
        ),
        new ActionRowBuilder<TextInputBuilder>().setComponents(
          campoIdCanlaServidor,
        ),
      );

    await interaccion.showModal(modal);
  }

  private static async editarCanalesDeRegistros(
    interaccion: ModalSubmitInteraction,
  ): Promise<void> {
    if (interaccion.customId !== "modal-editar-canales-de-registros") return;

    const nuevosDatos: CanalesDeRegistros = {
      idCanalMensajes: interaccion.fields.getTextInputValue(
        "campo-id-canal-mensajes",
      ),
      idCanalVoz: interaccion.fields.getTextInputValue("campo-id-canal-voz"),
      idCanalUsuarios: interaccion.fields.getTextInputValue(
        "campo-id-canal-usuarios",
      ),
      idCanalSanciones: interaccion.fields.getTextInputValue(
        "campo-id-canal-sanciones",
      ),
      idCanalServidor: interaccion.fields.getTextInputValue(
        "campo-id-canal-servidor",
      ),
    };

    try {
      await this.api.actualizarCanalesDeRegistros(nuevosDatos);
    } catch (error) {
      interaccion.reply({
        content:
          "Ocurrio un error al intentar editar los canales de registros.",
        ephemeral: true,
      });

      this.log.error(
        "Ocurrio un error al intentar editar los canales de registros.",
      );
      this.log.error(error);

      return;
    }

    await interaccion.message.edit({
      embeds: [await this.crearEmbedResumen()],
    });

    interaccion.reply({
      content: "Canales de registros editados correctamente.",
      ephemeral: true,
    });
  }
}
