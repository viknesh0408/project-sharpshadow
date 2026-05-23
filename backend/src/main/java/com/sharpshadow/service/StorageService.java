package com.sharpshadow.service;

import com.google.cloud.storage.Blob;
import com.google.cloud.storage.Bucket;
import com.google.cloud.storage.Storage;
import com.google.firebase.cloud.StorageClient;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.InputStream;
import java.net.URL;
import java.util.concurrent.TimeUnit;

@Service
public class StorageService {

    private static final Logger log = LoggerFactory.getLogger(StorageService.class);

    @Value("${app.firebase.bucket-name}")
    private String bucketName;

    @Value("${app.firebase.presigned-url-duration-minutes}")
    private int presignedUrlDurationMinutes;

    public String uploadFile(String key, InputStream inputStream, long contentLength, String contentType) {
        try {
            Bucket bucket = StorageClient.getInstance().bucket();
            if (bucket == null) {
                throw new RuntimeException("Firebase Storage bucket is not initialized. Ensure app.firebase.bucket-name is correct.");
            }
            
            bucket.create(key, inputStream, contentType);
            log.info("Uploaded file to Firebase Storage with key: {}", key);
            return key;
        } catch (Exception e) {
            log.error("Failed to upload file to Firebase Storage: {}", e.getMessage(), e);
            throw new RuntimeException("Storage upload error: " + e.getMessage(), e);
        }
    }

    public String generatePresignedUrl(String key) {
        try {
            Bucket bucket = StorageClient.getInstance().bucket();
            if (bucket == null) {
                throw new RuntimeException("Firebase Storage bucket is not initialized");
            }

            Blob blob = bucket.get(key);
            if (blob == null) {
                throw new RuntimeException("File not found in storage: " + key);
            }

            URL signedUrl = blob.signUrl(
                    presignedUrlDurationMinutes,
                    TimeUnit.MINUTES,
                    Storage.SignUrlOption.withV4Signature()
            );
            log.info("Generated Firebase Storage signed URL for key: {} (expires in {} min)", key, presignedUrlDurationMinutes);
            return signedUrl.toString();
        } catch (Exception e) {
            log.error("Failed to generate signed URL for key: {}", key, e);
            throw new RuntimeException("Failed to generate download link: " + e.getMessage(), e);
        }
    }

    public void deleteFile(String key) {
        try {
            Bucket bucket = StorageClient.getInstance().bucket();
            if (bucket == null) {
                throw new RuntimeException("Firebase Storage bucket is not initialized");
            }

            Blob blob = bucket.get(key);
            if (blob != null) {
                blob.delete();
                log.info("Deleted file from Firebase Storage with key: {}", key);
            } else {
                log.warn("File to delete not found in Firebase Storage: {}", key);
            }
        } catch (Exception e) {
            log.error("Failed to delete file from Firebase Storage: {}", key, e);
        }
    }

    public String getPublicUrl(String key) {
        return String.format("https://storage.googleapis.com/%s/%s", bucketName, key);
    }
}
