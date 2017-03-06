package com.hu.cm.web.rest;

import com.hu.cm.web.rest.configuration.AddressResource;
import com.hu.cm.Application;
import com.hu.cm.domain.configuration.Address;
import com.hu.cm.repository.configuration.AddressRepository;

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
 * Test class for the AddressResource REST controller.
 *
 * @see AddressResource
 */
@RunWith(SpringJUnit4ClassRunner.class)
@SpringApplicationConfiguration(classes = Application.class)
@WebAppConfiguration
@IntegrationTest
public class AddressResourceTest {

    private static final String DEFAULT_ADDRESS_LINE_1 = "SAMPLE_TEXT";
    private static final String UPDATED_ADDRESS_LINE_1 = "UPDATED_TEXT";
    private static final String DEFAULT_ADDRESS_LINE_2 = "SAMPLE_TEXT";
    private static final String UPDATED_ADDRESS_LINE_2 = "UPDATED_TEXT";
    private static final String DEFAULT_CITY = "SAMPLE_TEXT";
    private static final String UPDATED_CITY = "UPDATED_TEXT";
    private static final String DEFAULT_PROVINCE = "SAMPLE_TEXT";
    private static final String UPDATED_PROVINCE = "UPDATED_TEXT";
    private static final String DEFAULT_COUNTRY = "SAMPLE_TEXT";
    private static final String UPDATED_COUNTRY = "UPDATED_TEXT";
    private static final String DEFAULT_POSTAL_CODE = "SAMPLE_TEXT";
    private static final String UPDATED_POSTAL_CODE = "UPDATED_TEXT";

    @Inject
    private AddressRepository addressRepository;

    private MockMvc restAddressMockMvc;

    private Address address;

    @PostConstruct
    public void setup() {
        MockitoAnnotations.initMocks(this);
        AddressResource addressResource = new AddressResource();
        ReflectionTestUtils.setField(addressResource, "addressRepository", addressRepository);
        this.restAddressMockMvc = MockMvcBuilders.standaloneSetup(addressResource).build();
    }

    @Before
    public void initTest() {
        address = new Address();
        address.setAddress_line_1(DEFAULT_ADDRESS_LINE_1);
        address.setAddress_line_2(DEFAULT_ADDRESS_LINE_2);
        address.setCity(DEFAULT_CITY);
        address.setProvince(DEFAULT_PROVINCE);
        address.setCountry(DEFAULT_COUNTRY);
        address.setPostal_code(DEFAULT_POSTAL_CODE);
    }

    @Test
    @Transactional
    public void createAddress() throws Exception {
        int databaseSizeBeforeCreate = addressRepository.findAll().size();

        // Create the Address
        restAddressMockMvc.perform(post("/api/addresss")
                .contentType(TestUtil.APPLICATION_JSON_UTF8)
                .content(TestUtil.convertObjectToJsonBytes(address)))
                .andExpect(status().isCreated());

        // Validate the Address in the database
        List<Address> addresss = addressRepository.findAll();
        assertThat(addresss).hasSize(databaseSizeBeforeCreate + 1);
        Address testAddress = addresss.get(addresss.size() - 1);
        assertThat(testAddress.getAddress_line_1()).isEqualTo(DEFAULT_ADDRESS_LINE_1);
        assertThat(testAddress.getAddress_line_2()).isEqualTo(DEFAULT_ADDRESS_LINE_2);
        assertThat(testAddress.getCity()).isEqualTo(DEFAULT_CITY);
        assertThat(testAddress.getProvince()).isEqualTo(DEFAULT_PROVINCE);
        assertThat(testAddress.getCountry()).isEqualTo(DEFAULT_COUNTRY);
        assertThat(testAddress.getPostal_code()).isEqualTo(DEFAULT_POSTAL_CODE);
    }

    @Test
    @Transactional
    public void getAllAddresss() throws Exception {
        // Initialize the database
        addressRepository.saveAndFlush(address);

        // Get all the addresss
        restAddressMockMvc.perform(get("/api/addresss"))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.[*].id").value(hasItem(address.getId().intValue())))
                .andExpect(jsonPath("$.[*].address_line_1").value(hasItem(DEFAULT_ADDRESS_LINE_1.toString())))
                .andExpect(jsonPath("$.[*].address_line_2").value(hasItem(DEFAULT_ADDRESS_LINE_2.toString())))
                .andExpect(jsonPath("$.[*].city").value(hasItem(DEFAULT_CITY.toString())))
                .andExpect(jsonPath("$.[*].province").value(hasItem(DEFAULT_PROVINCE.toString())))
                .andExpect(jsonPath("$.[*].country").value(hasItem(DEFAULT_COUNTRY.toString())))
                .andExpect(jsonPath("$.[*].postal_code").value(hasItem(DEFAULT_POSTAL_CODE.toString())));
    }

    @Test
    @Transactional
    public void getAddress() throws Exception {
        // Initialize the database
        addressRepository.saveAndFlush(address);

        // Get the address
        restAddressMockMvc.perform(get("/api/addresss/{id}", address.getId()))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON))
            .andExpect(jsonPath("$.id").value(address.getId().intValue()))
            .andExpect(jsonPath("$.address_line_1").value(DEFAULT_ADDRESS_LINE_1.toString()))
            .andExpect(jsonPath("$.address_line_2").value(DEFAULT_ADDRESS_LINE_2.toString()))
            .andExpect(jsonPath("$.city").value(DEFAULT_CITY.toString()))
            .andExpect(jsonPath("$.province").value(DEFAULT_PROVINCE.toString()))
            .andExpect(jsonPath("$.country").value(DEFAULT_COUNTRY.toString()))
            .andExpect(jsonPath("$.postal_code").value(DEFAULT_POSTAL_CODE.toString()));
    }

    @Test
    @Transactional
    public void getNonExistingAddress() throws Exception {
        // Get the address
        restAddressMockMvc.perform(get("/api/addresss/{id}", Long.MAX_VALUE))
                .andExpect(status().isNotFound());
    }

    @Test
    @Transactional
    public void updateAddress() throws Exception {
        // Initialize the database
        addressRepository.saveAndFlush(address);

		int databaseSizeBeforeUpdate = addressRepository.findAll().size();

        // Update the address
        address.setAddress_line_1(UPDATED_ADDRESS_LINE_1);
        address.setAddress_line_2(UPDATED_ADDRESS_LINE_2);
        address.setCity(UPDATED_CITY);
        address.setProvince(UPDATED_PROVINCE);
        address.setCountry(UPDATED_COUNTRY);
        address.setPostal_code(UPDATED_POSTAL_CODE);
        restAddressMockMvc.perform(put("/api/addresss")
                .contentType(TestUtil.APPLICATION_JSON_UTF8)
                .content(TestUtil.convertObjectToJsonBytes(address)))
                .andExpect(status().isOk());

        // Validate the Address in the database
        List<Address> addresss = addressRepository.findAll();
        assertThat(addresss).hasSize(databaseSizeBeforeUpdate);
        Address testAddress = addresss.get(addresss.size() - 1);
        assertThat(testAddress.getAddress_line_1()).isEqualTo(UPDATED_ADDRESS_LINE_1);
        assertThat(testAddress.getAddress_line_2()).isEqualTo(UPDATED_ADDRESS_LINE_2);
        assertThat(testAddress.getCity()).isEqualTo(UPDATED_CITY);
        assertThat(testAddress.getProvince()).isEqualTo(UPDATED_PROVINCE);
        assertThat(testAddress.getCountry()).isEqualTo(UPDATED_COUNTRY);
        assertThat(testAddress.getPostal_code()).isEqualTo(UPDATED_POSTAL_CODE);
    }

    @Test
    @Transactional
    public void deleteAddress() throws Exception {
        // Initialize the database
        addressRepository.saveAndFlush(address);

		int databaseSizeBeforeDelete = addressRepository.findAll().size();

        // Get the address
        restAddressMockMvc.perform(delete("/api/addresss/{id}", address.getId())
                .accept(TestUtil.APPLICATION_JSON_UTF8))
                .andExpect(status().isOk());

        // Validate the database is empty
        List<Address> addresss = addressRepository.findAll();
        assertThat(addresss).hasSize(databaseSizeBeforeDelete - 1);
    }
}
