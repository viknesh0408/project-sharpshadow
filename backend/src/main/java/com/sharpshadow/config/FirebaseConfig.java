package com.sharpshadow.config;

import com.google.auth.oauth2.GoogleCredentials;
import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseOptions;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
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

    private static final Logger log = LoggerFactory.getLogger(FirebaseConfig.class);

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
        if (FirebaseApp.getApps().isEmpty()) {
            try {
                InputStream serviceAccount = resolveCredentials();
                if (serviceAccount == null) {
                    log.warn("Firebase credentials not found — Firebase features will be unavailable. " +
                             "Set FIREBASE_SERVICE_ACCOUNT_B64 env var to enable Firebase.");
                    return;
                }

                FirebaseOptions options = FirebaseOptions.builder()
                        .setCredentials(GoogleCredentials.fromStream(serviceAccount))
                        .setStorageBucket(bucketName)
                        .build();

                FirebaseApp.initializeApp(options);
                log.info("Firebase initialized successfully.");

            } catch (IOException e) {
                // Log but don't crash — app can still serve non-Firebase endpoints
                log.error("Failed to initialize Firebase: {} — Firebase features will be unavailable.", e.getMessage(), e);
            }
        }
    }

    /**
     * Resolves Firebase credentials in this priority order:
     *  1. FIREBASE_SERVICE_ACCOUNT_B64 env var (Base64-encoded JSON) — used in production
     *  2. File path (classpath or filesystem) — used in local development
     *  3. Returns null if neither is available (app starts with Firebase disabled)
     */
    private InputStream resolveCredentials() {
        // Production: decode Base64 env var
        if (credentialsBase64 != null && !credentialsBase64.isBlank()) {
            byte[] decodedBytes = Base64.getDecoder().decode(credentialsBase64);
            return new ByteArrayInputStream(decodedBytes);
        }

        // Local dev: try classpath first
        InputStream fromClasspath = getClass().getClassLoader().getResourceAsStream(credentialsPath);
        if (fromClasspath != null) {
            return fromClasspath;
        }

        // Try filesystem path
        try {
            return new FileInputStream(credentialsPath);
        } catch (IOException e) {
            // File not found — return null, caller handles it gracefully
            return null;
        }
    }
}
