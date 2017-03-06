package com.hu.cm.web.rest;

import com.hu.cm.Application;
import com.hu.cm.domain.configuration.Process;
import com.hu.cm.repository.configuration.ProcessRepository;

import com.hu.cm.web.rest.configuration.ProcessResource;
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
 * Test class for the ProcessResource REST controller.
 *
 * @see ProcessResource
 */
@RunWith(SpringJUnit4ClassRunner.class)
@SpringApplicationConfiguration(classes = Application.class)
@WebAppConfiguration
@IntegrationTest
public class ProcessResourceTest {

    private static final String DEFAULT_NAME = "SAMPLE_TEXT";
    private static final String UPDATED_NAME = "UPDATED_TEXT";
    private static final String DEFAULT_DESCRIPTION = "SAMPLE_TEXT";
    private static final String UPDATED_DESCRIPTION = "UPDATED_TEXT";

    @Inject
    private ProcessRepository processRepository;

    private MockMvc restProcessMockMvc;

    private Process process;

    @PostConstruct
    public void setup() {
        MockitoAnnotations.initMocks(this);
        ProcessResource processResource = new ProcessResource();
        ReflectionTestUtils.setField(processResource, "processRepository", processRepository);
        this.restProcessMockMvc = MockMvcBuilders.standaloneSetup(processResource).build();
    }

    @Before
    public void initTest() {
        process = new Process();
        process.setName(DEFAULT_NAME);
        process.setDescription(DEFAULT_DESCRIPTION);
    }

    @Test
    @Transactional
    public void createProcess() throws Exception {
        int databaseSizeBeforeCreate = processRepository.findAll().size();

        // Create the Process
        restProcessMockMvc.perform(post("/api/processs")
                .contentType(TestUtil.APPLICATION_JSON_UTF8)
                .content(TestUtil.convertObjectToJsonBytes(process)))
                .andExpect(status().isCreated());

        // Validate the Process in the database
        List<Process> processs = processRepository.findAll();
        assertThat(processs).hasSize(databaseSizeBeforeCreate + 1);
        Process testProcess = processs.get(processs.size() - 1);
        assertThat(testProcess.getName()).isEqualTo(DEFAULT_NAME);
        assertThat(testProcess.getDescription()).isEqualTo(DEFAULT_DESCRIPTION);
    }

    @Test
    @Transactional
    public void getAllProcesss() throws Exception {
        // Initialize the database
        processRepository.saveAndFlush(process);

        // Get all the processs
        restProcessMockMvc.perform(get("/api/processs"))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.[*].id").value(hasItem(process.getId().intValue())))
                .andExpect(jsonPath("$.[*].name").value(hasItem(DEFAULT_NAME.toString())))
                .andExpect(jsonPath("$.[*].description").value(hasItem(DEFAULT_DESCRIPTION.toString())));
    }

    @Test
    @Transactional
    public void getProcess() throws Exception {
        // Initialize the database
        processRepository.saveAndFlush(process);

        // Get the process
        restProcessMockMvc.perform(get("/api/processs/{id}", process.getId()))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON))
            .andExpect(jsonPath("$.id").value(process.getId().intValue()))
            .andExpect(jsonPath("$.name").value(DEFAULT_NAME.toString()))
            .andExpect(jsonPath("$.description").value(DEFAULT_DESCRIPTION.toString()));
    }

    @Test
    @Transactional
    public void getNonExistingProcess() throws Exception {
        // Get the process
        restProcessMockMvc.perform(get("/api/processs/{id}", Long.MAX_VALUE))
                .andExpect(status().isNotFound());
    }

    @Test
    @Transactional
    public void updateProcess() throws Exception {
        // Initialize the database
        processRepository.saveAndFlush(process);

		int databaseSizeBeforeUpdate = processRepository.findAll().size();

        // Update the process
        process.setName(UPDATED_NAME);
        process.setDescription(UPDATED_DESCRIPTION);
        restProcessMockMvc.perform(put("/api/processs")
                .contentType(TestUtil.APPLICATION_JSON_UTF8)
                .content(TestUtil.convertObjectToJsonBytes(process)))
                .andExpect(status().isOk());

        // Validate the Process in the database
        List<Process> processs = processRepository.findAll();
        assertThat(processs).hasSize(databaseSizeBeforeUpdate);
        Process testProcess = processs.get(processs.size() - 1);
        assertThat(testProcess.getName()).isEqualTo(UPDATED_NAME);
        assertThat(testProcess.getDescription()).isEqualTo(UPDATED_DESCRIPTION);
    }

    @Test
    @Transactional
    public void deleteProcess() throws Exception {
        // Initialize the database
        processRepository.saveAndFlush(process);

		int databaseSizeBeforeDelete = processRepository.findAll().size();

        // Get the process
        restProcessMockMvc.perform(delete("/api/processs/{id}", process.getId())
                .accept(TestUtil.APPLICATION_JSON_UTF8))
                .andExpect(status().isOk());

        // Validate the database is empty
        List<Process> processs = processRepository.findAll();
        assertThat(processs).hasSize(databaseSizeBeforeDelete - 1);
    }
}
