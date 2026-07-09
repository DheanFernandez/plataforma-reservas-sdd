# Pruebas manuales del MVP

Proyecto: Plataforma web de gestión inteligente de reservas para servicios pequeños  
Fase: 17 - Pruebas y correcciones  
Enfoque: SDD + GitHub Spec Kit + GitHub Copilot  
Base de datos: SQL Server  
Backend: Next.js API Routes  

---

## 1. Pruebas de autenticación

| Código | Caso de prueba | Resultado esperado | Resultado obtenido | Estado |
|---|---|---|---|---|
| AUTH-01 | Registrar usuario cliente | Usuario registrado correctamente |  | Pendiente |
| AUTH-02 | Login con usuario cliente | Token JWT generado |  | Pendiente |
| AUTH-03 | Validar token en /api/auth/me | Token válido |  | Pendiente |
| AUTH-04 | Login con credenciales incorrectas | 401 No autorizado |  | Pendiente |

---

## 2. Pruebas de roles

| Código | Caso de prueba | Resultado esperado | Resultado obtenido | Estado |
|---|---|---|---|---|
| ROL-01 | CLIENTE accede a ruta admin | 403 Prohibido |  | Pendiente |
| ROL-02 | ADMIN accede a ruta admin | Acceso permitido |  | Pendiente |

---

## 3. Pruebas de servicios

| Código | Caso de prueba | Resultado esperado | Resultado obtenido | Estado |
|---|---|---|---|---|
| SER-01 | ADMIN crea servicio | Servicio creado correctamente |  | Pendiente |
| SER-02 | CLIENTE intenta crear servicio | 403 Prohibido |  | Pendiente |
| SER-03 | Listar servicios | Servicios listados correctamente |  | Pendiente |
| SER-04 | ADMIN actualiza servicio | Servicio actualizado correctamente |  | Pendiente |
| SER-05 | CLIENTE intenta actualizar servicio | 403 Prohibido |  | Pendiente |
| SER-06 | ADMIN elimina servicio sin reservas | Servicio eliminado correctamente |  | Pendiente |
| SER-07 | CLIENTE intenta eliminar servicio | 403 Prohibido |  | Pendiente |
| SER-08 | ADMIN inactiva/activa servicio | Estado actualizado correctamente |  | Pendiente |

---

## 4. Pruebas de horarios

| Código | Caso de prueba | Resultado esperado | Resultado obtenido | Estado |
|---|---|---|---|---|
| HOR-01 | ADMIN crea horario | Horario creado correctamente |  | Pendiente |
| HOR-02 | CLIENTE intenta crear horario | 403 Prohibido |  | Pendiente |
| HOR-03 | Listar horarios | Horarios listados correctamente |  | Pendiente |
| HOR-04 | ADMIN actualiza horario | Horario actualizado correctamente |  | Pendiente |
| HOR-05 | CLIENTE intenta actualizar horario | 403 Prohibido |  | Pendiente |
| HOR-06 | ADMIN elimina horario sin reserva | Horario eliminado correctamente |  | Pendiente |
| HOR-07 | CLIENTE intenta eliminar horario | 403 Prohibido |  | Pendiente |

---

## 5. Pruebas de reservas

| Código | Caso de prueba | Resultado esperado | Resultado obtenido | Estado |
|---|---|---|---|---|
| RES-01 | CLIENTE crea reserva con horario disponible | Reserva creada correctamente |  | Pendiente |
| RES-02 | Horario reservado cambia a no disponible | disponible = False |  | Pendiente |
| RES-03 | CLIENTE intenta reservar horario ocupado | 400 Solicitud incorrecta |  | Pendiente |
| RES-04 | ADMIN intenta crear reserva | 403 Prohibido |  | Pendiente |
| RES-05 | CLIENTE lista sus reservas | Solo ve sus propias reservas |  | Pendiente |
| RES-06 | ADMIN lista reservas | Ve todas las reservas |  | Pendiente |

---

## 6. Pruebas de estados de reserva

| Código | Caso de prueba | Resultado esperado | Resultado obtenido | Estado |
|---|---|---|---|---|
| EST-01 | ADMIN confirma reserva | Estado CONFIRMADA |  | Pendiente |
| EST-02 | ADMIN completa reserva | Estado COMPLETADA |  | Pendiente |
| EST-03 | ADMIN cancela reserva | Estado CANCELADA y horario disponible |  | Pendiente |
| EST-04 | CLIENTE intenta cambiar estado por endpoint admin | 403 Prohibido |  | Pendiente |
| EST-05 | CLIENTE cancela su propia reserva | Reserva cancelada correctamente |  | Pendiente |
| EST-06 | CLIENTE intenta cancelar reserva ya cancelada | 400 Solicitud incorrecta |  | Pendiente |

---

## 7. Pruebas de agenda y filtros

| Código | Caso de prueba | Resultado esperado | Resultado obtenido | Estado |
|---|---|---|---|---|
| AGE-01 | ADMIN consulta agenda | Ve todas las reservas |  | Pendiente |
| AGE-02 | CLIENTE consulta agenda | Solo ve sus reservas |  | Pendiente |
| AGE-03 | Filtrar agenda por fecha | Lista reservas de la fecha indicada |  | Pendiente |
| AGE-04 | Filtrar agenda por estado | Lista reservas del estado indicado |  | Pendiente |
| AGE-05 | Filtrar agenda por servicio | Lista reservas del servicio indicado |  | Pendiente |
| AGE-06 | Filtrar agenda por cliente | Lista reservas del cliente indicado |  | Pendiente |

---

## 8. Pruebas de reportes

| Código | Caso de prueba | Resultado esperado | Resultado obtenido | Estado |
|---|---|---|---|---|
| REP-01 | ADMIN consulta reportes | Reportes generados correctamente |  | Pendiente |
| REP-02 | CLIENTE intenta consultar reportes | 403 Prohibido |  | Pendiente |
| REP-03 | Ver reservas por día | Totales agrupados por fecha |  | Pendiente |
| REP-04 | Ver reservas por servicio | Totales agrupados por servicio |  | Pendiente |
| REP-05 | Ver reservas por estado | Totales agrupados por estado |  | Pendiente |

---

## 9. Pruebas de notificaciones

| Código | Caso de prueba | Resultado esperado | Resultado obtenido | Estado |
|---|---|---|---|---|
| NOT-01 | Usuario consulta notificaciones | Lista sus propias notificaciones |  | Pendiente |
| NOT-02 | Usuario ve contador no leídas | totalNoLeidas correcto |  | Pendiente |
| NOT-03 | Usuario marca notificación como leída | Notificación marcada como leída |  | Pendiente |
| NOT-04 | Usuario intenta modificar notificación ajena | 403 Prohibido |  | Pendiente |

---

## Observaciones y correcciones

| N.º | Error detectado | Causa | Corrección aplicada | Estado |
|---|---|---|---|---|
| 1 |  |  |  |  |