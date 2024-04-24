class ConstructorApi {
  protected urlApi = "http://0.0.0.0:8000/api";
  protected tokenApi: string;

  constructor(tokenApi: string) {
    this.tokenApi = tokenApi;
  }

  protected headers = {
    "Content-Type": "application/json",
    Autorizacion: this.tokenApi,
  };
}

export default class Caverna extends ConstructorApi {
  public tiques = new Tiques(this.tokenApi);
  public rolesDeAdministracion = new RolesDeAdministracion(this.tokenApi);
  public embeds = new Embeds(this.tokenApi);
  public canalesDeRegistros: CanalesDeRegistros;
  public autoroles: Autorol[] = [];
  public canalesImportantes: CanalesImportantes;

  public async obtenerCanalesDeRegistros(): Promise<void> {
    const url = `${this.urlApi}/canales_registros`;

    const respuesta = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Autorizacion: this.tokenApi,
      },
    });

    if (respuesta.ok) {
      const datos = await respuesta.json();

      this.canalesDeRegistros = {
        idCanalMensajes: datos.id_canal_mensajes,
        idCanalVoz: datos.id_canal_voz,
        idCanalUsuarios: datos.id_canal_usuarios,
        idCanalSanciones: datos.id_canal_sanciones,
        idCanalServidor: datos.id_canal_servidor,
      };

      return;
    }

    const creacion = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Autorizacion: this.tokenApi,
      },
    });

    if (!creacion.ok) {
      throw new Error(JSON.stringify(await creacion.json()));
    }

    this.canalesDeRegistros = {
      idCanalMensajes: null,
      idCanalVoz: null,
      idCanalUsuarios: null,
      idCanalSanciones: null,
      idCanalServidor: null,
    };
  }

  public async obtenerAutoroles(): Promise<void> {
    const url = `${this.urlApi}/autoroles`;

    const respuesta = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Autorizacion: this.tokenApi,
      },
    });

    if (respuesta.ok) {
      const datos = await respuesta.json();
      this.autoroles = datos.map((dato) => {
        return {
          id: dato.id_rol,
          nombre: dato.nombre,
          emoji: dato.emoji,
          tipo: dato.tipo,
        };
      });
      return;
    }

    const creacion = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Autorizacion: this.tokenApi,
      },
    });

    if (!creacion.ok) {
      throw new Error(await creacion.json());
    }

    this.autoroles = [];
  }

  public async obtenerCanalesImportantes(): Promise<void> {
    const url = `${this.urlApi}/canales_importantes`;

    const respuesta = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Autorizacion: this.tokenApi,
      },
    });

    if (respuesta.ok) {
      const datos = await respuesta.json();
      this.canalesImportantes = {
        idCanalSugerencias: datos.id_canal_sugerencias,
      };

      return;
    }

    const creacion = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Autorizacion: this.tokenApi,
      },
    });

    if (!creacion.ok) {
      throw new Error(await creacion.json());
    }

    this.canalesImportantes = {
      idCanalSugerencias: null,
    };
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

  public async actualizarAutoroles(nuevosDatos: Autorol[]): Promise<void> {
    const url = `${this.urlApi}/autoroles`;

    const respuesta = await fetch(url, {
      headers: {
        "Content-Type": "application/json",
        Autorizacion: this.tokenApi,
      },
      method: "PUT",
      body: JSON.stringify(
        nuevosDatos.map((dato) => {
          return {
            id_rol: dato.id,
            nombre: dato.nombre,
            emoji: dato.emoji,
            tipo: dato.tipo,
          };
        }),
      ),
    });

    if (!respuesta.ok) {
      throw new Error(await respuesta.json());
    }
  }

  public async actualizarCanalesImportantes(
    nuevosDatos: CanalesImportantes,
  ): Promise<void> {
    const url = `${this.urlApi}/canales_importantes`;

    const respuesta = await fetch(url, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Autorizacion: this.tokenApi,
      },
      body: JSON.stringify({
        id_canal_sugerencias: nuevosDatos.idCanalSugerencias,
      }),
    });

    if (!respuesta.ok) {
      throw new Error(await respuesta.json());
    }
  }
}

class Tiques extends ConstructorApi implements ManejarTablas {
  public ruta = `${this.urlApi}/tiques`;

  public idCanalDeRegistros: string;
  public idCategoria: string;
  public cantidad: number;

  /*
   * Hace una petición GET a la api y rellena los datos con esa información
   * */
  public async obtener(): Promise<void> {
    const respuesta = await fetch(this.ruta, {
      method: "GET",
      headers: this.headers,
    });

    if (!respuesta.ok) {
      const error = JSON.stringify(await respuesta.json());

      throw new Error(
        `Error al obtener la información de los tiques: ${error}`,
      );
    }

    const datos: DatosTiquesApi = await respuesta.json();

    this.idCanalDeRegistros = datos.id_canal_registros;
    this.idCategoria = datos.id_categoria;
    this.cantidad = parseInt(datos.cantidad);
  }

  public async actualizar(nuevosDatos: DatosTiques): Promise<void> {
    const nuevosDatosApi: DatosTiquesApi = {
      id_canal_registros: nuevosDatos.idCanalDeRegistros,
      id_categoria: nuevosDatos.idCategoria,
    };

    const respuesta = await fetch(this.ruta, {
      method: "PUT",
      headers: this.headers,
      body: JSON.stringify(nuevosDatosApi),
    });

    if (!respuesta.ok) {
      const error = JSON.stringify(await respuesta.json());

      throw new Error(`
        Error al actualizar la información de los tiques: ${error}
      `);
    }
  }

  public async actualizarCantidad(): Promise<void> {
    const respuesta = await fetch(`${this.ruta}/cantidad`, {
      method: "PUT",
      headers: this.headers,
    });

    if (!respuesta.ok) {
      const error = JSON.stringify(await respuesta.json());

      throw new Error(`Error al actualizar la cantidad de tiques: ${error}`);
    }

    this.cantidad += 1;
  }
}

class RolesDeAdministracion
  extends ConstructorApi
  implements ManejarTablas, DatosRolesDeAdministracion
{
  public ruta = `${this.urlApi}/roles_administracion`;

  public idAdministrador: string;
  public idDirector: string;
  public idModerador: string;
  public idSoporte: string;
  public idInterno: string;

  /**
   * Hace una petición GET a la api y rellena los datos con esta info
   **/
  public async obtener(): Promise<void> {
    const respuesta = await fetch(this.ruta, {
      method: "GET",
      headers: this.headers,
    });

    if (!respuesta.ok) {
      const error = JSON.stringify(await respuesta.json());

      throw new Error(`Error al obtener los roles de administración: ${error}`);
    }

    const datos: DatosRolesDeAdministracionApi = await respuesta.json();
    this.idAdministrador = datos.id_administrador;
    this.idDirector = datos.id_director;
    this.idModerador = datos.id_moderador;
    this.idSoporte = datos.id_soporte;
    this.idInterno = datos.id_interno;
  }

  /**
   * Actualiza los datos de la api con una petición PUT
   * No actualiza los datos de la clase
   **/
  public async actualizar(
    nuevosDatos: DatosRolesDeAdministracion,
  ): Promise<void> {
    const nuevosDatosApi: DatosRolesDeAdministracionApi = {
      id_administrador: nuevosDatos.idAdministrador,
      id_director: nuevosDatos.idDirector,
      id_moderador: nuevosDatos.idModerador,
      id_soporte: nuevosDatos.idSoporte,
      id_interno: nuevosDatos.idInterno,
    };

    const respuesta = await fetch(this.ruta, {
      method: "PUT",
      headers: this.headers,
      body: JSON.stringify(nuevosDatosApi),
    });

    if (!respuesta.ok) {
      const error = JSON.stringify(await respuesta.json());

      throw new Error(
        `Error al actualizar los roles de administración: ${error}`,
      );
    }
  }
}

class Embeds extends ConstructorApi implements ManejarTablas, DatosEmbeds {
  public ruta = `${this.urlApi}/embeds`;

  public color: string;
  public urlImaginLimitadora: string;

  public async obtener(): Promise<void> {
    const respuesta = await fetch(this.ruta, {
      method: "GET",
      headers: this.headers,
    });

    if (!respuesta.ok) {
      const error = JSON.stringify(await respuesta.json());

      throw new Error(`Error al obtener los embeds: ${error}`);
    }

    const datos: DatosEmbedsApi = await respuesta.json();

    this.color = datos.color;
    this.urlImaginLimitadora = datos.url_imagen_limitadora;
  }

  public async actualizar(nuevosDatos: DatosEmbeds): Promise<void> {
    const nuevosDatosApi: DatosEmbedsApi = {
      color: nuevosDatos.color,
      url_imagen_limitadora: nuevosDatos.urlImaginLimitadora,
    };

    const respuesta = await fetch(this.ruta, {
      method: "PUT",
      headers: this.headers,
      body: JSON.stringify(nuevosDatosApi),
    });

    if (!respuesta.ok) {
      const error = JSON.stringify(await respuesta.json());

      throw new Error(`Error al actualizar los embeds: ${error}`);
    }
  }
}

interface ManejarTablas {
  ruta: string;
  obtener(): Promise<void>;
  actualizar(nuevosDatos: any): Promise<void>;
}

export type DatosTiques = {
  idCanalDeRegistros: string | null;
  idCategoria: string | null;
  cantidad: number | null;
};

type DatosTiquesApi = {
  id_canal_registros: string | null;
  id_categoria: string | null;
  cantidad?: string | null;
};

export type DatosRolesDeAdministracion = {
  idAdministrador: string | null;
  idDirector: string | null;
  idModerador: string | null;
  idSoporte: string | null;
  idInterno: string | null;
};

type DatosRolesDeAdministracionApi = {
  id_administrador: string | null;
  id_director: string | null;
  id_moderador: string | null;
  id_soporte: string | null;
  id_interno: string | null;
};

export type DatosEmbeds = {
  color: string | null;
  urlImaginLimitadora: string | null;
};

type DatosEmbedsApi = {
  color: string | null;
  url_imagen_limitadora: string | null;
};

export interface CanalesDeRegistros {
  idCanalMensajes: string | null;
  idCanalVoz: string | null;
  idCanalUsuarios: string | null;
  idCanalSanciones: string | null;
  idCanalServidor: string | null;
}

export interface Autorol {
  id: string | null;
  nombre: string | null;
  emoji: string | null;
  tipo: "lenguaje" | "nivel" | "edad" | "ingreso" | string | null;
}

export interface CanalesImportantes {
  idCanalSugerencias: string | null;
}
