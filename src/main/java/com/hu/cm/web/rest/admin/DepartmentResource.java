package com.hu.cm.web.rest.admin;

import com.codahale.metrics.annotation.Timed;
import com.hu.cm.domain.admin.Department;
import com.hu.cm.domain.admin.User;
import com.hu.cm.domain.enumeration.DepartmentType;
import com.hu.cm.repository.admin.DepartmentRepository;
import com.hu.cm.repository.admin.UserRepository;
import com.hu.cm.security.SecurityUtils;
import com.hu.cm.service.DepartmentService;
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

/**
 * REST controller for managing Department.
 */
@RestController
@RequestMapping("/api")
public class DepartmentResource {

    private final Logger log = LoggerFactory.getLogger(DepartmentResource.class);

    @Inject
    private DepartmentRepository departmentRepository;

    @Inject
    private UserRepository userRepository;

    @Inject
    private DepartmentService departmentService;

    /**
     * POST  /departments -> Create a new department.
     */
    @RequestMapping(value = "/departments",
            method = RequestMethod.POST,
            produces = MediaType.APPLICATION_JSON_VALUE)
    @Timed
    public ResponseEntity<Department> create(@Valid @RequestBody Department department) throws URISyntaxException {
        log.debug("REST request to save Department : {}", department);
        if (department.getId() != null) {
            return ResponseEntity.badRequest().header("Failure", "A new department cannot already have an ID").body(null);
        }
        Department result = departmentRepository.save(department);
        return ResponseEntity.created(new URI("/api/departments/" + department.getId())).body(result);
    }

    /**
     * PUT  /departments -> Updates an existing department.
     */
    @RequestMapping(value = "/departments",
        method = RequestMethod.PUT,
        produces = MediaType.APPLICATION_JSON_VALUE)
    @Timed
    public ResponseEntity<Department> update(@Valid @RequestBody Department department) throws URISyntaxException {
        log.debug("REST request to update Department : {}", department);
        if (department.getId() == null) {
            return create(department);
        }
        Department result = departmentRepository.save(department);
        return ResponseEntity.ok().body(result);
    }

    /**
     * GET  /departments -> get all the departments.
     */
    @RequestMapping(value = "/departments",
            method = RequestMethod.GET,
            produces = MediaType.APPLICATION_JSON_VALUE)
    @Timed
    public ResponseEntity<List<Department>> getAll(@RequestParam(value = "page" , required = false) Integer offset,
                                  @RequestParam(value = "per_page", required = false) Integer limit)
        throws URISyntaxException {
        Page<Department> page = departmentRepository.findAll(PaginationUtil.generatePageRequest(offset, limit));
        HttpHeaders headers = PaginationUtil.generatePaginationHttpHeaders(page, "/api/departments", offset, limit);
        return new ResponseEntity<>(page.getContent(), headers, HttpStatus.OK);
    }

    /**
     * GET  /departments/:id -> get the "id" department.
     */
    @RequestMapping(value = "/departments/{id}",
            method = RequestMethod.GET,
            produces = MediaType.APPLICATION_JSON_VALUE)
    @Timed
    public ResponseEntity<Department> get(@PathVariable Long id) {
        log.debug("REST request to get Department : {}", id);
        return Optional.ofNullable(departmentRepository.findOne(id))
            .map(department -> new ResponseEntity<>(
                department,
                HttpStatus.OK))
            .orElse(new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }

    /**
     * DELETE  /departments/:id -> delete the "id" department.
     */
    @RequestMapping(value = "/departments/{id}",
            method = RequestMethod.DELETE,
            produces = MediaType.APPLICATION_JSON_VALUE)
    @Timed
    public void delete(@PathVariable Long id) {
        log.debug("REST request to delete Department : {}", id);
        departmentRepository.delete(id);
    }

    /**
     * GET  /departments/:id -> get the "id" department.
     */
    @RequestMapping(value = "/departments/{id}/internalDivisions",
        method = RequestMethod.GET,
        produces = MediaType.APPLICATION_JSON_VALUE)
    @Timed
    public ResponseEntity<List<Department>> getInternalDivisions(@PathVariable Long id) {
        log.debug("REST request to get internal divisions : {}", id);
        List<Department> internalDivisions = new ArrayList<Department>();
        User currentUser = userRepository.findOneByLogin(SecurityUtils.getCurrentLogin()).get();

        Department dept = departmentRepository.findOne(currentUser.getDepartmentId());
        if(dept != null){
            if(dept.getType().equals(DepartmentType.DEPT)) {
                internalDivisions = departmentService.getChildDivisions(dept.getId());
            }else if(dept.getType().equals(DepartmentType.DIV)){
                internalDivisions = departmentService.getSiblingDivisions(dept.getId());
            }
        }

        return new ResponseEntity<>(internalDivisions, HttpStatus.OK);
    }
}
