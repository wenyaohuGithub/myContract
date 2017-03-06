package com.hu.cm.web.rest.admin;

import com.codahale.metrics.annotation.Timed;
import com.hu.cm.domain.admin.Authority;
import com.hu.cm.domain.admin.Role;
import com.hu.cm.repository.admin.AuthorityRepository;
import com.hu.cm.repository.admin.RoleRepository;
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
 * REST controller for managing Authorities.
 */
@RestController
@RequestMapping("/api")
public class AuthorityResource {

    private final Logger log = LoggerFactory.getLogger(AuthorityResource.class);

    @Inject
    private AuthorityRepository authorityRepository;

    /**
     * POST  /authorities -> Create a new authority.
     */
    @RequestMapping(value = "/authorities",
            method = RequestMethod.POST,
            produces = MediaType.APPLICATION_JSON_VALUE)
    @Timed
    public ResponseEntity<Authority> create(@Valid @RequestBody Authority authority) throws URISyntaxException {
        log.debug("REST request to save Authority : {}", authority);
        Authority result = authorityRepository.save(authority);
        return ResponseEntity.created(new URI("/api/authorities/" + authority.getName())).body(result);
    }

    /**
     * PUT  /authorities -> Updates an existing authority.
     */
    @RequestMapping(value = "/authorities",
        method = RequestMethod.PUT,
        produces = MediaType.APPLICATION_JSON_VALUE)
    @Timed
    public ResponseEntity<Authority> update(@Valid @RequestBody Authority authority) throws URISyntaxException {
        log.debug("REST request to update Authority : {}", authority);
        Authority result = authorityRepository.save(authority);
        return ResponseEntity.ok().body(result);
    }

    /**
     * GET  /authorities -> get all the authorities.
     */
    @RequestMapping(value = "/authorities",
            method = RequestMethod.GET,
            produces = MediaType.APPLICATION_JSON_VALUE)
    @Timed
    public List<Authority> getAll() {
        log.debug("REST request to get all Authorities");
        return authorityRepository.findAll();
    }

    /**
     * GET  /authorities/:name -> get the "name" authority.
     */
    @RequestMapping(value = "/authorities/{name}",
            method = RequestMethod.GET,
            produces = MediaType.APPLICATION_JSON_VALUE)
    @Timed
    public ResponseEntity<Authority> get(@PathVariable String name) {
        log.debug("REST request to get Authority : {}", name);
        return Optional.ofNullable(authorityRepository.findOne(name))
            .map(role -> new ResponseEntity<>(
                role,
                HttpStatus.OK))
            .orElse(new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }

    /**
     * DELETE  /authorities/:name -> delete the "name" authority.
     */
    @RequestMapping(value = "/authorities/{name}",
            method = RequestMethod.DELETE,
            produces = MediaType.APPLICATION_JSON_VALUE)
    @Timed
    public void delete(@PathVariable String name) {
        log.debug("REST request to delete Authority : {}", name);
        authorityRepository.delete(name);
    }
}
