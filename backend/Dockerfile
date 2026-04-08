FROM maven:3.8.4-openjdk-17-slim AS build

# Establecemos el directorio de trabajo en el contenedor
WORKDIR /app

# Copiamos el archivo pom.xml y las dependencias
COPY pom.xml .
COPY src ./src

# Ejecutamos Maven para descargar las dependencias (sin empaquetar, solo descarga)
RUN mvn clean install -DskipTests

# Creamos una imagen final para ejecutar la aplicación en desarrollo
FROM openjdk:17-jdk-slim

WORKDIR /app

# Copiamos las dependencias de la imagen build
COPY --from=build /app /app

# Exponemos el puerto donde Spring Boot correrá
EXPOSE 8080

# Ejecutamos la aplicación con Spring Boot en modo de desarrollo (usando Maven)
CMD ["mvn", "spring-boot:run"]