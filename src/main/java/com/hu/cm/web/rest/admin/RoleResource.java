package com.hu.cm.web.rest.admin;

import com.codahale.metrics.annotation.Timed;
import com.hu.cm.domain.admin.Role;
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
 * REST controller for managing Role.
 */
@RestController
@RequestMapping("/api")
public class RoleResource {

    private final Logger log = LoggerFactory.getLogger(RoleResource.class);

    @Inject
    private RoleRepository roleRepository;

    /**
     * POST  /roles -> Create a new role.
     */
    @RequestMapping(value = "/roles",
            method = RequestMethod.POST,
            produces = MediaType.APPLICATION_JSON_VALUE)
    @Timed
    public ResponseEntity<Role> create(@Valid @RequestBody Role role) throws URISyntaxException {
        log.debug("REST request to save Role : {}", role);
        Role result = roleRepository.save(role);
        return ResponseEntity.created(new URI("/api/roles/" + role.getName())).body(result);
    }

    /**
     * PUT  /roles -> Updates an existing role.
     */
    @RequestMapping(value = "/roles",
        method = RequestMethod.PUT,
        produces = MediaType.APPLICATION_JSON_VALUE)
    @Timed
    public ResponseEntity<Role> update(@Valid @RequestBody Role role) throws URISyntaxException {
        log.debug("REST request to update Role : {}", role);
        Role result = roleRepository.save(role);
        return ResponseEntity.ok().body(result);
    }

    /**
     * GET  /roles -> get all the roles.
     */
    @RequestMapping(value = "/roles",
            method = RequestMethod.GET,
            produces = MediaType.APPLICATION_JSON_VALUE)
    @Timed
    public List<Role> getAll() {
        log.debug("REST request to get all Roles");
        return roleRepository.findAll();
    }

    /**
     * GET  /roles/:name -> get the "name" role.
     */
    @RequestMapping(value = "/roles/{name}",
            method = RequestMethod.GET,
            produces = MediaType.APPLICATION_JSON_VALUE)
    @Timed
    public ResponseEntity<Role> get(@PathVariable String name) {
        log.debug("REST request to get Role : {}", name);
        return Optional.ofNullable(roleRepository.findOne(name))
            .map(role -> new ResponseEntity<>(
                role,
                HttpStatus.OK))
            .orElse(new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }

    /**
     * DELETE  /roles/:name -> delete the "name" role.
     */
    @RequestMapping(value = "/roles/{name}",
            method = RequestMethod.DELETE,
            produces = MediaType.APPLICATION_JSON_VALUE)
    @Timed
    public void delete(@PathVariable String name) {
        log.debug("REST request to delete Role : {}", name);
        roleRepository.delete(name);
    }
}
