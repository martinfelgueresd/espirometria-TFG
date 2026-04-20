# EspirometrIA

Aplicación web clínica para la gestión y análisis automatizado de espirometrías mediante inteligencia artificial.

## Descripción

EspirometrIA permite a profesionales sanitarios gestionar pacientes, subir pruebas de espirometría en formato XML y obtener automáticamente un análisis de calidad de cada maniobra mediante un modelo de IA. El sistema indica si cada prueba cumple los criterios de aceptabilidad y proporciona su interpretación clínica.

## Referencias

### Documentación oficial
- [React](https://react.dev/)
- [Spring Boot](https://spring.io/projects/spring-boot)
- [Spring Security](https://spring.io/projects/spring-security)
- [Tailwind CSS](https://tailwindcss.com/)
- [FastAPI](https://fastapi.tiangolo.com/)
- [MapStruct](https://mapstruct.org/)
- [Lucide React](https://lucide.dev/)

### Guías y artículos
- [Authentication with Spring Security and JWT](https://josealopez.dev/en/blog/authentication-with-spring-security-and-jwt)
- [@RestController Guide in Spring Boot - Step-by-Step CRUD](https://josealopez.dev/en/blog/spring-boot-rest-controller-crud)
- [Spring Security with WebSecurityConfig – Authentication and Authorization with Roles](https://josealopez.dev/en/blog/spring-security-authentication-and-authorization-guide)

### Estándares clínicos
- [ATS/ERS Standardisation of Spirometry](https://www.atsjournals.org/doi/10.1183/13993003.00688-2022)

## Decisiones técnicas
### Utilización de UUID v7 en entidades en vez de UUID v4 o Long
<img width="854" height="318" alt="{1FD74645-AE30-4ADE-907E-86E1ABAD1C5A}" src="https://github.com/user-attachments/assets/c8ecd6c3-4702-410e-8f9a-14cc0b66fee6" />

### Control de versiones de la API con ApiRoutes
Las rutas de la API están centralizadas en la clase ApiRoutes, siguiendo el principio Open/Closed de SOLID. Esto permite añadir nuevas versiones de la API (v2, v3...) sin modificar los controladores existentes, garantizando que los clientes que consumen la versión actual no se vean afectados por futuros cambios.

<img width="669" height="309" alt="{418976D7-BD2A-45A1-AB7D-28631D5EDF51}" src="https://github.com/user-attachments/assets/03d8670d-1e4c-49a6-be17-f6b2433845aa" />
<img width="418" height="54" alt="{D27E747C-06A4-4F9D-BAD1-5FD407888F95}" src="https://github.com/user-attachments/assets/de39d5b7-93d6-4c00-8805-6e69f13a934b" />

### UUID v7 Java
- [Documentación sobre UUID v7 que sustituí por Long](https://belief-driven-design.com/uuid-v7-java-3ccbb/)

## Tecnologías

**Frontend:** React, Tailwind CSS, Vite  
**Backend:** Java, Spring Boot, Spring Security, JWT  
**Base de datos:** PostgreSQL  
**Modelo IA:** Python, FastAPI  
