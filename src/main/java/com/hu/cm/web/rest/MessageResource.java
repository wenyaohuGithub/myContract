package com.hu.cm.web.rest;

import com.codahale.metrics.annotation.Timed;
import com.hu.cm.domain.Message;
import com.hu.cm.domain.admin.Account;
import com.hu.cm.repository.MessageRepository;
import com.hu.cm.security.xauth.TokenManager;
import com.hu.cm.web.rest.admin.LoginUser;
import com.hu.cm.web.rest.dto.MessageDTO;
import com.hu.cm.web.rest.dto.UserDTO;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import javax.inject.Inject;
import java.net.URI;
import java.net.URISyntaxException;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

/**
 * REST controller for managing Message.
 */
@RestController
@RequestMapping("/api")
public class MessageResource {

    private final Logger log = LoggerFactory.getLogger(MessageResource.class);

    @Inject
    private MessageRepository messageRepository;

    /**
     * POST  /messages -> Create a new message.
     */
    @RequestMapping(value = "/messages",
            method = RequestMethod.POST,
            produces = MediaType.APPLICATION_JSON_VALUE)
    @Timed
    public ResponseEntity<Message> create(@RequestBody Message message) throws URISyntaxException {
        log.debug("REST request to save Message : {}", message);
        if (message.getId() != null) {
            return ResponseEntity.badRequest().header("Failure", "A new message cannot already have an ID").body(null);
        }
        LoginUser user = (LoginUser)TokenManager.getCurrentToken().getUserDetails();
        Long accountId = user.getAccount().getId();
        if(accountId == null){
            log.error("create: Account id missing");
            return new ResponseEntity<>(null, null, HttpStatus.BAD_REQUEST);
        }

        Message result = messageRepository.save(message);
        return ResponseEntity.created(new URI("/api/messages/" + message.getId())).body(result);
    }

    /**
     * PUT  /messages -> Updates an existing message.
     */
    @RequestMapping(value = "/messages",
        method = RequestMethod.PUT,
        produces = MediaType.APPLICATION_JSON_VALUE)
    @Timed
    public ResponseEntity<Message> update(@RequestBody Message message) throws URISyntaxException {
        log.debug("REST request to update Message : {}", message);
        if (message.getId() == null) {
            return create(message);
        }
        Message result = messageRepository.save(message);
        return ResponseEntity.ok().body(result);
    }

    /**
     * GET  /messages -> get all the messages.
     */
    @RequestMapping(value = "/messages",
            method = RequestMethod.GET,
            produces = MediaType.APPLICATION_JSON_VALUE)
    @Timed
    public ResponseEntity<List<MessageDTO>> getAll() {
        log.debug("REST request to get all Messages");
        LoginUser user = (LoginUser)TokenManager.getCurrentToken().getUserDetails();
        Long accountId = user.getAccount().getId();
        if(accountId == null){
            log.error("getAll(): Account id missing");
            return new ResponseEntity<>(null, null, HttpStatus.BAD_REQUEST);
        }

        List<Message> messages = messageRepository.findAllForCurrentUserToReceive();
        List<MessageDTO> results = new ArrayList<>();
        for(Message msg: messages){
            MessageDTO dto = new MessageDTO(msg.getId());
            dto.setContent(msg.getContent());
            UserDTO sender = new UserDTO(msg.getSender().getId(), msg.getSender().getLogin(),
                null, null, null, null, null,null, null);
            dto.setSender(sender);
            UserDTO recipient = new UserDTO(msg.getRecipient().getId(), msg.getRecipient().getLogin(),
                null, null, null, null, null,null, null);
            dto.setRecipient(recipient);
            dto.setSend_datetime(msg.getSend_datetime().toString());
            dto.setSubject(msg.getSubject());
            dto.setRead(msg.getRead());
            results.add(dto);
        }
        return new ResponseEntity<>(results, null, HttpStatus.OK);
    }

    /**
     * GET  /messages/:id -> get the "id" message.
     */
    @RequestMapping(value = "/messages/{id}",
            method = RequestMethod.GET,
            produces = MediaType.APPLICATION_JSON_VALUE)
    @Timed
    public ResponseEntity<MessageDTO> get(@PathVariable Long id) {
        log.debug("REST request to get Message : {}", id);
        Message msg = messageRepository.findOne(id);
        if(msg != null){
            MessageDTO dto = new MessageDTO(msg.getId());
            dto.setContent(msg.getContent());
            UserDTO sender = new UserDTO(msg.getSender().getId(), msg.getSender().getLogin(),
                null, null, null, null, null, null, null);
            dto.setSender(sender);
            UserDTO recipient = new UserDTO(msg.getRecipient().getId(), msg.getRecipient().getLogin(),
                null, null, null, null, null,null, null);
            dto.setRecipient(recipient);
            dto.setSend_datetime(msg.getSend_datetime().toString());
            dto.setSubject(msg.getSubject());
            dto.setRead(msg.getRead());
            return new ResponseEntity<>(dto, HttpStatus.OK);
        } else {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

    /**
     * DELETE  /messages/:id -> delete the "id" message.
     */
    @RequestMapping(value = "/messages/{id}",
            method = RequestMethod.DELETE,
            produces = MediaType.APPLICATION_JSON_VALUE)
    @Timed
    public void delete(@PathVariable Long id) {
        log.debug("REST request to delete Message : {}", id);
        messageRepository.delete(id);
    }
}
