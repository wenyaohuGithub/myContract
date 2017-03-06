package com.hu.cm.repository.configuration;

import com.hu.cm.domain.configuration.Process;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;

/**
 * Spring Data JPA repository for the Process entity.
 */
public interface ProcessRepository extends JpaRepository<Process,Long> {
    @Query("SELECT p FROM Process p WHERE p.name = (:name)")
    public Process findOneByName(@Param("name")String name);
}
