package com.hu.cm.web.rest;

import com.hu.cm.Application;
import com.hu.cm.domain.admin.Role;
import com.hu.cm.repository.admin.RoleRepository;

import com.hu.cm.web.rest.admin.RoleResource;
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
 * Test class for the RoleResource REST controller.
 *
 * @see RoleResource
 */
@RunWith(SpringJUnit4ClassRunner.class)
@SpringApplicationConfiguration(classes = Application.class)
@WebAppConfiguration
@IntegrationTest
public class RoleResourceTest {

    private static final String DEFAULT_NAME = "SAMPLE_TEXT";
    private static final String UPDATED_NAME = "UPDATED_TEXT";

    @Inject
    private RoleRepository roleRepository;

    private MockMvc restRoleMockMvc;

    private Role role;

    @PostConstruct
    public void setup() {
        MockitoAnnotations.initMocks(this);
        RoleResource roleResource = new RoleResource();
        ReflectionTestUtils.setField(roleResource, "roleRepository", roleRepository);
        this.restRoleMockMvc = MockMvcBuilders.standaloneSetup(roleResource).build();
    }

    @Before
    public void initTest() {
        role = new Role();
        role.setName(DEFAULT_NAME);
    }

    @Test
    @Transactional
    public void createRole() throws Exception {
        int databaseSizeBeforeCreate = roleRepository.findAll().size();

        // Create the Role
        restRoleMockMvc.perform(post("/api/roles")
                .contentType(TestUtil.APPLICATION_JSON_UTF8)
                .content(TestUtil.convertObjectToJsonBytes(role)))
                .andExpect(status().isCreated());

        // Validate the Role in the database
        List<Role> roles = roleRepository.findAll();
        assertThat(roles).hasSize(databaseSizeBeforeCreate + 1);
        Role testRole = roles.get(roles.size() - 1);
        assertThat(testRole.getName()).isEqualTo(DEFAULT_NAME);
    }

    @Test
    @Transactional
    public void getAllRoles() throws Exception {
        // Initialize the database
        roleRepository.saveAndFlush(role);

        // Get all the roles
        restRoleMockMvc.perform(get("/api/roles"))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                //.andExpect(jsonPath("$.[*].id").value(hasItem(role.getId().intValue())))
                .andExpect(jsonPath("$.[*].name").value(hasItem(DEFAULT_NAME.toString())));
    }

    @Test
    @Transactional
    public void getRole() throws Exception {
        // Initialize the database
        roleRepository.saveAndFlush(role);

        // Get the role
        restRoleMockMvc.perform(get("/api/roles/{name}", role.getName()))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON))
            //.andExpect(jsonPath("$.id").value(role.getId().intValue()))
            .andExpect(jsonPath("$.name").value(DEFAULT_NAME.toString()));
    }

    @Test
    @Transactional
    public void getNonExistingRole() throws Exception {
        // Get the role
        restRoleMockMvc.perform(get("/api/roles/{id}", Long.MAX_VALUE))
                .andExpect(status().isNotFound());
    }

    @Test
    @Transactional
    public void updateRole() throws Exception {
        // Initialize the database
        roleRepository.saveAndFlush(role);

		int databaseSizeBeforeUpdate = roleRepository.findAll().size();

        // Update the role
        role.setName(UPDATED_NAME);
        restRoleMockMvc.perform(put("/api/roles")
                .contentType(TestUtil.APPLICATION_JSON_UTF8)
                .content(TestUtil.convertObjectToJsonBytes(role)))
                .andExpect(status().isOk());

        // Validate the Role in the database
        List<Role> roles = roleRepository.findAll();
        assertThat(roles).hasSize(databaseSizeBeforeUpdate);
        Role testRole = roles.get(roles.size() - 1);
        assertThat(testRole.getName()).isEqualTo(UPDATED_NAME);
    }

    @Test
    @Transactional
    public void deleteRole() throws Exception {
        // Initialize the database
        roleRepository.saveAndFlush(role);

		int databaseSizeBeforeDelete = roleRepository.findAll().size();

        // Get the role
        restRoleMockMvc.perform(delete("/api/roles/{name}", role.getName())
                .accept(TestUtil.APPLICATION_JSON_UTF8))
                .andExpect(status().isOk());

        // Validate the database is empty
        List<Role> roles = roleRepository.findAll();
        assertThat(roles).hasSize(databaseSizeBeforeDelete - 1);
    }
}
