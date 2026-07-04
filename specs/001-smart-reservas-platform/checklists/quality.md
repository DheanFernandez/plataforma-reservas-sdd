# Quality Checklist: Plataforma web de gestión inteligente de reservas

**Purpose**: Validate the MVP before, during and after implementation using the Spec Kit artifacts as the source of truth.
**Feature**: [spec.md](../spec.md)
**Plan**: [plan.md](../plan.md)
**Tasks**: [tasks.md](../tasks.md)
**Created**: 2026-07-03

## 1. Alignment with Spec Kit artifacts

- [ ] The implementation scope is aligned with the business requirements in [spec.md](../spec.md).
- [ ] The architecture and implementation decisions in [plan.md](../plan.md) match the scope of the MVP.
- [ ] The tasks in [tasks.md](../tasks.md) cover the priority flows defined in the specification.
- [ ] No task contradicts the roles, business rules or constraints of the MVP.

## 2. Functional completeness

- [ ] Authentication flows for registration and login are covered.
- [ ] Admin and client roles are clearly defined and implemented.
- [ ] Service management is covered: create, list, edit, activate/inactivate and delete if applicable.
- [ ] Schedule management is covered: manual registration of date, start time and end time.
- [ ] Reservation management is covered: create, list, cancel and update status.
- [ ] Agenda, filters, reports and internal notifications are covered.

## 3. Verifiable acceptance criteria

- [ ] Each implemented feature has a clear acceptance criterion that can be tested.
- [ ] The acceptance criteria are observable and do not depend on vague statements.
- [ ] The main user journeys can be validated manually or automatically.

## 4. Basic security

- [ ] Passwords are not stored in plain text.
- [ ] Input validation is applied on the client and server side.
- [ ] Protected routes enforce the correct role-based access.
- [ ] The system prevents unauthorized access to admin-only areas.

## 5. Role validation

- [ ] Administrators can manage services, schedules, reservations and reports.
- [ ] Clients can register, log in and create/view their own reservations.
- [ ] Clients cannot access privileged admin-only views or actions.

## 6. Reservation integrity and schedule conflicts

- [ ] The system validates that a schedule is available before creating a reservation.
- [ ] Duplicate reservations for the same service/date/schedule are blocked.
- [ ] Overlapping or conflicting reservations are prevented.
- [ ] A reserved schedule is not offered as available after the reservation is created.

## 7. SQL Server integration

- [ ] The application connects successfully to SQL Server.
- [ ] The database includes the required tables: Usuarios, Servicios, Horarios, Reservas and Notificaciones.
- [ ] Primary keys, foreign keys and basic constraints are applied.
- [ ] The connection uses environment variables and secure configuration.

## 8. Minimum MVP tests

- [ ] Registration test passes.
- [ ] Login test passes.
- [ ] Role-based access test passes.
- [ ] Service creation test passes.
- [ ] Schedule creation test passes.
- [ ] Reservation creation test passes.
- [ ] Occupied schedule blocking test passes.
- [ ] Reservation status change test passes.
- [ ] Agenda filters test passes.
- [ ] Basic reports test passes.
- [ ] Internal notifications test passes.

## 9. Documentation

- [ ] The README explains how to install and run the project locally.
- [ ] The README explains the MVP scope and the SDD approach.
- [ ] The SQL script and seed data instructions are documented.
- [ ] The repository includes the Spec Kit artifacts and explains their purpose.

## 10. Academic presentation evidence

- [ ] The project includes screenshots or visual evidence of the main flows.
- [ ] The repository contains a short summary for academic presentation.
- [ ] The implementation can be demonstrated in a short live walkthrough.
- [ ] The evidence clearly reflects the MVP features and the SDD workflow.
