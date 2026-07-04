<!--
Sync Impact Report
- Version change: 0.0.0 → 1.0.0
- Modified principles: N/A (initial constitution for the project)
- Added sections: Core Principles, Additional Constraints, Development Workflow and Evidence of SDD
- Removed sections: None
- Templates requiring updates: ✅ .specify/templates/plan-template.md, ✅ .specify/templates/spec-template.md, ✅ .specify/templates/tasks-template.md
- Follow-up TODOs: None
-->

# Plataforma de Gestión Inteligente de Reservas Constitution

## Core Principles

### I. Especificación-Primero
Toda funcionalidad nueva, cambio de negocio o mejora de flujo debe iniciarse con una especificación formal previa en GitHub Spec Kit. No se implementa código ni se aprueban cambios sin un spec, un plan y tareas que definan alcance, contexto y objetivos.
Este principio garantiza trazabilidad, reduce ambigüedad y evita construir soluciones sin necesidad real o sin validación previa.

### II. Aceptación Verificable
Cada requisito debe incluir criterios de aceptación verificables, observables y medibles. Los criterios deben describir condiciones de entrada, comportamiento esperado y resultado comprobable, de modo que puedan validarse durante pruebas o revisión.
Este principio convierte los requisitos en compromisos ejecutables y evita interpretaciones subjetivas durante la entrega.

### III. Revisión Humana de Código Generado por IA
Todo código generado con asistencia de IA debe ser revisado por un integrante humano antes de aceptarse, integrarse o desplegarse. La revisión debe cubrir corrección funcional, calidad de diseño, seguridad, cumplimiento del spec y coherencia con la arquitectura del proyecto.
Este principio preserva la calidad técnica y evita aceptar automáticamente soluciones incompletas o inconsistentes.

### IV. Gobierno por Roles y Operación de Negocio
El sistema debe implementar roles diferenciados de administrador y cliente, con permisos explícitos y coherentes con las operaciones del negocio. El administrador debe poder gestionar servicios, horarios y reservas; el cliente debe poder interactuar con el sistema dentro de los límites definidos por la organización.
Este principio asegura control de acceso, responsabilidad operativa y alineación con los procesos reales de gestión de reservas.

### V. Integridad de Datos y Experiencia de Gestión
El sistema debe permitir gestionar servicios, horarios y reservas, evitar cruces de horario en las reservas, incluir agenda, filtros, reportes básicos y notificaciones internas, y mantener la integridad de los datos mediante restricciones, claves primarias y claves foráneas en la base de datos.
Este principio garantiza confiabilidad operativa, utilidad funcional y una base de datos consistente para la toma de decisiones.

## Additional Constraints

El proyecto se desarrollará con Next.js, Node.js, SQL Server, Visual Studio Code, GitHub Copilot y GitHub Spec Kit. La arquitectura debe favorecer una separación clara entre frontend, backend y persistencia, con documentación técnica y de negocio accesible para el equipo.

Los siguientes requisitos son obligatorios para toda iteración de desarrollo:
- La base de datos debe definir restricciones, claves primarias y claves foráneas para garantizar integridad relacional.
- Cada módulo debe contar con pruebas básicas que verifiquen su comportamiento principal.
- El proyecto debe incluir README, capturas y una explicación del enfoque SDD empleado.
- La experiencia de usuario debe contemplar agenda, filtros, reportes básicos y notificaciones internas como parte del alcance mínimo.
- La lógica de reservas debe prevenir superposición de horarios y conservar la consistencia del calendario.

## Development Workflow and Evidence of SDD

El desarrollo debe ejecutarse bajo un enfoque de Desarrollo Dirigido por Especificación (SDD), con evidencia explícita en cada etapa del ciclo de trabajo. Cada incremento debe pasar por los artefactos de Spec Kit correspondientes: especificación, plan, tareas y validación.

El flujo obligatorio es el siguiente:
1. Definir el requisito en una especificación clara y completa.
2. Convertir el requisito en un plan técnico con alcance, riesgos y decisiones de diseño.
3. Descomponer el plan en tareas verificables y priorizadas.
4. Implementar con revisión humana, pruebas básicas y documentación asociada.
5. Verificar que el resultado cumpla los criterios de aceptación antes de considerarlo entregado.

La evidencia de SDD debe quedar reflejada en los artefactos del repositorio, en el historial de cambios y en la documentación del proyecto. La constitución de este proyecto debe considerarse una guía obligatoria para decisiones técnicas, revisión de cambios y aceptación de entregables.

## Governance

Esta constitución sustituye prácticas informales y orienta las decisiones de diseño, desarrollo y revisión del proyecto. Cualquier cambio en los principios, restricciones o flujo de trabajo debe documentarse, justificarse y aprobarse antes de incorporarse al repositorio.

La versión de la constitución se gestionará con semántica de versiones MAJOR.MINOR.PATCH. Un cambio mayor elimina o redefine principios centrales; un cambio menor añade un principio o amplía una sección importante; un cambio de parche ajusta redacción, claridad o correcciones no semánticas. Toda modificación debe reflejarse en la documentación y en los artefactos de especificación correspondientes.

El cumplimiento de esta constitución será revisado en cada entregable, en cada revisión de código y en cada cierre de iteración. Los cambios que no cumplan los principios definidos no podrán aceptarse como finalizados.

**Version**: 1.0.0 | **Ratified**: 2026-07-03 | **Last Amended**: 2026-07-03
