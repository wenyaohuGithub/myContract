package com.hu.cm.repository.admin;

import com.hu.cm.domain.admin.Department;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;

/**
 * Spring Data JPA repository for the Department entity.
 */
public interface DepartmentRepository extends JpaRepository<Department,Long> {
    @Query("SELECT d FROM Department d LEFT JOIN FETCH d.employees WHERE d.id = (:id)")
    public Department findByIdAndFetchEager(@Param("id") Long id);

    @Query("SELECT d FROM Department d LEFT JOIN FETCH d.employees WHERE d.name = (:name) AND d.account.id = (:accountId)")
    public Department findOneByName(@Param("name")String name, @Param("accountId") Long accountId);
}
