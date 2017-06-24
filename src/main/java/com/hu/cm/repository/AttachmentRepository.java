package com.hu.cm.repository;

import com.hu.cm.domain.Attachment;
import org.springframework.data.jpa.repository.JpaRepository;

/**
 * Spring Data JPA repository for the Category entity.
 */
public interface AttachmentRepository extends JpaRepository<Attachment,Long> {
}
