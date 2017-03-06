package com.hu.cm.web.rest;

import com.hu.cm.Application;
import com.hu.cm.domain.Task;
import com.hu.cm.repository.TaskRepository;

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
 * Test class for the TaskResource REST controller.
 *
 * @see TaskResource
 */
@RunWith(SpringJUnit4ClassRunner.class)
@SpringApplicationConfiguration(classes = Application.class)
@WebAppConfiguration
@IntegrationTest
public class TaskResourceTest {


    private static final Integer DEFAULT_SEQUENCE = 0;
    private static final Integer UPDATED_SEQUENCE = 1;

    @Inject
    private TaskRepository taskRepository;

    private MockMvc restTaskMockMvc;

    private Task task;

    @PostConstruct
    public void setup() {
        MockitoAnnotations.initMocks(this);
        TaskResource taskResource = new TaskResource();
        ReflectionTestUtils.setField(taskResource, "taskRepository", taskRepository);
        this.restTaskMockMvc = MockMvcBuilders.standaloneSetup(taskResource).build();
    }

    @Before
    public void initTest() {
        task = new Task();
        task.setSequence(DEFAULT_SEQUENCE);
    }

    @Test
    @Transactional
    public void createTask() throws Exception {
        int databaseSizeBeforeCreate = taskRepository.findAll().size();

        // Create the Task
        restTaskMockMvc.perform(post("/api/tasks")
                .contentType(TestUtil.APPLICATION_JSON_UTF8)
                .content(TestUtil.convertObjectToJsonBytes(task)))
                .andExpect(status().isCreated());

        // Validate the Task in the database
        List<Task> tasks = taskRepository.findAll();
        assertThat(tasks).hasSize(databaseSizeBeforeCreate + 1);
        Task testTask = tasks.get(tasks.size() - 1);
        assertThat(testTask.getSequence()).isEqualTo(DEFAULT_SEQUENCE);
    }

    @Test
    @Transactional
    public void getAllTasks() throws Exception {
        // Initialize the database
        taskRepository.saveAndFlush(task);

        // Get all the tasks
        restTaskMockMvc.perform(get("/api/tasks"))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.[*].id").value(hasItem(task.getId().intValue())))
                .andExpect(jsonPath("$.[*].sequence").value(hasItem(DEFAULT_SEQUENCE)));
    }

    @Test
    @Transactional
    public void getTask() throws Exception {
        // Initialize the database
        taskRepository.saveAndFlush(task);

        // Get the task
        restTaskMockMvc.perform(get("/api/tasks/{id}", task.getId()))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON))
            .andExpect(jsonPath("$.id").value(task.getId().intValue()))
            .andExpect(jsonPath("$.sequence").value(DEFAULT_SEQUENCE));
    }

    @Test
    @Transactional
    public void getNonExistingTask() throws Exception {
        // Get the task
        restTaskMockMvc.perform(get("/api/tasks/{id}", Long.MAX_VALUE))
                .andExpect(status().isNotFound());
    }

    @Test
    @Transactional
    public void updateTask() throws Exception {
        // Initialize the database
        taskRepository.saveAndFlush(task);

		int databaseSizeBeforeUpdate = taskRepository.findAll().size();

        // Update the task
        task.setSequence(UPDATED_SEQUENCE);
        restTaskMockMvc.perform(put("/api/tasks")
                .contentType(TestUtil.APPLICATION_JSON_UTF8)
                .content(TestUtil.convertObjectToJsonBytes(task)))
                .andExpect(status().isOk());

        // Validate the Task in the database
        List<Task> tasks = taskRepository.findAll();
        assertThat(tasks).hasSize(databaseSizeBeforeUpdate);
        Task testTask = tasks.get(tasks.size() - 1);
        assertThat(testTask.getSequence()).isEqualTo(UPDATED_SEQUENCE);
    }

    @Test
    @Transactional
    public void deleteTask() throws Exception {
        // Initialize the database
        taskRepository.saveAndFlush(task);

		int databaseSizeBeforeDelete = taskRepository.findAll().size();

        // Get the task
        restTaskMockMvc.perform(delete("/api/tasks/{id}", task.getId())
                .accept(TestUtil.APPLICATION_JSON_UTF8))
                .andExpect(status().isOk());

        // Validate the database is empty
        List<Task> tasks = taskRepository.findAll();
        assertThat(tasks).hasSize(databaseSizeBeforeDelete - 1);
    }
}
