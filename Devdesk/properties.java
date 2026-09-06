# backend/src/main/resources/application.properties
# Database Configuration
spring.datasource.url=jdbc:postgresql://localhost:5432/devdesk
spring.datasource.username=postgres
spring.datasource.password=postgres
spring.datasource.driver-class-name=org.postgresql.Driver

# JPA Configuration
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=false
spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.PostgreSQLDialect
spring.jpa.properties.hibernate.format_sql=true

# JWT Configuration
jwt.secret=devdeskSecretKeyForJWTTokenGeneration2024SecureKey123456789
jwt.expiration=86400000

# Server Configuration
server.port=8080
server.servlet.context-path=/

# CORS Configuration
spring.web.cors.allowed-origins=http://localhost:3000
spring.web.cors.allowed-methods=GET,POST,PUT,DELETE,OPTIONS
spring.web.cors.allowed-headers=*

# Logging
logging.level.org.springframework.security=INFO
logging.level.com.devdesk=DEBUG
