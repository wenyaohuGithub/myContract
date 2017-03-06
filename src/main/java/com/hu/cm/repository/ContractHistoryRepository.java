package com.hu.cm.repository;

import com.hu.cm.domain.ContractHistory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;

import java.util.List;

/**
 * Spring Data JPA repository for the ContractHistory entity.
 */
public interface ContractHistoryRepository extends JpaRepository<ContractHistory,Long> {

    @Query("select contract_history from ContractHistory contract_history where contract_history.user.login = ?#{principal.username}")
    List<ContractHistory> findAllForCurrentUser();

    @Query("select contract_history from ContractHistory contract_history where contract_history.contract.id = (:contractId)" +
            " order by contract_history.action_datetime desc")
    List<ContractHistory> findAllForContract(@Param("contractId") Long contractId);
}
