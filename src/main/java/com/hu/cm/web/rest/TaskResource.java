package com.hu.cm.web.rest;

import com.codahale.metrics.annotation.Timed;
import com.hu.cm.domain.Task;
import com.hu.cm.domain.admin.Account;
import com.hu.cm.repository.TaskRepository;
import com.hu.cm.security.xauth.TokenManager;
import com.hu.cm.web.rest.admin.LoginUser;
import com.hu.cm.web.rest.dto.TaskDTO;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import javax.inject.Inject;
import java.net.URI;
import java.net.URISyntaxException;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

/**
 * REST controller for managing Task.
 */
@RestController
@RequestMapping("/api")
public class TaskResource {

    private final Logger log = LoggerFactory.getLogger(TaskResource.class);

    @Inject
    private TaskRepository taskRepository;

    /**
     * POST  /tasks -> Create a new task.
     */
    @RequestMapping(value = "/tasks",
            method = RequestMethod.POST,
            produces = MediaType.APPLICATION_JSON_VALUE)
    @Timed
    public ResponseEntity<Task> create(@RequestBody Task task) throws URISyntaxException {
        log.debug("REST request to save Task : {}", task);
        if (task.getId() != null) {
            return ResponseEntity.badRequest().header("Failure", "A new task cannot already have an ID").body(null);
        }
        LoginUser user = (LoginUser)TokenManager.getCurrentToken().getUserDetails();
        Long accountId = user.getAccount().getId();
        if(accountId == null){
            log.error("create: Account id missing");
            return new ResponseEntity<>(null, null, HttpStatus.BAD_REQUEST);
        }

        Task result = taskRepository.save(task);
        return ResponseEntity.created(new URI("/api/tasks/" + task.getId())).body(result);
    }

    /**
     * PUT  /tasks -> Updates an existing task.
     */
    @RequestMapping(value = "/tasks",
        method = RequestMethod.PUT,
        produces = MediaType.APPLICATION_JSON_VALUE)
    @Timed
    public ResponseEntity<Task> update(@RequestBody Task task) throws URISyntaxException {
        log.debug("REST request to update Task : {}", task);
        if (task.getId() == null) {
            return create(task);
        }
        Task result = taskRepository.save(task);
        return ResponseEntity.ok().body(result);
    }

    /**
     * GET  /tasks -> get all the tasks.
     */
    @RequestMapping(value = "/tasks",
            method = RequestMethod.GET,
            produces = MediaType.APPLICATION_JSON_VALUE)
    @Timed
    public ResponseEntity<List<TaskDTO>> getAll() {
        log.debug("REST request to get all Tasks");
        LoginUser user = (LoginUser)TokenManager.getCurrentToken().getUserDetails();
        Long accountId = user.getAccount().getId();
        if(accountId == null){
            log.error("getAll(): Account id missing");
            return new ResponseEntity<>(null, null, HttpStatus.BAD_REQUEST);
        }

        List<Task> all = taskRepository.findAll();
        List<TaskDTO> result = new ArrayList<>();
        for(Task t: all){
            TaskDTO dto = new TaskDTO();
            dto.setContractId(t.getContract().getId());
            dto.setContractName(t.getContract().getName());
            dto.setProcessName(t.getProcess().getName());
            dto.setAssignee(t.getAssignee().getLogin());
            if(t.getPerformer() != null) {
                dto.setPerformedBy(t.getPerformer().getLogin());
            }
            if(t.getPerformedDatetime() != null){
                dto.setPerfomedDate(t.getPerformedDatetime().toLocalDate().toString());
            }
            if(t.getResult() != null){
                dto.setResult(t.getResult());
            }
            result.add(dto);
        }
        return new ResponseEntity<>(result, null, HttpStatus.OK);
    }

    /**
     * GET  /tasks/:id -> get the "id" task.
     */
    @RequestMapping(value = "/tasks/{id}",
            method = RequestMethod.GET,
            produces = MediaType.APPLICATION_JSON_VALUE)
    @Timed
    public ResponseEntity<Task> get(@PathVariable Long id) {
        log.debug("REST request to get Task : {}", id);
        return Optional.ofNullable(taskRepository.findOne(id))
            .map(task -> new ResponseEntity<>(
                task,
                HttpStatus.OK))
            .orElse(new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }

    /**
     * DELETE  /tasks/:id -> delete the "id" task.
     */
    @RequestMapping(value = "/tasks/{id}",
            method = RequestMethod.DELETE,
            produces = MediaType.APPLICATION_JSON_VALUE)
    @Timed
    public void delete(@PathVariable Long id) {
        log.debug("REST request to delete Task : {}", id);
        taskRepository.delete(id);
    }
}
