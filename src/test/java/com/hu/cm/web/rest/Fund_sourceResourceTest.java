package com.hu.cm.web.rest;

import com.hu.cm.Application;
import com.hu.cm.domain.configuration.FundSource;
import com.hu.cm.repository.configuration.FundSourceRepository;

import com.hu.cm.web.rest.configuration.FundSourceResource;
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
 * Test class for the Fund_sourceResource REST controller.
 *
 * @see FundSourceResource
 */
@RunWith(SpringJUnit4ClassRunner.class)
@SpringApplicationConfiguration(classes = Application.class)
@WebAppConfiguration
@IntegrationTest
public class Fund_sourceResourceTest {

    private static final DateTimeFormatter dateTimeFormatter = DateTimeFormat.forPattern("yyyy-MM-dd'T'HH:mm:ss'Z'");

    private static final String DEFAULT_NAME = "SAMPLE_TEXT";
    private static final String UPDATED_NAME = "UPDATED_TEXT";
    private static final String DEFAULT_DESCRIPTION = "SAMPLE_TEXT";
    private static final String UPDATED_DESCRIPTION = "UPDATED_TEXT";

    private static final Boolean DEFAULT_DELETED = false;
    private static final Boolean UPDATED_DELETED = true;

    private static final DateTime DEFAULT_DELETED_DATE_TIME = new DateTime(0L, DateTimeZone.UTC);
    private static final DateTime UPDATED_DELETED_DATE_TIME = new DateTime(DateTimeZone.UTC).withMillisOfSecond(0);
    private static final String DEFAULT_DELETED_DATE_TIME_STR = dateTimeFormatter.print(DEFAULT_DELETED_DATE_TIME);

    @Inject
    private FundSourceRepository fund_sourceRepository;

    private MockMvc restFund_sourceMockMvc;

    private FundSource fund_source;

    @PostConstruct
    public void setup() {
        MockitoAnnotations.initMocks(this);
        FundSourceResource fund_sourceResource = new FundSourceResource();
        ReflectionTestUtils.setField(fund_sourceResource, "fund_sourceRepository", fund_sourceRepository);
        this.restFund_sourceMockMvc = MockMvcBuilders.standaloneSetup(fund_sourceResource).build();
    }

    @Before
    public void initTest() {
        fund_source = new FundSource();
        fund_source.setName(DEFAULT_NAME);
        fund_source.setDescription(DEFAULT_DESCRIPTION);
        fund_source.setDeleted(DEFAULT_DELETED);
        fund_source.setDeleted_date_time(DEFAULT_DELETED_DATE_TIME);
    }

    @Test
    @Transactional
    public void createFund_source() throws Exception {
        int databaseSizeBeforeCreate = fund_sourceRepository.findAll().size();

        // Create the FundSource
        restFund_sourceMockMvc.perform(post("/api/fund_sources")
                .contentType(TestUtil.APPLICATION_JSON_UTF8)
                .content(TestUtil.convertObjectToJsonBytes(fund_source)))
                .andExpect(status().isCreated());

        // Validate the FundSource in the database
        List<FundSource> fund_sources = fund_sourceRepository.findAll();
        assertThat(fund_sources).hasSize(databaseSizeBeforeCreate + 1);
        FundSource testFund_source = fund_sources.get(fund_sources.size() - 1);
        assertThat(testFund_source.getName()).isEqualTo(DEFAULT_NAME);
        assertThat(testFund_source.getDescription()).isEqualTo(DEFAULT_DESCRIPTION);
        assertThat(testFund_source.getDeleted()).isEqualTo(DEFAULT_DELETED);
        assertThat(testFund_source.getDeleted_date_time().toDateTime(DateTimeZone.UTC)).isEqualTo(DEFAULT_DELETED_DATE_TIME);
    }

    @Test
    @Transactional
    public void getAllFund_sources() throws Exception {
        // Initialize the database
        fund_sourceRepository.saveAndFlush(fund_source);

        // Get all the fund_sources
        restFund_sourceMockMvc.perform(get("/api/fund_sources"))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.[*].id").value(hasItem(fund_source.getId().intValue())))
                .andExpect(jsonPath("$.[*].name").value(hasItem(DEFAULT_NAME.toString())))
                .andExpect(jsonPath("$.[*].description").value(hasItem(DEFAULT_DESCRIPTION.toString())))
                .andExpect(jsonPath("$.[*].deleted").value(hasItem(DEFAULT_DELETED.booleanValue())))
                .andExpect(jsonPath("$.[*].deleted_date_time").value(hasItem(DEFAULT_DELETED_DATE_TIME_STR)));
    }

    @Test
    @Transactional
    public void getFund_source() throws Exception {
        // Initialize the database
        fund_sourceRepository.saveAndFlush(fund_source);

        // Get the fund_source
        restFund_sourceMockMvc.perform(get("/api/fund_sources/{id}", fund_source.getId()))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON))
            .andExpect(jsonPath("$.id").value(fund_source.getId().intValue()))
            .andExpect(jsonPath("$.name").value(DEFAULT_NAME.toString()))
            .andExpect(jsonPath("$.description").value(DEFAULT_DESCRIPTION.toString()))
            .andExpect(jsonPath("$.deleted").value(DEFAULT_DELETED.booleanValue()))
            .andExpect(jsonPath("$.deleted_date_time").value(DEFAULT_DELETED_DATE_TIME_STR));
    }

    @Test
    @Transactional
    public void getNonExistingFund_source() throws Exception {
        // Get the fund_source
        restFund_sourceMockMvc.perform(get("/api/fund_sources/{id}", Long.MAX_VALUE))
                .andExpect(status().isNotFound());
    }

    @Test
    @Transactional
    public void updateFund_source() throws Exception {
        // Initialize the database
        fund_sourceRepository.saveAndFlush(fund_source);

		int databaseSizeBeforeUpdate = fund_sourceRepository.findAll().size();

        // Update the fund_source
        fund_source.setName(UPDATED_NAME);
        fund_source.setDescription(UPDATED_DESCRIPTION);
        fund_source.setDeleted(UPDATED_DELETED);
        fund_source.setDeleted_date_time(UPDATED_DELETED_DATE_TIME);
        restFund_sourceMockMvc.perform(put("/api/fund_sources")
                .contentType(TestUtil.APPLICATION_JSON_UTF8)
                .content(TestUtil.convertObjectToJsonBytes(fund_source)))
                .andExpect(status().isOk());

        // Validate the FundSource in the database
        List<FundSource> fund_sources = fund_sourceRepository.findAll();
        assertThat(fund_sources).hasSize(databaseSizeBeforeUpdate);
        FundSource testFund_source = fund_sources.get(fund_sources.size() - 1);
        assertThat(testFund_source.getName()).isEqualTo(UPDATED_NAME);
        assertThat(testFund_source.getDescription()).isEqualTo(UPDATED_DESCRIPTION);
        assertThat(testFund_source.getDeleted()).isEqualTo(UPDATED_DELETED);
        assertThat(testFund_source.getDeleted_date_time().toDateTime(DateTimeZone.UTC)).isEqualTo(UPDATED_DELETED_DATE_TIME);
    }

    @Test
    @Transactional
    public void deleteFund_source() throws Exception {
        // Initialize the database
        fund_sourceRepository.saveAndFlush(fund_source);

		int databaseSizeBeforeDelete = fund_sourceRepository.findAll().size();

        // Get the fund_source
        restFund_sourceMockMvc.perform(delete("/api/fund_sources/{id}", fund_source.getId())
                .accept(TestUtil.APPLICATION_JSON_UTF8))
                .andExpect(status().isOk());

        // Validate the database is empty
        List<FundSource> fund_sources = fund_sourceRepository.findAll();
        assertThat(fund_sources).hasSize(databaseSizeBeforeDelete - 1);
    }
}
