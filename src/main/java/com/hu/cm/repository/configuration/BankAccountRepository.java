package com.hu.cm.repository.configuration;

import com.hu.cm.domain.BankAccount;
import org.springframework.data.jpa.repository.*;

/**
 * Spring Data JPA repository for the BankAccount entity.
 */
public interface BankAccountRepository extends JpaRepository<BankAccount,Long> {

}
