package com.hu.cm.repository.configuration;

import com.hu.cm.domain.configuration.FundSource;
import org.springframework.data.jpa.repository.*;

/**
 * Spring Data JPA repository for the FundSource entity.
 */
public interface FundSourceRepository extends JpaRepository<FundSource,Long> {

}
