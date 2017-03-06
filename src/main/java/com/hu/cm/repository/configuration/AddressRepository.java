package com.hu.cm.repository.configuration;

import com.hu.cm.domain.configuration.Address;
import org.springframework.data.jpa.repository.*;

/**
 * Spring Data JPA repository for the Address entity.
 */
public interface AddressRepository extends JpaRepository<Address,Long> {

}
