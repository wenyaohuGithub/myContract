package com.hu.cm.security;

/**
 * Constants for Spring Security authorities.
 */
public final class AuthoritiesConstants {

    private AuthoritiesConstants() {
    }

    public static final String ADMIN = "ROLE_ADMIN";

    public static final String USER = "ROLE_USER";

    public static final String ANONYMOUS = "ROLE_ANONYMOUS";

    public static final String DEPARTMENT_HEAD = "ROLE_DEPARTMENT_HEAD";

    public static final String DIVISION_HEAD = "ROLE_DIVISION_HEAD";

    public static final String BRANCH_MANAGER = "ROLE_BRANCH_MANAGER";

    public static final String EXECUTIVE = "ROLE_EXECUTIVE";


    public static final String FINANCE_DEPT_HEAD = "ROLE_FINANCE_DEPT_HEAD";

    public static final String LEGAL_DEPT_HEAD = "ROLE_LEGAL_DEPT_HEAD";

    public static final String TECH_DEPT_HEAD = "ROLE_TECH_DEPT_HEAD";

    public static final String FINANCE_DEPT_STAFF = "ROLE_FINANCE_DEPT_STAFF";

    public static final String LEGAL_DEPT_STAFF = "ROLE_LEGAL_DEPT_STAFF";

    public static final String TECH_DEPT_STAFF = "ROLE_TECH_DEPT_STAFF";


    public static final String DEPT_CONTRACT_MANAGER = "ROLE_DEPT_CONTRACT_MANAGER";

    public static final String DEPT_CONTRACT_COMANAGER = "ROLE_DEPT_CONTRACT_COMANAGER";

    public static final String DEPT_CONTRACT_STAFF = "ROLE_DEPT_CONTRACT_STAFF";

    public static final String DIV_CONTRACT_MANAGER = "ROLE_DIV_CONTRACT_MANAGER";

    public static final String DIV_CONTRACT_COMANAGER = "ROLE_DIV_CONTRACT_COMANAGER";

    public static final String DIV_CONTRACT_STAFF = "ROLE_DIV_CONTRACT_STAFF";

    public static final String CONTRACT_SEAL_MANAGER = "ROLE_CONTRACT_SEAL_MANAGER";
}
