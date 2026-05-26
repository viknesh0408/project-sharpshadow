package com.sharpshadow.config;

import com.google.auth.oauth2.GoogleCredentials;
import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseOptions;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;

import jakarta.annotation.PostConstruct;
import java.io.ByteArrayInputStream;
import java.io.FileInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.util.Base64;

@Configuration
public class FirebaseConfig {

    /** Set FIREBASE_SERVICE_ACCOUNT_B64 in Railway (Base64-encoded JSON). */
    @Value("${app.firebase.credentials-base64:}")
    private String credentialsBase64;

    /** Fallback for local dev: path to the JSON file on disk. */
    @Value("${app.firebase.credentials-path:firebase-service-account.json}")
    private String credentialsPath;

    @Value("${app.firebase.bucket-name}")
    private String bucketName;

    @PostConstruct
    public void initializeFirebase() {
        try {
            if (FirebaseApp.getApps().isEmpty()) {
                InputStream serviceAccount = resolveCredentials();

                FirebaseOptions options = FirebaseOptions.builder()
                        .setCredentials(GoogleCredentials.fromStream(serviceAccount))
                        .setStorageBucket(bucketName)
                        .build();

                FirebaseApp.initializeApp(options);
            }
        } catch (IOException e) {
            throw new RuntimeException("Failed to initialize Firebase: " + e.getMessage(), e);
        }
    }

    /**
     * Resolves Firebase credentials in this priority order:
     *  1. FIREBASE_SERVICE_ACCOUNT_B64 env var (Base64-encoded JSON) — used in production
     *  2. File path (classpath or filesystem) — used in local development
     */
    private InputStream resolveCredentials() throws IOException {
        // Production path: decode the Base64 env var → raw JSON bytes → InputStream
        if (credentialsBase64 != null && !credentialsBase64.isBlank()) {
            byte[] decodedBytes = Base64.getDecoder().decode(credentialsBase64);
            return new ByteArrayInputStream(decodedBytes);
        }

        // Local dev path: load from classpath first, then filesystem
        InputStream fromClasspath = getClass().getClassLoader().getResourceAsStream(credentialsPath);
        if (fromClasspath != null) {
            return fromClasspath;
        }
        return new FileInputStream(credentialsPath);
    }
}
