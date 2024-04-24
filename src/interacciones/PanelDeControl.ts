import AccionesBase from "@lib/AccionesBase";
import {
  Autorol,
  CanalesDeRegistros,
  CanalesImportantes,
  Embeds,
  DatosRolesDeAdministracion,
  DatosTiques,
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

    await this.api.tiques.obtener();
    await this.api.rolesDeAdministracion.obtener();
    await this.api.obtenerEmbeds();
    await this.api.obtenerCanalesDeRegistros();
    await this.api.obtenerAutoroles();
    await this.api.obtenerCanalesImportantes();

    const {
      tiques,
      rolesDeAdministracion,
      embeds,
      canalesDeRegistros,
      autoroles,
      canalesImportantes,
    } = this.api;

    embed.setTitle("💻 Panel de control").setFields(
      {
        name: "🎟 Tiques",
        value: `> Canal de registros: ${tiques.idCanalDeRegistros ? `<#${tiques.idCanalDeRegistros}>` : "No definido"}
              > Categoría: ${tiques.idCategoria ? tiques.idCategoria : "No definido"}
              > Cantidad: ${tiques.cantidad}`,
      },
      {
        name: "👮 Roles de administracion",
        value: `> Administrador: ${rolesDeAdministracion.idAdministrador ? `<@&${rolesDeAdministracion.idAdministrador}>` : "No definido"}
              > Director: ${rolesDeAdministracion.idDirector ? `<@&${rolesDeAdministracion.idDirector}>` : "No definido"}
              > Moderador: ${rolesDeAdministracion.idModerador ? `<@&${rolesDeAdministracion.idModerador}>` : "No definido"}
              > Soporte: ${rolesDeAdministracion.idSoporte ? `<@&${rolesDeAdministracion.idSoporte}>` : "No definido"}
              > Interno: ${rolesDeAdministracion.idInterno ? `<@&${rolesDeAdministracion.idInterno}>` : "No definido"}`,
      },
      {
        name: "📝 Embeds",
        value: `> Color: ${embeds.color ? embeds.color : "No definido"}
              > Imagen limitadora: ${embeds.urlImaginLimitadora ? embeds.urlImaginLimitadora : "No definido"}`,
      },
      {
        name: "📄 Canales de registros",
        value: `> Mensajes: ${canalesDeRegistros.idCanalMensajes ? `<#${canalesDeRegistros.idCanalMensajes}>` : "No definido"}
              > Voz: ${canalesDeRegistros.idCanalVoz ? `<#${canalesDeRegistros.idCanalVoz}>` : "No definido"}
              > Usuarios: ${canalesDeRegistros.idCanalUsuarios ? `<#${canalesDeRegistros.idCanalUsuarios}>` : "No definido"}
              > Sanciones: ${canalesDeRegistros.idCanalSanciones ? `<#${canalesDeRegistros.idCanalSanciones}>` : "No definido"}
              > Servidor: ${canalesDeRegistros.idCanalServidor ? `<#${canalesDeRegistros.idCanalServidor}>` : "No definido"} `,
      },
      {
        name: "🛑 Autoroles",
        value:
          autoroles.length > 0
            ? autoroles
                .map((autorol) => {
                  return `> ${autorol.emoji} <@&${autorol.id}> - \`${autorol.nombre}\` - ${autorol.tipo}`;
                })
                .join("\n")
            : "No definido",
      },
      {
        name: "‼️ Canales importantes",
        value: `> Sugerencias: ${canalesImportantes.idCanalSugerencias ? `<#${canalesImportantes.idCanalSugerencias}>` : "No definido"}`,
      },
    );

    return embed;
  }

  public static async crearPanelDeControl(
    interaccion: CommandInteraction,
  ): Promise<void> {
    if (interaccion.commandName !== "panel-de-control") return;

    const autorComando = interaccion.member as GuildMember;
    if (!this.esAdmin(autorComando)) return;

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

            new StringSelectMenuOptionBuilder()
              .setEmoji("🛑")
              .setLabel("Editar autoroles")
              .setValue("editar-autoroles"),

            new StringSelectMenuOptionBuilder()
              .setEmoji("‼️")
              .setLabel("Editar canales importantes")
              .setValue("editar-canales-importantes"),
          ),
      );

    await interaccion.reply({ embeds: [embed], components: [controles] });
  }

  public static async manejarInteraccion(
    interaccion: Interaction,
  ): Promise<void> {
    const autor = interaccion.member as GuildMember;
    if (!this.esAdmin(autor)) return;

    if (interaccion.isCommand()) {
      //
      await this.crearPanelDeControl(interaccion);
      //
    } else if (interaccion.isStringSelectMenu()) {
      //
      await this.modalEditarTiques(interaccion);
      await this.modalEditarRolesDeAdministracion(interaccion);
      await this.modalEditarEmbeds(interaccion);
      await this.modalEditarCanalesDeRegistros(interaccion);
      await this.modalEditarAutoroles(interaccion);
      await this.modalEditarCanalesImportantes(interaccion);
      //
    } else if (interaccion.isModalSubmit()) {
      //
      await this.editarTiques(interaccion);
      await this.editarRolesDeAdministracion(interaccion);
      await this.editarEmbeds(interaccion);
      await this.editarCanalesDeRegistros(interaccion);
      await this.editarAutoroles(interaccion);
      await this.editarCanalesImportantes(interaccion);
      //
    }
  }

  private static async modalEditarTiques(
    interaccion: StringSelectMenuInteraction,
  ): Promise<void> {
    if (interaccion.customId !== "panel-de-control-opciones") return;
    if (interaccion.values[0] !== "editar-tiques") return;

    try {
      await this.api.tiques.obtener();
    } catch (error) {
      interaccion.reply({
        content: "Ocurrió un error al ejecutar este comando.",
      });

      this.log.error(error);
      return;
    }

    const campos: TextInputBuilder[] = [
      new TextInputBuilder()
        .setCustomId("campo-id-canal-de-registros")
        .setLabel("ID del canal de registros")
        .setValue(`${this.api.tiques.idCanalDeRegistros}`)
        .setStyle(TextInputStyle.Short)
        .setMaxLength(20),

      new TextInputBuilder()
        .setCustomId("campo-id-categoria")
        .setLabel("ID de la categoría")
        .setValue(`${this.api.tiques.idCategoria}`)
        .setStyle(TextInputStyle.Short)
        .setMaxLength(20),
    ];

    const modal = new ModalBuilder()
      .setTitle("🎟 Editar tiques")
      .setCustomId("modal-editar-tiques")
      .setComponents(
        campos.map((campo) =>
          new ActionRowBuilder<TextInputBuilder>().setComponents(campo),
        ),
      );

    await interaccion.showModal(modal);
  }

  private static async editarTiques(
    interaccion: ModalSubmitInteraction,
  ): Promise<void> {
    if (interaccion.customId !== "modal-editar-tiques") return;

    const nuevosDatos: DatosTiques = {
      idCanalDeRegistros: interaccion.fields.getTextInputValue(
        "campo-id-canal-de-registros",
      ),
      idCategoria: interaccion.fields.getTextInputValue("campo-id-categoria"),
      cantidad: null,
    };

    try {
      await this.api.tiques.actualizar(nuevosDatos);
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

    await this.api.rolesDeAdministracion.obtener();

    const campos: TextInputBuilder[] = [
      new TextInputBuilder()
        .setCustomId("campo-id-administrador")
        .setLabel("ID del rol administrador")
        .setValue(`${this.api.rolesDeAdministracion.idAdministrador}`)
        .setStyle(TextInputStyle.Short)
        .setMaxLength(20),

      new TextInputBuilder()
        .setCustomId("campo-id-director")
        .setLabel("ID del rol director")
        .setValue(`${this.api.rolesDeAdministracion.idDirector}`)
        .setStyle(TextInputStyle.Short)
        .setMaxLength(20),

      new TextInputBuilder()
        .setCustomId("campo-id-moderador")
        .setLabel("ID del rol moderador")
        .setValue(`${this.api.rolesDeAdministracion.idModerador}`)
        .setStyle(TextInputStyle.Short)
        .setMaxLength(20),

      new TextInputBuilder()
        .setCustomId("campo-id-soporte")
        .setLabel("ID del rol soporte")
        .setValue(`${this.api.rolesDeAdministracion.idSoporte}`)
        .setStyle(TextInputStyle.Short)
        .setMaxLength(20),

      new TextInputBuilder()
        .setCustomId("campo-id-interno")
        .setLabel("ID del rol interno")
        .setValue(`${this.api.rolesDeAdministracion.idInterno}`)
        .setStyle(TextInputStyle.Short)
        .setMaxLength(20),
    ];

    const modal = new ModalBuilder()
      .setTitle("🎟 Editar roles de administración")
      .setCustomId("modal-editar-roles-de-administracion")
      .setComponents(
        campos.map((campo) =>
          new ActionRowBuilder<TextInputBuilder>().setComponents(campo),
        ),
      );

    await interaccion.showModal(modal);
  }

  private static async editarRolesDeAdministracion(
    interaccion: ModalSubmitInteraction,
  ): Promise<void> {
    if (interaccion.customId !== "modal-editar-roles-de-administracion") return;

    const nuevosDatos: DatosRolesDeAdministracion = {
      idAdministrador: interaccion.fields.getTextInputValue(
        "campo-id-administrador",
      ),
      idDirector: interaccion.fields.getTextInputValue("campo-id-director"),
      idModerador: interaccion.fields.getTextInputValue("campo-id-moderador"),
      idSoporte: interaccion.fields.getTextInputValue("campo-id-soporte"),
      idInterno: interaccion.fields.getTextInputValue("campo-id-interno"),
    };

    try {
      await this.api.rolesDeAdministracion.actualizar(nuevosDatos);
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

    await this.api.obtenerEmbeds();

    const campos: TextInputBuilder[] = [
      new TextInputBuilder()
        .setCustomId("campo-color")
        .setLabel("Color")
        .setValue(`${this.api.embeds.color}`)
        .setStyle(TextInputStyle.Short)
        .setMaxLength(7),

      new TextInputBuilder()
        .setCustomId("campo-url-imagen-limitadora")
        .setLabel("URL de la imagen limitadora")
        .setValue(`${this.api.embeds.urlImaginLimitadora}`)
        .setStyle(TextInputStyle.Short)
        .setMaxLength(255),
    ];

    const modal = new ModalBuilder()
      .setTitle("🎟 Editar embeds")
      .setCustomId("modal-editar-embeds")
      .setComponents(
        campos.map((campo) =>
          new ActionRowBuilder<TextInputBuilder>().setComponents(campo),
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

    await this.api.obtenerCanalesDeRegistros();

    const campos: TextInputBuilder[] = [
      new TextInputBuilder()
        .setCustomId("campo-id-canal-mensajes")
        .setLabel("ID del canal de mensajes")
        .setValue(`${this.api.canalesDeRegistros.idCanalMensajes}`)
        .setStyle(TextInputStyle.Short)
        .setMaxLength(20),

      new TextInputBuilder()
        .setCustomId("campo-id-canal-voz")
        .setLabel("ID del canal de voz")
        .setValue(`${this.api.canalesDeRegistros.idCanalVoz}`)
        .setStyle(TextInputStyle.Short)
        .setMaxLength(20),

      new TextInputBuilder()
        .setCustomId("campo-id-canal-usuarios")
        .setLabel("ID del canal de usuarios")
        .setValue(`${this.api.canalesDeRegistros.idCanalUsuarios}`)
        .setStyle(TextInputStyle.Short)
        .setMaxLength(20),

      new TextInputBuilder()
        .setCustomId("campo-id-canal-sanciones")
        .setLabel("ID del canal de sanciones")
        .setValue(`${this.api.canalesDeRegistros.idCanalSanciones}`)
        .setStyle(TextInputStyle.Short)
        .setMaxLength(20),

      new TextInputBuilder()
        .setCustomId("campo-id-canal-servidor")
        .setLabel("ID del canal de servidor")
        .setValue(`${this.api.canalesDeRegistros.idCanalServidor}`)
        .setStyle(TextInputStyle.Short)
        .setMaxLength(20),
    ];

    const modal = new ModalBuilder()
      .setTitle("🎟 Editar canales de registros")
      .setCustomId("modal-editar-canales-de-registros")
      .setComponents(
        campos.map((campo) =>
          new ActionRowBuilder<TextInputBuilder>().setComponents(campo),
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

  private static async modalEditarAutoroles(
    interaccion: StringSelectMenuInteraction,
  ): Promise<void> {
    if (interaccion.customId !== "panel-de-control-opciones") return;
    if (interaccion.values[0] !== "editar-autoroles") return;

    await this.api.obtenerAutoroles();

    const campos: TextInputBuilder[] = [
      new TextInputBuilder()
        .setLabel("Autoroles")
        .setValue(JSON.stringify(this.api.autoroles))
        .setCustomId("campo-autoroles")
        .setStyle(TextInputStyle.Paragraph)
        .setRequired(true),
    ];

    const modal = new ModalBuilder()
      .setTitle("🛑 Editar autoroles")
      .setCustomId("modal-editar-autoroles")
      .setComponents(
        campos.map((campo) =>
          new ActionRowBuilder<TextInputBuilder>().setComponents(campo),
        ),
      );

    await interaccion.showModal(modal);
  }

  private static async editarAutoroles(
    interaccion: ModalSubmitInteraction,
  ): Promise<void> {
    if (interaccion.customId !== "modal-editar-autoroles") return;

    const campoAutoroles =
      interaccion.fields.getTextInputValue("campo-autoroles");
    let nuevosDatos: Autorol[] = [];

    try {
      nuevosDatos = JSON.parse(campoAutoroles);
    } catch (error) {
      await interaccion.reply({
        content: "Los datos proveídos no son validos",
        ephemeral: true,
      });

      return;
    }

    try {
      await this.api.actualizarAutoroles(nuevosDatos);
    } catch (error) {
      await interaccion.reply({
        content: "Ocurrió un error al intentar actualizar los autoroles",
        ephemeral: true,
      });

      this.log.error("Ocurrió un error al intentar actualizar los autoroles");
      this.log.error(error);

      return;
    }

    await interaccion.reply({
      content: "Autoroles actualizados",
      ephemeral: true,
    });

    await interaccion.message.edit({
      embeds: [await this.crearEmbedResumen()],
    });
  }

  private static async modalEditarCanalesImportantes(
    interaccion: StringSelectMenuInteraction,
  ): Promise<void> {
    if (interaccion.customId !== "panel-de-control-opciones") return;
    if (interaccion.values[0] !== "editar-canales-importantes") return;

    await this.api.obtenerCanalesImportantes();

    const campos: TextInputBuilder[] = [
      new TextInputBuilder()
        .setLabel("Id del canal de sugerencias")
        .setValue(`${this.api.canalesImportantes.idCanalSugerencias}`)
        .setStyle(TextInputStyle.Short)
        .setCustomId("campo-id-canal-de-sugerencias")
        .setRequired(true),
    ];

    const modal = new ModalBuilder()
      .setCustomId("modal-editar-canales-importantes")
      .setTitle("‼️ Editar canales importantse")
      .setComponents(
        campos.map((campo) =>
          new ActionRowBuilder<TextInputBuilder>().setComponents(campo),
        ),
      );

    await interaccion.showModal(modal);
  }

  private static async editarCanalesImportantes(
    interaccion: ModalSubmitInteraction,
  ): Promise<void> {
    if (interaccion.customId !== "modal-editar-canales-importantes") return;

    const { fields: campos, message: mensaje } = interaccion;

    const nuevosDatos: CanalesImportantes = {
      idCanalSugerencias: campos.getTextInputValue(
        "campo-id-canal-de-sugerencias",
      ),
    };

    try {
      await this.api.actualizarCanalesImportantes(nuevosDatos);
    } catch (error) {
      await interaccion.reply({
        content:
          "Ocurrió un error al intentar actualizar los canales importantes",
        ephemeral: true,
      });

      this.log.error(
        "Ocurrió un error al intentar actualizar los canales importantes",
      );
      this.log.error(error);

      return;
    }

    await interaccion.reply({
      content: "Canales importantes actualizados correctamente!",
      ephemeral: true,
    });

    await mensaje.edit({
      embeds: [await this.crearEmbedResumen()],
    });
  }
}
