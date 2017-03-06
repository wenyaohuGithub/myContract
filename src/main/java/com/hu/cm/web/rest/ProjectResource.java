package com.hu.cm.web.rest;

import com.codahale.metrics.annotation.Timed;
import com.hu.cm.domain.Category;
import com.hu.cm.domain.Project;
import com.hu.cm.domain.admin.Account;
import com.hu.cm.repository.ProjectRepository;
import com.hu.cm.repository.admin.AccountRepository;
import com.hu.cm.security.xauth.TokenManager;
import com.hu.cm.web.rest.admin.LoginUser;
import com.hu.cm.web.rest.util.PaginationUtil;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpHeaders;
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
 * REST controller for managing Project.
 */
@RestController
@RequestMapping("/api")
public class ProjectResource {

    private final Logger log = LoggerFactory.getLogger(ProjectResource.class);

    @Inject
    private ProjectRepository projectRepository;

    @Inject
    private AccountRepository accountRepository;

    /**
     * POST  /projects -> Create a new project.
     */
    @RequestMapping(value = "/projects",
            method = RequestMethod.POST,
            produces = MediaType.APPLICATION_JSON_VALUE)
    @Timed
    public ResponseEntity<Project> create(@Valid @RequestBody Project project) throws URISyntaxException {
        log.debug("REST request to save Project : {}", project);
        if (project.getId() != null) {
            return ResponseEntity.badRequest().header("Failure", "A new project cannot already have an ID").body(null);
        }
        LoginUser user = (LoginUser)TokenManager.getCurrentToken().getUserDetails();
        Long accountId = user.getAccount().getId();
        if(accountId == null){
            log.error("create: Account id missing");
            return new ResponseEntity<>(null, null, HttpStatus.BAD_REQUEST);
        }
        Account account = accountRepository.findOne(accountId);
        project.setAccount(account);
        Project result = projectRepository.save(project);
        return ResponseEntity.created(new URI("/api/projects/" + project.getId())).body(result);
    }

    /**
     * PUT  /projects -> Updates an existing project.
     */
    @RequestMapping(value = "/projects",
        method = RequestMethod.PUT,
        produces = MediaType.APPLICATION_JSON_VALUE)
    @Timed
    public ResponseEntity<Project> update(@Valid @RequestBody Project project) throws URISyntaxException {
        log.debug("REST request to update Project : {}", project);
        if (project.getId() == null) {
            return create(project);
        }
        Project result = projectRepository.save(project);
        return ResponseEntity.ok().body(result);
    }

    /**
     * GET  /projects -> get all the projects.
     */
    @RequestMapping(value = "/projects",
            method = RequestMethod.GET,
            produces = MediaType.APPLICATION_JSON_VALUE)
    @Timed
    public ResponseEntity<List<Project>> getAll(@RequestParam(value = "page" , required = false) Integer offset,
                                  @RequestParam(value = "per_page", required = false) Integer limit)
        throws URISyntaxException {
        LoginUser user = (LoginUser)TokenManager.getCurrentToken().getUserDetails();
        Long accountId = user.getAccount().getId();
        if(accountId == null){
            log.error("getAll(): Account id missing");
            return new ResponseEntity<>(null, null, HttpStatus.BAD_REQUEST);
        }

        Page<Project> page = projectRepository.findAllForAccount(PaginationUtil.generatePageRequest(offset, limit), accountId);
        HttpHeaders headers = PaginationUtil.generatePaginationHttpHeaders(page, "/api/projects", offset, limit);
        return new ResponseEntity<>(page.getContent(), headers, HttpStatus.OK);
    }

    /**
     * GET  /projects/:id -> get the "id" project.
     */
    @RequestMapping(value = "/projects/{id}",
            method = RequestMethod.GET,
            produces = MediaType.APPLICATION_JSON_VALUE)
    @Timed
    public ResponseEntity<Project> get(@PathVariable Long id) {
        log.debug("REST request to get Project : {}", id);
        return Optional.ofNullable(projectRepository.findOne(id))
            .map(project -> new ResponseEntity<>(
                project,
                HttpStatus.OK))
            .orElse(new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }

    /**
     * DELETE  /projects/:id -> delete the "id" project.
     */
    @RequestMapping(value = "/projects/{id}",
            method = RequestMethod.DELETE,
            produces = MediaType.APPLICATION_JSON_VALUE)
    @Timed
    public void delete(@PathVariable Long id) {
        log.debug("REST request to delete Project : {}", id);
        projectRepository.delete(id);
    }
}
