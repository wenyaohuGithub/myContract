package com.hu.cm.web.rest.configuration;

import com.codahale.metrics.annotation.Timed;
import com.hu.cm.domain.Workflow;
import com.hu.cm.domain.WorkflowProcess;
import com.hu.cm.domain.admin.Role;
import com.hu.cm.domain.admin.User;
import com.hu.cm.domain.configuration.Process;
import com.hu.cm.repository.WorkflowProcessRepository;
import com.hu.cm.repository.WorkflowRepository;
import com.hu.cm.repository.admin.UserRepository;
import com.hu.cm.repository.configuration.ProcessRepository;
import com.hu.cm.security.SecurityUtils;
import com.hu.cm.service.ProcessService;
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
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.Set;

/**
 * REST controller for managing Process.
 */
@RestController
@RequestMapping("/api")
public class ProcessResource {

    private final Logger log = LoggerFactory.getLogger(ProcessResource.class);

    @Inject
    private ProcessRepository processRepository;

    @Inject
    private WorkflowRepository workflowRepository;

    @Inject
    private WorkflowProcessRepository wpRepository;

    @Inject
    private UserRepository userRepository;

    @Inject
    private ProcessService processService;

    /**
     * POST  /processes -> Create a new process.
     */
    @RequestMapping(value = "/processes",
            method = RequestMethod.POST,
            produces = MediaType.APPLICATION_JSON_VALUE)
    @Timed
    public ResponseEntity<Process> create(@Valid @RequestBody Process process) throws URISyntaxException {
        log.debug("REST request to save Process : {}", process);
        if (process.getId() != null) {
            return ResponseEntity.badRequest().header("Failure", "A new process cannot already have an ID").body(null);
        }
        Process result = processRepository.save(process);
        return ResponseEntity.created(new URI("/api/processes/" + process.getId())).body(result);
    }

    /**
     * PUT  /processes -> Updates an existing process.
     */
    @RequestMapping(value = "/processes",
        method = RequestMethod.PUT,
        produces = MediaType.APPLICATION_JSON_VALUE)
    @Timed
    public ResponseEntity<Process> update(@Valid @RequestBody Process process) throws URISyntaxException {
        log.debug("REST request to update Process : {}", process);
        if (process.getId() == null) {
            return create(process);
        }
        Process result = processRepository.save(process);
        return ResponseEntity.ok().body(result);
    }

    /**
     * GET  /processes -> get all the processes.
     */
    @RequestMapping(value = "/processes",
            method = RequestMethod.GET,
            produces = MediaType.APPLICATION_JSON_VALUE)
    @Timed
    public ResponseEntity<List<Process>> getAll(@RequestParam(value = "page" , required = false) Integer offset,
                                  @RequestParam(value = "per_page", required = false) Integer limit)
        throws URISyntaxException {
        Page<Process> page = processRepository.findAll(PaginationUtil.generatePageRequest(offset, limit));
        HttpHeaders headers = PaginationUtil.generatePaginationHttpHeaders(page, "/api/processes", offset, limit);
        return new ResponseEntity<>(page.getContent(), headers, HttpStatus.OK);
    }

    /**
     * GET  /processes/:id -> get the "id" process.
     */
    @RequestMapping(value = "/processes/{id}",
            method = RequestMethod.GET,
            produces = MediaType.APPLICATION_JSON_VALUE)
    @Timed
    public ResponseEntity<Process> get(@PathVariable Long id) {
        log.debug("REST request to get Process : {}", id);
        return Optional.ofNullable(processRepository.findOne(id))
            .map(process -> new ResponseEntity<>(
                process,
                HttpStatus.OK))
            .orElse(new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }

    /**
     * DELETE  /processes/:id -> delete the "id" process.
     */
    @RequestMapping(value = "/processes/{id}",
            method = RequestMethod.DELETE,
            produces = MediaType.APPLICATION_JSON_VALUE)
    @Timed
    public void delete(@PathVariable Long id) {
        log.debug("REST request to delete Process : {}", id);
        processRepository.delete(id);
    }

    /**
     * GET  /processes -> get next available the processes.
     */
    @RequestMapping(value = "/processes/next",
        method = RequestMethod.GET,
        produces = MediaType.APPLICATION_JSON_VALUE)
    @Timed
    public ResponseEntity<List<Process>> getNextAvailableProcesses(@RequestParam(value = "current" , required = false) Long processId,
                                                                   @RequestParam(value = "workflow" , required = true) Long workflowId)
        throws URISyntaxException {
        List<Process> availableProcesses = processService.getNextAvailableProcesses(workflowId, processId);

        return new ResponseEntity<>(availableProcesses, HttpStatus.OK);
    }
}
