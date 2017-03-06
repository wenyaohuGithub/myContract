package com.hu.cm.repository.admin;

import com.hu.cm.domain.admin.Role;
import org.springframework.data.jpa.repository.JpaRepository;

/**
 * Spring Data JPA repository for the Authority entity.
 */
public interface RoleRepository extends JpaRepository<Role, String> {
}
