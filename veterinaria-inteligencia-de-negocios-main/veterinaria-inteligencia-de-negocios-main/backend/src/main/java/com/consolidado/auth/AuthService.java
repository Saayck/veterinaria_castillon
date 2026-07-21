package com.consolidado.auth;

import com.consolidado.dto.LoginRequest;
import com.consolidado.dto.LoginResponse;
import com.consolidado.security.JwtService;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class AuthService {

    private final JdbcTemplate jdbc;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthService(@Qualifier("consolidadoJdbcTemplate") JdbcTemplate jdbc,
                       PasswordEncoder passwordEncoder,
                       JwtService jwtService) {
        this.jdbc = jdbc;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    public Optional<LoginResponse> authenticate(LoginRequest request) {
        var rows = jdbc.query(
                "SELECT PASSWORD_HASH, ROL FROM USUARIO WHERE USERNAME = ? AND ESTADO = 'A'",
                (rs, row) -> new Object[]{rs.getString("PASSWORD_HASH"), rs.getString("ROL")},
                request.username()
        );

        if (rows.isEmpty()) return Optional.empty();

        String hash = (String) rows.getFirst()[0];
        String rol = (String) rows.getFirst()[1];

        if (!passwordEncoder.matches(request.password(), hash)) {
            return Optional.empty();
        }

        String token = jwtService.generateToken(request.username(), rol);
        return Optional.of(new LoginResponse(token, request.username(), rol));
    }
}