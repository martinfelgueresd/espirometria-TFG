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

### Estándares clínicos
- [ATS/ERS Standardisation of Spirometry](https://www.atsjournals.org/doi/10.1183/13993003.00688-2022)

## Decisiones técnicas
- Utilización de UUID v7 en entidades en vez de UUID v4 o Long
<img width="854" height="318" alt="{1FD74645-AE30-4ADE-907E-86E1ABAD1C5A}" src="https://github.com/user-attachments/assets/c8ecd6c3-4702-410e-8f9a-14cc0b66fee6" />

## Tecnologías

**Frontend:** React, Tailwind CSS, Vite  
**Backend:** Java, Spring Boot, Spring Security, JWT  
**Base de datos:** PostgreSQL  
**Modelo IA:** Python, FastAPI  
