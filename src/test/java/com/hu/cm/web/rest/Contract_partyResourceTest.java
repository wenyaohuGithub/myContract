package com.hu.cm.web.rest;

import com.hu.cm.Application;
import com.hu.cm.domain.ContractParty;
import com.hu.cm.repository.ContractPartyRepository;

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
import java.math.BigDecimal;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;


/**
 * Test class for the Contract_partyResource REST controller.
 *
 * @see ContractPartyResource
 */
@RunWith(SpringJUnit4ClassRunner.class)
@SpringApplicationConfiguration(classes = Application.class)
@WebAppConfiguration
@IntegrationTest
public class Contract_partyResourceTest {

    private static final String DEFAULT_NAME = "SAMPLE_TEXT";
    private static final String UPDATED_NAME = "UPDATED_TEXT";
    private static final String DEFAULT_DESCRIPTION = "SAMPLE_TEXT";
    private static final String UPDATED_DESCRIPTION = "UPDATED_TEXT";
    private static final String DEFAULT_REGISTRATION_ID = "SAMPLE_TEXT";
    private static final String UPDATED_REGISTRATION_ID = "UPDATED_TEXT";

    private static final BigDecimal DEFAULT_REGISTERED_CAPITAL = new BigDecimal(0);
    private static final BigDecimal UPDATED_REGISTERED_CAPITAL = new BigDecimal(1);
    private static final String DEFAULT_LEGAL_REPRESENTATIVE = "SAMPLE_TEXT";
    private static final String UPDATED_LEGAL_REPRESENTATIVE = "UPDATED_TEXT";
    private static final String DEFAULT_REGISTRATION_INSPECTION_RECORD = "SAMPLE_TEXT";
    private static final String UPDATED_REGISTRATION_INSPECTION_RECORD = "UPDATED_TEXT";
    private static final String DEFAULT_PROFESSIONAL_CERTIFICATE = "SAMPLE_TEXT";
    private static final String UPDATED_PROFESSIONAL_CERTIFICATE = "UPDATED_TEXT";
    private static final String DEFAULT_BUSINESS_CERTIFICATE = "SAMPLE_TEXT";
    private static final String UPDATED_BUSINESS_CERTIFICATE = "UPDATED_TEXT";

    @Inject
    private ContractPartyRepository contract_partyRepository;

    private MockMvc restContract_partyMockMvc;

    private ContractParty contract_party;

    @PostConstruct
    public void setup() {
        MockitoAnnotations.initMocks(this);
        ContractPartyResource contract_partyResource = new ContractPartyResource();
        ReflectionTestUtils.setField(contract_partyResource, "contract_partyRepository", contract_partyRepository);
        this.restContract_partyMockMvc = MockMvcBuilders.standaloneSetup(contract_partyResource).build();
    }

    @Before
    public void initTest() {
        contract_party = new ContractParty();
        contract_party.setName(DEFAULT_NAME);
        contract_party.setDescription(DEFAULT_DESCRIPTION);
        contract_party.setRegistration_id(DEFAULT_REGISTRATION_ID);
        contract_party.setRegistered_capital(DEFAULT_REGISTERED_CAPITAL);
        contract_party.setLegal_representative(DEFAULT_LEGAL_REPRESENTATIVE);
        contract_party.setRegistration_inspection_record(DEFAULT_REGISTRATION_INSPECTION_RECORD);
        contract_party.setProfessional_certificate(DEFAULT_PROFESSIONAL_CERTIFICATE);
        contract_party.setBusiness_certificate(DEFAULT_BUSINESS_CERTIFICATE);
    }

    @Test
    @Transactional
    public void createContract_party() throws Exception {
        int databaseSizeBeforeCreate = contract_partyRepository.findAll().size();

        // Create the ContractParty
        restContract_partyMockMvc.perform(post("/api/contract_parties")
                .contentType(TestUtil.APPLICATION_JSON_UTF8)
                .content(TestUtil.convertObjectToJsonBytes(contract_party)))
                .andExpect(status().isCreated());

        // Validate the ContractParty in the database
        List<ContractParty> contract_parties = contract_partyRepository.findAll();
        assertThat(contract_parties).hasSize(databaseSizeBeforeCreate + 1);
        ContractParty testContract_party = contract_parties.get(contract_parties.size() - 1);
        assertThat(testContract_party.getName()).isEqualTo(DEFAULT_NAME);
        assertThat(testContract_party.getDescription()).isEqualTo(DEFAULT_DESCRIPTION);
        assertThat(testContract_party.getRegistration_id()).isEqualTo(DEFAULT_REGISTRATION_ID);
        assertThat(testContract_party.getRegistered_capital()).isEqualTo(DEFAULT_REGISTERED_CAPITAL);
        assertThat(testContract_party.getLegal_representative()).isEqualTo(DEFAULT_LEGAL_REPRESENTATIVE);
        assertThat(testContract_party.getRegistration_inspection_record()).isEqualTo(DEFAULT_REGISTRATION_INSPECTION_RECORD);
        assertThat(testContract_party.getProfessional_certificate()).isEqualTo(DEFAULT_PROFESSIONAL_CERTIFICATE);
        assertThat(testContract_party.getBusiness_certificate()).isEqualTo(DEFAULT_BUSINESS_CERTIFICATE);
    }

    @Test
    @Transactional
    public void getAllContract_partys() throws Exception {
        // Initialize the database
        contract_partyRepository.saveAndFlush(contract_party);

        // Get all the contract_partys
        restContract_partyMockMvc.perform(get("/api/contract_partys"))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.[*].id").value(hasItem(contract_party.getId().intValue())))
                .andExpect(jsonPath("$.[*].name").value(hasItem(DEFAULT_NAME.toString())))
                .andExpect(jsonPath("$.[*].description").value(hasItem(DEFAULT_DESCRIPTION.toString())))
                .andExpect(jsonPath("$.[*].registration_id").value(hasItem(DEFAULT_REGISTRATION_ID.toString())))
                .andExpect(jsonPath("$.[*].registered_capital").value(hasItem(DEFAULT_REGISTERED_CAPITAL.intValue())))
                .andExpect(jsonPath("$.[*].legal_representative").value(hasItem(DEFAULT_LEGAL_REPRESENTATIVE.toString())))
                .andExpect(jsonPath("$.[*].registration_inspection_record").value(hasItem(DEFAULT_REGISTRATION_INSPECTION_RECORD.toString())))
                .andExpect(jsonPath("$.[*].professional_certificate").value(hasItem(DEFAULT_PROFESSIONAL_CERTIFICATE.toString())))
                .andExpect(jsonPath("$.[*].business_certificate").value(hasItem(DEFAULT_BUSINESS_CERTIFICATE.toString())));
    }

    @Test
    @Transactional
    public void getContract_party() throws Exception {
        // Initialize the database
        contract_partyRepository.saveAndFlush(contract_party);

        // Get the contract_party
        restContract_partyMockMvc.perform(get("/api/contract_partys/{id}", contract_party.getId()))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON))
            .andExpect(jsonPath("$.id").value(contract_party.getId().intValue()))
            .andExpect(jsonPath("$.name").value(DEFAULT_NAME.toString()))
            .andExpect(jsonPath("$.description").value(DEFAULT_DESCRIPTION.toString()))
            .andExpect(jsonPath("$.registration_id").value(DEFAULT_REGISTRATION_ID.toString()))
            .andExpect(jsonPath("$.registered_capital").value(DEFAULT_REGISTERED_CAPITAL.intValue()))
            .andExpect(jsonPath("$.legal_representative").value(DEFAULT_LEGAL_REPRESENTATIVE.toString()))
            .andExpect(jsonPath("$.registration_inspection_record").value(DEFAULT_REGISTRATION_INSPECTION_RECORD.toString()))
            .andExpect(jsonPath("$.professional_certificate").value(DEFAULT_PROFESSIONAL_CERTIFICATE.toString()))
            .andExpect(jsonPath("$.business_certificate").value(DEFAULT_BUSINESS_CERTIFICATE.toString()));
    }

    @Test
    @Transactional
    public void getNonExistingContract_party() throws Exception {
        // Get the contract_party
        restContract_partyMockMvc.perform(get("/api/contract_partys/{id}", Long.MAX_VALUE))
                .andExpect(status().isNotFound());
    }

    @Test
    @Transactional
    public void updateContract_party() throws Exception {
        // Initialize the database
        contract_partyRepository.saveAndFlush(contract_party);

		int databaseSizeBeforeUpdate = contract_partyRepository.findAll().size();

        // Update the contract_party
        contract_party.setName(UPDATED_NAME);
        contract_party.setDescription(UPDATED_DESCRIPTION);
        contract_party.setRegistration_id(UPDATED_REGISTRATION_ID);
        contract_party.setRegistered_capital(UPDATED_REGISTERED_CAPITAL);
        contract_party.setLegal_representative(UPDATED_LEGAL_REPRESENTATIVE);
        contract_party.setRegistration_inspection_record(UPDATED_REGISTRATION_INSPECTION_RECORD);
        contract_party.setProfessional_certificate(UPDATED_PROFESSIONAL_CERTIFICATE);
        contract_party.setBusiness_certificate(UPDATED_BUSINESS_CERTIFICATE);
        restContract_partyMockMvc.perform(put("/api/contract_parties")
                .contentType(TestUtil.APPLICATION_JSON_UTF8)
                .content(TestUtil.convertObjectToJsonBytes(contract_party)))
                .andExpect(status().isOk());

        // Validate the ContractParty in the database
        List<ContractParty> contract_parties = contract_partyRepository.findAll();
        assertThat(contract_parties).hasSize(databaseSizeBeforeUpdate);
        ContractParty testContract_party = contract_parties.get(contract_parties.size() - 1);
        assertThat(testContract_party.getName()).isEqualTo(UPDATED_NAME);
        assertThat(testContract_party.getDescription()).isEqualTo(UPDATED_DESCRIPTION);
        assertThat(testContract_party.getRegistration_id()).isEqualTo(UPDATED_REGISTRATION_ID);
        assertThat(testContract_party.getRegistered_capital()).isEqualTo(UPDATED_REGISTERED_CAPITAL);
        assertThat(testContract_party.getLegal_representative()).isEqualTo(UPDATED_LEGAL_REPRESENTATIVE);
        assertThat(testContract_party.getRegistration_inspection_record()).isEqualTo(UPDATED_REGISTRATION_INSPECTION_RECORD);
        assertThat(testContract_party.getProfessional_certificate()).isEqualTo(UPDATED_PROFESSIONAL_CERTIFICATE);
        assertThat(testContract_party.getBusiness_certificate()).isEqualTo(UPDATED_BUSINESS_CERTIFICATE);
    }

    @Test
    @Transactional
    public void deleteContract_party() throws Exception {
        // Initialize the database
        contract_partyRepository.saveAndFlush(contract_party);

		int databaseSizeBeforeDelete = contract_partyRepository.findAll().size();

        // Get the contract_party
        restContract_partyMockMvc.perform(delete("/api/contract_parties/{id}", contract_party.getId())
                .accept(TestUtil.APPLICATION_JSON_UTF8))
                .andExpect(status().isOk());

        // Validate the database is empty
        List<ContractParty> contract_parties = contract_partyRepository.findAll();
        assertThat(contract_parties).hasSize(databaseSizeBeforeDelete - 1);
    }
}
