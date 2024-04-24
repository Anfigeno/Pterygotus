import AccionesBase from "@lib/AccionesBase";
import { GuildMember } from "discord.js";

export default class NuevoMiembro extends AccionesBase {
  public static async darRolesDeIngreso(miembro: GuildMember): Promise<void> {
    const rolesDeIngreso: string[] = [];

    await this.api.autoroles.obtener();
    this.api.autoroles.roles.forEach((autorol) => {
      if (autorol.tipo !== "ingreso") return;

      rolesDeIngreso.push(autorol.id);
    });

    miembro.roles.add(rolesDeIngreso);
  }
}
