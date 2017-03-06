package com.hu.cm.config;

/**
 * Application constants.
 */
public final class Constants {

    private Constants() {
    }

    // Spring profile for development, production and "fast", see http://jhipster.github.io/profiles.html
    public static final String SPRING_PROFILE_DEVELOPMENT = "dev";
    public static final String SPRING_PROFILE_PRODUCTION = "prod";
    public static final String SPRING_PROFILE_FAST = "fast";
    // Spring profile used when deploying with Spring Cloud (used when deploying to CloudFoundry)
    public static final String SPRING_PROFILE_CLOUD = "cloud";
    // Spring profile used when deploying to Heroku
    public static final String SPRING_PROFILE_HEROKU = "heroku";

    public static final String SYSTEM_ACCOUNT = "system";

    public static final String PROCESS_CONTRACT_DRAFT = "CONTRACT_DRAFT";
    public static final String PROCESS_INTERNAL_DIV_REVIEW = "INTERNAL_DIV_REVIEW";
    public static final String PROCESS_RELATED_DIV_REVIEW = "RELATED_DIV_REVIEW";
    public static final String PROCESS_INTERNAL_DEPT_REVIEW = "INTERNAL_DEPT_REVIEW";
    public static final String PROCESS_RELATED_DEPT_REVIEW = "RELATED_DEPT_REVIEW";
    public static final String PROCESS_FINANCE_DEPT_REVIEW = "FINANCE_DEPT_REVIEW";
    public static final String PROCESS_LEGAL_DEPT_REVIEW = "LEGAL_DEPT_REVIEW";
    public static final String PROCESS_TECH_DEPT_REVIEW = "TECH_DEPT_REVIEW";
    public static final String PROCESS_DEV_STRATEGY_DEPT_REVIEW = "DEV_STRATEGY_DEPT_REVIEW";
    public static final String PROCESS_EXECUTIVE_REVIEW = "EXECUTIVE_REVIEW";
    public static final String PROCESS_CONTRACT_SIGN = "CONTRACT_SIGN";
    public static final String PROCESS_CONTRACT_EXECUTION = "CONTRACT_EXECUTION";
    public static final String PROCESS_CONTRACT_ARCHIVE = "CONTRACT_ARCHIVE";

}

