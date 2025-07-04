package com.example.demo.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class LoginController {

    @GetMapping("/login")
    public String login() {
        return "login"; // 表示渲染 templates/login.html
    }

    @GetMapping("/signup")
    public String signup() {
        return "signup"; // 表示渲染 templates/login.html
    }
}
