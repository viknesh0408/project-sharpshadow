package com.sharpshadow.controller;

import com.sharpshadow.security.UserPrincipal;
import com.sharpshadow.service.DownloadService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/download")
@RequiredArgsConstructor
public class DownloadController {

    private final DownloadService downloadService;

    @GetMapping("/{productId}")
    public ResponseEntity<Map<String, String>> getDownloadUrl(
            @PathVariable Long productId,
            @AuthenticationPrincipal UserPrincipal principal) {
        String url = downloadService.getSecureDownloadUrl(principal.getId(), productId);
        return ResponseEntity.ok(Map.of(
                "downloadUrl", url,
                "expiresIn", "15 minutes"
        ));
    }
}
