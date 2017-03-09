package com.hu.cm.security.xauth;

import com.hu.cm.domain.admin.Account;
import com.hu.cm.web.rest.admin.LoginUser;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.codec.Hex;

import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.Set;

public class TokenProvider {

    private final String secretKey;
    private final int tokenValidity;

    public TokenProvider(String secretKey, int tokenValidity) {
        this.secretKey = secretKey;
        this.tokenValidity = tokenValidity;
    }

    public Token createToken(LoginUser userDetails) {
        long expires = System.currentTimeMillis() + 1000L * tokenValidity;
        String tokenString = userDetails.getUsername() + ":" + expires + ":" + computeSignature(userDetails, expires);
        Token token = new Token(tokenString, expires, userDetails.getAccount(), userDetails.getUsername(), (Set<GrantedAuthority>) userDetails.getAuthorities());
        TokenManager.addToken(token);
        return token;
    }

    public String computeSignature(LoginUser userDetails, long expires) {
        StringBuilder signatureBuilder = new StringBuilder();
        signatureBuilder.append(userDetails.getUsername()).append(":");
        signatureBuilder.append(expires).append(":");
        signatureBuilder.append(userDetails.getPassword()).append(":");
        signatureBuilder.append(secretKey);

        MessageDigest digest;
        try {
            digest = MessageDigest.getInstance("MD5");
        } catch (NoSuchAlgorithmException e) {
            throw new IllegalStateException("No MD5 algorithm available!");
        }
        return new String(Hex.encode(digest.digest(signatureBuilder.toString().getBytes())));
    }

    public String getUserNameFromToken(String authToken) {
        if (null == authToken) {
            return null;
        }
        String[] parts = authToken.split(":");
        return parts[0];
    }

    public boolean validateToken(String authToken, LoginUser userDetails) {
        // check if the token exist in token map
        Token token = TokenManager.get(authToken);
        if(token == null){
            return false;
        }

        String[] parts = authToken.split(":");
        long expires = Long.parseLong(parts[1]);
        String signature = parts[2];
        String signatureToMatch = computeSignature(userDetails, expires);
        return expires >= System.currentTimeMillis() && signature.equals(signatureToMatch);
    }
}
