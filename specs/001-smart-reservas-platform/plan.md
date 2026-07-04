# Implementation Plan: Plataforma web de gestión inteligente de reservas

**Branch**: `001-smart-reservas-platform` | **Date**: 2026-07-03 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/001-smart-reservas-platform/spec.md`

## Summary

Se implementará un MVP web monolítico modular con Next.js para la interfaz y la lógica de negocio, usando API Routes o un backend interno en Node.js dentro del mismo proyecto. La persistencia se realizará en SQL Server mediante un esquema relacional con tablas para usuarios, servicios, horarios, reservas y notificaciones. El enfoque priorizará autenticación básica, control de roles, gestión de servicios y horarios, reservas con validación de disponibilidad, agenda, filtros, reportes básicos y notificaciones internas, manteniendo el alcance realista para una entrega académica en tres días.

## Technical Context

**Language/Version**: TypeScript 5.x, Node.js 20.x

**Primary Dependencies**: Next.js 14+, React, Tailwind CSS, mssql, bcryptjs, zod, next-auth o JWT personalizado, Vitest, Supertest, Testing Library

**Storage**: SQL Server 2019+ (local development)

**Testing**: Vitest, Supertest, React Testing Library, Playwright opcional para smoke test

**Target Platform**: Navegadores web modernos, desktop y mobile responsive

**Project Type**: Web application (monolítica modular)

**Performance Goals**: Respuesta de pantallas y APIs en menos de 2 s para flujos básicos del MVP

**Constraints**: MVP entregable en 3 días, sin pagos, sin correos, sin WhatsApp, sin IA real, sin reprogramación avanzada, sin recurrencia avanzada de horarios

**Scale/Scope**: Pequeños negocios, número limitado de servicios y reservas, uso local o de desarrollo con SQL Server

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- ✅ Spec-first: la implementación se deriva directamente de la especificación aprobada.
- ✅ Aceptación verificable: cada requisito está traducido a escenarios testables y criterios de aceptación.
- ✅ Revisión humana de IA: el código generado con Copilot deberá ser revisado antes de aceptar cambios.
- ✅ Roles y negocio: se implementarán roles de administrador y cliente con permisos definidos.
- ✅ Integridad de datos: la base de datos incluirá PK, FK, restricciones y validaciones de negocio.
- ✅ Pruebas básicas: se incluirán pruebas mínimas para los flujos principales.
- ✅ Documentación: el proyecto incluirá README, capturas y explicación del enfoque SDD.

## Project Structure

### Documentation (this feature)

```text
specs/001-smart-reservas-platform/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
└── tasks.md
```

### Source Code (repository root)

```text
src/
├── app/
│   ├── api/
│   │   ├── auth/
│   │   ├── services/
│   │   ├── schedules/
│   │   ├── reservations/
│   │   ├── agenda/
│   │   ├── reports/
│   │   └── notifications/
│   ├── admin/
│   ├── client/
│   ├── login/
│   └── register/
├── components/
│   ├── common/
│   ├── admin/
│   └── client/
├── lib/
│   ├── auth/
│   ├── db/
│   ├── validation/
│   └── utils/
├── server/
│   ├── services/
│   ├── repositories/
│   └── middleware/
├── types/
├── styles/
└── tests/
    ├── unit/
    ├── integration/
    └── e2e/
```

**Structure Decision**: Se adoptará una arquitectura monolítica modular en Next.js con rutas de frontend, API Routes internas y una capa de acceso a datos separada. La separación permitirá desarrollar el MVP de forma ágil y mantener el código organizado para una entrega académica.

## Implementation Approach

### 1. Arquitectura propuesta

- Frontend: páginas y componentes en Next.js con App Router.
- Backend: API Routes en Next.js para manejar autenticación, servicios, horarios, reservas, agenda, reportes y notificaciones.
- Capa de datos: módulo dedicado para conexión a SQL Server y consultas parametrizadas.
- Seguridad: middleware de autenticación y autorización por rol, validación del lado del cliente y del servidor, hash de contraseñas y control de sesiones.
- Persistencia: SQL Server con tablas relacionales y restricciones.

### 2. Módulos técnicos

#### Autenticación
- Registro de usuario con validación de email y contraseña.
- Inicio y cierre de sesión.
- Hash de contraseñas con bcrypt.
- Sesión persistente para usuario autenticado.
- Protección de rutas según rol.

#### Roles
- Administrador: gestión de servicios, horarios, reservas y reportes.
- Cliente: registro, login, creación de reservas y visualización de sus reservas.

#### Servicios
- CRUD básico para servicios.
- Estado activo/inactivo.
- Validación de campos obligatorios.

#### Horarios
- Registro manual de horarios por fecha, hora de inicio y hora de fin.
- Marcar horario como ocupado cuando se genere una reserva.
- Prevención de cruces y duplicados.

#### Reservas
- Crear reserva si el horario está disponible y el servicio está activo.
- Listar reservas por cliente y administrador.
- Cambiar estado de reserva.
- Cancelar la reserva si aplica.
- Validación previa antes de insertar.

#### Agenda
- Vista ordenada por fecha y hora.
- Filtros por fecha, estado, servicio y cliente.

#### Reportes
- Reservas por día.
- Reservas por servicio.
- Reservas por estado.

#### Notificaciones internas
- Crear registro al crear, confirmar o cancelar una reserva.
- Mostrar notificaciones al usuario correspondiente.

## Data Model

### Tablas principales

#### Usuarios
- id_usuario (PK)
- nombre
- email (unique)
- password_hash
- rol
- fecha_creacion

#### Servicios
- id_servicio (PK)
- nombre
- descripcion
- duracion_minutos
- precio
- estado
- fecha_creacion

#### Horarios
- id_horario (PK)
- id_servicio (FK -> Servicios)
- fecha
- hora_inicio
- hora_fin
- disponible
- fecha_creacion

#### Reservas
- id_reserva (PK)
- id_usuario (FK -> Usuarios)
- id_servicio (FK -> Servicios)
- id_horario (FK -> Horarios)
- estado
- fecha_creacion
- fecha_actualizacion

#### Notificaciones
- id_notificacion (PK)
- id_usuario (FK -> Usuarios)
- mensaje
- tipo
- leida
- fecha_creacion

### Reglas de integridad
- PK y FK en todas las relaciones principales.
- Restricciones de valores para estado y rol.
- Restricciones de negocio para evitar reservas duplicadas.
- Validación de disponibilad antes de guardar.

## Suggested API Endpoints

### Autenticación
- POST `/api/auth/register`
- POST `/api/auth/login`
- POST `/api/auth/logout`
- GET `/api/auth/me`

### Servicios
- GET `/api/services`
- POST `/api/services`
- PUT `/api/services/:id`
- PATCH `/api/services/:id/status`
- DELETE `/api/services/:id`

### Horarios
- GET `/api/schedules`
- POST `/api/schedules`
- PUT `/api/schedules/:id`
- DELETE `/api/schedules/:id`

### Reservas
- GET `/api/reservations`
- GET `/api/reservations/me`
- POST `/api/reservations`
- PATCH `/api/reservations/:id/status`
- PATCH `/api/reservations/:id/cancel`

### Agenda y filtros
- GET `/api/agenda?date=...&status=...&serviceId=...&clientId=...`

### Reportes
- GET `/api/reports/daily`
- GET `/api/reports/services`
- GET `/api/reports/status`

### Notificaciones
- GET `/api/notifications`
- PATCH `/api/notifications/:id/read`

## Security Plan

- No almacenar contraseñas en texto plano; usar hash con bcrypt.
- Validar datos en frontend y backend con esquemas de entrada.
- Usar middleware de autenticación y autorización por rol.
- Proteger rutas de administrador y cliente con middleware o guards.
- Evitar reservas duplicadas mediante verificación de disponibilidad antes de insertar.
- Usar consultas parametrizadas para prevenir SQL injection.
- Mantener sesiones seguras mediante cookies seguras o tokens de sesión.

## Testing Strategy

### Pruebas mínimas del MVP
1. Registro correcto de usuario.
2. Login correcto.
3. Bloqueo de acceso según rol.
4. Creación de servicio.
5. Creación de horario.
6. Creación de reserva.
7. Bloqueo de horario ocupado.
8. Cambio de estado de reserva.
9. Filtros de agenda.
10. Reportes básicos.
11. Registro de notificaciones internas.

### Enfoque técnico
- Unit tests para validaciones y reglas de negocio.
- Integration tests para rutas API y acceso a datos.
- Smoke tests básicos para flujos críticos.

## Delivery Plan (Scrum-friendly for MVP)

### Sprint 1 — Fundación
- Configuración del proyecto Next.js + TypeScript.
- Conexión a SQL Server.
- Autenticación básica y control de sesiones.
- Estructura de rutas y componentes base.

### Sprint 2 — Operación del negocio
- Gestión de servicios.
- Gestión de horarios.
- Creación de reservas con validación de disponibilidad.
- Agenda y filtros básicos.

### Sprint 3 — Reportes y cierre
- Estados de reserva y cancelaciones.
- Reportes básicos.
- Notificaciones internas.
- Pruebas mínimas, documentación y revisión final.

## Risks and Mitigations

| Riesgo | Impacto | Mitigación |
|---|---|---|
| Complejidad de configuración de SQL Server | Alta | Preparar script SQL y variables de entorno desde el inicio |
| Alcance excesivo para 3 días | Alta | Priorizar flujos core del MVP y descartar funciones no esenciales |
| Duplicidad de reservas por concurrencia | Alta | Implementar validación transaccional y bloqueo de disponibilidad |
| Ambigüedad en roles y permisos | Media | Definir permisos claros desde el inicio y documentarlos |
| Tiempo de revisión del código generado por IA | Media | Revisar cambios manualmente antes de integrarlos |

## Open Questions

- ¿Se utilizará NextAuth o un JWT personalizado para la sesión?
- ¿Se usará un ORM o acceso directo a SQL Server con queries manuales?
- ¿Se requiere un entorno de desarrollo con Docker para SQL Server?

## Notes

Este plan está orientado a un MVP académico, por lo que prioriza funcionalidad comprobable, simplicidad técnica y cumplimiento de los requisitos de negocio definidos en la especificación.
