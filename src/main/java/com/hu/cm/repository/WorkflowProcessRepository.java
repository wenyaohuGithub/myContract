package com.hu.cm.repository;

import com.hu.cm.domain.WorkflowProcess;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

/**
 * Spring Data JPA repository for the FirstEntity entity.
 */
public interface WorkflowProcessRepository extends JpaRepository<WorkflowProcess,Long> {
    @Query("select wp from WorkflowProcess wp where wp.workflow.id = :id order by wp.sequence")
    List<WorkflowProcess> findWithWorkflowId(@Param("id") Long id);

}
