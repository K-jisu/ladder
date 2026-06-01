plugins {
	// 시스템에 JDK 21이 없을 때 Gradle 툴체인이 자동으로 받아오도록 한다.
	id("org.gradle.toolchains.foojay-resolver-convention") version "0.8.0"
}

rootProject.name = "slack-ladder"
