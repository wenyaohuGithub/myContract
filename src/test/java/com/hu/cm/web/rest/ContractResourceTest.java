package com.hu.cm.web.rest;

import com.hu.cm.Application;
import com.hu.cm.domain.Contract;
import com.hu.cm.repository.ContractRepository;

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
import java.math.BigDecimal;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import com.hu.cm.domain.enumeration.ContractingMethod;
import com.hu.cm.domain.enumeration.Currency;
import com.hu.cm.domain.enumeration.ContractStatus;
import com.hu.cm.domain.enumeration.ProcessState;

/**
 * Test class for the ContractResource REST controller.
 *
 * @see ContractResource
 */
@RunWith(SpringJUnit4ClassRunner.class)
@SpringApplicationConfiguration(classes = Application.class)
@WebAppConfiguration
@IntegrationTest
public class ContractResourceTest {

    private static final DateTimeFormatter dateTimeFormatter = DateTimeFormat.forPattern("yyyy-MM-dd'T'HH:mm:ss'Z'");

    private static final String DEFAULT_NAME = "SAMPLE_TEXT";
    private static final String UPDATED_NAME = "UPDATED_TEXT";
    private static final String DEFAULT_REVIEW_IDENTIFIER = "SAMPLE_TEXT";
    private static final String UPDATED_REVIEW_IDENTIFIER = "UPDATED_TEXT";
    private static final String DEFAULT_CONTRACT_IDENTIFIER = "SAMPLE_TEXT";
    private static final String UPDATED_CONTRACT_IDENTIFIER = "UPDATED_TEXT";

    private static final ContractingMethod DEFAULT_CONTRACTING_METHOD = ContractingMethod.Bid;
    private static final ContractingMethod UPDATED_CONTRACTING_METHOD = ContractingMethod.Proposal;

    private static final BigDecimal DEFAULT_AMOUNT = new BigDecimal(0);
    private static final BigDecimal UPDATED_AMOUNT = new BigDecimal(1);
    private static final String DEFAULT_AMOUNT_WRITTEN = "SAMPLE_TEXT";
    private static final String UPDATED_AMOUNT_WRITTEN = "UPDATED_TEXT";

    private static final Currency DEFAULT_CURRENCY = Currency.ChineseYuan;
    private static final Currency UPDATED_CURRENCY = Currency.USDollar;

    private static final BigDecimal DEFAULT_AMOUNT_CURRENT_YEAR = new BigDecimal(0);
    private static final BigDecimal UPDATED_AMOUNT_CURRENT_YEAR = new BigDecimal(1);

    private static final DateTime DEFAULT_SUBMIT_DATE = new DateTime(0L, DateTimeZone.UTC);
    private static final DateTime UPDATED_SUBMIT_DATE = new DateTime(DateTimeZone.UTC).withMillisOfSecond(0);
    private static final String DEFAULT_SUBMIT_DATE_STR = dateTimeFormatter.print(DEFAULT_SUBMIT_DATE);

    private static final DateTime DEFAULT_START_DATE = new DateTime(0L, DateTimeZone.UTC);
    private static final DateTime UPDATED_START_DATE = new DateTime(DateTimeZone.UTC).withMillisOfSecond(0);
    private static final String DEFAULT_START_DATE_STR = dateTimeFormatter.print(DEFAULT_START_DATE);

    private static final DateTime DEFAULT_END_DATE = new DateTime(0L, DateTimeZone.UTC);
    private static final DateTime UPDATED_END_DATE = new DateTime(DateTimeZone.UTC).withMillisOfSecond(0);
    private static final String DEFAULT_END_DATE_STR = dateTimeFormatter.print(DEFAULT_END_DATE);

    private static final DateTime DEFAULT_EXPIRE_DATE = new DateTime(0L, DateTimeZone.UTC);
    private static final DateTime UPDATED_EXPIRE_DATE = new DateTime(DateTimeZone.UTC).withMillisOfSecond(0);
    private static final String DEFAULT_EXPIRE_DATE_STR = dateTimeFormatter.print(DEFAULT_EXPIRE_DATE);

    private static final Boolean DEFAULT_IS_MULTI_YEAR = false;
    private static final Boolean UPDATED_IS_MULTI_YEAR = true;

    private static final ContractStatus DEFAULT_STATUS = ContractStatus.Drafting;
    private static final ContractStatus UPDATED_STATUS = ContractStatus.Reviewing;

    private static final ProcessState DEFAULT_STATE = ProcessState.drafting;
    private static final ProcessState UPDATED_STATE = ProcessState.internal_division_review;

    private static final DateTime DEFAULT_APPROVE_DATE = new DateTime(0L, DateTimeZone.UTC);
    private static final DateTime UPDATED_APPROVE_DATE = new DateTime(DateTimeZone.UTC).withMillisOfSecond(0);
    private static final String DEFAULT_APPROVE_DATE_STR = dateTimeFormatter.print(DEFAULT_APPROVE_DATE);

    private static final DateTime DEFAULT_SIGN_DATE = new DateTime(0L, DateTimeZone.UTC);
    private static final DateTime UPDATED_SIGN_DATE = new DateTime(DateTimeZone.UTC).withMillisOfSecond(0);
    private static final String DEFAULT_SIGN_DATE_STR = dateTimeFormatter.print(DEFAULT_SIGN_DATE);

    private static final DateTime DEFAULT_ARCHIVE_DATE = new DateTime(0L, DateTimeZone.UTC);
    private static final DateTime UPDATED_ARCHIVE_DATE = new DateTime(DateTimeZone.UTC).withMillisOfSecond(0);
    private static final String DEFAULT_ARCHIVE_DATE_STR = dateTimeFormatter.print(DEFAULT_ARCHIVE_DATE);

    @Inject
    private ContractRepository contractRepository;

    private MockMvc restContractMockMvc;

    private Contract contract;

    @PostConstruct
    public void setup() {
        MockitoAnnotations.initMocks(this);
        ContractResource contractResource = new ContractResource();
        ReflectionTestUtils.setField(contractResource, "contractRepository", contractRepository);
        this.restContractMockMvc = MockMvcBuilders.standaloneSetup(contractResource).build();
    }

    @Before
    public void initTest() {
        contract = new Contract();
        contract.setName(DEFAULT_NAME);
        contract.setReviewIdentifier(DEFAULT_REVIEW_IDENTIFIER);
        contract.setContractIdentifier(DEFAULT_CONTRACT_IDENTIFIER);
        contract.setContractingMethod(DEFAULT_CONTRACTING_METHOD);
        contract.setAmount(DEFAULT_AMOUNT);
        contract.setAmountWritten(DEFAULT_AMOUNT_WRITTEN);
        contract.setCurrency(DEFAULT_CURRENCY);
        contract.setAmountCurrentYear(DEFAULT_AMOUNT_CURRENT_YEAR);
        contract.setSubmitDate(DEFAULT_SUBMIT_DATE);
        contract.setStartDate(DEFAULT_START_DATE);
        contract.setEndDate(DEFAULT_END_DATE);
        contract.setExpireDate(DEFAULT_EXPIRE_DATE);
        contract.setIsMultiYear(DEFAULT_IS_MULTI_YEAR);
        //contract.setStatus(DEFAULT_STATUS);
        //contract.setStatus(DEFAULT_STATE);
        contract.setApproveDate(DEFAULT_APPROVE_DATE);
        contract.setSignDate(DEFAULT_SIGN_DATE);
        contract.setArchiveDate(DEFAULT_ARCHIVE_DATE);
    }

    @Test
    @Transactional
    public void createContract() throws Exception {
        int databaseSizeBeforeCreate = contractRepository.findAll().size();

        // Create the Contract
        restContractMockMvc.perform(post("/api/contracts")
                .contentType(TestUtil.APPLICATION_JSON_UTF8)
                .content(TestUtil.convertObjectToJsonBytes(contract)))
                .andExpect(status().isCreated());

        // Validate the Contract in the database
        List<Contract> contracts = contractRepository.findAll();
        assertThat(contracts).hasSize(databaseSizeBeforeCreate + 1);
        Contract testContract = contracts.get(contracts.size() - 1);
        assertThat(testContract.getName()).isEqualTo(DEFAULT_NAME);
        assertThat(testContract.getReviewIdentifier()).isEqualTo(DEFAULT_REVIEW_IDENTIFIER);
        assertThat(testContract.getContractIdentifier()).isEqualTo(DEFAULT_CONTRACT_IDENTIFIER);
        assertThat(testContract.getContractingMethod()).isEqualTo(DEFAULT_CONTRACTING_METHOD);
        assertThat(testContract.getAmount()).isEqualTo(DEFAULT_AMOUNT);
        assertThat(testContract.getAmountWritten()).isEqualTo(DEFAULT_AMOUNT_WRITTEN);
        assertThat(testContract.getCurrency()).isEqualTo(DEFAULT_CURRENCY);
        assertThat(testContract.getAmountCurrentYear()).isEqualTo(DEFAULT_AMOUNT_CURRENT_YEAR);
        assertThat(testContract.getSubmitDate().toDateTime(DateTimeZone.UTC)).isEqualTo(DEFAULT_SUBMIT_DATE);
        assertThat(testContract.getStartDate().toDateTime(DateTimeZone.UTC)).isEqualTo(DEFAULT_START_DATE);
        assertThat(testContract.getEndDate().toDateTime(DateTimeZone.UTC)).isEqualTo(DEFAULT_END_DATE);
        assertThat(testContract.getExpireDate().toDateTime(DateTimeZone.UTC)).isEqualTo(DEFAULT_EXPIRE_DATE);
        assertThat(testContract.getIsMultiYear()).isEqualTo(DEFAULT_IS_MULTI_YEAR);
        assertThat(testContract.getStatus()).isEqualTo(DEFAULT_STATUS);
        //assertThat(testContract.getState()).isEqualTo(DEFAULT_STATE);
        assertThat(testContract.getApproveDate().toDateTime(DateTimeZone.UTC)).isEqualTo(DEFAULT_APPROVE_DATE);
        assertThat(testContract.getSignDate().toDateTime(DateTimeZone.UTC)).isEqualTo(DEFAULT_SIGN_DATE);
        assertThat(testContract.getArchiveDate().toDateTime(DateTimeZone.UTC)).isEqualTo(DEFAULT_ARCHIVE_DATE);
    }
/*
    @Test
    @Transactional
    public void getAllContracts() throws Exception {
        // Initialize the database
        contractRepository.saveAndFlush(contract);

        // Get all the contracts
        restContractMockMvc.perform(get("/api/contracts"))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.[*].id").value(hasItem(contract.getId().intValue())))
                .andExpect(jsonPath("$.[*].name").value(hasItem(DEFAULT_NAME.toString())))
                .andExpect(jsonPath("$.[*].review_identifier").value(hasItem(DEFAULT_REVIEW_IDENTIFIER.toString())))
                .andExpect(jsonPath("$.[*].contract_identifier").value(hasItem(DEFAULT_CONTRACT_IDENTIFIER.toString())))
                .andExpect(jsonPath("$.[*].contracting_method").value(hasItem(DEFAULT_CONTRACTING_METHOD.toString())))
                .andExpect(jsonPath("$.[*].amount").value(hasItem(DEFAULT_AMOUNT.intValue())))
                .andExpect(jsonPath("$.[*].amount_written").value(hasItem(DEFAULT_AMOUNT_WRITTEN.toString())))
                .andExpect(jsonPath("$.[*].currency").value(hasItem(DEFAULT_CURRENCY.toString())))
                .andExpect(jsonPath("$.[*].amount_current_year").value(hasItem(DEFAULT_AMOUNT_CURRENT_YEAR.intValue())))
                .andExpect(jsonPath("$.[*].submit_date").value(hasItem(DEFAULT_SUBMIT_DATE_STR)))
                .andExpect(jsonPath("$.[*].start_date").value(hasItem(DEFAULT_START_DATE_STR)))
                .andExpect(jsonPath("$.[*].end_date").value(hasItem(DEFAULT_END_DATE_STR)))
                .andExpect(jsonPath("$.[*].expire_date").value(hasItem(DEFAULT_EXPIRE_DATE_STR)))
                .andExpect(jsonPath("$.[*].is_multi_year").value(hasItem(DEFAULT_IS_MULTI_YEAR.booleanValue())))
                .andExpect(jsonPath("$.[*].status").value(hasItem(DEFAULT_STATUS.toString())))
                .andExpect(jsonPath("$.[*].state").value(hasItem(DEFAULT_STATE.toString())))
                .andExpect(jsonPath("$.[*].approve_date").value(hasItem(DEFAULT_APPROVE_DATE_STR)))
                .andExpect(jsonPath("$.[*].sign_date").value(hasItem(DEFAULT_SIGN_DATE_STR)))
                .andExpect(jsonPath("$.[*].archive_date").value(hasItem(DEFAULT_ARCHIVE_DATE_STR)));
    }

    @Test
    @Transactional
    public void getContract() throws Exception {
        // Initialize the database
        contractRepository.saveAndFlush(contract);

        // Get the contract
        restContractMockMvc.perform(get("/api/contracts/{id}", contract.getId()))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON))
            .andExpect(jsonPath("$.id").value(contract.getId().intValue()))
            .andExpect(jsonPath("$.name").value(DEFAULT_NAME.toString()))
            .andExpect(jsonPath("$.review_identifier").value(DEFAULT_REVIEW_IDENTIFIER.toString()))
            .andExpect(jsonPath("$.contract_identifier").value(DEFAULT_CONTRACT_IDENTIFIER.toString()))
            .andExpect(jsonPath("$.contracting_method").value(DEFAULT_CONTRACTING_METHOD.toString()))
            .andExpect(jsonPath("$.amount").value(DEFAULT_AMOUNT.intValue()))
            .andExpect(jsonPath("$.amount_written").value(DEFAULT_AMOUNT_WRITTEN.toString()))
            .andExpect(jsonPath("$.currency").value(DEFAULT_CURRENCY.toString()))
            .andExpect(jsonPath("$.amount_current_year").value(DEFAULT_AMOUNT_CURRENT_YEAR.intValue()))
            .andExpect(jsonPath("$.submit_date").value(DEFAULT_SUBMIT_DATE_STR))
            .andExpect(jsonPath("$.start_date").value(DEFAULT_START_DATE_STR))
            .andExpect(jsonPath("$.end_date").value(DEFAULT_END_DATE_STR))
            .andExpect(jsonPath("$.expire_date").value(DEFAULT_EXPIRE_DATE_STR))
            .andExpect(jsonPath("$.is_multi_year").value(DEFAULT_IS_MULTI_YEAR.booleanValue()))
            .andExpect(jsonPath("$.status").value(DEFAULT_STATUS.toString()))
            .andExpect(jsonPath("$.state").value(DEFAULT_STATE.toString()))
            .andExpect(jsonPath("$.approve_date").value(DEFAULT_APPROVE_DATE_STR))
            .andExpect(jsonPath("$.sign_date").value(DEFAULT_SIGN_DATE_STR))
            .andExpect(jsonPath("$.archive_date").value(DEFAULT_ARCHIVE_DATE_STR));
    }

    @Test
    @Transactional
    public void getNonExistingContract() throws Exception {
        // Get the contract
        restContractMockMvc.perform(get("/api/contracts/{id}", Long.MAX_VALUE))
                .andExpect(status().isNotFound());
    }

    @Test
    @Transactional
    public void updateContract() throws Exception {
        // Initialize the database
        contractRepository.saveAndFlush(contract);

		int databaseSizeBeforeUpdate = contractRepository.findAll().size();

        // Update the contract
        contract.setName(UPDATED_NAME);
        contract.setReviewIdentifier(UPDATED_REVIEW_IDENTIFIER);
        contract.setContractIdentifier(UPDATED_CONTRACT_IDENTIFIER);
        contract.setContractingMethod(UPDATED_CONTRACTING_METHOD);
        contract.setAmount(UPDATED_AMOUNT);
        contract.setAmountWritten(UPDATED_AMOUNT_WRITTEN);
        contract.setCurrency(UPDATED_CURRENCY);
        contract.setAmountCurrentYear(UPDATED_AMOUNT_CURRENT_YEAR);
        contract.setSubmitDate(UPDATED_SUBMIT_DATE);
        contract.setStartDate(UPDATED_START_DATE);
        contract.setEndDate(UPDATED_END_DATE);
        contract.setExpireDate(UPDATED_EXPIRE_DATE);
        contract.setIsMultiYear(UPDATED_IS_MULTI_YEAR);
        //contract.setStatus(UPDATED_STATUS);
        //contract.setState(UPDATED_STATE);
        contract.setApproveDate(UPDATED_APPROVE_DATE);
        contract.setSignDate(UPDATED_SIGN_DATE);
        contract.setArchiveDate(UPDATED_ARCHIVE_DATE);
        restContractMockMvc.perform(put("/api/contracts")
                .contentType(TestUtil.APPLICATION_JSON_UTF8)
                .content(TestUtil.convertObjectToJsonBytes(contract)))
                .andExpect(status().isOk());

        // Validate the Contract in the database
        List<Contract> contracts = contractRepository.findAll();
        assertThat(contracts).hasSize(databaseSizeBeforeUpdate);
        Contract testContract = contracts.get(contracts.size() - 1);
        assertThat(testContract.getName()).isEqualTo(UPDATED_NAME);
        assertThat(testContract.getReviewIdentifier()).isEqualTo(UPDATED_REVIEW_IDENTIFIER);
        assertThat(testContract.getContractIdentifier()).isEqualTo(UPDATED_CONTRACT_IDENTIFIER);
        assertThat(testContract.getContractingMethod()).isEqualTo(UPDATED_CONTRACTING_METHOD);
        assertThat(testContract.getAmount()).isEqualTo(UPDATED_AMOUNT);
        assertThat(testContract.getAmountWritten()).isEqualTo(UPDATED_AMOUNT_WRITTEN);
        assertThat(testContract.getCurrency()).isEqualTo(UPDATED_CURRENCY);
        assertThat(testContract.getAmountCurrentYear()).isEqualTo(UPDATED_AMOUNT_CURRENT_YEAR);
        assertThat(testContract.getSubmitDate().toDateTime(DateTimeZone.UTC)).isEqualTo(UPDATED_SUBMIT_DATE);
        assertThat(testContract.getStartDate().toDateTime(DateTimeZone.UTC)).isEqualTo(UPDATED_START_DATE);
        assertThat(testContract.getEndDate().toDateTime(DateTimeZone.UTC)).isEqualTo(UPDATED_END_DATE);
        assertThat(testContract.getExpireDate().toDateTime(DateTimeZone.UTC)).isEqualTo(UPDATED_EXPIRE_DATE);
        assertThat(testContract.getIsMultiYear()).isEqualTo(UPDATED_IS_MULTI_YEAR);
        assertThat(testContract.getStatus()).isEqualTo(UPDATED_STATUS);
        //assertThat(testContract.getState()).isEqualTo(UPDATED_STATE);
        assertThat(testContract.getApproveDate().toDateTime(DateTimeZone.UTC)).isEqualTo(UPDATED_APPROVE_DATE);
        assertThat(testContract.getSignDate().toDateTime(DateTimeZone.UTC)).isEqualTo(UPDATED_SIGN_DATE);
        assertThat(testContract.getArchiveDate().toDateTime(DateTimeZone.UTC)).isEqualTo(UPDATED_ARCHIVE_DATE);
    }

    @Test
    @Transactional
    public void deleteContract() throws Exception {
        // Initialize the database
        contractRepository.saveAndFlush(contract);

		int databaseSizeBeforeDelete = contractRepository.findAll().size();

        // Get the contract
        restContractMockMvc.perform(delete("/api/contracts/{id}", contract.getId())
                .accept(TestUtil.APPLICATION_JSON_UTF8))
                .andExpect(status().isOk());

        // Validate the database is empty
        List<Contract> contracts = contractRepository.findAll();
        assertThat(contracts).hasSize(databaseSizeBeforeDelete - 1);
    }
    */
}
