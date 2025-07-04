package com.example.demo.controller;
import org.springframework.stereotype.Controller;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.provisioning.InMemoryUserDetailsManager;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

@Controller
public class RegisterController {

    private final InMemoryUserDetailsManager manager;
    private final PasswordEncoder encoder;

    public RegisterController(InMemoryUserDetailsManager manager, PasswordEncoder encoder) {
        this.manager = manager;
        this.encoder = encoder;
    }

    @PostMapping("/signup")
    public String register(@RequestParam String username, @RequestParam String password) {
        if (manager.userExists(username)) {
            return "error";
        }

        UserDetails user = User.withUsername(username)
                .password(encoder.encode(password))
                .roles("USER")
                .build();

        manager.createUser(user);
        return "registerSuccess";
    }
}
