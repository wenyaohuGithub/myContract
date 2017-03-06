package com.hu.cm.security.xauth;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.Security;
import java.util.ArrayList;
import java.util.Calendar;
import java.util.Collections;
import java.util.Date;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Created by wenyaohu on 2/12/17.
 */
public final class TokenManager {

    private static Logger log = LoggerFactory.getLogger(TokenManager.class);

    private static final ConcurrentHashMap<String, Token> tokenMap = new ConcurrentHashMap<String, Token>();

    public final ArrayList<Token> getAllTokens() {
        return new ArrayList<Token>(tokenMap.values());
    }

    public final ArrayList<String> getAllTokenKeys() {
        return Collections.list(tokenMap.keys());
    }

    /**
     * Get token
     *
     * @param token
     * @return
     */
    public static final Token get(String token) {
        if (token == null) {
            return null;
        }
        return tokenMap.get(token);
    }


    /**
     * Remove token
     *
     * @param token
     * @return
     */
    public final void remove(Token token) {
        if (token == null) {
            return;
        }
        tokenMap.remove(token.getToken());
    }

    public static void addToken(Token token){
        tokenMap.put(token.getToken(), token);
    }

    public static Token getCurrentToken() {
        final Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication instanceof TokenAuthentication) {
            String tokenString =  ((TokenAuthentication) authentication).getTokenString();
            return tokenMap.get(tokenString);
        } else {
            return null;
        }
    }
}