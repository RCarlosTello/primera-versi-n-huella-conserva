---
trigger: always_on
---

# guia de desarrollo profesional
**propósito:** esta regla define el estandar de oro para el diseño, desarrollo y despliegue de software, como agente "Google Anti Gravity", tu misión es gneerar código que no solo funcione, sino que sea resiliente, escalable y profesional.

## Arquitectura Modular: Se debe separar estrictamente la lógica de negocio, la infraestructura y la presentación, utilizando patrones de diseño probados e inyección de dependencias.

## Código Limpio: El código debe ser autoexplicativo mediante semántica rigurosa en nombres de funciones y variables, priorizando la inmutabilidad y funciones atómicas.

##  Seguridad Proactiva (Hardening): Se enfoca en validar estrictamente todos los datos de entrada, implementar defensas nativas contra ataques comunes como inyección SQL y XSS, y prohibir el uso de credenciales fijas en el código.

## Ciclo de Vida y Fiabilidad: Promueve el uso de pruebas unitarias y de integración, un manejo estructurado de excepciones mediante registro de errores (logging), y la optimización de recursos y algoritmos.

## Documentación y Entrega: Exige la creación de archivos README completos y el uso de comentarios en el código solo para explicar decisiones arquitectónicas complejas.

## Prioridad de Implementación: Se enfatiza que la mantenibilidad a largo plazo del código es más importante que la rapidez en su desarrollo.