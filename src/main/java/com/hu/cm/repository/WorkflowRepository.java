package com.hu.cm.repository;

import com.hu.cm.domain.Workflow;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;

import java.sql.ResultSet;
import java.util.List;

/**
 * Spring Data JPA repository for the Workflow entity.
 */
public interface WorkflowRepository extends JpaRepository<Workflow,Long> {

    @Query("select workflow from Workflow workflow left join fetch workflow.processes where workflow.id =:id")
    Workflow findOneWithEagerRelationships(@Param("id") Long id);

    @Query("select workflow from Workflow workflow where workflow.account.id = :accountId")
    List<Workflow> findAllForAccount(@Param("accountId") Long accountId);
}
