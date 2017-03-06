package com.hu.cm.repository;

import com.hu.cm.domain.Workflow;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.sql.ResultSet;
import java.util.HashSet;
import java.util.Set;

/**
 * Spring Data JPA repository for the Workflow entity.
 */
public interface WorkflowRepository1 extends JpaRepository<Workflow,Long> {

    //@Query(value = "select workflow from Workflow workflow left join fetch workflow.processes where workflow.id =:id", nativeQuery = true)
    @Query(value =
        "select w.id, w.name, w.description, p.id, p.name, p.description " +
        "from workflow w, workflow_process wp, mc_process p " +
        "where w.id = wp.workflow_id " +
        "and p.id = wp.process_id " +
        "and w.id = :id " +
        "order by wp.sequence ", nativeQuery = true)
    Workflow findOneWithEagerRelationships(@Param("id") Long id);

}
