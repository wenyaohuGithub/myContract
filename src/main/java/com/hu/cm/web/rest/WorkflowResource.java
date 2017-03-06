package com.hu.cm.web.rest;

import com.codahale.metrics.annotation.Timed;
import com.hu.cm.domain.Workflow;
import com.hu.cm.domain.WorkflowProcess;
import com.hu.cm.domain.admin.Account;
import com.hu.cm.domain.configuration.Process;
import com.hu.cm.repository.WorkflowProcessRepository;
import com.hu.cm.repository.WorkflowRepository;
import com.hu.cm.repository.WorkflowRepository1;
import com.hu.cm.repository.admin.AccountRepository;
import com.hu.cm.security.xauth.TokenManager;
import com.hu.cm.web.rest.admin.LoginUser;
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
import java.sql.ResultSet;
import java.util.*;

/**
 * REST controller for managing Workflow.
 */
@RestController
@RequestMapping("/api")
public class WorkflowResource {

    private final Logger log = LoggerFactory.getLogger(WorkflowResource.class);

    @Inject
    private WorkflowRepository workflowRepository;

    @Inject
    private WorkflowProcessRepository wpRepository;

    @Inject
    private AccountRepository accountRepository;

    /**
     * POST  /workflows -> Create a new workflow.
     */
    @RequestMapping(value = "/workflows",
            method = RequestMethod.POST,
            produces = MediaType.APPLICATION_JSON_VALUE)
    @Timed
    public ResponseEntity<Workflow> create(@Valid @RequestBody Workflow workflow) throws URISyntaxException {
        log.debug("REST request to save Workflow : {}", workflow);
        if (workflow.getId() != null) {
            return ResponseEntity.badRequest().header("Failure", "A new workflow cannot already have an ID").body(null);
        }
        LoginUser user = (LoginUser)TokenManager.getCurrentToken().getUserDetails();
        Long accountId = user.getAccount().getId();
        if(accountId == null){
            log.error("create: Account id missing");
            return new ResponseEntity<>(null, null, HttpStatus.BAD_REQUEST);
        }
        Account account = accountRepository.findOne(accountId);
        workflow.setAccount(account);
        Workflow result = workflowRepository.save(workflow);
        return ResponseEntity.created(new URI("/api/workflows/" + workflow.getId())).body(result);
    }

    /**
     * PUT  /workflows -> Updates an existing workflow.
     */
    @RequestMapping(value = "/workflows",
        method = RequestMethod.PUT,
        produces = MediaType.APPLICATION_JSON_VALUE)
    @Timed
    public ResponseEntity<Workflow> update(@Valid @RequestBody Workflow workflow) throws URISyntaxException {
        log.debug("REST request to update Workflow : {}", workflow);
        if (workflow.getId() == null) {
            return create(workflow);
        }
        Workflow result = workflowRepository.save(workflow);
        return ResponseEntity.ok().body(result);
    }

    /**
     * GET  /workflows -> get all the workflows.
     */
    @RequestMapping(value = "/workflows",
            method = RequestMethod.GET,
            produces = MediaType.APPLICATION_JSON_VALUE)
    @Timed
    public ResponseEntity<List<Workflow>>getAll() {
        log.debug("REST request to get all Workflows");
        LoginUser user = (LoginUser)TokenManager.getCurrentToken().getUserDetails();
        Long accountId = user.getAccount().getId();
        if(accountId == null){
            log.error("getAll(): Account id missing");
            return new ResponseEntity<>(null, null, HttpStatus.BAD_REQUEST);
        }
        return new ResponseEntity<>(workflowRepository.findAllForAccount(accountId), null, HttpStatus.OK);

    }

    /**
     * GET  /workflows/:id -> get the "id" workflow.
     */
    @RequestMapping(value = "/workflows/{id}",
            method = RequestMethod.GET,
            produces = MediaType.APPLICATION_JSON_VALUE)
    @Timed
    public ResponseEntity<Workflow> get(@PathVariable Long id) {
        log.debug("REST request to get Workflow : {}", id);
        //Workflow wf = workflowRepository.findOneWithEagerRelationships(id);

        Workflow wf = workflowRepository.findOne(id);
        if(wf != null){
            List<WorkflowProcess> wps = wpRepository.findWithWorkflowId(id);
            wf.setProcesses(new ArrayList<Process>());
            for(WorkflowProcess wp : wps){
                wf.getProcesses().add(wp.getProcess());
            }
        }
        return Optional.ofNullable(wf)
            .map(workflow -> new ResponseEntity<>(
                workflow,
                HttpStatus.OK))
            .orElse(new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }

    /**
     * DELETE  /workflows/:id -> delete the "id" workflow.
     */
    @RequestMapping(value = "/workflows/{id}",
            method = RequestMethod.DELETE,
            produces = MediaType.APPLICATION_JSON_VALUE)
    @Timed
    public void delete(@PathVariable Long id) {
        log.debug("REST request to delete Workflow : {}", id);
        workflowRepository.delete(id);
    }
}
