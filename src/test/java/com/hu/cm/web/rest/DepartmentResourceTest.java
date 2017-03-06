package com.hu.cm.web.rest;

import com.hu.cm.Application;
import com.hu.cm.domain.admin.Department;
import com.hu.cm.repository.admin.DepartmentRepository;

import com.hu.cm.web.rest.admin.DepartmentResource;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import static org.hamcrest.Matchers.hasItem;
import org.mockito.MockitoAnnotations;
import org.springframework.boot.test.IntegrationTest;
import org.springframework.boot.test.SpringApplicationConfiguration;
import org.springframework.http.MediaType;
import org.springframework.test.context.junit4.SpringJUnit4ClassRunner;
import org.springframework.test.context.web.WebAppConfiguration;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.transaction.annotation.Transactional;

import javax.annotation.PostConstruct;
import javax.inject.Inject;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;


/**
 * Test class for the DepartmentResource REST controller.
 *
 * @see DepartmentResource
 */
@RunWith(SpringJUnit4ClassRunner.class)
@SpringApplicationConfiguration(classes = Application.class)
@WebAppConfiguration
@IntegrationTest
public class DepartmentResourceTest {

    private static final String DEFAULT_NAME = "SAMPLE_TEXT";
    private static final String UPDATED_NAME = "UPDATED_TEXT";
    private static final String DEFAULT_DESCRIPTION = "SAMPLE_TEXT";
    private static final String UPDATED_DESCRIPTION = "UPDATED_TEXT";
    private static final String DEFAULT_NOTE = "SAMPLE_TEXT";
    private static final String UPDATED_NOTE = "UPDATED_TEXT";

    @Inject
    private DepartmentRepository departmentRepository;

    private MockMvc restDepartmentMockMvc;

    private Department department;

    @PostConstruct
    public void setup() {
        MockitoAnnotations.initMocks(this);
        DepartmentResource departmentResource = new DepartmentResource();
        ReflectionTestUtils.setField(departmentResource, "departmentRepository", departmentRepository);
        this.restDepartmentMockMvc = MockMvcBuilders.standaloneSetup(departmentResource).build();
    }

    @Before
    public void initTest() {
        department = new Department();
        department.setName(DEFAULT_NAME);
        department.setDescription(DEFAULT_DESCRIPTION);
    }

    @Test
    @Transactional
    public void createDepartment() throws Exception {
        int databaseSizeBeforeCreate = departmentRepository.findAll().size();

        // Create the Department
        restDepartmentMockMvc.perform(post("/api/departments")
                .contentType(TestUtil.APPLICATION_JSON_UTF8)
                .content(TestUtil.convertObjectToJsonBytes(department)))
                .andExpect(status().isCreated());

        // Validate the Department in the database
        List<Department> departments = departmentRepository.findAll();
        assertThat(departments).hasSize(databaseSizeBeforeCreate + 1);
        Department testDepartment = departments.get(departments.size() - 1);
        assertThat(testDepartment.getName()).isEqualTo(DEFAULT_NAME);
        assertThat(testDepartment.getDescription()).isEqualTo(DEFAULT_DESCRIPTION);
    }

    @Test
    @Transactional
    public void getAllDepartments() throws Exception {
        // Initialize the database
        departmentRepository.saveAndFlush(department);

        // Get all the departments
        restDepartmentMockMvc.perform(get("/api/departments"))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.[*].id").value(hasItem(department.getId().intValue())))
                .andExpect(jsonPath("$.[*].name").value(hasItem(DEFAULT_NAME.toString())))
                .andExpect(jsonPath("$.[*].description").value(hasItem(DEFAULT_DESCRIPTION.toString())))
                .andExpect(jsonPath("$.[*].note").value(hasItem(DEFAULT_NOTE.toString())));
    }

    @Test
    @Transactional
    public void getDepartment() throws Exception {
        // Initialize the database
        departmentRepository.saveAndFlush(department);

        // Get the department
        restDepartmentMockMvc.perform(get("/api/departments/{id}", department.getId()))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON))
            .andExpect(jsonPath("$.id").value(department.getId().intValue()))
            .andExpect(jsonPath("$.name").value(DEFAULT_NAME.toString()))
            .andExpect(jsonPath("$.description").value(DEFAULT_DESCRIPTION.toString()))
            .andExpect(jsonPath("$.note").value(DEFAULT_NOTE.toString()));
    }

    @Test
    @Transactional
    public void getNonExistingDepartment() throws Exception {
        // Get the department
        restDepartmentMockMvc.perform(get("/api/departments/{id}", Long.MAX_VALUE))
                .andExpect(status().isNotFound());
    }

    @Test
    @Transactional
    public void updateDepartment() throws Exception {
        // Initialize the database
        departmentRepository.saveAndFlush(department);

		int databaseSizeBeforeUpdate = departmentRepository.findAll().size();

        // Update the department
        department.setName(UPDATED_NAME);
        department.setDescription(UPDATED_DESCRIPTION);
        restDepartmentMockMvc.perform(put("/api/departments")
                .contentType(TestUtil.APPLICATION_JSON_UTF8)
                .content(TestUtil.convertObjectToJsonBytes(department)))
                .andExpect(status().isOk());

        // Validate the Department in the database
        List<Department> departments = departmentRepository.findAll();
        assertThat(departments).hasSize(databaseSizeBeforeUpdate);
        Department testDepartment = departments.get(departments.size() - 1);
        assertThat(testDepartment.getName()).isEqualTo(UPDATED_NAME);
        assertThat(testDepartment.getDescription()).isEqualTo(UPDATED_DESCRIPTION);
    }

    @Test
    @Transactional
    public void deleteDepartment() throws Exception {
        // Initialize the database
        departmentRepository.saveAndFlush(department);

		int databaseSizeBeforeDelete = departmentRepository.findAll().size();

        // Get the department
        restDepartmentMockMvc.perform(delete("/api/departments/{id}", department.getId())
                .accept(TestUtil.APPLICATION_JSON_UTF8))
                .andExpect(status().isOk());

        // Validate the database is empty
        List<Department> departments = departmentRepository.findAll();
        assertThat(departments).hasSize(databaseSizeBeforeDelete - 1);
    }
}
