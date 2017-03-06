package com.hu.cm.web.rest.admin;

import com.codahale.metrics.annotation.Timed;
import com.hu.cm.domain.admin.Account;
import com.hu.cm.repository.admin.AccountRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import javax.inject.Inject;
import javax.validation.Valid;
import java.net.URI;
import java.net.URISyntaxException;
import java.util.List;
import java.util.Optional;


/**
 * REST controller for managing accounts.
 */
@RestController
@RequestMapping("/api/accounts")
public class AccountResource {

    private final Logger log = LoggerFactory.getLogger(AccountResource.class);

    @Inject
    private AccountRepository accountRepository;

    /**
     * POST  -> Create a new account.
     */
    @RequestMapping(method = RequestMethod.POST,
            produces = MediaType.APPLICATION_JSON_VALUE)
    @Timed
    public ResponseEntity<Account> create(@Valid @RequestBody Account account) throws URISyntaxException {
        log.debug("REST request to save Account : {}", account);
        Account result = accountRepository.save(account);
        return ResponseEntity.created(new URI("/api/accounts/" + account.getName())).body(result);
    }

    /**
     * PUT  /roles -> Updates an existing account.
     */
    @RequestMapping(method = RequestMethod.PUT,
            produces = MediaType.APPLICATION_JSON_VALUE)
    @Timed
    public ResponseEntity<Account> update(@Valid @RequestBody Account account) throws URISyntaxException {
        log.debug("REST request to update Account : {}", account);
        Account result = accountRepository.save(account);
        return ResponseEntity.ok().body(result);
    }

    /**
     * GET   -> get all the accounts.
     */
    @RequestMapping(method = RequestMethod.GET,
            produces = MediaType.APPLICATION_JSON_VALUE)
    @Timed
    public List<Account> getAll() {
        log.debug("REST request to get all accounts");
        return accountRepository.findAll();
    }

    /**
     * GET  /byname/:name -> get the "name" account.
     */
    @RequestMapping(value = "/byname/{name}",
            method = RequestMethod.GET,
            produces = MediaType.APPLICATION_JSON_VALUE)
    @Timed
    public ResponseEntity<Account> getByName(@PathVariable String name) {
        log.debug("REST request to get Account : {}", name);
        return accountRepository.findOneByName(name)
                .map(account -> new ResponseEntity<>(account, HttpStatus.OK))
                .orElse(new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }

    /**
     * GET  /:id -> get the "id" account.
     */
    @RequestMapping(value = "/{id}",
            method = RequestMethod.GET,
            produces = MediaType.APPLICATION_JSON_VALUE)
    @Timed
    public ResponseEntity<Account> get(@PathVariable Long id) {
        log.debug("REST request to get Account : {}", id);
        return Optional.ofNullable(accountRepository.findOne(id))
                .map(account -> new ResponseEntity<>(
                        account,
                        HttpStatus.OK))
                .orElse(new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }

    /**
     * DELETE  /:name -> delete the "name" account.
     */
    @RequestMapping(value = "/{id}",
            method = RequestMethod.DELETE,
            produces = MediaType.APPLICATION_JSON_VALUE)
    @Timed
    public void delete(@PathVariable Long id) {
        log.debug("REST request to delete Account : {}", id);
        accountRepository.delete(id);
    }
}
