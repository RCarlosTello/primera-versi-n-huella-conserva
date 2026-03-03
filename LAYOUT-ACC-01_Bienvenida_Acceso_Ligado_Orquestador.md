# Layout: Bienvenida + Acceso ligado (Orquestador)

## Identificador

| Campo | Valor |
|---|---|
| `id` | `Layout_Ecosistema` |

---

## Módulo: Bienvenida

### Disparadores de evento

- `hola`
- `saludo`
- `primera_interaccion`
- `cualquier_mensaje`

### Mensaje homologado (saludo)

> ¡Hola! 👋🌿
> Bienvenido(a) al Ecosistema Huella CONSERVA.
> 
> Estoy listo para apoyarte con información institucional, manuales, políticas, viáticos, capacitaciones y cualquier consulta relacionada con tu operación dentro de Grupo CONSERVA.
> 
> Para comenzar, indícame tu correo institucional.

---

## Módulo: Validación de acceso

### Parámetros principales

| Campo | Valor |
|---|---|
| `dominio_permitido` | `@grupoconserva.mx` |
| `bloqueo_sin_validacion` | `true` |

### Pasos de validación (flujo)

1. Solicitar correo institucional en el primer mensaje.
2. Normalizar correo (minúsculas, sin espacios).
3. Validar contra el catálogo de accesos del Ecosistema CONSERVA.
4. Si existe y acceso_autorizado=true, devolver módulos habilitados.
5. Si no existe o acceso_autorizado=false, bloquear.

### Mensajes del sistema

| Clave | Mensaje |
|---|---|
| `solicitar_correo` | Para registrar tu usuario y validar tu acceso, indícame tu correo institucional (ej. nombre@grupoconserva.mx). |
| `correo_no_encontrado` | No encontré tu correo en el listado de accesos del Ecosistema Huella CONSERVA. Por el momento no puedo habilitar módulos. Si consideras que debes tener acceso, solicita tu alta o actualización por los canales institucionales correspondientes. |
| `correo_encontrado` | Listo, tu usuario ha sido validado. Indícame qué módulo o tema institucional deseas consultar. |
| `bloqueo_sin_acceso` | No es posible continuar sin validación de correo institucional con acceso autorizado. |

---

## Salida estándar de validación

- **formato**: `json`

### Estructura esperada

```json
{
  "correo": "<correo_institucional_normalizado>",
  "acceso_autorizado": "<true|false>",
  "modulos_habilitados": []
}
```

---

## Control y restricciones

| Campo | Valor |
|---|---|
| `no_divulgar_catalogo_usuarios` | `true` |
| `autoridad_validacion` | `Dirección de Riesgos y Crédito` |