package com.hu.cm.security.xauth;

import com.sun.security.auth.UserPrincipal;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.GrantedAuthority;

import java.util.Collection;

/**
 * Created by wenyaohu on 2/12/17.
 */

public class TokenAuthentication extends UsernamePasswordAuthenticationToken {

    private static final long serialVersionUID = 1528583668266837309L;

    private String tokenString;

    public TokenAuthentication(Object principal, Collection<? extends GrantedAuthority> authorities, String tokenString) {
        super(principal, null, authorities);
        this.tokenString = tokenString;
    }

    public String getTokenString() {
        return tokenString;
    }

}