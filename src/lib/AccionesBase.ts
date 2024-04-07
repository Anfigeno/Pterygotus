import pino from "pino";
import Caverna from "./Caverna";
import { ColorResolvable, EmbedBuilder, Guild, GuildMember } from "discord.js";

export default class AccionesBase {
  public static log = pino();
  public static api = new Caverna(this.env("TOKEN_API"));

  public static env(clave: string): string {
    const variableDeEntorno = process.env[clave];

    if (!variableDeEntorno) {
      throw new Error(`La variable de entorno ${clave} no existe`);
    }

    return variableDeEntorno;
  }

  public static async crearEmbedEstilizado(): Promise<EmbedBuilder> {
    const embed = new EmbedBuilder();

    await this.api.obtenerEmbeds();

    try {
      embed.setColor(this.api.embeds.color as ColorResolvable);
    } catch (error) {
      this.log.error(
        "No se pudo establecer el color de un embed, ya que el color no es valido",
      );
    }

    try {
      embed.setImage(this.api.embeds.urlImaginLimitadora);
    } catch (error) {
      this.log.error(
        "No se pudo establecer la imagen de un embed, ya que la imagen no es valida",
      );
    }

    return embed;
  }

  public static esAdmin(autor: GuildMember): boolean {
    return autor.permissions.has("Administrator");
  }

  public static rolExiste(
    guilg: Guild,
    rolId: string,
    nombre: string,
  ): boolean {
    const rol = guilg.roles.cache.get(rolId);

    if (!rol) {
      this.log.error(`El rol ${nombre} no existe o no es valido`);
      return false;
    }

    return true;
  }

  public static canalExiste(
    guilg: Guild,
    canalId: string,
    nombre: string,
  ): boolean {
    const canal = guilg.channels.cache.get(canalId);

    if (!canal) {
      this.log.error(`El canal ${nombre} no existe o no es valido`);
      return false;
    }

    return true;
  }
}
