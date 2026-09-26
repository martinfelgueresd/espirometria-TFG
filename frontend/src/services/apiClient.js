const CONNECTION_MESSAGE = "No se ha podido conectar con el servidor. Comprueba que el backend está en marcha.";
const DEFAULT_MESSAGE = "No se ha podido completar la operación. Inténtalo de nuevo más tarde.";

const FALLBACK_MESSAGES = {
    404: "El recurso solicitado no existe.",
    413: "El fichero supera el tamaño máximo permitido.",
    500: "Ha ocurrido un error inesperado en el servidor. Inténtalo de nuevo más tarde.",
};

// Error de una petición al backend. Además del mensaje, trae lo que el backend manda en su formato de error:
// code (tipo de error), fieldErrors (errores por campo de un formulario) y details (datos extra).
export class ApiError extends Error {
    constructor(message, { status = null, code = null, fieldErrors = {}, details = {} } = {}) {
        super(message);
        this.name = "ApiError";
        this.status = status;
        this.code = code;
        this.fieldErrors = fieldErrors;
        this.details = details;
    }
}

const readErrorBody = async (response) => {
    try {
        return await response.json();
    } catch {
        return null;
    }
};

export const request = async (url, options) => {
    let response;
    try {
        response = await fetch(url, options);
    } catch {
        throw new ApiError(CONNECTION_MESSAGE);
    }

    if (!response.ok) {
        const body = await readErrorBody(response);
        const message = (typeof body?.message === "string" && body.message)
            || FALLBACK_MESSAGES[response.status]
            || DEFAULT_MESSAGE;

        throw new ApiError(message, {
            status: response.status,
            code: body?.code ?? null,
            fieldErrors: body?.fieldErrors ?? {},
            details: body?.details ?? {},
        });
    }
    return response;
};

export const requestJson = async (url, options) => {
    const response = await request(url, options);
    try {
        return await response.json();
    } catch {
        throw new ApiError(DEFAULT_MESSAGE, { status: response.status });
    }
};
