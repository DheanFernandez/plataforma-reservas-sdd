# Tasks: Plataforma web de gestión inteligente de reservas

**Input**: Design documents from `/specs/001-smart-reservas-platform/`

**Goal**: Implementar un MVP funcional en 3 días, priorizando los flujos críticos de autenticación, servicios, horarios, reservas, agenda, reportes y notificaciones.

## FASE 1: Preparación del proyecto Next.js

**Propósito**: Crear la base técnica del proyecto y dejarlo listo para desarrollo incremental.

- [ ] T001 Create a new Next.js project with TypeScript and App Router in the repository root
  - Priority: P1
  - Depends on: None
  - Acceptance: `npm run dev` starts successfully and serves the default Next.js page.

- [ ] T002 Configure the recommended folder structure under `src/` for app, components, lib, server, types and tests
  - Priority: P1
  - Depends on: T001
  - Acceptance: The required folders exist and are referenced by the project structure.

- [ ] T003 [P] Create environment configuration files such as `.env.example` and `.env.local.example`
  - Priority: P1
  - Depends on: T001
  - Acceptance: Configuration templates include variables for DB connection, auth secrets and app settings.

- [ ] T004 [P] Install core dependencies for Next.js, SQL Server access, auth, validation and testing
  - Priority: P1
  - Depends on: T001
  - Acceptance: The required packages are installed and resolvable from the project.

- [ ] T005 Prepare the initial README with project description, setup steps and MVP scope
  - Priority: P1
  - Depends on: T001
  - Acceptance: The README contains installation, execution and architecture summary sections.

---

## FASE 2: Base de datos SQL Server

**Propósito**: Definir el esquema inicial relacional del MVP con tablas principales y reglas básicas.

- [ ] T006 Create the initial SQL script for the database schema in `docs/sql/init-schema.sql`
  - Priority: P1
  - Depends on: T003
  - Acceptance: The SQL file contains the statements required to create all MVP tables.

- [ ] T007 Create the `Usuarios` table with primary key, unique email, role and creation date
  - Priority: P1
  - Depends on: T006
  - Acceptance: The table can be created successfully in SQL Server.

- [ ] T008 Create the `Servicios` table with name, description, duration, price, active status and creation date
  - Priority: P1
  - Depends on: T006
  - Acceptance: The table can be created successfully and stores the required fields.

- [ ] T009 Create the `Horarios` table with service foreign key, date, start/end time and availability flag
  - Priority: P1
  - Depends on: T006, T008
  - Acceptance: The table can be created successfully and relates to services.

- [ ] T010 Create the `Reservas` table with user, service and schedule foreign keys and reservation status
  - Priority: P1
  - Depends on: T006, T007, T008, T009
  - Acceptance: The table can be created successfully and stores the reservation relationship.

- [ ] T011 Create the `Notificaciones` table with user foreign key, message, type, read flag and creation date
  - Priority: P1
  - Depends on: T006, T007
  - Acceptance: The table can be created successfully and stores notification records.

- [ ] T012 Define primary keys, foreign keys and basic constraints for the MVP schema
  - Priority: P1
  - Depends on: T007-T011
  - Acceptance: The schema validates referential integrity and basic value constraints.

- [ ] T013 Add basic seed data for an administrator, a client, one service and one available schedule
  - Priority: P1
  - Depends on: T007-T011
  - Acceptance: The seed data can be inserted successfully and used for local testing.

---

## FASE 3: Conexión a SQL Server

**Propósito**: Conectar la aplicación a la base de datos de forma segura y reutilizable.

- [ ] T014 Create a database connection module in `src/lib/db/connection.ts`
  - Priority: P1
  - Depends on: T004, T006
  - Acceptance: The module initializes a connection using environment variables.

- [ ] T015 Configure SQL Server connection variables in the environment template and runtime config
  - Priority: P1
  - Depends on: T003, T014
  - Acceptance: The app reads DB host, port, database name, user and password from environment variables.

- [ ] T016 [P] Test the database connection from the Next.js application
  - Priority: P1
  - Depends on: T014, T015
  - Acceptance: A simple health check query succeeds and returns a connection confirmation.

- [ ] T017 Create a helper for reusable parameterized queries in `src/lib/db/query.ts`
  - Priority: P1
  - Depends on: T014
  - Acceptance: The helper executes simple SELECT and INSERT operations securely.

---

## FASE 4: Autenticación y roles

**Propósito**: Implementar el acceso inicial al sistema con autenticación básica y control por rol.

- [ ] T018 [US1] Create the registration page and form in `src/app/register/page.tsx`
  - Priority: P1
  - Depends on: T002, T014
  - Acceptance: A user can open the page and submit registration data.

- [ ] T019 [US1] Implement the registration API endpoint in `src/app/api/auth/register/route.ts`
  - Priority: P1
  - Depends on: T017, T018
  - Acceptance: A new user is created in the database with a hashed password.

- [ ] T020 [US1] Implement password hashing and input validation for registration and login
  - Priority: P1
  - Depends on: T019
  - Acceptance: Passwords are stored as hashes and invalid input is rejected.

- [ ] T021 [US1] Implement the login API endpoint in `src/app/api/auth/login/route.ts`
  - Priority: P1
  - Depends on: T020
  - Acceptance: Valid credentials authenticate the user and invalid ones are rejected.

- [ ] T022 [US1] Create session handling for authenticated users in `src/lib/auth/session.ts`
  - Priority: P1
  - Depends on: T021
  - Acceptance: A logged-in user remains authenticated across requests.

- [ ] T023 [US1] Implement role-based route protection for admin and client areas
  - Priority: P1
  - Depends on: T022
  - Acceptance: Clients cannot access admin-only pages and admins can access protected areas.

- [ ] T024 [US1] Implement logout flow and session clearing
  - Priority: P1
  - Depends on: T022
  - Acceptance: A logged-out user is redirected and loses access to protected routes.

---

## FASE 5: Módulo de servicios

**Propósito**: Gestionar los servicios del negocio desde el panel de administración.

- [ ] T025 [US2] Create the service form page and UI in `src/app/admin/services/page.tsx`
  - Priority: P1
  - Depends on: T023
  - Acceptance: An admin can open the services screen and enter service data.

- [ ] T026 [US2] Implement the service creation endpoint in `src/app/api/services/route.ts`
  - Priority: P1
  - Depends on: T025
  - Acceptance: An admin can create a service and it is stored in the database.

- [ ] T027 [US2] Implement listing of services for admin and client views
  - Priority: P1
  - Depends on: T026
  - Acceptance: The system returns the active services available for reservation.

- [ ] T028 [US2] Implement service edit and update flow
  - Priority: P1
  - Depends on: T027
  - Acceptance: An admin can update service fields and the changes persist.

- [ ] T029 [US2] Implement activate/inactivate service behavior
  - Priority: P1
  - Depends on: T028
  - Acceptance: Inactive services are not offered for new reservations.

- [ ] T030 [US2] Validate required service fields before persistence
  - Priority: P1
  - Depends on: T026
  - Acceptance: Missing name, duration or price is rejected with a clear validation error.

- [ ] T5.6 Implementar eliminación de servicios por parte del administrador
  - Priority: Media
  - Depends on: T027 (tarea de listado de servicios)
  - Acceptance: El administrador puede eliminar un servicio desde la lista de servicios y el sistema impide eliminar servicios que tengan reservas asociadas; en ese caso debe recomendar inactivar el servicio.

---

## FASE 6: Módulo de horarios

**Propósito**: Permitir al administrador registrar horarios disponibles manualmente.

- [ ] T031 [US2] Create the schedule form UI in `src/app/admin/schedules/page.tsx`
  - Priority: P1
  - Depends on: T025
  - Acceptance: An admin can enter date, start time and end time for a schedule.

- [ ] T032 [US2] Implement the schedule creation endpoint in `src/app/api/schedules/route.ts`
  - Priority: P1
  - Depends on: T031
  - Acceptance: A schedule is saved with the selected service and dates.

- [ ] T033 [US2] Implement schedule listing for available slots
  - Priority: P1
  - Depends on: T032
  - Acceptance: The system returns the available schedules for the selected service/date.

- [ ] T034 [US2] Validate that start/end time ranges are valid and do not overlap with other schedules for the same service/date
  - Priority: P1
  - Depends on: T032
  - Acceptance: Invalid or conflicting schedules are rejected.

- [ ] T035 [US2] Mark a schedule as unavailable when a reservation is created
  - Priority: P1
  - Depends on: T032, T036
  - Acceptance: A reserved schedule is no longer offered as available.

---

## FASE 7: Módulo de reservas

**Propósito**: Permitir la reserva de servicios por parte del cliente y la gestión operativa por parte del administrador.

- [ ] T036 [US3] Create the client reservation page in `src/app/client/reservations/page.tsx`
  - Priority: P1
  - Depends on: T027, T033
  - Acceptance: A client can choose a service and an available schedule.

- [ ] T037 [US3] Implement the reservation creation endpoint in `src/app/api/reservations/route.ts`
  - Priority: P1
  - Depends on: T036
  - Acceptance: A reservation is stored when the schedule is available and the service is active.

- [ ] T038 [US3] Validate availability before saving a reservation
  - Priority: P1
  - Depends on: T037
  - Acceptance: An attempt to reserve an already occupied slot is rejected.

- [ ] T039 [US3] Prevent duplicate reservations for the same service/date/schedule
  - Priority: P1
  - Depends on: T037
  - Acceptance: The system blocks duplicate reservation attempts.

- [ ] T040 [US3] Implement listing of reservations for the logged-in client
  - Priority: P1
  - Depends on: T037
  - Acceptance: A client sees only their own reservations.

- [ ] T041 [US3] Implement listing of all reservations for the administrator
  - Priority: P1
  - Depends on: T037
  - Acceptance: An admin can view the full reservation list.

- [ ] T042 [US3] Implement reservation status changes by the administrator
  - Priority: P1
  - Depends on: T041
  - Acceptance: The reservation status updates to confirmed, completed or cancelled as allowed.

- [ ] T043 [US3] Implement reservation cancellation by client or administrator when the reservation is pending or confirmed
  - Priority: P1
  - Depends on: T042
  - Acceptance: A cancellation changes the state to cancelled and is blocked for unsupported states.

---

## FASE 8: Agenda y filtros

**Propósito**: Exponer una vista operativa de reservas organizada y filtrable.

- [ ] T044 [US4] Create the agenda page in `src/app/admin/agenda/page.tsx`
  - Priority: P1
  - Depends on: T041
  - Acceptance: The agenda displays reservations sorted by date and time.

- [ ] T045 [US4] Order agenda items by date and time
  - Priority: P1
  - Depends on: T044
  - Acceptance: Reservations appear in ascending chronological order.

- [ ] T046 [US4] Add filters for date, status, service and client
  - Priority: P1
  - Depends on: T045
  - Acceptance: Applying filters returns only the matching reservations.

---

## FASE 9: Reportes básicos

**Propósito**: Mostrar indicadores operativos simples para el negocio.

- [ ] T047 [US4] Implement the daily reservations report in `src/app/admin/reports/page.tsx`
  - Priority: P2
  - Depends on: T044
  - Acceptance: The report shows the total number of reservations by day.

- [ ] T048 [US4] Implement the report by service
  - Priority: P2
  - Depends on: T047
  - Acceptance: The report groups reservations by service.

- [ ] T049 [US4] Implement the report by status
  - Priority: P2
  - Depends on: T048
  - Acceptance: The report groups reservations by status.

---

## FASE 10: Notificaciones internas

**Propósito**: Registrar eventos importantes para el usuario y el administrador.

- [ ] T050 [US4] Create a notification when a reservation is created
  - Priority: P1
  - Depends on: T037
  - Acceptance: The system inserts a notification record for the client.

- [ ] T051 [US4] Create a notification when a reservation is confirmed
  - Priority: P1
  - Depends on: T042
  - Acceptance: The system inserts a notification when the status changes to confirmed.

- [ ] T052 [US4] Create a notification when a reservation is cancelled
  - Priority: P1
  - Depends on: T043
  - Acceptance: The system inserts a notification when the status changes to cancelled.

- [ ] T053 [US4] Display notifications for the current user and mark them as read
  - Priority: P2
  - Depends on: T050-T052
  - Acceptance: The user can view their notifications and mark them as read.

---

## FASE 11: Pruebas

**Propósito**: Verificar los flujos principales del MVP antes de la entrega.

- [ ] T054 Write unit tests for registration and login flows
  - Priority: P1
  - Depends on: T019, T021
  - Acceptance: The tests pass and cover valid and invalid authentication cases.

- [ ] T055 Write unit tests for service creation and activation rules
  - Priority: P1
  - Depends on: T026, T029
  - Acceptance: The tests pass and cover required fields and inactive service behavior.

- [ ] T056 Write unit tests for schedule validation and reservation conflict prevention
  - Priority: P1
  - Depends on: T034, T038
  - Acceptance: The tests pass for valid schedules and blocked conflicts.

- [ ] T057 Write integration tests for the full reservation flow and role protection
  - Priority: P1
  - Depends on: T023, T037, T042
  - Acceptance: The tests pass for admin and client flows.

- [ ] T058 Write smoke tests for agenda filters, reports and notifications
  - Priority: P2
  - Depends on: T046, T049, T053
  - Acceptance: The main UI flows return expected results in the test environment.

---

## FASE 12: Documentación y evidencia

**Propósito**: Preparar la entrega académica con documentación, evidencia y pasos claros para ejecutar el proyecto.

- [ ] T059 Complete the README with installation, execution, architecture and SDD explanation
  - Priority: P1
  - Depends on: T005
  - Acceptance: The README includes setup instructions and a clear description of the MVP.

- [ ] T060 Add the SQL script and sample data instructions to the documentation
  - Priority: P1
  - Depends on: T006, T013
  - Acceptance: The documentation explains how to initialize the database locally.

- [ ] T061 Add evidence of Spec Kit workflow and project artifacts in the repository
  - Priority: P2
  - Depends on: T005
  - Acceptance: The repository includes the spec, plan and task files as evidence of SDD.

- [ ] T062 Add screenshots and a short presentation summary for the academic delivery
  - Priority: P2
  - Depends on: T044, T047, T053
  - Acceptance: The documentation includes the required visual evidence and a short explanation.

- [ ] T063 Perform a final review of local execution, documentation and test status
  - Priority: P1
  - Depends on: T058, T059, T060, T061, T062
  - Acceptance: The project can be executed locally with documented steps and the main flows are verified.
