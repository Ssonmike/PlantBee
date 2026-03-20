Quiero que actúes como un senior full-stack product engineer y software architect. Ayúdame a diseñar y construir una app web mobile-first llamada “PlantBee”.

## Visión del producto
PlantBee es una plataforma web enfocada principalmente en móviles que ayuda a los usuarios a cuidar sus plantas de forma inteligente. La app debe permitir:

1. Identificar el tipo de planta usando la cámara del dispositivo.
2. Detectar problemas de la planta usando la cámara:
   - plagas
   - sequedad
   - exceso o falta de agua
   - falta o exceso de luz
   - hongos
   - hojas amarillas
   - hojas caídas
   - problemas generales de salud
3. Sugerir posibles soluciones para esos problemas.
4. Tener una sección llamada “Mi jardín” donde el usuario pueda guardar y gestionar sus plantas.
5. Usar geolocalización para adaptar recomendaciones de cuidado según el lugar del usuario:
   - luz
   - agua
   - humedad
   - frecuencia de riego
   - temperatura
   - estacionalidad
6. Mostrar en la pantalla de inicio un calendario o dashboard con:
   - plantas que toca regar hoy
   - plantas que pronto necesitarán riego
   - fertilización
   - recordatorios de cuidado
   - alertas importantes

## Objetivo
No quiero una idea genérica. Quiero que me ayudes a convertir esto en una aplicación real, bien pensada, técnicamente viable y preparada para evolucionar.

## Tu rol
Quiero que trabajes como si fueras mi socio técnico. Debes:
- cuestionar decisiones poco realistas
- proponer alternativas mejores cuando sea necesario
- priorizar MVP vs futuras versiones
- pensar en experiencia de usuario, arquitectura, escalabilidad y viabilidad técnica
- escribir código limpio, modular y mantenible
- explicar tus decisiones de forma clara

## Lo que necesito de ti
Quiero que estructures tu respuesta en este orden exacto:

### 1. Product breakdown
Define claramente:
- problema que resuelve PlantBee
- tipo de usuario objetivo
- propuesta de valor
- funcionalidades principales
- diferencias entre MVP y versión futura

### 2. MVP realista
Propón un MVP que se pueda construir de forma razonable.
Debes separar:
- funciones imprescindibles para lanzar
- funciones deseables pero no críticas
- funciones avanzadas para más adelante

### 3. UX/UI mobile-first
Diseña la estructura de pantallas principales para móvil:
- onboarding
- login/registro
- home/dashboard
- escaneo de planta
- resultado de identificación
- diagnóstico de problema
- detalle de planta
- “Mi jardín”
- calendario / tareas
- perfil / configuración

Para cada pantalla, explica:
- objetivo
- elementos principales
- CTA principal
- navegación

### 4. Arquitectura técnica recomendada
Quiero una recomendación técnica moderna y razonable para construir esta app web.
Propón stack completo, justificando cada elección:
- frontend
- backend
- base de datos
- almacenamiento de imágenes
- autenticación
- geolocalización
- notificaciones
- calendario / tareas
- despliegue
- analítica
- observabilidad

Si ves mejor una PWA en vez de app nativa al principio, explícalo.

### 5. IA / visión por computadora
Quiero que propongas cómo implementar de forma realista:
- identificación de especies de plantas mediante imagen
- detección básica de problemas de la planta mediante imagen
- sistema de recomendaciones

No inventes magia. Debes distinguir claramente entre:
- lo que puede hacerse con APIs o modelos ya existentes
- lo que requeriría entrenar modelos propios
- lo que debería empezar como una aproximación simple basada en reglas
- limitaciones y riesgos de precisión

Si es mejor comenzar con integración a servicios externos y luego evolucionar, indícalo.

### 6. Modelo de datos
Diseña las entidades principales de la app.
Incluye al menos:
- User
- Plant
- Garden
- PlantScan
- Diagnosis
- CareSchedule
- Reminder
- LocationProfile
- PlantCareRequirements

Describe para cada entidad:
- propósito
- campos principales
- relaciones

### 7. Lógica de negocio
Define cómo debería funcionar:
- registro de una planta en “Mi jardín”
- estimación de riego
- generación de recordatorios
- recomendaciones según geolocalización y clima
- diagnóstico de problemas
- evolución del estado de la planta con el tiempo

Quiero reglas realistas y explicadas.

### 8. Roadmap de desarrollo
Divide el desarrollo en fases concretas:
- Fase 1: base del producto
- Fase 2: escaneo e identificación
- Fase 3: diagnóstico y recomendaciones
- Fase 4: calendario inteligente
- Fase 5: mejoras premium o avanzadas

Para cada fase, incluye:
- objetivo
- tareas técnicas
- dependencias
- resultado esperado

### 9. Riesgos y decisiones importantes
Enumera riesgos reales:
- precisión de la IA
- permisos de cámara y geolocalización
- calidad de datos
- complejidad del sistema de cuidado
- diferencias entre especies
- experiencia en móvil
- coste de APIs
- privacidad de imágenes y ubicación

Y para cada riesgo, propón mitigaciones.

### 10. Primer entregable técnico
Quiero que termines proponiendo el mejor punto de partida para empezar a programar hoy mismo.
Debes decirme:
- qué stack exacto usarías para el MVP
- estructura de carpetas inicial
- primeras features a implementar
- orden recomendado de desarrollo
- qué dejar fuera al principio para no complicar el proyecto

## Requisitos de respuesta
- Sé concreto.
- No seas superficial.
- Prioriza decisiones realistas.
- No asumas que todo debe resolverse con IA compleja.
- Si algo no conviene hacer en la primera versión, dilo claramente.
- Cuando haya varias opciones técnicas, recomienda una y justifica por qué.
- Piensa como alguien que quiere lanzar un producto funcional, no solo un concepto bonito.

## Contexto adicional del producto
Detalles que quiero que tengas en cuenta:
- El nombre de la app es PlantBee.
- La prioridad es móvil, pero debe funcionar también en escritorio.
- Quiero una experiencia visual limpia, moderna y sencilla.
- Me interesa que la app se sienta útil desde el primer día.
- Quiero que el usuario pueda guardar plantas y recibir ayuda continua, no solo hacer un escaneo puntual.
- El calendario de cuidados y la personalización según ubicación son muy importantes.
- El diagnóstico debe presentarse como ayuda orientativa, no como certeza absoluta.

## Forma de trabajar
No me des solo teoría. Quiero que pienses como arquitecto + diseñador de producto + ingeniero.
Si detectas debilidades en la idea, señálalas con honestidad y propón mejoras.

Empieza ahora.
