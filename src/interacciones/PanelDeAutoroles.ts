import AccionesBase from "@lib/AccionesBase";
import { DatosAutorol } from "@lib/Caverna";
import {
  ActionRowBuilder,
  CommandInteraction,
  GuildMember,
  GuildTextBasedChannel,
  Interaction,
  StringSelectMenuBuilder,
  StringSelectMenuInteraction,
  StringSelectMenuOptionBuilder,
} from "discord.js";

export default class PanelDeAutoroles extends AccionesBase {
  public static async manejarInteraccion(
    interaccion: Interaction,
  ): Promise<void> {
    if (interaccion.isCommand()) {
      //
      await this.crearPanelDeAutoroles(interaccion);
      //
    } else if (interaccion.isStringSelectMenu()) {
      //
      await this.darRolesDeLenguaje(interaccion);
      await this.darRolDeNivel(interaccion);
      await this.darRolDeEdad(interaccion);
      //
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

    await this.api.autoroles.obtener();

    const autorolesValidos: DatosAutorol[] = [];

    this.api.autoroles.roles.forEach((autorol) => {
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

    await this.api.autoroles.obtener();
    const autorolesValidos: DatosAutorol[] = [];

    this.api.autoroles.roles.forEach(async (autorol) => {
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

    await this.api.autoroles.obtener();
    const autorolesValidos: DatosAutorol[] = [];

    this.api.autoroles.roles.forEach(async (autorol) => {
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

  private static async darRolesDeLenguaje(
    interaccion: StringSelectMenuInteraction,
  ): Promise<void> {
    if (interaccion.customId !== "selector-de-lenguajes") return;

    const { values: valores, member: miembro, user: usuario } = interaccion;

    const nombresAutorolesQueDar: string[] = valores.map((valor) =>
      valor.slice(17),
    );
    const idAutorolesQueDar: string[] = [];

    await this.api.autoroles.obtener();
    this.api.autoroles.roles.forEach((autorol) =>
      nombresAutorolesQueDar.forEach((nombreAutorol) => {
        if (autorol.nombre === nombreAutorol) {
          idAutorolesQueDar.push(autorol.id);
        }
      }),
    );

    try {
      miembro.roles.add(idAutorolesQueDar);
    } catch (error) {
      this.log.error(
        `Ocurrió un error al intentar dar los autoroles de lenguaje al usuario ${usuario.username}`,
      );
      this.log.error(error);

      await interaccion.reply({
        content: "Ocurrió un error al ejecutar esta interacción",
        ephemeral: true,
      });

      return;
    }

    await interaccion.reply({
      content: "Autoroles añadidos!",
      ephemeral: true,
    });
  }

  private static async darRolDeNivel(
    interaccion: StringSelectMenuInteraction,
  ): Promise<void> {
    if (interaccion.customId !== "selector-de-nivel") return;

    const { values: valores, member: miembro, user: usuario } = interaccion;

    const nombreAutorolQueDar: string = valores[0].slice(14);
    let idAutorolQueDar: string;

    await this.api.autoroles.obtener();
    this.api.autoroles.roles.forEach((autorol) => {
      if (autorol.nombre === nombreAutorolQueDar) {
        idAutorolQueDar = autorol.id;
        return;
      }
    });

    try {
      miembro.roles.add(idAutorolQueDar);
    } catch (error) {
      this.log.error(
        `Ocurrió un error al intentar dar el autorol de nivel al usuario ${usuario.username}`,
      );
      this.log.error(error);

      await interaccion.reply({
        content: "Ocurrió un error al intentar ejecutar esta interacción",
        ephemeral: true,
      });

      return;
    }

    await interaccion.reply({
      content: "Autorol añadido!",
      ephemeral: true,
    });
  }

  private static async darRolDeEdad(
    interaccion: StringSelectMenuInteraction,
  ): Promise<void> {
    if (interaccion.customId !== "selector-de-edad") return;

    const { values: valores, member: miembro, user: usuario } = interaccion;

    const nombreAutorolQueDar: string = valores[0].slice(13);
    let idAutorolQueDar: string;

    await this.api.autoroles.obtener();
    this.api.autoroles.roles.forEach((autorol) => {
      if (autorol.nombre === nombreAutorolQueDar) {
        idAutorolQueDar = autorol.id;
      }
    });

    try {
      miembro.roles.add(idAutorolQueDar);
    } catch (error) {
      this.log.error(
        `Ocurrió un error al intentar dar el autorol de edad al usuario ${usuario.username}`,
      );
      this.log.error(error);

      await interaccion.reply({
        content: "Ocurrió un error al intentar ejecutar esta interacción",
        ephemeral: true,
      });

      return;
    }

    interaccion.reply({
      content: "Autorol añadido!",
      ephemeral: true,
    });
  }
}
