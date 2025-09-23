package com.example.demo.controller;
// import com.example.demo.grpc.GrpcDiaryClient;

import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.provisioning.InMemoryUserDetailsManager;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import jakarta.servlet.http.HttpSession;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final InMemoryUserDetailsManager manager;
    private final PasswordEncoder encoder;
    private final AuthenticationManager authManager;
    // private final GrpcDiaryClient grpcDiaryClient;  // 注入 gRPC 客户端

    public AuthController(InMemoryUserDetailsManager manager,
                          PasswordEncoder encoder,
                          AuthenticationManager authManager
                        //   ,GrpcDiaryClient grpcDiaryClient
                          ) {
        this.manager = manager;
        this.encoder = encoder;
        this.authManager = authManager;
        // this.grpcDiaryClient = grpcDiaryClient;
    }

    // 注册
    @PostMapping("/signup")
    public Map<String, String> register(@RequestBody Map<String, String> request) {
        String username = request.get("username");
        String password = request.get("password");

        if (manager.userExists(username)) {
            return Map.of("status", "error", "message", "User already exists");
        }

        UserDetails user = User.withUsername(username)
                .password(encoder.encode(password))
                .roles("USER")
                .build();

        manager.createUser(user);
        // try {
        //     String grpcStatus = grpcDiaryClient.addDiaryEntry(username, "欢迎加入我们的应用，祝你使用愉快！");
        //     System.out.println("gRPC welcome diary status: " + grpcStatus);
        // } catch (Exception e) {
        //     System.err.println("Failed to add welcome diary entry via gRPC: " + e.getMessage());
        // }
        return Map.of("status", "success", "message", "User registered successfully");
    }

    // 登录
    @PostMapping("/login")
    public Map<String, String> login(@RequestBody Map<String, String> request, HttpSession session) {
        String username = request.get("username");
        String password = request.get("password");

        try {
            Authentication auth = authManager.authenticate(
                new UsernamePasswordAuthenticationToken(username, password)
            );
            SecurityContextHolder.getContext().setAuthentication(auth);
            session.setAttribute("username", username);
            session.setAttribute("SPRING_SECURITY_CONTEXT", SecurityContextHolder.getContext());
            return Map.of("status", "success", "message", "Login successful");
        } catch (Exception e) {
            return Map.of("status", "error", "message", "Invalid username or password");
        }
    }

    @PostMapping("/signout")
    public Map<String, String> signout(HttpSession session) {
        session.invalidate();
        SecurityContextHolder.clearContext();
        return Map.of("status", "success", "message", "Logged out successfully");
    }

    @GetMapping("/check")
    public Map<String, Object> checkSession(HttpSession session) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        boolean isAuthenticated = auth != null && auth.isAuthenticated()
                && !"anonymousUser".equals(auth.getPrincipal());

        Map<String, Object> response = new HashMap<>();
        response.put("authenticated", isAuthenticated);
        response.put("username", isAuthenticated ? auth.getName() : null);
        return response;
    }

}
