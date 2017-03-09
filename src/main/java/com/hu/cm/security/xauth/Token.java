package com.hu.cm.security.xauth;

import com.hu.cm.domain.admin.Account;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Set;

/**
 * The security token.
 */
public class Token {

    String token;
    long expires;
    Set<GrantedAuthority> authorities;
    Account account;
    String userName;

    public Token(String token, long expires){
        this.token = token;
        this.expires = expires;
    }

    public Token(String token, long expires, Account account, String userName, Set<GrantedAuthority> authorities){
        this.token = token;
        this.expires = expires;
        this.account = account;
        this.userName = userName;
        this.authorities = authorities;
    }

    public String getToken() {
        return token;
    }

    public long getExpires() {
        return expires;
    }

    public Account getAccount() {
        return account;
    }

    public String getUserName() {
        return userName;
    }

    public Set<GrantedAuthority> getAuthorities() {
        return authorities;
    }
}
