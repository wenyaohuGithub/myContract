package com.hu.cm.web.rest;

import com.hu.cm.Application;
import com.hu.cm.domain.ContractHistory;
import com.hu.cm.repository.ContractHistoryRepository;
import com.hu.cm.web.rest.mapper.ContractHistoryMapper;

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
import org.joda.time.DateTime;
import org.joda.time.DateTimeZone;
import org.joda.time.format.DateTimeFormat;
import org.joda.time.format.DateTimeFormatter;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import com.hu.cm.domain.enumeration.UserAction;

/**
 * Test class for the Contract_historyResource REST controller.
 *
 * @see ContractHistoryResource
 */
@RunWith(SpringJUnit4ClassRunner.class)
@SpringApplicationConfiguration(classes = Application.class)
@WebAppConfiguration
@IntegrationTest
public class Contract_historyResourceTest {

    private static final DateTimeFormatter dateTimeFormatter = DateTimeFormat.forPattern("yyyy-MM-dd'T'HH:mm:ss'Z'");

    private static final String DEFAULT_NOTE = "SAMPLE_TEXT";
    private static final String UPDATED_NOTE = "UPDATED_TEXT";

    private static final UserAction DEFAULT_ACTION = UserAction.APPROVE;
    private static final UserAction UPDATED_ACTION = UserAction.REJECT;

    private static final DateTime DEFAULT_ACTION_DATETIME = new DateTime(0L, DateTimeZone.UTC);
    private static final DateTime UPDATED_ACTION_DATETIME = new DateTime(DateTimeZone.UTC).withMillisOfSecond(0);
    private static final String DEFAULT_ACTION_DATETIME_STR = dateTimeFormatter.print(DEFAULT_ACTION_DATETIME);

    @Inject
    private ContractHistoryRepository contract_historyRepository;

    @Inject
    private ContractHistoryMapper contract_historyMapper;

    private MockMvc restContract_historyMockMvc;

    private ContractHistory contract_history;

    @PostConstruct
    public void setup() {
        MockitoAnnotations.initMocks(this);
        ContractHistoryResource contract_historyResource = new ContractHistoryResource();
        ReflectionTestUtils.setField(contract_historyResource, "contract_historyRepository", contract_historyRepository);
        ReflectionTestUtils.setField(contract_historyResource, "contract_historyMapper", contract_historyMapper);
        this.restContract_historyMockMvc = MockMvcBuilders.standaloneSetup(contract_historyResource).build();
    }

    @Before
    public void initTest() {
        contract_history = new ContractHistory();
        contract_history.setNote(DEFAULT_NOTE);
        contract_history.setAction(DEFAULT_ACTION);
        contract_history.setAction_datetime(DEFAULT_ACTION_DATETIME);
    }

    @Test
    @Transactional
    public void createContract_history() throws Exception {
        int databaseSizeBeforeCreate = contract_historyRepository.findAll().size();

        // Create the ContractHistory
        restContract_historyMockMvc.perform(post("/api/contract_histories")
                .contentType(TestUtil.APPLICATION_JSON_UTF8)
                .content(TestUtil.convertObjectToJsonBytes(contract_history)))
                .andExpect(status().isCreated());

        // Validate the ContractHistory in the database
        List<ContractHistory> contract_histories = contract_historyRepository.findAll();
        assertThat(contract_histories).hasSize(databaseSizeBeforeCreate + 1);
        ContractHistory testContract_history = contract_histories.get(contract_histories.size() - 1);
        assertThat(testContract_history.getNote()).isEqualTo(DEFAULT_NOTE);
        assertThat(testContract_history.getAction()).isEqualTo(DEFAULT_ACTION);
        assertThat(testContract_history.getAction_datetime().toDateTime(DateTimeZone.UTC)).isEqualTo(DEFAULT_ACTION_DATETIME);
    }

    @Test
    @Transactional
    public void getAllContract_historys() throws Exception {
        // Initialize the database
        contract_historyRepository.saveAndFlush(contract_history);

        // Get all the contract_historys
        restContract_historyMockMvc.perform(get("/api/contract_historys"))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.[*].id").value(hasItem(contract_history.getId().intValue())))
                .andExpect(jsonPath("$.[*].note").value(hasItem(DEFAULT_NOTE.toString())))
                .andExpect(jsonPath("$.[*].action").value(hasItem(DEFAULT_ACTION.toString())))
                .andExpect(jsonPath("$.[*].action_datetime").value(hasItem(DEFAULT_ACTION_DATETIME_STR)));
    }

    @Test
    @Transactional
    public void getContract_history() throws Exception {
        // Initialize the database
        contract_historyRepository.saveAndFlush(contract_history);

        // Get the contract_history
        restContract_historyMockMvc.perform(get("/api/contract_historys/{id}", contract_history.getId()))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON))
            .andExpect(jsonPath("$.id").value(contract_history.getId().intValue()))
            .andExpect(jsonPath("$.note").value(DEFAULT_NOTE.toString()))
            .andExpect(jsonPath("$.action").value(DEFAULT_ACTION.toString()))
            .andExpect(jsonPath("$.action_datetime").value(DEFAULT_ACTION_DATETIME_STR));
    }

    @Test
    @Transactional
    public void getNonExistingContract_history() throws Exception {
        // Get the contract_history
        restContract_historyMockMvc.perform(get("/api/contract_historys/{id}", Long.MAX_VALUE))
                .andExpect(status().isNotFound());
    }

    @Test
    @Transactional
    public void updateContract_history() throws Exception {
        // Initialize the database
        contract_historyRepository.saveAndFlush(contract_history);

		int databaseSizeBeforeUpdate = contract_historyRepository.findAll().size();

        // Update the contract_history
        contract_history.setNote(UPDATED_NOTE);
        contract_history.setAction(UPDATED_ACTION);
        contract_history.setAction_datetime(UPDATED_ACTION_DATETIME);
        restContract_historyMockMvc.perform(put("/api/contract_histories")
                .contentType(TestUtil.APPLICATION_JSON_UTF8)
                .content(TestUtil.convertObjectToJsonBytes(contract_history)))
                .andExpect(status().isOk());

        // Validate the ContractHistory in the database
        List<ContractHistory> contract_histories = contract_historyRepository.findAll();
        assertThat(contract_histories).hasSize(databaseSizeBeforeUpdate);
        ContractHistory testContract_history = contract_histories.get(contract_histories.size() - 1);
        assertThat(testContract_history.getNote()).isEqualTo(UPDATED_NOTE);
        assertThat(testContract_history.getAction()).isEqualTo(UPDATED_ACTION);
        assertThat(testContract_history.getAction_datetime().toDateTime(DateTimeZone.UTC)).isEqualTo(UPDATED_ACTION_DATETIME);
    }

    @Test
    @Transactional
    public void deleteContract_history() throws Exception {
        // Initialize the database
        contract_historyRepository.saveAndFlush(contract_history);

		int databaseSizeBeforeDelete = contract_historyRepository.findAll().size();

        // Get the contract_history
        restContract_historyMockMvc.perform(delete("/api/contract_histories/{id}", contract_history.getId())
                .accept(TestUtil.APPLICATION_JSON_UTF8))
                .andExpect(status().isOk());

        // Validate the database is empty
        List<ContractHistory> contract_histories = contract_historyRepository.findAll();
        assertThat(contract_histories).hasSize(databaseSizeBeforeDelete - 1);
    }
}
