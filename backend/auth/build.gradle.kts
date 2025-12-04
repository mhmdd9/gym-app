plugins {
    `java-library`
}

dependencies {
    implementation(project(":common"))
    
    api("org.springframework.boot:spring-boot-starter-security")
    api("io.jsonwebtoken:jjwt-api:0.12.3")
    runtimeOnly("io.jsonwebtoken:jjwt-impl:0.12.3")
    runtimeOnly("io.jsonwebtoken:jjwt-jackson:0.12.3")
    
    // Rate limiting
    implementation("com.bucket4j:bucket4j-core:8.7.0")
}

