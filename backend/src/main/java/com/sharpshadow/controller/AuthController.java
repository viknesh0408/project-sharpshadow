package com.sharpshadow.controller;

import com.sharpshadow.dto.auth.AuthResponse;
import com.sharpshadow.dto.auth.LoginRequest;
import com.sharpshadow.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        return ResponseEntity.ok(authService.loginWithFirebase(request));
    }

    // Register is handled via Firebase — same endpoint as login (find-or-create)
    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody LoginRequest request) {
        return ResponseEntity.ok(authService.loginWithFirebase(request));
    }
}
