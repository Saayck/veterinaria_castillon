package com.consolidado;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

public class GenHash {
    public static void main(String[] args) {
        BCryptPasswordEncoder enc = new BCryptPasswordEncoder();
        System.out.println(enc.encode("123456"));
        System.out.println(enc.encode("admin123"));
        System.out.println(enc.encode("admin"));
        System.out.println(enc.encode("password"));
    }
}
