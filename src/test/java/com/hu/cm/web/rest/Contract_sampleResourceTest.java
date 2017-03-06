package com.hu.cm.web.rest;

import com.hu.cm.Application;
import com.hu.cm.domain.configuration.ContractSample;
import com.hu.cm.repository.configuration.Contract_sampleRepository;

import com.hu.cm.web.rest.configuration.Contract_sampleResource;
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


/**
 * Test class for the Contract_sampleResource REST controller.
 *
 * @see Contract_sampleResource
 */
@RunWith(SpringJUnit4ClassRunner.class)
@SpringApplicationConfiguration(classes = Application.class)
@WebAppConfiguration
@IntegrationTest
public class Contract_sampleResourceTest {

    private static final DateTimeFormatter dateTimeFormatter = DateTimeFormat.forPattern("yyyy-MM-dd'T'HH:mm:ss'Z'");

    private static final String DEFAULT_NAME = "SAMPLE_TEXT";
    private static final String UPDATED_NAME = "UPDATED_TEXT";
    private static final String DEFAULT_DESCRIPTION = "SAMPLE_TEXT";
    private static final String UPDATED_DESCRIPTION = "UPDATED_TEXT";
    private static final String DEFAULT_PATH = "SAMPLE_TEXT";
    private static final String UPDATED_PATH = "UPDATED_TEXT";
    private static final String DEFAULT_FILE_NAME = "SAMPLE_TEXT";
    private static final String UPDATED_FILE_NAME = "UPDATED_TEXT";
    private static final String DEFAULT_UPLOADED_BY = "SAMPLE_TEXT";
    private static final String UPDATED_UPLOADED_BY = "UPDATED_TEXT";

    private static final DateTime DEFAULT_UPLOADED_DATE_TIME = new DateTime(0L, DateTimeZone.UTC);
    private static final DateTime UPDATED_UPLOADED_DATE_TIME = new DateTime(DateTimeZone.UTC).withMillisOfSecond(0);
    private static final String DEFAULT_UPLOADED_DATE_TIME_STR = dateTimeFormatter.print(DEFAULT_UPLOADED_DATE_TIME);

    private static final DateTime DEFAULT_MODIFIED_DATE_TIME = new DateTime(0L, DateTimeZone.UTC);
    private static final DateTime UPDATED_MODIFIED_DATE_TIME = new DateTime(DateTimeZone.UTC).withMillisOfSecond(0);
    private static final String DEFAULT_MODIFIED_DATE_TIME_STR = dateTimeFormatter.print(DEFAULT_MODIFIED_DATE_TIME);

    private static final Long DEFAULT_REVISION = 0L;
    private static final Long UPDATED_REVISION = 1L;

    @Inject
    private Contract_sampleRepository contract_sampleRepository;

    private MockMvc restContract_sampleMockMvc;

    private ContractSample contract_sample;

    @PostConstruct
    public void setup() {
        MockitoAnnotations.initMocks(this);
        Contract_sampleResource contract_sampleResource = new Contract_sampleResource();
        ReflectionTestUtils.setField(contract_sampleResource, "contract_sampleRepository", contract_sampleRepository);
        this.restContract_sampleMockMvc = MockMvcBuilders.standaloneSetup(contract_sampleResource).build();
    }

    @Before
    public void initTest() {
        contract_sample = new ContractSample();
        contract_sample.setName(DEFAULT_NAME);
        contract_sample.setDescription(DEFAULT_DESCRIPTION);
        contract_sample.setPath(DEFAULT_PATH);
        contract_sample.setFile_name(DEFAULT_FILE_NAME);
        contract_sample.setUploaded_by(DEFAULT_UPLOADED_BY);
        contract_sample.setUploaded_date_time(DEFAULT_UPLOADED_DATE_TIME);
        contract_sample.setModified_date_time(DEFAULT_MODIFIED_DATE_TIME);
        contract_sample.setRevision(DEFAULT_REVISION);
    }

    @Test
    @Transactional
    public void createContract_sample() throws Exception {
        int databaseSizeBeforeCreate = contract_sampleRepository.findAll().size();

        // Create the ContractSample
        restContract_sampleMockMvc.perform(post("/api/contract_samples")
                .contentType(TestUtil.APPLICATION_JSON_UTF8)
                .content(TestUtil.convertObjectToJsonBytes(contract_sample)))
                .andExpect(status().isCreated());

        // Validate the ContractSample in the database
        List<ContractSample> contract_samples = contract_sampleRepository.findAll();
        assertThat(contract_samples).hasSize(databaseSizeBeforeCreate + 1);
        ContractSample testContract_sample = contract_samples.get(contract_samples.size() - 1);
        assertThat(testContract_sample.getName()).isEqualTo(DEFAULT_NAME);
        assertThat(testContract_sample.getDescription()).isEqualTo(DEFAULT_DESCRIPTION);
        assertThat(testContract_sample.getPath()).isEqualTo(DEFAULT_PATH);
        assertThat(testContract_sample.getFile_name()).isEqualTo(DEFAULT_FILE_NAME);
        assertThat(testContract_sample.getUploaded_by()).isEqualTo(DEFAULT_UPLOADED_BY);
        assertThat(testContract_sample.getUploaded_date_time().toDateTime(DateTimeZone.UTC)).isEqualTo(DEFAULT_UPLOADED_DATE_TIME);
        assertThat(testContract_sample.getModified_date_time().toDateTime(DateTimeZone.UTC)).isEqualTo(DEFAULT_MODIFIED_DATE_TIME);
        assertThat(testContract_sample.getRevision()).isEqualTo(DEFAULT_REVISION);
    }

    @Test
    @Transactional
    public void getAllContract_samples() throws Exception {
        // Initialize the database
        contract_sampleRepository.saveAndFlush(contract_sample);

        // Get all the contract_samples
        restContract_sampleMockMvc.perform(get("/api/contract_samples"))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.[*].id").value(hasItem(contract_sample.getId().intValue())))
                .andExpect(jsonPath("$.[*].name").value(hasItem(DEFAULT_NAME.toString())))
                .andExpect(jsonPath("$.[*].description").value(hasItem(DEFAULT_DESCRIPTION.toString())))
                .andExpect(jsonPath("$.[*].path").value(hasItem(DEFAULT_PATH.toString())))
                .andExpect(jsonPath("$.[*].file_name").value(hasItem(DEFAULT_FILE_NAME.toString())))
                .andExpect(jsonPath("$.[*].uploaded_by").value(hasItem(DEFAULT_UPLOADED_BY.toString())))
                .andExpect(jsonPath("$.[*].uploaded_date_time").value(hasItem(DEFAULT_UPLOADED_DATE_TIME_STR)))
                .andExpect(jsonPath("$.[*].modified_date_time").value(hasItem(DEFAULT_MODIFIED_DATE_TIME_STR)))
                .andExpect(jsonPath("$.[*].revision").value(hasItem(DEFAULT_REVISION.intValue())));
    }

    @Test
    @Transactional
    public void getContract_sample() throws Exception {
        // Initialize the database
        contract_sampleRepository.saveAndFlush(contract_sample);

        // Get the contract_sample
        restContract_sampleMockMvc.perform(get("/api/contract_samples/{id}", contract_sample.getId()))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON))
            .andExpect(jsonPath("$.id").value(contract_sample.getId().intValue()))
            .andExpect(jsonPath("$.name").value(DEFAULT_NAME.toString()))
            .andExpect(jsonPath("$.description").value(DEFAULT_DESCRIPTION.toString()))
            .andExpect(jsonPath("$.path").value(DEFAULT_PATH.toString()))
            .andExpect(jsonPath("$.file_name").value(DEFAULT_FILE_NAME.toString()))
            .andExpect(jsonPath("$.uploaded_by").value(DEFAULT_UPLOADED_BY.toString()))
            .andExpect(jsonPath("$.uploaded_date_time").value(DEFAULT_UPLOADED_DATE_TIME_STR))
            .andExpect(jsonPath("$.modified_date_time").value(DEFAULT_MODIFIED_DATE_TIME_STR))
            .andExpect(jsonPath("$.revision").value(DEFAULT_REVISION.intValue()));
    }

    @Test
    @Transactional
    public void getNonExistingContract_sample() throws Exception {
        // Get the contract_sample
        restContract_sampleMockMvc.perform(get("/api/contract_samples/{id}", Long.MAX_VALUE))
                .andExpect(status().isNotFound());
    }

    @Test
    @Transactional
    public void updateContract_sample() throws Exception {
        // Initialize the database
        contract_sampleRepository.saveAndFlush(contract_sample);

		int databaseSizeBeforeUpdate = contract_sampleRepository.findAll().size();

        // Update the contract_sample
        contract_sample.setName(UPDATED_NAME);
        contract_sample.setDescription(UPDATED_DESCRIPTION);
        contract_sample.setPath(UPDATED_PATH);
        contract_sample.setFile_name(UPDATED_FILE_NAME);
        contract_sample.setUploaded_by(UPDATED_UPLOADED_BY);
        contract_sample.setUploaded_date_time(UPDATED_UPLOADED_DATE_TIME);
        contract_sample.setModified_date_time(UPDATED_MODIFIED_DATE_TIME);
        contract_sample.setRevision(UPDATED_REVISION);
        restContract_sampleMockMvc.perform(put("/api/contract_samples")
                .contentType(TestUtil.APPLICATION_JSON_UTF8)
                .content(TestUtil.convertObjectToJsonBytes(contract_sample)))
                .andExpect(status().isOk());

        // Validate the ContractSample in the database
        List<ContractSample> contract_samples = contract_sampleRepository.findAll();
        assertThat(contract_samples).hasSize(databaseSizeBeforeUpdate);
        ContractSample testContract_sample = contract_samples.get(contract_samples.size() - 1);
        assertThat(testContract_sample.getName()).isEqualTo(UPDATED_NAME);
        assertThat(testContract_sample.getDescription()).isEqualTo(UPDATED_DESCRIPTION);
        assertThat(testContract_sample.getPath()).isEqualTo(UPDATED_PATH);
        assertThat(testContract_sample.getFile_name()).isEqualTo(UPDATED_FILE_NAME);
        assertThat(testContract_sample.getUploaded_by()).isEqualTo(UPDATED_UPLOADED_BY);
        assertThat(testContract_sample.getUploaded_date_time().toDateTime(DateTimeZone.UTC)).isEqualTo(UPDATED_UPLOADED_DATE_TIME);
        assertThat(testContract_sample.getModified_date_time().toDateTime(DateTimeZone.UTC)).isEqualTo(UPDATED_MODIFIED_DATE_TIME);
        assertThat(testContract_sample.getRevision()).isEqualTo(UPDATED_REVISION);
    }

    @Test
    @Transactional
    public void deleteContract_sample() throws Exception {
        // Initialize the database
        contract_sampleRepository.saveAndFlush(contract_sample);

		int databaseSizeBeforeDelete = contract_sampleRepository.findAll().size();

        // Get the contract_sample
        restContract_sampleMockMvc.perform(delete("/api/contract_samples/{id}", contract_sample.getId())
                .accept(TestUtil.APPLICATION_JSON_UTF8))
                .andExpect(status().isOk());

        // Validate the database is empty
        List<ContractSample> contract_samples = contract_sampleRepository.findAll();
        assertThat(contract_samples).hasSize(databaseSizeBeforeDelete - 1);
    }
}
