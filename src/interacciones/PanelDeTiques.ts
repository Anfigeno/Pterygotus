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
      //
    } else if (interaccion.isModalSubmit()) {
      //
      await this.crearTiqueDeServicio(interaccion);
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

  private static async modalTiqueDeServicio(
    interaccion: StringSelectMenuInteraction,
  ): Promise<void> {
    if (interaccion.customId !== "panel-de-tiques-opciones") return;
    if (interaccion.values[0] !== "opcion-tique-servicio") return;

    const campoDescripcionServicio = new TextInputBuilder()
      .setCustomId("campo-descripcion-del-servicio")
      .setLabel("¿Qué tipo de servicio desea?")
      .setPlaceholder(
        "Quiero un ... que haga ... y tenga que ...\n (Sea muy descriptivo)",
      )
      .setStyle(TextInputStyle.Paragraph)
      .setRequired(true);

    const campoFechaDeEntrega = new TextInputBuilder()
      .setCustomId("campo-fecha-de-entrega")
      .setLabel("Fecha de entrega")
      .setPlaceholder("DD/MM/AAAA (opcional)")
      .setStyle(TextInputStyle.Short)
      .setRequired(false);

    const campoCostoDelServicio = new TextInputBuilder()
      .setCustomId("campo-costo-del-servicio")
      .setLabel("Costo del servicio USD")
      .setPlaceholder(
        "¿Crees que debería costar? (usamos esta info para ajustarnos a su presupuesto)",
      )
      .setStyle(TextInputStyle.Paragraph)
      .setRequired(false);

    const modal = new ModalBuilder()
      .setTitle("🪙 Contrata un servicio")
      .setCustomId("modal-tique-de-servicio")
      .setComponents(
        new ActionRowBuilder<TextInputBuilder>().setComponents(
          campoDescripcionServicio,
        ),

        new ActionRowBuilder<TextInputBuilder>().setComponents(
          campoFechaDeEntrega,
        ),

        new ActionRowBuilder<TextInputBuilder>().setComponents(
          campoCostoDelServicio,
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
      value: `> ${descripcionDelServicio}`,
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
