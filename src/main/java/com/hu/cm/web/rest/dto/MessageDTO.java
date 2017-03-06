package com.hu.cm.web.rest.dto;

import com.hu.cm.domain.Task;
import com.hu.cm.domain.admin.User;
import org.joda.time.DateTime;

public class MessageDTO {

    private Long id;

    private String subject;

    private String content;

    private String send_datetime;

    private Boolean read;

    private UserDTO sender;

    private UserDTO recipient;

    private TaskDTO task;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getSubject() {
        return subject;
    }

    public void setSubject(String subject) {
        this.subject = subject;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public String getSend_datetime() {
        return send_datetime;
    }

    public void setSend_datetime(String send_datetime) {
        this.send_datetime = send_datetime;
    }

    public Boolean getRead() {
        return read;
    }

    public void setRead(Boolean read) {
        this.read = read;
    }

    public UserDTO getSender() {
        return sender;
    }

    public void setSender(UserDTO sender) {
        this.sender = sender;
    }

    public UserDTO getRecipient() {
        return recipient;
    }

    public void setRecipient(UserDTO recipient) {
        this.recipient = recipient;
    }

    public TaskDTO getTask() {
        return task;
    }

    public void setTask(TaskDTO task) {
        this.task = task;
    }

    public MessageDTO(Long id){
        this.id = id;
    }

    public MessageDTO(){}
}
