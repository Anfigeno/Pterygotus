import AccionesBase from "@lib/AccionesBase";
import { GuildMember } from "discord.js";

export default class NuevoMiembro extends AccionesBase {
  public static async darRolesDeIngreso(miembro: GuildMember): Promise<void> {
    const rolesDeIngreso: string[] = [];

    await this.api.obtenerAutoroles();
    this.api.autoroles.forEach((autorol) => {
      if (autorol.tipo !== "ingreso") return;

      rolesDeIngreso.push(autorol.id);
    });

    miembro.roles.add(rolesDeIngreso);
    this.log.info(miembro);
  }
}
