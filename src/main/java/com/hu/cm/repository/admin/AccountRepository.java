package com.hu.cm.repository.admin;

import com.hu.cm.domain.admin.Account;
import com.hu.cm.domain.admin.User;
import org.joda.time.DateTime;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

/**
 * Spring Data JPA repository for the Account entity.
 */
public interface AccountRepository extends JpaRepository<Account, Long> {

    Optional<Account> findOneByName(String name);
}
