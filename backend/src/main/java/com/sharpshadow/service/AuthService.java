package com.sharpshadow.service;

import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.auth.FirebaseToken;
import com.sharpshadow.dto.auth.AuthResponse;
import com.sharpshadow.dto.auth.LoginRequest;
import com.sharpshadow.entity.User;
import com.sharpshadow.repository.UserRepository;
import com.sharpshadow.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthService {

    private final UserRepository userRepository;
    private final JwtUtil jwtUtil;

    @Transactional
    public AuthResponse loginWithFirebase(LoginRequest request) {
        try {
            // Verify Firebase ID token
            FirebaseToken decodedToken = FirebaseAuth.getInstance()
                    .verifyIdToken(request.getFirebaseToken());

            String uid = decodedToken.getUid();
            String email = decodedToken.getEmail();
            String name = decodedToken.getName() != null ? decodedToken.getName() : "User";
            String phone = (String) decodedToken.getClaims().get("phone_number");

            // Find or create user
            User user = userRepository.findByFirebaseUid(uid)
                    .orElseGet(() -> {
                        User newUser = User.builder()
                                .firebaseUid(uid)
                                .name(name)
                                .email(email)
                                .phone(phone)
                                .role(User.Role.USER)
                                .build();
                        return userRepository.save(newUser);
                    });

            // Update user info if changed
            if (email != null && !email.equals(user.getEmail())) {
                user.setEmail(email);
            }
            if (name != null && !name.equals(user.getName())) {
                user.setName(name);
            }
            userRepository.save(user);

            String token = jwtUtil.generateToken(uid, user.getId(), user.getRole().name());

            return AuthResponse.builder()
                    .token(token)
                    .userId(user.getId())
                    .name(user.getName())
                    .email(user.getEmail())
                    .role(user.getRole().name())
                    .build();

        } catch (Exception e) {
            log.error("Firebase auth error: {}", e.getMessage());
            throw new RuntimeException("Invalid Firebase token: " + e.getMessage());
        }
    }
}
