package com.hu.cm.web.rest;

import com.hu.cm.domain.BankAccount;
import com.hu.cm.web.rest.configuration.BankAccountResource;
import com.hu.cm.Application;
import com.hu.cm.repository.configuration.BankAccountRepository;

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
 * Test class for the Bank_accountResource REST controller.
 *
 * @see BankAccountResource
 */
@RunWith(SpringJUnit4ClassRunner.class)
@SpringApplicationConfiguration(classes = Application.class)
@WebAppConfiguration
@IntegrationTest
public class Bank_accountResourceTest {

    private static final String DEFAULT_BANK_NAME = "SAMPLE_TEXT";
    private static final String UPDATED_BANK_NAME = "UPDATED_TEXT";
    private static final String DEFAULT_ACCOUNT_NAME = "SAMPLE_TEXT";
    private static final String UPDATED_ACCOUNT_NAME = "UPDATED_TEXT";
    private static final String DEFAULT_ACCOUNT_NUMBER = "SAMPLE_TEXT";
    private static final String UPDATED_ACCOUNT_NUMBER = "UPDATED_TEXT";

    @Inject
    private BankAccountRepository bank_accountRepository;

    private MockMvc restBank_accountMockMvc;

    private BankAccount bank_account;

    @PostConstruct
    public void setup() {
        MockitoAnnotations.initMocks(this);
        BankAccountResource bank_accountResource = new BankAccountResource();
        ReflectionTestUtils.setField(bank_accountResource, "bank_accountRepository", bank_accountRepository);
        this.restBank_accountMockMvc = MockMvcBuilders.standaloneSetup(bank_accountResource).build();
    }

    @Before
    public void initTest() {
        bank_account = new BankAccount();
        bank_account.setBank_name(DEFAULT_BANK_NAME);
        bank_account.setAccount_name(DEFAULT_ACCOUNT_NAME);
        bank_account.setAccount_number(DEFAULT_ACCOUNT_NUMBER);
    }

    @Test
    @Transactional
    public void createBank_account() throws Exception {
        int databaseSizeBeforeCreate = bank_accountRepository.findAll().size();

        // Create the BankAccount
        restBank_accountMockMvc.perform(post("/api/bank_accounts")
                .contentType(TestUtil.APPLICATION_JSON_UTF8)
                .content(TestUtil.convertObjectToJsonBytes(bank_account)))
                .andExpect(status().isCreated());

        // Validate the BankAccount in the database
        List<BankAccount> bank_accounts = bank_accountRepository.findAll();
        assertThat(bank_accounts).hasSize(databaseSizeBeforeCreate + 1);
        BankAccount testBank_account = bank_accounts.get(bank_accounts.size() - 1);
        assertThat(testBank_account.getBank_name()).isEqualTo(DEFAULT_BANK_NAME);
        assertThat(testBank_account.getAccount_name()).isEqualTo(DEFAULT_ACCOUNT_NAME);
        assertThat(testBank_account.getAccount_number()).isEqualTo(DEFAULT_ACCOUNT_NUMBER);
    }

    @Test
    @Transactional
    public void getAllBank_accounts() throws Exception {
        // Initialize the database
        bank_accountRepository.saveAndFlush(bank_account);

        // Get all the bank_accounts
        restBank_accountMockMvc.perform(get("/api/bank_accounts"))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.[*].id").value(hasItem(bank_account.getId().intValue())))
                .andExpect(jsonPath("$.[*].bank_name").value(hasItem(DEFAULT_BANK_NAME.toString())))
                .andExpect(jsonPath("$.[*].account_name").value(hasItem(DEFAULT_ACCOUNT_NAME.toString())))
                .andExpect(jsonPath("$.[*].account_number").value(hasItem(DEFAULT_ACCOUNT_NUMBER.toString())));
    }

    @Test
    @Transactional
    public void getBank_account() throws Exception {
        // Initialize the database
        bank_accountRepository.saveAndFlush(bank_account);

        // Get the bank_account
        restBank_accountMockMvc.perform(get("/api/bank_accounts/{id}", bank_account.getId()))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON))
            .andExpect(jsonPath("$.id").value(bank_account.getId().intValue()))
            .andExpect(jsonPath("$.bank_name").value(DEFAULT_BANK_NAME.toString()))
            .andExpect(jsonPath("$.account_name").value(DEFAULT_ACCOUNT_NAME.toString()))
            .andExpect(jsonPath("$.account_number").value(DEFAULT_ACCOUNT_NUMBER.toString()));
    }

    @Test
    @Transactional
    public void getNonExistingBank_account() throws Exception {
        // Get the bank_account
        restBank_accountMockMvc.perform(get("/api/bank_accounts/{id}", Long.MAX_VALUE))
                .andExpect(status().isNotFound());
    }

    @Test
    @Transactional
    public void updateBank_account() throws Exception {
        // Initialize the database
        bank_accountRepository.saveAndFlush(bank_account);

		int databaseSizeBeforeUpdate = bank_accountRepository.findAll().size();

        // Update the bank_account
        bank_account.setBank_name(UPDATED_BANK_NAME);
        bank_account.setAccount_name(UPDATED_ACCOUNT_NAME);
        bank_account.setAccount_number(UPDATED_ACCOUNT_NUMBER);
        restBank_accountMockMvc.perform(put("/api/bank_accounts")
                .contentType(TestUtil.APPLICATION_JSON_UTF8)
                .content(TestUtil.convertObjectToJsonBytes(bank_account)))
                .andExpect(status().isOk());

        // Validate the BankAccount in the database
        List<BankAccount> bank_accounts = bank_accountRepository.findAll();
        assertThat(bank_accounts).hasSize(databaseSizeBeforeUpdate);
        BankAccount testBank_account = bank_accounts.get(bank_accounts.size() - 1);
        assertThat(testBank_account.getBank_name()).isEqualTo(UPDATED_BANK_NAME);
        assertThat(testBank_account.getAccount_name()).isEqualTo(UPDATED_ACCOUNT_NAME);
        assertThat(testBank_account.getAccount_number()).isEqualTo(UPDATED_ACCOUNT_NUMBER);
    }

    @Test
    @Transactional
    public void deleteBank_account() throws Exception {
        // Initialize the database
        bank_accountRepository.saveAndFlush(bank_account);

		int databaseSizeBeforeDelete = bank_accountRepository.findAll().size();

        // Get the bank_account
        restBank_accountMockMvc.perform(delete("/api/bank_accounts/{id}", bank_account.getId())
                .accept(TestUtil.APPLICATION_JSON_UTF8))
                .andExpect(status().isOk());

        // Validate the database is empty
        List<BankAccount> bank_accounts = bank_accountRepository.findAll();
        assertThat(bank_accounts).hasSize(databaseSizeBeforeDelete - 1);
    }
}
