package com.hu.cm.web.rest;

import com.hu.cm.Application;
import com.hu.cm.domain.Workflow;
import com.hu.cm.repository.WorkflowRepository;

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
 * Test class for the WorkflowResource REST controller.
 *
 * @see WorkflowResource
 */
@RunWith(SpringJUnit4ClassRunner.class)
@SpringApplicationConfiguration(classes = Application.class)
@WebAppConfiguration
@IntegrationTest
public class WorkflowResourceTest {

    private static final String DEFAULT_NAME = "SAMPLE_TEXT";
    private static final String UPDATED_NAME = "UPDATED_TEXT";
    private static final String DEFAULT_DESCRIPTION = "SAMPLE_TEXT";
    private static final String UPDATED_DESCRIPTION = "UPDATED_TEXT";

    @Inject
    private WorkflowRepository workflowRepository;

    private MockMvc restWorkflowMockMvc;

    private Workflow workflow;

    @PostConstruct
    public void setup() {
        MockitoAnnotations.initMocks(this);
        WorkflowResource workflowResource = new WorkflowResource();
        ReflectionTestUtils.setField(workflowResource, "workflowRepository", workflowRepository);
        this.restWorkflowMockMvc = MockMvcBuilders.standaloneSetup(workflowResource).build();
    }

    @Before
    public void initTest() {
        workflow = new Workflow();
        workflow.setName(DEFAULT_NAME);
        workflow.setDescription(DEFAULT_DESCRIPTION);
    }

    @Test
    @Transactional
    public void createWorkflow() throws Exception {
        int databaseSizeBeforeCreate = workflowRepository.findAll().size();

        // Create the Workflow
        restWorkflowMockMvc.perform(post("/api/workflows")
                .contentType(TestUtil.APPLICATION_JSON_UTF8)
                .content(TestUtil.convertObjectToJsonBytes(workflow)))
                .andExpect(status().isCreated());

        // Validate the Workflow in the database
        List<Workflow> workflows = workflowRepository.findAll();
        assertThat(workflows).hasSize(databaseSizeBeforeCreate + 1);
        Workflow testWorkflow = workflows.get(workflows.size() - 1);
        assertThat(testWorkflow.getName()).isEqualTo(DEFAULT_NAME);
        assertThat(testWorkflow.getDescription()).isEqualTo(DEFAULT_DESCRIPTION);
    }

    @Test
    @Transactional
    public void getAllWorkflows() throws Exception {
        // Initialize the database
        workflowRepository.saveAndFlush(workflow);

        // Get all the workflows
        restWorkflowMockMvc.perform(get("/api/workflows"))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.[*].id").value(hasItem(workflow.getId().intValue())))
                .andExpect(jsonPath("$.[*].name").value(hasItem(DEFAULT_NAME.toString())))
                .andExpect(jsonPath("$.[*].description").value(hasItem(DEFAULT_DESCRIPTION.toString())));
    }

    @Test
    @Transactional
    public void getWorkflow() throws Exception {
        // Initialize the database
        workflowRepository.saveAndFlush(workflow);

        // Get the workflow
        restWorkflowMockMvc.perform(get("/api/workflows/{id}", workflow.getId()))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON))
            .andExpect(jsonPath("$.id").value(workflow.getId().intValue()))
            .andExpect(jsonPath("$.name").value(DEFAULT_NAME.toString()))
            .andExpect(jsonPath("$.description").value(DEFAULT_DESCRIPTION.toString()));
    }

    @Test
    @Transactional
    public void getNonExistingWorkflow() throws Exception {
        // Get the workflow
        restWorkflowMockMvc.perform(get("/api/workflows/{id}", Long.MAX_VALUE))
                .andExpect(status().isNotFound());
    }

    @Test
    @Transactional
    public void updateWorkflow() throws Exception {
        // Initialize the database
        workflowRepository.saveAndFlush(workflow);

		int databaseSizeBeforeUpdate = workflowRepository.findAll().size();

        // Update the workflow
        workflow.setName(UPDATED_NAME);
        workflow.setDescription(UPDATED_DESCRIPTION);
        restWorkflowMockMvc.perform(put("/api/workflows")
                .contentType(TestUtil.APPLICATION_JSON_UTF8)
                .content(TestUtil.convertObjectToJsonBytes(workflow)))
                .andExpect(status().isOk());

        // Validate the Workflow in the database
        List<Workflow> workflows = workflowRepository.findAll();
        assertThat(workflows).hasSize(databaseSizeBeforeUpdate);
        Workflow testWorkflow = workflows.get(workflows.size() - 1);
        assertThat(testWorkflow.getName()).isEqualTo(UPDATED_NAME);
        assertThat(testWorkflow.getDescription()).isEqualTo(UPDATED_DESCRIPTION);
    }

    @Test
    @Transactional
    public void deleteWorkflow() throws Exception {
        // Initialize the database
        workflowRepository.saveAndFlush(workflow);

		int databaseSizeBeforeDelete = workflowRepository.findAll().size();

        // Get the workflow
        restWorkflowMockMvc.perform(delete("/api/workflows/{id}", workflow.getId())
                .accept(TestUtil.APPLICATION_JSON_UTF8))
                .andExpect(status().isOk());

        // Validate the database is empty
        List<Workflow> workflows = workflowRepository.findAll();
        assertThat(workflows).hasSize(databaseSizeBeforeDelete - 1);
    }
}
