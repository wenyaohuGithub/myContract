package com.hu.cm.repository;

import com.hu.cm.domain.Contract;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.querydsl.QueryDslPredicateExecutor;
import org.springframework.data.repository.query.Param;

import java.util.List;

/**
 * Spring Data JPA repository for the Contract entity.
 */
public interface ContractRepository extends JpaRepository<Contract, Long>, QueryDslPredicateExecutor<Contract> {
    @Query("SELECT c FROM Contract c LEFT JOIN FETCH c.relatedDepartments LEFT JOIN FETCH c.contractParty " +
        "LEFT JOIN FETCH c.category LEFT JOIN FETCH c.projects LEFT JOIN FETCH c.tasks WHERE c.id = (:id) ORDER BY c.name")
    public Contract findByIdAndFetchEager(@Param("id") Long id);

    @Query("SELECT c FROM Contract c WHERE c.account.id = (:accountId) ORDER BY c.name")
    Page<Contract> findAllForAccount(Pageable var1, @Param("accountId")Long accountId);

    @Query("SELECT c FROM Contract c WHERE c.account.id = (:accountId) AND c.administrator.id = (:userId) ORDER BY c.name")
    Page<Contract> findAllForUser(Pageable var1, @Param("accountId")Long accountId, @Param("userId")Long userId);

    @Query("SELECT c FROM Contract c WHERE c.account.id = (:accountId) AND c.administrativeDepartment.id = (:deptId) ORDER BY c.name")
    Page<Contract> findAllForDepartment(Pageable var1, @Param("accountId")Long accountId, @Param("deptId")Long deptId);
}
