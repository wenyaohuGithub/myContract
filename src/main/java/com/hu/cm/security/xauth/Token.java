package com.hu.cm.security.xauth;

import com.hu.cm.domain.admin.Account;
import org.springframework.security.core.userdetails.UserDetails;

/**
 * The security token.
 */
public class Token {

    String token;
    long expires;
    UserDetails userDetails;

    public Token(String token, long expires){
        this.token = token;
        this.expires = expires;
    }

    public Token(String token, long expires, UserDetails userDetails){
        this.token = token;
        this.expires = expires;
        this.userDetails = userDetails;
    }

    public String getToken() {
        return token;
    }

    public long getExpires() {
        return expires;
    }

    public UserDetails getUserDetails() { return userDetails; }
}
