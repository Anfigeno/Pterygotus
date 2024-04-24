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
  public canalesDeRegistros = new CanalesDeRegistros(this.tokenApi);
  public autoroles = new Autoroles(this.tokenApi);
  public canalesImportantes = new CanalesImportantes(this.tokenApi);
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

class CanalesDeRegistros
  extends ConstructorApi
  implements ManejarTablas, DatosCanalesDeRegistros
{
  public ruta = `${this.urlApi}/canales_registros`;

  public idCanalMensajes: string;
  public idCanalVoz: string;
  public idCanalUsuarios: string;
  public idCanalSanciones: string;
  public idCanalServidor: string;

  public async obtener(): Promise<void> {
    const respuesta = await fetch(this.ruta, {
      method: "GET",
      headers: this.headers,
    });

    if (!respuesta.ok) {
      const error = JSON.stringify(await respuesta.json());

      throw new Error(`Error al obtener los canales de registros: ${error}`);
    }

    const datos: DatosCanalesDeRegistrosApi = await respuesta.json();

    this.idCanalUsuarios = datos.id_canal_usuarios;
    this.idCanalVoz = datos.id_canal_voz;
    this.idCanalMensajes = datos.id_canal_mensajes;
    this.idCanalSanciones = datos.id_canal_sanciones;
    this.idCanalServidor = datos.id_canal_servidor;
  }

  public async actualizar(nuevosDatos: DatosCanalesDeRegistros): Promise<void> {
    const nuevosDatosApi: DatosCanalesDeRegistrosApi = {
      id_canal_usuarios: nuevosDatos.idCanalUsuarios,
      id_canal_voz: nuevosDatos.idCanalVoz,
      id_canal_mensajes: nuevosDatos.idCanalMensajes,
      id_canal_sanciones: nuevosDatos.idCanalSanciones,
      id_canal_servidor: nuevosDatos.idCanalServidor,
    };

    const respuesta = await fetch(this.ruta, {
      method: "PUT",
      headers: this.headers,
      body: JSON.stringify(nuevosDatosApi),
    });

    if (!respuesta.ok) {
      const error = JSON.stringify(await respuesta.json());

      throw new Error(`Error al actualizar lo canales de registros: ${error}`);
    }
  }
}

class Autoroles extends ConstructorApi implements ManejarTablas {
  public ruta = `${this.urlApi}/autoroles`;
  public roles: DatosAutorol[] = [];

  public async obtener(): Promise<void> {
    const respuesta = await fetch(this.ruta, {
      method: "GET",
      headers: this.headers,
    });

    if (!respuesta.ok) {
      const error = JSON.stringify(await respuesta.json());

      throw new Error(`Error al obtener los autoroles: ${error}`);
    }

    const datos: DatosAutorolApi[] = await respuesta.json();

    this.roles = datos.map((dato) => {
      return {
        id: dato.id_rol,
        nombre: dato.nombre,
        emoji: dato.emoji,
        tipo: dato.tipo,
      };
    });
  }

  public async actualizar(nuevosDatos: DatosAutorol[]): Promise<void> {
    const nuevosDatosApi: DatosAutorolApi[] = nuevosDatos.map((dato) => {
      return {
        id_rol: dato.id,
        nombre: dato.nombre,
        tipo: dato.tipo,
        emoji: dato.emoji,
      };
    });

    const respuesta = await fetch(this.ruta, {
      method: "PUT",
      headers: this.headers,
      body: JSON.stringify(nuevosDatosApi),
    });

    if (!respuesta.ok) {
      const error = JSON.stringify(await respuesta.json());

      throw new Error(`Error al actualizar los autoroles: ${error}`);
    }
  }
}

class CanalesImportantes
  extends ConstructorApi
  implements ManejarTablas, DatosCanalesImportantes
{
  public ruta = `${this.urlApi}/canales_importantes`;

  public idCanalSugerencias: string;
  public idCanalGeneral: string;

  public async obtener(): Promise<void> {
    const respuesta = await fetch(this.ruta, {
      method: "GET",
      headers: this.headers,
    });

    if (!respuesta.ok) {
      const error = JSON.stringify(await respuesta.json());

      throw new Error(`Error al obtener los canales importantes: ${error}`);
    }

    const datos: DatosCanalesImportantesApi = await respuesta.json();

    this.idCanalSugerencias = datos.id_canal_sugerencias;
    this.idCanalGeneral = datos.id_canal_general;
  }

  public async actualizar(nuevosDatos: DatosCanalesImportantes): Promise<void> {
    const nuevosDatosApi: DatosCanalesImportantesApi = {
      id_canal_sugerencias: nuevosDatos.idCanalSugerencias,
      id_canal_general: nuevosDatos.idCanalGeneral,
    };

    const respuesta = await fetch(this.ruta, {
      method: "PUT",
      headers: this.headers,
      body: JSON.stringify(nuevosDatosApi),
    });

    if (!respuesta.ok) {
      const error = JSON.stringify(await respuesta.json());

      throw new Error(`Error al actualizar los canales importantes: ${error}`);
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

export type DatosCanalesDeRegistros = {
  idCanalMensajes: string | null;
  idCanalVoz: string | null;
  idCanalUsuarios: string | null;
  idCanalSanciones: string | null;
  idCanalServidor: string | null;
};

type DatosCanalesDeRegistrosApi = {
  id_canal_mensajes: string | null;
  id_canal_voz: string | null;
  id_canal_usuarios: string | null;
  id_canal_sanciones: string | null;
  id_canal_servidor: string | null;
};

export type DatosAutorol = {
  id: string | null;
  nombre: string | null;
  emoji: string | null;
  tipo: "lenguaje" | "nivel" | "edad" | "ingreso" | string | null;
};

type DatosAutorolApi = {
  id_rol: string | null;
  nombre: string | null;
  emoji: string | null;
  tipo: string | null;
};

export type DatosCanalesImportantes = {
  idCanalSugerencias: string | null;
  idCanalGeneral: string | null;
};

type DatosCanalesImportantesApi = {
  id_canal_sugerencias: string | null;
  id_canal_general: string | null;
};
