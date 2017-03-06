package com.hu.cm.repository.admin;

import com.hu.cm.domain.admin.User;

import org.joda.time.DateTime;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

/**
 * Spring Data JPA repository for the User entity.
 */
public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findOneByActivationKey(String activationKey);

    List<User> findAllByActivatedIsFalseAndCreatedDateBefore(DateTime dateTime);

    Optional<User> findOneByResetKey(String resetKey);

    Optional<User> findOneByEmail(String email);

    @Query("SELECT u FROM User u JOIN FETCH u.userAccounts WHERE u.login = (:login)")
    Optional<User> findOneByLogin(@Param("login") String login);

    @Query("SELECT u FROM User u JOIN FETCH u.userAccounts WHERE u.id = (:id)")
    public User findByIdAndFetchUserAccounts(@Param("id") Long id);

    @Query("SELECT u FROM User u JOIN FETCH u.userAccounts WHERE u.login = (:login)")
    public User findByIdAndFetchUserAccountByLogin(@Param("login") String login);

    @Override
    void delete(User t);

}
