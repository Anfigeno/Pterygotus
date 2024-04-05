import pino from "pino";

export default class Caverna {
  private readonly urlApi = "http://0.0.0.0:8000/api";
  private readonly log = pino();

  private readonly tokenApi: string;

  public tiques: Tiques;
  public rolesDeAdministracion: RolesDeAdministracion;
  public embeds: Embeds;
  public canalesDeRegistros: CanalesDeRegistros;

  constructor(tokenApi: string) {
    this.tokenApi = tokenApi;
  }

  public async obtenerTiques(): Promise<void> {
    const url = `${this.urlApi}/tiques`;

    try {
      const respuesta = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Autorizacion: this.tokenApi,
        },
      });

      const datos = await respuesta.json();

      this.tiques = {
        idCanalDeRegistros: datos.id_canal_registros,
        idCategoria: datos.id_categoria,
        cantidad: datos.cantidad,
      };
    } catch (error) {
      this.log.error(error);

      await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Autorizacion: this.tokenApi,
        },
      });

      this.tiques = {
        idCanalDeRegistros: null,
        idCategoria: null,
        cantidad: null,
      };
    }
  }

  public async obtenerRolesDeAdministracion(): Promise<void> {
    const url = `${this.urlApi}/roles_administracion`;

    try {
      const respuesta = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Autorizacion: this.tokenApi,
        },
      });

      const datos = await respuesta.json();

      this.rolesDeAdministracion = {
        idAdministrador: datos.id_administrador,
        idDirector: datos.id_director,
        idModerador: datos.id_moderador,
        idSoporte: datos.id_soporte,
        idInterno: datos.id_interno,
      };
    } catch (error) {
      this.log.error(error);

      await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Autorizacion: this.tokenApi,
        },
      });

      this.rolesDeAdministracion = {
        idAdministrador: null,
        idDirector: null,
        idModerador: null,
        idSoporte: null,
        idInterno: null,
      };
    }
  }

  public async obtenerEmbeds(): Promise<void> {
    const url = `${this.urlApi}/embeds`;

    try {
      const respuesta = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Autorizacion: this.tokenApi,
        },
      });

      const datos = await respuesta.json();

      this.embeds = {
        color: datos.color,
        urlImaginLimitadora: datos.url_imagen_limitadora,
      };
    } catch (error) {
      this.log.error(error);

      await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Autorizacion: this.tokenApi,
        },
      });

      this.embeds = {
        color: null,
        urlImaginLimitadora: null,
      };
    }
  }

  public async obtenerCanalesDeRegistros(): Promise<void> {
    const url = `${this.urlApi}/canales_registros`;

    try {
      const respuesta = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Autorizacion: this.tokenApi,
        },
      });

      const datos = await respuesta.json();

      this.canalesDeRegistros = {
        idCanalMensajes: datos.id_canal_mensajes,
        idCanalVoz: datos.id_canal_voz,
        idCanalUsuarios: datos.id_canal_usuarios,
        idCanalSanciones: datos.id_canal_sanciones,
        idCanalServidor: datos.id_canal_servidor,
      };
    } catch (error) {
      this.log.error(error);

      await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Autorizacion: this.tokenApi,
        },
      });

      this.canalesDeRegistros = {
        idCanalMensajes: null,
        idCanalVoz: null,
        idCanalUsuarios: null,
        idCanalSanciones: null,
        idCanalServidor: null,
      };
    }
  }

  public async actualizarTiques(nuevosDatos: Tiques): Promise<void> {
    const url = `${this.urlApi}/tiques`;

    const respuesta = await fetch(url, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Autorizacion: this.tokenApi,
      },
      body: JSON.stringify({
        id_canal_registros: nuevosDatos.idCanalDeRegistros,
        id_categoria: nuevosDatos.idCategoria,
      }),
    });

    if (!respuesta.ok) {
      throw new Error(JSON.stringify(await respuesta.json()));
    }
  }

  public async actualizarCantidadTiques(): Promise<void> {
    const url = `${this.urlApi}/tiques/cantidad`;

    const respuesta = await fetch(url, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Autorizacion: this.tokenApi,
      },
    });

    if (!respuesta.ok) {
      throw new Error(JSON.stringify(await respuesta.json()));
    }
  }

  public async actualizarRolesDeAdministracion(
    nuevosDatos: RolesDeAdministracion,
  ): Promise<void> {
    const url = `${this.urlApi}/roles_administracion`;

    const respuesta = await fetch(url, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Autorizacion: this.tokenApi,
      },
      body: JSON.stringify({
        id_administrador: nuevosDatos.idAdministrador,
        id_director: nuevosDatos.idDirector,
        id_moderador: nuevosDatos.idModerador,
        id_soporte: nuevosDatos.idSoporte,
        id_interno: nuevosDatos.idInterno,
      }),
    });

    if (!respuesta.ok) {
      throw new Error(JSON.stringify(await respuesta.json()));
    }
  }

  public async actualizarEmbeds(nuevosDatos: Embeds): Promise<void> {
    const url = `${this.urlApi}/embeds`;

    const respuesta = await fetch(url, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Autorizacion: this.tokenApi,
      },
      body: JSON.stringify({
        color: nuevosDatos.color,
        url_imagen_limitadora: nuevosDatos.urlImaginLimitadora,
      }),
    });

    if (!respuesta.ok) {
      throw new Error(JSON.stringify(await respuesta.json()));
    }
  }

  public async actualizarCanalesDeRegistros(
    nuevosDatos: CanalesDeRegistros,
  ): Promise<void> {
    const url = `${this.urlApi}/canales_registros`;

    const respuesta = await fetch(url, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Autorizacion: this.tokenApi,
      },
      body: JSON.stringify({
        id_canal_mensajes: nuevosDatos.idCanalMensajes,
        id_canal_voz: nuevosDatos.idCanalVoz,
        id_canal_usuarios: nuevosDatos.idCanalUsuarios,
        id_canal_sanciones: nuevosDatos.idCanalSanciones,
        id_canal_servidor: nuevosDatos.idCanalServidor,
      }),
    });

    if (!respuesta.ok) {
      throw new Error(JSON.stringify(await respuesta.json()));
    }
  }
}

export interface Tiques {
  idCanalDeRegistros: string | null;
  idCategoria: string | null;
  cantidad: number | null;
}

export interface RolesDeAdministracion {
  idAdministrador: string | null;
  idDirector: string | null;
  idModerador: string | null;
  idSoporte: string | null;
  idInterno: string | null;
}

export interface Embeds {
  color: string | null;
  urlImaginLimitadora: string | null;
}

export interface CanalesDeRegistros {
  idCanalMensajes: string | null;
  idCanalVoz: string | null;
  idCanalUsuarios: string | null;
  idCanalSanciones: string | null;
  idCanalServidor: string | null;
}
