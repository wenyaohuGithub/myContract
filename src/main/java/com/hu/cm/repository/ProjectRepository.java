package com.hu.cm.repository;

import com.hu.cm.domain.Contract;
import com.hu.cm.domain.Project;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;

import java.util.List;

/**
 * Spring Data JPA repository for the Project entity.
 */
public interface ProjectRepository extends JpaRepository<Project,Long> {
    @Query("SELECT p FROM Project p WHERE p.account.id = (:accountId)")
    Page<Project> findAllForAccount(Pageable var1, @Param("accountId")Long accountId);
}
