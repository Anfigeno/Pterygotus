import AccionesBase from "@lib/AccionesBase";
import { Autorol } from "@lib/Caverna";
import {
  ActionRowBuilder,
  CommandInteraction,
  GuildMember,
  GuildTextBasedChannel,
  Interaction,
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder,
} from "discord.js";

export default class PanelDeAutoroles extends AccionesBase {
  public static async manejarInteraccion(
    interaccion: Interaction,
  ): Promise<void> {
    if (interaccion.isCommand()) {
      await this.crearPanelDeAutoroles(interaccion);
    }
  }

  private static async crearPanelDeAutoroles(interaccion: CommandInteraction) {
    if (interaccion.commandName !== "panel-de-autoroles") return;

    const { channel: canal, member: miembro } = interaccion;
    if (!this.esAdmin(miembro as GuildMember)) {
      await interaccion.reply({
        content: "No tienes permisos para ejecutar esta interacción",
        ephemeral: true,
      });

      return;
    }

    await this.crearSelectorDeLenguajes(canal);
    await this.crearSelectorDeNivel(canal);
    await this.crearSelectorDeEdad(canal);

    await interaccion.reply({
      content: "Panel de autoroles creado!",
      ephemeral: true,
    });
  }

  private static async crearSelectorDeLenguajes(
    canal: GuildTextBasedChannel,
  ): Promise<void> {
    const embed = await this.crearEmbedEstilizado();
    embed.setTitle("🐘 ¿Qué lenguajes de programación dominas?");

    await this.api.obtenerAutoroles();

    const autorolesValidos: Autorol[] = [];

    this.api.autoroles.forEach((autorol) => {
      if (autorol.tipo !== "lenguaje") return;

      autorolesValidos.push(autorol);
    });

    const opciones: StringSelectMenuOptionBuilder[] = [];

    if (autorolesValidos.length === 0) {
      opciones.push(
        new StringSelectMenuOptionBuilder()
          .setEmoji("❌")
          .setLabel("Lista de autoroles vacía")
          .setValue("invalido"),
      );
    } else {
      autorolesValidos.forEach((autorol) =>
        opciones.push(
          new StringSelectMenuOptionBuilder()
            .setEmoji(autorol.emoji)
            .setLabel(autorol.nombre)
            .setValue(`autorol-lenguaje-${autorol.nombre}`),
        ),
      );
    }

    const controles =
      new ActionRowBuilder<StringSelectMenuBuilder>().setComponents(
        new StringSelectMenuBuilder()
          .setMaxValues(opciones.length)
          .setCustomId("selector-de-lenguajes")
          .setOptions(opciones),
      );

    await canal.send({
      embeds: [embed],
      components: [controles],
    });
  }

  private static async crearSelectorDeNivel(
    canal: GuildTextBasedChannel,
  ): Promise<void> {
    const embed = await this.crearEmbedEstilizado();
    embed.setTitle("🆙 ¿Qué nivel crees tener?");

    await this.api.obtenerAutoroles();
    const autorolesValidos: Autorol[] = [];

    this.api.autoroles.forEach(async (autorol) => {
      if (autorol.tipo !== "nivel") return;

      autorolesValidos.push(autorol);
    });

    const opciones: StringSelectMenuOptionBuilder[] = [];

    if (autorolesValidos.length === 0) {
      opciones.push(
        new StringSelectMenuOptionBuilder()
          .setEmoji("❌")
          .setLabel("Lista de autoroles vacía!")
          .setValue("invalido"),
      );
    } else {
      autorolesValidos.forEach((autorol) => {
        opciones.push(
          new StringSelectMenuOptionBuilder()
            .setEmoji(autorol.emoji)
            .setLabel(autorol.nombre)
            .setValue(`autorol-nivel-${autorol.nombre}`),
        );
      });
    }

    const controles =
      new ActionRowBuilder<StringSelectMenuBuilder>().setComponents(
        new StringSelectMenuBuilder()
          .setMaxValues(1)
          .setCustomId("selector-de-nivel")
          .setOptions(opciones),
      );

    await canal.send({
      embeds: [embed],
      components: [controles],
    });
  }

  private static async crearSelectorDeEdad(
    canal: GuildTextBasedChannel,
  ): Promise<void> {
    const embed = await this.crearEmbedEstilizado();
    embed.setTitle("👶 ¿Qué edad tienes?");

    await this.api.obtenerAutoroles();
    const autorolesValidos: Autorol[] = [];

    this.api.autoroles.forEach(async (autorol) => {
      if (autorol.tipo !== "edad") return;

      autorolesValidos.push(autorol);
    });

    const opciones: StringSelectMenuOptionBuilder[] = [];

    if (autorolesValidos.length === 0) {
      opciones.push(
        new StringSelectMenuOptionBuilder()
          .setEmoji("❌")
          .setLabel("Lista de autoroles vacía!")
          .setValue("invalido"),
      );
    } else {
      autorolesValidos.forEach((autorol) => {
        opciones.push(
          new StringSelectMenuOptionBuilder()
            .setEmoji(autorol.emoji)
            .setLabel(autorol.nombre)
            .setValue(`autorol-edad-${autorol.nombre}`),
        );
      });
    }

    const controles =
      new ActionRowBuilder<StringSelectMenuBuilder>().setComponents(
        new StringSelectMenuBuilder()
          .setMaxValues(1)
          .setCustomId("selector-de-edad")
          .setOptions(opciones),
      );

    await canal.send({
      embeds: [embed],
      components: [controles],
    });
  }
}
