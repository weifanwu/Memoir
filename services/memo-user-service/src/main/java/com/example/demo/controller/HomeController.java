package com.example.demo.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import jakarta.servlet.http.HttpSession;

import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;

@RestController
public class HomeController {

    @GetMapping("/home")
    public String home(@AuthenticationPrincipal UserDetails user, HttpSession session) {
        String sessionId = session.getId();
        return "Welcome, " + user.getUsername() + "! This page is protected. Your session ID is: " + sessionId;
    }
}
