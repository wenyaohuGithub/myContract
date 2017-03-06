package com.hu.cm.repository;

import com.hu.cm.domain.Category;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;

import java.util.List;

/**
 * Spring Data JPA repository for the Category entity.
 */
public interface CategoryRepository extends JpaRepository<Category,Long> {
    @Query("SELECT c FROM Category c WHERE c.account.id = (:accountId)")
    Page<Category> findAllForAccount(Pageable var1, @Param("accountId")Long accountId);

    @Query("SELECT c FROM Category c WHERE c.account.id = (:accountId)")
    List<Category> findAllWithAccountId(@Param("accountId")Long accountId);
}
