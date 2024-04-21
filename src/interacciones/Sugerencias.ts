import AccionesBase from "@lib/AccionesBase";
import {
  ActionRowBuilder,
  CommandInteraction,
  Guild,
  Interaction,
  ModalBuilder,
  ModalSubmitInteraction,
  TextChannel,
  TextInputBuilder,
  TextInputStyle,
} from "discord.js";

export default class Sugerencias extends AccionesBase {
  public static async manejarInteraccion(
    interaccion: Interaction,
  ): Promise<void> {
    if (interaccion.isCommand()) {
      //
      this.modalCrearSugerencia(interaccion);
      //
    } else if (interaccion.isModalSubmit()) {
      //
      this.crearSugerencia(interaccion);
      //
    }
  }

  private static async obtenerCanalDeSugerencias(
    servidor: Guild,
  ): Promise<TextChannel | void> {
    await this.api.obtenerCanalesImportantes();

    const { idCanalSugerencias } = this.api.canalesImportantes;

    if (idCanalSugerencias === null) {
      throw new Error("El id del canal de sugerencias no ha sido definido");
    }

    const canalDeSugerencias =
      await servidor.channels.fetch(idCanalSugerencias);
    if (!canalDeSugerencias) {
      throw new Error("El canal de sugerencias no existe");
    }

    if (!canalDeSugerencias.isTextBased()) {
      throw new Error("El canal de sugerencias no es un canal de texto");
    }

    return canalDeSugerencias as TextChannel;
  }

  private static async modalCrearSugerencia(
    interaccion: CommandInteraction,
  ): Promise<void> {
    if (interaccion.commandName !== "crear-sugerencia") return;

    const campos: TextInputBuilder[] = [
      new TextInputBuilder()
        .setLabel("Titulo de tu sugerencia")
        .setCustomId("campo-titulo-sugerencia")
        .setStyle(TextInputStyle.Short)
        .setRequired(true),

      new TextInputBuilder()
        .setLabel("Describe tu sugerencia")
        .setCustomId("campo-descripcion-sugerencia")
        .setStyle(TextInputStyle.Paragraph)
        .setRequired(true),

      new TextInputBuilder()
        .setLabel("Imágen")
        .setCustomId("campo-url-imagen")
        .setStyle(TextInputStyle.Short)
        .setRequired(false),
    ];

    const modal = new ModalBuilder()
      .setCustomId("modal-crear-sugerencia")
      .setTitle("💡 Crear una sugerencia")
      .setComponents(
        campos.map((campo) =>
          new ActionRowBuilder<TextInputBuilder>().setComponents(campo),
        ),
      );

    await interaccion.showModal(modal);
  }

  private static async crearSugerencia(
    interaccion: ModalSubmitInteraction,
  ): Promise<void> {
    if (interaccion.customId !== "modal-crear-sugerencia") return;

    const { fields: campos, guild: servidor, user: usuario } = interaccion;

    const campoTituloSugerencia = campos.getTextInputValue(
      "campo-titulo-sugerencia",
    );
    const campoDescripcionSugerencia = campos.getTextInputValue(
      "campo-descripcion-sugerencia",
    );
    const campoUrlImagen = campos.getTextInputValue("campo-url-imagen");

    const embed = await this.crearEmbedEstilizado();
    embed
      .setAuthor({
        name: usuario.username,
        iconURL: usuario.avatarURL(),
      })
      .setTitle(campoTituloSugerencia)
      .setDescription(campoDescripcionSugerencia);

    if (campoUrlImagen) {
      try {
        embed.setThumbnail(campoUrlImagen);
      } catch (error) {
        await interaccion.reply({
          content: "La url de la imágen no es valida",
          ephemeral: true,
        });

        return;
      }
    }

    try {
      const canalSugerencias = (await this.obtenerCanalDeSugerencias(
        servidor,
      )) as TextChannel;
      const sugerencia = await canalSugerencias.send({
        embeds: [embed],
      });

      await sugerencia.react("👍");
      await sugerencia.react("👎");

      await interaccion.reply({
        content: `La sugerencia fue creada`,
        ephemeral: true,
      });
    } catch (error) {
      await interaccion.reply({
        content: "Ocurrió un error al intentar ejecutar esta interacción",
        ephemeral: true,
      });

      this.log.error("Ocurrió un error al intentar crear una sugerencia");
      this.log.error(error);

      return;
    }
  }
}
