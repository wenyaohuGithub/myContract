package com.hu.cm.repository;

import com.hu.cm.domain.Contract;
import com.hu.cm.domain.ContractParty;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;

/**
 * Spring Data JPA repository for the ContractParty entity.
 */
public interface ContractPartyRepository extends JpaRepository<ContractParty,Long> {
    @Query("SELECT cp FROM ContractParty cp LEFT JOIN FETCH cp.bank_accounts " +
        "WHERE cp.id = (:id)")
    public ContractParty findByIdAndFetchEager(@Param("id") Long id);

    @Query("SELECT cp FROM ContractParty cp WHERE cp.account.id = (:accountId)")
    Page<ContractParty> findAllForAccount(Pageable var1, @Param("accountId")Long accountId);
}
