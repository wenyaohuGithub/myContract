package com.hu.cm.web.rest;

import com.hu.cm.Application;
import com.hu.cm.domain.Message;
import com.hu.cm.repository.MessageRepository;

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
 * Test class for the MessageResource REST controller.
 *
 * @see MessageResource
 */
@RunWith(SpringJUnit4ClassRunner.class)
@SpringApplicationConfiguration(classes = Application.class)
@WebAppConfiguration
@IntegrationTest
public class MessageResourceTest {

    private static final DateTimeFormatter dateTimeFormatter = DateTimeFormat.forPattern("yyyy-MM-dd'T'HH:mm:ss'Z'");

    private static final String DEFAULT_SUBJECT = "SAMPLE_TEXT";
    private static final String UPDATED_SUBJECT = "UPDATED_TEXT";
    private static final String DEFAULT_CONTENT = "SAMPLE_TEXT";
    private static final String UPDATED_CONTENT = "UPDATED_TEXT";

    private static final DateTime DEFAULT_SEND_DATETIME = new DateTime(0L, DateTimeZone.UTC);
    private static final DateTime UPDATED_SEND_DATETIME = new DateTime(DateTimeZone.UTC).withMillisOfSecond(0);
    private static final String DEFAULT_SEND_DATETIME_STR = dateTimeFormatter.print(DEFAULT_SEND_DATETIME);

    private static final Boolean DEFAULT_READ = false;
    private static final Boolean UPDATED_READ = true;

    @Inject
    private MessageRepository messageRepository;

    private MockMvc restMessageMockMvc;

    private Message message;

    @PostConstruct
    public void setup() {
        MockitoAnnotations.initMocks(this);
        MessageResource messageResource = new MessageResource();
        ReflectionTestUtils.setField(messageResource, "messageRepository", messageRepository);
        this.restMessageMockMvc = MockMvcBuilders.standaloneSetup(messageResource).build();
    }

    @Before
    public void initTest() {
        message = new Message();
        message.setSubject(DEFAULT_SUBJECT);
        message.setContent(DEFAULT_CONTENT);
        message.setSend_datetime(DEFAULT_SEND_DATETIME);
        message.setRead(DEFAULT_READ);
    }

    @Test
    @Transactional
    public void createMessage() throws Exception {
        int databaseSizeBeforeCreate = messageRepository.findAll().size();

        // Create the Message
        restMessageMockMvc.perform(post("/api/messages")
                .contentType(TestUtil.APPLICATION_JSON_UTF8)
                .content(TestUtil.convertObjectToJsonBytes(message)))
                .andExpect(status().isCreated());

        // Validate the Message in the database
        List<Message> messages = messageRepository.findAll();
        assertThat(messages).hasSize(databaseSizeBeforeCreate + 1);
        Message testMessage = messages.get(messages.size() - 1);
        assertThat(testMessage.getSubject()).isEqualTo(DEFAULT_SUBJECT);
        assertThat(testMessage.getContent()).isEqualTo(DEFAULT_CONTENT);
        assertThat(testMessage.getSend_datetime().toDateTime(DateTimeZone.UTC)).isEqualTo(DEFAULT_SEND_DATETIME);
        assertThat(testMessage.getRead()).isEqualTo(DEFAULT_READ);
    }

    @Test
    @Transactional
    public void getAllMessages() throws Exception {
        // Initialize the database
        messageRepository.saveAndFlush(message);

        // Get all the messages
        restMessageMockMvc.perform(get("/api/messages"))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.[*].id").value(hasItem(message.getId().intValue())))
                .andExpect(jsonPath("$.[*].subject").value(hasItem(DEFAULT_SUBJECT.toString())))
                .andExpect(jsonPath("$.[*].content").value(hasItem(DEFAULT_CONTENT.toString())))
                .andExpect(jsonPath("$.[*].send_datetime").value(hasItem(DEFAULT_SEND_DATETIME_STR)))
                .andExpect(jsonPath("$.[*].read").value(hasItem(DEFAULT_READ.booleanValue())));
    }

    @Test
    @Transactional
    public void getMessage() throws Exception {
        // Initialize the database
        messageRepository.saveAndFlush(message);

        // Get the message
        restMessageMockMvc.perform(get("/api/messages/{id}", message.getId()))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON))
            .andExpect(jsonPath("$.id").value(message.getId().intValue()))
            .andExpect(jsonPath("$.subject").value(DEFAULT_SUBJECT.toString()))
            .andExpect(jsonPath("$.content").value(DEFAULT_CONTENT.toString()))
            .andExpect(jsonPath("$.send_datetime").value(DEFAULT_SEND_DATETIME_STR))
            .andExpect(jsonPath("$.read").value(DEFAULT_READ.booleanValue()));
    }

    @Test
    @Transactional
    public void getNonExistingMessage() throws Exception {
        // Get the message
        restMessageMockMvc.perform(get("/api/messages/{id}", Long.MAX_VALUE))
                .andExpect(status().isNotFound());
    }

    @Test
    @Transactional
    public void updateMessage() throws Exception {
        // Initialize the database
        messageRepository.saveAndFlush(message);

		int databaseSizeBeforeUpdate = messageRepository.findAll().size();

        // Update the message
        message.setSubject(UPDATED_SUBJECT);
        message.setContent(UPDATED_CONTENT);
        message.setSend_datetime(UPDATED_SEND_DATETIME);
        message.setRead(UPDATED_READ);
        restMessageMockMvc.perform(put("/api/messages")
                .contentType(TestUtil.APPLICATION_JSON_UTF8)
                .content(TestUtil.convertObjectToJsonBytes(message)))
                .andExpect(status().isOk());

        // Validate the Message in the database
        List<Message> messages = messageRepository.findAll();
        assertThat(messages).hasSize(databaseSizeBeforeUpdate);
        Message testMessage = messages.get(messages.size() - 1);
        assertThat(testMessage.getSubject()).isEqualTo(UPDATED_SUBJECT);
        assertThat(testMessage.getContent()).isEqualTo(UPDATED_CONTENT);
        assertThat(testMessage.getSend_datetime().toDateTime(DateTimeZone.UTC)).isEqualTo(UPDATED_SEND_DATETIME);
        assertThat(testMessage.getRead()).isEqualTo(UPDATED_READ);
    }

    @Test
    @Transactional
    public void deleteMessage() throws Exception {
        // Initialize the database
        messageRepository.saveAndFlush(message);

		int databaseSizeBeforeDelete = messageRepository.findAll().size();

        // Get the message
        restMessageMockMvc.perform(delete("/api/messages/{id}", message.getId())
                .accept(TestUtil.APPLICATION_JSON_UTF8))
                .andExpect(status().isOk());

        // Validate the database is empty
        List<Message> messages = messageRepository.findAll();
        assertThat(messages).hasSize(databaseSizeBeforeDelete - 1);
    }
}
