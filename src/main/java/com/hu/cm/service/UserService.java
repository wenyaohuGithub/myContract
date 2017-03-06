package com.hu.cm.service;

import com.hu.cm.domain.admin.Department;
import com.hu.cm.domain.admin.Role;
import com.hu.cm.domain.admin.User;
import com.hu.cm.domain.admin.UserAccount;
import com.hu.cm.domain.enumeration.DepartmentType;
import com.hu.cm.repository.admin.AuthorityRepository;
import com.hu.cm.repository.admin.DepartmentRepository;
import com.hu.cm.repository.admin.RoleRepository;
import com.hu.cm.repository.admin.UserRepository;
import com.hu.cm.security.SecurityUtils;
import com.hu.cm.service.util.RandomUtil;
import org.joda.time.DateTime;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import javax.inject.Inject;
import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;

/**
 * Service class for managing users.
 */
@Service
@Transactional
public class UserService {

    private final Logger log = LoggerFactory.getLogger(UserService.class);

    @Inject
    private PasswordEncoder passwordEncoder;

    @Inject
    private UserRepository userRepository;

    @Inject
    private AuthorityRepository authorityRepository;

    @Inject
    private DepartmentRepository departmentRepository;

    @Inject
    private RoleRepository roleRepository;

    public Optional<User> activateRegistration(String key) {
        log.debug("Activating user for activation key {}", key);
        userRepository.findOneByActivationKey(key)
            .map(user -> {
                // activate given user for the registration key.
                user.setActivated(true);
                user.setActivationKey(null);
                userRepository.save(user);
                log.debug("Activated user: {}", user);
                return user;
            });
        return Optional.empty();
    }

    public Optional<User> completePasswordReset(String newPassword, String key) {
       log.debug("Reset user password for reset key {}", key);

       return userRepository.findOneByResetKey(key)
           .filter(user -> {
               DateTime oneDayAgo = DateTime.now().minusHours(24);
               return user.getResetDate().isAfter(oneDayAgo.toInstant().getMillis());
           })
           .map(user -> {
               user.setPassword(passwordEncoder.encode(newPassword));
               user.setResetKey(null);
               user.setResetDate(null);
               userRepository.save(user);
               return user;
           });
    }

    public Optional<User> requestPasswordReset(String mail) {
       return userRepository.findOneByEmail(mail)
           .filter(user -> user.getActivated() == true)
           .map(user -> {
               user.setResetKey(RandomUtil.generateResetKey());
               user.setResetDate(DateTime.now());
               userRepository.save(user);
               return user;
           });
    }

    public User createUserInformation(String login, String password, String firstName, String lastName, String email,
                                      String langKey, Long departmentId) {

        User newUser = new User();
        //Authority authority = authorityRepository.findOne("ROLE_USER");
        Role role = roleRepository.findOne("ROLE_USER");
        Set<Role> roles = new HashSet<>();
        String encryptedPassword = passwordEncoder.encode(password);
        newUser.setLogin(login);
        // new user gets initially a generated password
        newUser.setPassword(encryptedPassword);
        newUser.setFirstName(firstName);
        newUser.setLastName(lastName);
        newUser.setEmail(email);
        newUser.setLangKey(langKey);
        newUser.setDepartmentId(departmentId);
        // new user is not active
        newUser.setActivated(false);
        // new user gets registration key
        newUser.setActivationKey(RandomUtil.generateActivationKey());
        roles.add(role);
        //newUser.setRoles(roles);
        userRepository.save(newUser);
        log.debug("Created Information for User: {}", newUser);
        return newUser;
    }

    public void updateUserInformation(String firstName, String lastName, String email, String langKey) {
        userRepository.findOneByLogin(SecurityUtils.getCurrentLogin()).ifPresent(u -> {
            u.setFirstName(firstName);
            u.setLastName(lastName);
            u.setEmail(email);
            u.setLangKey(langKey);
            userRepository.save(u);
            log.debug("Changed Information for User: {}", u);
        });
    }

    public void changePassword(String password) {
        userRepository.findOneByLogin(SecurityUtils.getCurrentLogin()).ifPresent(u-> {
            String encryptedPassword = passwordEncoder.encode(password);
            u.setPassword(encryptedPassword);
            userRepository.save(u);
            log.debug("Changed password for User: {}", u);
        });
    }

    @Transactional(readOnly = true)
    public User getUserWithRoles() {
        User currentUser = userRepository.findOneByLogin(SecurityUtils.getCurrentLogin()).get();
        UserAccount userAccount = currentUser.getUserAccounts().iterator().next();
        currentUser.setCurrentAccount(userAccount.getAccount());
        currentUser.setRoles(userAccount.getRoles());
        currentUser.getRoles().size();
        return currentUser;
    }

    /**
     * Not activated users should be automatically deleted after 3 days.
     * <p/>
     * <p>
     * This is scheduled to get fired everyday, at 01:00 (am).
     * </p>
     */
    @Scheduled(cron = "0 0 1 * * ?")
    public void removeNotActivatedUsers() {
        DateTime now = new DateTime();
        List<User> users = userRepository.findAllByActivatedIsFalseAndCreatedDateBefore(now.minusDays(3));
        for (User user : users) {
            log.debug("Deleting not activated user {}", user.getLogin());
            userRepository.delete(user);
        }
    }

    public User getUserInChargeOfReview(Department department){
        department = departmentRepository.findByIdAndFetchEager(department.getId());
        Set<User> members = department.getEmployees();
        /*if(department.getType() == DepartmentType.DIV) {
            for (User u : members) {
                if (u.getRoles().contains(Role.INSTANCE("ROLE_DIV_CONTRACT_STAFF"))) {
                    return u;
                } else if (u.getRoles().contains(Role.INSTANCE("ROLE_DIV_CONTRACT_COMANAGER"))) {
                    return u;
                } else if (u.getRoles().contains(Role.INSTANCE("ROLE_DIV_CONTRACT_MANAGER"))) {
                    return u;
                } else if (u.getRoles().contains(Role.INSTANCE("ROLE_DIV_HEAD"))) {
                    return u;
                }
            }
        } else if(department.getType() == DepartmentType.DEPT){
            for(User u : members){
                if(u.getRoles().contains(Role.INSTANCE("ROLE_DEPT_CONTRACT_STAFF"))){
                    return u;
                } else if(u.getRoles().contains(Role.INSTANCE("ROLE_DEPT_CONTRACT_COMANAGER"))) {
                    return u;
                } else if(u.getRoles().contains(Role.INSTANCE("ROLE_DEPT_CONTRACT_MANAGER"))) {
                    return u;
                } else if(u.getRoles().contains(Role.INSTANCE("ROLE_DEPT_HEAD"))) {
                    return u;
                }
            }
        }*/

        return null;
    }

    public User getUserCanApproveContract() {
        List<User> members = userRepository.findAll();
        for (User u : members) {
            UserAccount userAccount = u.getUserAccounts().iterator().next();
            if (userAccount.getRoles().contains(Role.INSTANCE("ROLE_BRANCH_MANAGER"))) {
                return u;
            } else if (userAccount.getRoles().contains(Role.INSTANCE("ROLE_EXECUTIVE"))) {
                return u;
            }
        }
        return null;
    }

    public User getUserCanSignContract() {
        List<User> members = userRepository.findAll();
        for (User u : members) {
            UserAccount userAccount = u.getUserAccounts().iterator().next();
            if (userAccount.getRoles().contains(Role.INSTANCE("ROLE_CONTRACT_SEAL_MGR"))) {
                return u;
            } else if (userAccount.getRoles().contains(Role.INSTANCE("ROLE_BRANCH_MANAGER"))) {
                return u;
            } else if (userAccount.getRoles().contains(Role.INSTANCE("ROLE_EXECUTIVE"))) {
                return u;
            }
        }
        return null;
    }
}
