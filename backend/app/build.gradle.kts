plugins {
    id("org.springframework.boot")
}

dependencies {
    implementation(project(":common"))
    implementation(project(":auth"))
    implementation(project(":club"))
    implementation(project(":booking"))
    
    runtimeOnly("org.postgresql:postgresql")
    
    // Flyway for database migrations
    implementation("org.flywaydb:flyway-core")
    implementation("org.flywaydb:flyway-database-postgresql")
    
    // DevTools
    developmentOnly("org.springframework.boot:spring-boot-devtools")
}

tasks.bootJar {
    archiveFileName.set("gym-booking-saas.jar")
}

