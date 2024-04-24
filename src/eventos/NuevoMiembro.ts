import AccionesBase from "@lib/AccionesBase";
import { GuildMember } from "discord.js";

export default class NuevoMiembro extends AccionesBase {
  public static async darRolesDeIngreso(miembro: GuildMember): Promise<void> {
    const rolesDeIngreso: string[] = [];

    const { autoroles } = this.api;
    await autoroles.obtener();
    autoroles.roles.forEach((autorol) => {
      if (autorol.tipo !== "ingreso") return;

      rolesDeIngreso.push(autorol.id);
    });

    miembro.roles.add(rolesDeIngreso);
  }

  public static async darleLaBienvenida(miembro: GuildMember): Promise<void> {
    const contexto = "Se intentó darle la bienvenida a un nuevo miembro";

    const { canalesImportantes, mensajesDelSistema } = this.api;
    await canalesImportantes.obtener();

    if (!canalesImportantes.idCanalGeneral) {
      this.log.error(
        `${contexto}, pero el id del canal general no está definido`,
      );
      return;
    }

    const { guild: servidor } = miembro;
    const canalGeneral = await servidor.channels.fetch(
      canalesImportantes.idCanalGeneral,
    );
    if (!canalGeneral) {
      this.log.error(`${contexto}, pero el canal general no existe`);
    }

    if (!canalGeneral.isTextBased()) {
      this.log.error(
        `${contexto}, pero el canal general no es una canal de texto`,
      );
    } else {
      await mensajesDelSistema.obtener();

      const mensajeDeBienvenida = mensajesDelSistema.bienvenida
        .split("{usuario}")
        .join(`${miembro}`);
      await canalGeneral.send({
        content: mensajeDeBienvenida,
      });
    }
  }
}
