import AccionesBase from "@lib/AccionesBase";
import {
  ActionRowBuilder,
  CommandInteraction,
  Guild,
  GuildMember,
  Interaction,
  ModalBuilder,
  ModalSubmitInteraction,
  PermissionFlagsBits,
  StringSelectMenuBuilder,
  StringSelectMenuInteraction,
  StringSelectMenuOptionBuilder,
  TextChannel,
  TextInputBuilder,
  TextInputStyle,
} from "discord.js";

export default class PanelDeTiques extends AccionesBase {
  public static async manejarInteraccion(
    interaccion: Interaction,
  ): Promise<void> {
    if (interaccion.isCommand()) {
      await this.crearPanelDeTiques(interaccion);
    } else if (interaccion.isStringSelectMenu()) {
      await this.modalTiqueDeServicio(interaccion);
    } else if (interaccion.isModalSubmit()) {
      await this.crearTiqueDeServicio(interaccion);
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

    const guild = interaccion.guild;
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

    const idCanalRegistrosTiques = this.api.tiques.idCanalDeRegistros;
    const canalRegistrosTiquesExiste = this.canalExiste(
      guild,
      idCanalRegistrosTiques,
      "Canal de registros",
    );

    if (!canalRegistrosTiquesExiste) {
      await interaccion.reply({
        content: "Ocurrió un error al crear el tique.",
        ephemeral: true,
      });

      return;
    }

    const autorInteraccion = interaccion.user;
    const cantidadTiques = this.api.tiques.cantidad;
    const idCategoriaTiques = this.api.tiques.idCategoria;
    const rolEveryone = guild.roles.everyone;

    try {
      const canalTique = await guild.channels.create({
        name: `${emoji}・${autorInteraccion.username}-${cantidadTiques}`,
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
            id: autorInteraccion.id,
            allow: [PermissionFlagsBits.ViewChannel],
          },
        ],
      });

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

    await canalTique.send({
      content: `<@&${idRolSoporte}> <@${idAutorInteraccion}>`,
      embeds: [embedResumen],
    });

    await interaccion.reply({
      content: `Tique creado en <#${canalTique.id}>.`,
      ephemeral: true,
    });
  }
}
