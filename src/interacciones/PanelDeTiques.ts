import AccionesBase from "@lib/AccionesBase";
import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonInteraction,
  ButtonStyle,
  CommandInteraction,
  Guild,
  GuildMember,
  GuildTextBasedChannel,
  Interaction,
  ModalBuilder,
  ModalSubmitInteraction,
  PermissionFlagsBits,
  StringSelectMenuBuilder,
  StringSelectMenuInteraction,
  StringSelectMenuOptionBuilder,
  TextBasedChannel,
  TextChannel,
  TextInputBuilder,
  TextInputStyle,
  User,
} from "discord.js";

export default class PanelDeTiques extends AccionesBase {
  public static async manejarInteraccion(
    interaccion: Interaction,
  ): Promise<void> {
    if (interaccion.isCommand()) {
      //
      await this.crearPanelDeTiques(interaccion);
      //
    } else if (interaccion.isStringSelectMenu()) {
      //
      await this.modalTiqueDeServicio(interaccion);
      await this.modalTiqueDeReporte(interaccion);
      await this.modalTiqueDePostulacion(interaccion);
      await this.modalTiqueDeCliente(interaccion);
      //
    } else if (interaccion.isModalSubmit()) {
      //
      await this.crearTiqueDeServicio(interaccion);
      await this.crearTiqueDeReporte(interaccion);
      await this.crearTiqueDePostulacion(interaccion);
      await this.crearTiqueDeCliente(interaccion);
      //
    } else if (interaccion.isButton()) {
      //
      this.cerrarTique(interaccion);
      this.reabrirTique(interaccion);
      this.eliminarTique(interaccion);
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
        "Los tiques son canales privados que puedes crear para charlar " +
          "con los miembros del personal. Un tique solo debe ser creado si " +
          "es sumamente necesario, por lo que no se tolerará crear tiques " +
          "por cosas insignificantes, y se les aplicará una sanción a quienes " +
          "hagan mal uso de los tiques,",
      );

    const opciones: StringSelectMenuOptionBuilder[] = [
      new StringSelectMenuOptionBuilder()
        .setEmoji("🪙")
        .setLabel("Servicio")
        .setDescription("Contrata un servicio")
        .setValue("opcion-tique-de-servicio"),

      new StringSelectMenuOptionBuilder()
        .setEmoji("📣")
        .setLabel("Reporte")
        .setDescription("Reporta un usuario o un problema")
        .setValue("opcion-tique-de-reporte"),

      new StringSelectMenuOptionBuilder()
        .setEmoji("🤚")
        .setLabel("Postulación")
        .setDescription("Postula a un cargo del servidor")
        .setValue("opcion-tique-de-postulacion"),

      new StringSelectMenuOptionBuilder()
        .setEmoji("👤")
        .setLabel("Cliente")
        .setDescription("Si haz contratado un servicio")
        .setValue("opcion-tique-de-cliente"),
    ];

    const listaDeOpciones =
      new ActionRowBuilder<StringSelectMenuBuilder>().setComponents(
        new StringSelectMenuBuilder()
          .setCustomId("panel-de-tiques-opciones")
          .setOptions(opciones.map((opcion) => opcion)),
      );

    await interaccion.reply({ embeds: [embed], components: [listaDeOpciones] });
  }

  private static async modalTiqueDeServicio(
    interaccion: StringSelectMenuInteraction,
  ): Promise<void> {
    if (interaccion.customId !== "panel-de-tiques-opciones") return;
    if (interaccion.values[0] !== "opcion-tique-de-servicio") return;

    const campos: TextInputBuilder[] = [
      new TextInputBuilder()
        .setCustomId("campo-descripcion-del-servicio")
        .setLabel("¿Qué tipo de servicio desea?")
        .setPlaceholder(
          "Quiero un ... que haga ... y tenga que ...\n (Sea muy descriptivo)",
        )
        .setStyle(TextInputStyle.Paragraph)
        .setRequired(true),

      new TextInputBuilder()
        .setCustomId("campo-fecha-de-entrega")
        .setLabel("Fecha de entrega")
        .setPlaceholder("DD/MM/AAAA (opcional)")
        .setStyle(TextInputStyle.Short)
        .setRequired(false),

      new TextInputBuilder()
        .setCustomId("campo-costo-del-servicio")
        .setLabel("Costo del servicio USD")
        .setPlaceholder(
          "¿Crees que debería costar? (usamos esta info para ajustarnos a su presupuesto)",
        )
        .setStyle(TextInputStyle.Paragraph)
        .setRequired(false),
    ];

    const modal = new ModalBuilder()
      .setTitle("🪙 Contrata un servicio")
      .setCustomId("modal-tique-de-servicio")
      .setComponents(
        campos.map((campo) =>
          new ActionRowBuilder<TextInputBuilder>().setComponents(campo),
        ),
      );

    await interaccion.showModal(modal);
  }

  private static async modalTiqueDeReporte(
    interaccion: StringSelectMenuInteraction,
  ): Promise<void> {
    if (interaccion.customId !== "panel-de-tiques-opciones") return;
    if (interaccion.values[0] !== "opcion-tique-de-reporte") return;

    const campos: TextInputBuilder[] = [
      new TextInputBuilder()
        .setLabel("Nombre del usuario o problema a reportar")
        .setCustomId("campo-usuario-o-problema")
        .setStyle(TextInputStyle.Short)
        .setRequired(true),

      new TextInputBuilder()
        .setLabel("Descripción del reporte")
        .setCustomId("campo-razon-del-reporte")
        .setPlaceholder(
          "El usuario ... estaba haciendo ...\nPasó algo extraño en un canal...",
        )
        .setStyle(TextInputStyle.Paragraph),
    ];

    const modal = new ModalBuilder()
      .setTitle("📣 Reporta a un usuario o un problema")
      .setCustomId("modal-tique-de-reporte")
      .setComponents(
        campos.map((campo) =>
          new ActionRowBuilder<TextInputBuilder>().setComponents(campo),
        ),
      );

    await interaccion.showModal(modal);
  }

  private static async modalTiqueDePostulacion(
    interaccion: StringSelectMenuInteraction,
  ): Promise<void> {
    if (interaccion.customId !== "panel-de-tiques-opciones") return;
    if (interaccion.values[0] !== "opcion-tique-de-postulacion") return;

    const campos: TextInputBuilder[] = [
      new TextInputBuilder()
        .setLabel("Cargo al que desea postular")
        .setPlaceholder("Moderador o soporte")
        .setCustomId("campo-cargo")
        .setStyle(TextInputStyle.Short)
        .setRequired(true),

      new TextInputBuilder()
        .setLabel("Razón de la postulación")
        .setCustomId("campo-razon-de-la-postulacion")
        .setStyle(TextInputStyle.Paragraph)
        .setRequired(true),
    ];

    const modal = new ModalBuilder()
      .setTitle("🛡 Postula a un cargo del servidor")
      .setCustomId("modal-tique-de-postulacion")
      .setComponents(
        campos.map((campo) =>
          new ActionRowBuilder<TextInputBuilder>().setComponents(campo),
        ),
      );

    await interaccion.showModal(modal);
  }

  private static async modalTiqueDeCliente(
    interaccion: StringSelectMenuInteraction,
  ): Promise<void> {
    if (interaccion.customId !== "panel-de-tiques-opciones") return;
    if (interaccion.values[0] !== "opcion-tique-de-cliente") return;

    const campos: TextInputBuilder[] = [
      new TextInputBuilder()
        .setLabel("Razón")
        .setPlaceholder("Mi producto ... esta ...")
        .setStyle(TextInputStyle.Paragraph)
        .setCustomId("campo-razon")
        .setRequired(true),
    ];

    const modal = new ModalBuilder()
      .setCustomId("modal-tique-de-cliente")
      .setTitle("🪙 Cliente")
      .setComponents(
        campos.map((campo) =>
          new ActionRowBuilder<TextInputBuilder>().setComponents(campo),
        ),
      );

    await interaccion.showModal(modal);
  }

  private static async crearCanalTique(
    interaccion: ModalSubmitInteraction,
    emoji: string,
  ): Promise<TextChannel | void> {
    await this.api.obtenerRolesDeAdministracion();

    const { guild, user } = interaccion;
    const idRolSoporte = this.api.rolesDeAdministracion.idSoporte;
    const rolSoporteExiste = this.rolExiste(guild, idRolSoporte, "Soporte");

    if (!rolSoporteExiste) {
      await interaccion.reply({
        content: "Ocurrió un error al crear el tique.",
        ephemeral: true,
      });

      return;
    }

    await this.api.obtenerTiques();

    const cantidadTiques = this.api.tiques.cantidad;
    const idCategoriaTiques = this.api.tiques.idCategoria;
    const rolEveryone = guild.roles.everyone;

    try {
      const canalTique = await guild.channels.create({
        name: `${emoji}・${user.username}-${cantidadTiques}`,
        parent: idCategoriaTiques,
        permissionOverwrites: [
          {
            id: idRolSoporte,
            allow: [
              PermissionFlagsBits.ViewChannel,
              PermissionFlagsBits.SendMessages,
            ],
          },
          {
            id: rolEveryone.id,
            deny: [PermissionFlagsBits.ViewChannel],
          },
          {
            id: user.id,
            allow: [PermissionFlagsBits.ViewChannel],
          },
        ],
      });

      try {
        await this.registrarCreacionDeTique(guild, canalTique, user);
      } catch (error) {
        this.log.error(error);
      }

      return canalTique;
    } catch (error) {
      this.log.error(error);

      await interaccion.reply({
        content: "Ocurrió un error al crear el tique.",
        ephemeral: true,
      });
    }
  }

  private static async crearTiqueDeServicio(
    interaccion: ModalSubmitInteraction,
  ): Promise<void> {
    if (interaccion.customId !== "modal-tique-de-servicio") return;

    const canalTique = await this.crearCanalTique(interaccion, "🪙");

    if (!canalTique) return;

    const camposModal = interaccion.fields;

    const descripcionDelServicio = camposModal.getTextInputValue(
      "campo-descripcion-del-servicio",
    );
    const fechaDeEntrega = camposModal.getTextInputValue(
      "campo-fecha-de-entrega",
    );
    const costoDelServicio = camposModal.getTextInputValue(
      "campo-costo-del-servicio",
    );

    const embedResumen = await this.crearEmbedEstilizado();
    embedResumen.setTitle("🪙 Tique de servicio").setFields({
      name: "Descripcion del servicio",
      value: descripcionDelServicio
        .split("\n")
        .map((parrafo) => `> ${parrafo}`)
        .join("\n"),
    });

    if (fechaDeEntrega) {
      embedResumen.addFields({
        name: "Fecha de entrega",
        value: `> ${fechaDeEntrega}`,
      });
    }

    if (costoDelServicio) {
      embedResumen.addFields({
        name: "Costo del servicio",
        value: `> ${costoDelServicio} USD`,
      });
    }

    const idAutorInteraccion = interaccion.user.id;
    const idRolSoporte = this.api.rolesDeAdministracion.idSoporte;

    const controles = new ActionRowBuilder<ButtonBuilder>().setComponents(
      this.crearBotonCerrarTique(),
    );

    await canalTique.send({
      content: `<@&${idRolSoporte}> <@${idAutorInteraccion}>`,
      embeds: [embedResumen],
      components: [controles],
    });

    await interaccion.reply({
      content: `Tique creado en <#${canalTique.id}>.`,
      ephemeral: true,
    });
  }

  private static async crearTiqueDeReporte(
    interaccion: ModalSubmitInteraction,
  ): Promise<void> {
    if (interaccion.customId !== "modal-tique-de-reporte") return;

    const canalTique = await this.crearCanalTique(interaccion, "📣");

    if (!canalTique) return;

    const { fields: camposModal, user: usuario } = interaccion;

    const usuarioOProblema = camposModal.getTextInputValue(
      "campo-usuario-o-problema",
    );

    const razonDelReporte = camposModal.getTextInputValue(
      "campo-razon-del-reporte",
    );

    const embedResumen = await this.crearEmbedEstilizado();
    embedResumen.setTitle("📣 Tique de reporte").setFields(
      {
        name: "Usuario o probelema",
        value: `> ${usuarioOProblema}`,
      },
      {
        name: "Razón del reporte",
        value: razonDelReporte
          .split("\n")
          .map((parrafo) => `> ${parrafo}`)
          .join("\n"),
      },
    );

    const controles = new ActionRowBuilder<ButtonBuilder>().setComponents(
      this.crearBotonCerrarTique(),
    );

    await this.api.obtenerRolesDeAdministracion();
    const idRolSoporte = this.api.rolesDeAdministracion.idSoporte;

    await canalTique.send({
      content: `<@&${idRolSoporte}> <@${usuario.id}>`,
      embeds: [embedResumen],
      components: [controles],
    });

    await interaccion.reply({
      content: `Tique creado en ${canalTique}`,
      ephemeral: true,
    });
  }

  private static async crearTiqueDePostulacion(
    interaccion: ModalSubmitInteraction,
  ): Promise<void> {
    if (interaccion.customId !== "modal-tique-de-postulacion") return;

    const canalTique = await this.crearCanalTique(interaccion, "🛡");

    if (!canalTique) return;

    const { fields: camposModal, user: usuario } = interaccion;

    const campoCargo = camposModal.getTextInputValue("campo-cargo");
    const campoRazonDeLaPostulacion = camposModal.getTextInputValue(
      "campo-razon-de-la-postulacion",
    );

    const embedResumen = await this.crearEmbedEstilizado();
    embedResumen.setTitle("🛡 Tique de postulación").setFields(
      {
        name: "Cargo deseado",
        value: `> ${campoCargo}`,
      },
      {
        name: "Razón de la postulación",
        value: campoRazonDeLaPostulacion
          .split("\n")
          .map((parrafo) => `> ${parrafo}`)
          .join("\n"),
      },
    );

    const controles = new ActionRowBuilder<ButtonBuilder>().setComponents(
      this.crearBotonCerrarTique(),
    );

    await this.api.obtenerRolesDeAdministracion();
    const idRolSoporte = this.api.rolesDeAdministracion.idSoporte;

    await canalTique.send({
      content: `<@&${idRolSoporte}> ${usuario}`,
      embeds: [embedResumen],
      components: [controles],
    });

    await interaccion.reply({
      content: `Tique creado en ${canalTique}`,
      ephemeral: true,
    });
  }

  private static async crearTiqueDeCliente(
    interaccion: ModalSubmitInteraction,
  ): Promise<void> {
    if (interaccion.customId !== "modal-tique-de-cliente") return;

    const canalTique = await this.crearCanalTique(interaccion, "👤");

    if (!canalTique) return;

    const { fields: camposModal, user: usuario } = interaccion;

    const campoRazon = camposModal.getTextInputValue("campo-razon");

    const embedResumen = await this.crearEmbedEstilizado();
    embedResumen.setTitle("👤 Tique de cliente").setFields({
      name: "Razón del tique",
      value: campoRazon
        .split("\n")
        .map((parrafo) => `> ${parrafo}`)
        .join("\n"),
    });

    const controles = new ActionRowBuilder<ButtonBuilder>().setComponents(
      this.crearBotonCerrarTique(),
    );

    await this.api.obtenerRolesDeAdministracion();
    const idRolSoporte = this.api.rolesDeAdministracion.idSoporte;

    await canalTique.send({
      content: `<@&${idRolSoporte}> ${usuario}>`,
      embeds: [embedResumen],
      components: [controles],
    });

    await interaccion.reply({
      content: `Tique creado en ${canalTique}`,
      ephemeral: true,
    });
  }

  private static crearBotonCerrarTique(): ButtonBuilder {
    const botonCerrarTique = new ButtonBuilder()
      .setCustomId("boton-cerrar-tique")
      .setEmoji("❌")
      .setLabel("Cerrar tique")
      .setStyle(ButtonStyle.Secondary);

    return botonCerrarTique;
  }

  private static crearBotonEliminarTique(): ButtonBuilder {
    const botonEliminarTique = new ButtonBuilder()
      .setCustomId("boton-eliminar-tique")
      .setEmoji("🗑")
      .setLabel("Eliminar tique")
      .setStyle(ButtonStyle.Danger);

    return botonEliminarTique;
  }

  private static crearBotonReabrirTique(): ButtonBuilder {
    const botonReabrirTique = new ButtonBuilder()
      .setCustomId("boton-reabrir-tique")
      .setEmoji("📖")
      .setLabel("Reabrir tique")
      .setStyle(ButtonStyle.Success);

    return botonReabrirTique;
  }

  private static async cerrarTique(
    interaccion: ButtonInteraction,
  ): Promise<void> {
    if (interaccion.customId !== "boton-cerrar-tique") return;

    const { guild: servidor, channel: canalTique, user: usuario } = interaccion;

    const rolEveryone = servidor.roles.everyone;
    const canalEstaCerrado = canalTique
      .permissionsFor(rolEveryone)
      .has(PermissionFlagsBits.SendMessages);

    if (!canalEstaCerrado) {
      interaccion.reply({
        content: "El tique ya está cerrado",
        ephemeral: true,
      });

      return;
    }

    try {
      canalTique.permissionOverwrites.edit(rolEveryone, {
        SendMessages: false,
      });
    } catch (error) {
      interaccion.reply({
        content: "Ocurrió un error al intentar cerrar el tique",
        ephemeral: true,
      });

      this.log.error(
        `Ocurrió un error al intentar cerrar el tique <${canalTique.name}>`,
      );
      this.log.error(error);

      return;
    }

    const embed = await this.crearEmbedEstilizado();
    embed
      .setAuthor({
        iconURL: usuario.avatarURL(),
        name: usuario.username,
      })
      .setTitle("❌ Tique cerrado");

    const controles = new ActionRowBuilder<ButtonBuilder>().setComponents(
      this.crearBotonReabrirTique(),
      this.crearBotonEliminarTique(),
    );

    await interaccion.reply({
      embeds: [embed],
      components: [controles],
    });

    await this.registrarClausuraDeTique(servidor, canalTique, usuario);
  }

  public static async reabrirTique(interaccion: ButtonInteraction) {
    if (interaccion.customId !== "boton-reabrir-tique") return;

    const {
      guild: servidor,
      channel: canalTique,
      user: usuario,
      member: miembro,
    } = interaccion;

    await this.api.obtenerRolesDeAdministracion();
    const rolSoporteExiste = this.rolExiste(
      servidor,
      this.api.rolesDeAdministracion.idSoporte,
      "soporte",
    );
    if (!rolSoporteExiste) {
      await interaccion.reply({
        content: "Ocurrió un error al intentar rearbrir el tique",
        ephemeral: true,
      });

      return;
    }

    const autorInteraccionEsSoporte = miembro.roles.cache.has(
      this.api.rolesDeAdministracion.idSoporte,
    );
    if (!autorInteraccionEsSoporte) {
      await interaccion.reply({
        content: "No tienes permisos para ejecutar esta interacción",
        ephemeral: true,
      });

      return;
    }

    const rolEveryone = servidor.roles.everyone;

    const canalEstaAbierto = canalTique
      .permissionsFor(rolEveryone)
      .has(PermissionFlagsBits.SendMessages);

    if (canalEstaAbierto) {
      interaccion.reply({
        content: "El tique no está cerrado",
        ephemeral: true,
      });

      return;
    }

    try {
      canalTique.permissionOverwrites.edit(rolEveryone, { SendMessages: true });
    } catch (error) {
      interaccion.reply({
        content: "Ocurrió un error al intentar reabrir el tique",
        ephemeral: true,
      });

      this.log.error(
        `Ocurrió un error al intentar reabrir el tique <${canalTique.name}>`,
      );
      this.log.error(error);

      return;
    }

    const embed = await this.crearEmbedEstilizado();
    embed
      .setAuthor({
        iconURL: usuario.avatarURL(),
        name: usuario.username,
      })
      .setTitle("📖 Tique reabierto");

    const controles = new ActionRowBuilder<ButtonBuilder>().setComponents(
      this.crearBotonCerrarTique(),
    );

    await interaccion.reply({
      embeds: [embed],
      components: [controles],
    });

    await interaccion.message.delete();

    await this.registrarReaperturaDeTique(servidor, canalTique, usuario);
  }

  public static async eliminarTique(
    interaccion: ButtonInteraction,
  ): Promise<void> {
    if (interaccion.customId !== "boton-eliminar-tique") return;

    const {
      member: miembro,
      channel: canalTique,
      guild: servidor,
      user: usuario,
    } = interaccion;

    await this.api.obtenerRolesDeAdministracion();
    const autorInteraccionEsSoporte = miembro.roles.cache.has(
      this.api.rolesDeAdministracion.idSoporte,
    );
    if (!autorInteraccionEsSoporte) {
      interaccion.reply({
        content: "No tienes permisos para ejecutar esta interacción",
        ephemeral: true,
      });

      return;
    }

    await this.registrarEliminacionDeTique(servidor, canalTique, usuario);

    await canalTique.delete();
  }

  private static async obtenerCanalDeRegistrosDeTiques(
    servidor: Guild,
    canalTique: GuildTextBasedChannel,
  ): Promise<TextBasedChannel> {
    await this.api.obtenerTiques();

    if (this.api.tiques.idCanalDeRegistros == null) {
      throw new Error(
        `Se intentó registrar la creación del tique <${canalTique.name}>,
        pero no sea ha definido el canal de registros de los tiques`,
      );
    }

    const canalDeRegistrosDeTiquesExiste = servidor.channels.cache.has(
      this.api.tiques.idCanalDeRegistros,
    );

    if (!canalDeRegistrosDeTiquesExiste) {
      throw new Error(
        `Se intentó registrar la creación del tique <${canalTique.name}>,
        pero el canal de registros de tiques no existe`,
      );
    }

    const canalDeRegistrosDeTiques = servidor.channels.cache.get(
      this.api.tiques.idCanalDeRegistros,
    );

    if (!canalDeRegistrosDeTiques.isTextBased()) {
      throw new Error(
        `Se intentó registrar la creación del tique <${canalTique.name}>,
        pero el canal de registros de tiques no es un canal de texto`,
      );
    }

    return canalDeRegistrosDeTiques;
  }

  private static async registrarCreacionDeTique(
    servidor: Guild,
    canalTique: GuildTextBasedChannel,
    usuario: User,
  ): Promise<void> {
    try {
      const canalDeRegistrosDeTiques =
        await this.obtenerCanalDeRegistrosDeTiques(servidor, canalTique);

      const embed = await this.crearEmbedEstilizado();
      embed
        .setAuthor({
          iconURL: usuario.avatarURL(),
          name: usuario.username,
        })
        .setDescription(`Se ha creado el tique <${canalTique.name}>`);

      await canalDeRegistrosDeTiques.send({
        embeds: [embed],
      });
    } catch (error) {
      this.log.error(error);

      return;
    }

    try {
      await this.api.actualizarCantidadTiques();
    } catch (error) {
      this.log.error(
        "Ocurrió un error al intentar actualizar la cantidad de tiques",
      );
      this.log.error(error);
    }
  }

  private static async registrarClausuraDeTique(
    servidor: Guild,
    canalTique: GuildTextBasedChannel,
    usuario: User,
  ): Promise<void> {
    try {
      const canalDeRegistrosDeTiques =
        await this.obtenerCanalDeRegistrosDeTiques(servidor, canalTique);

      const embed = await this.crearEmbedEstilizado();
      embed
        .setAuthor({
          iconURL: usuario.avatarURL(),
          name: usuario.username,
        })
        .setDescription(`Se ha clausurado el tique <${canalTique.name}>`);

      await canalDeRegistrosDeTiques.send({
        embeds: [embed],
      });
    } catch (error) {
      this.log.error(error);
    }
  }

  private static async registrarReaperturaDeTique(
    servidor: Guild,
    canalTique: GuildTextBasedChannel,
    usuario: User,
  ): Promise<void> {
    try {
      const canalDeRegistrosDeTiques =
        await this.obtenerCanalDeRegistrosDeTiques(servidor, canalTique);

      const embed = await this.crearEmbedEstilizado();
      embed
        .setAuthor({
          iconURL: usuario.avatarURL(),
          name: usuario.username,
        })
        .setDescription(`Se ha reabierto el tique <${canalTique.name}>`);

      await canalDeRegistrosDeTiques.send({
        embeds: [embed],
      });
    } catch (error) {
      this.log.error(error);
    }
  }

  private static async registrarEliminacionDeTique(
    servidor: Guild,
    canalTique: GuildTextBasedChannel,
    usuario: User,
  ): Promise<void> {
    try {
      const canalDeRegistrosDeTiques =
        await this.obtenerCanalDeRegistrosDeTiques(servidor, canalTique);

      const embed = await this.crearEmbedEstilizado();
      embed
        .setAuthor({
          iconURL: usuario.avatarURL(),
          name: usuario.username,
        })
        .setDescription(`Se ha eliminado el tique <${canalTique.name}>`);

      await canalDeRegistrosDeTiques.send({
        embeds: [embed],
      });

      await canalTique.delete();
    } catch (error) {
      this.log.error(error);
    }
  }
}
