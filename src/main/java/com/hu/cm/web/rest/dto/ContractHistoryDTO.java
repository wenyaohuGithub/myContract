package com.hu.cm.web.rest.dto;

import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import com.hu.cm.domain.admin.User;
import com.hu.cm.domain.util.CustomDateTimeDeserializer;
import com.hu.cm.domain.util.CustomDateTimeSerializer;
import org.joda.time.DateTime;
import java.io.Serializable;
import java.util.Objects;

import com.hu.cm.domain.enumeration.UserAction;

/**
 * A DTO for the ContractHistory entity.
 */
public class ContractHistoryDTO implements Serializable {

    private Long id;

    private String note;

    private UserAction action;

    @JsonSerialize(using = CustomDateTimeSerializer.class)
    @JsonDeserialize(using = CustomDateTimeDeserializer.class)
    private DateTime action_datetime;

    private Long contractId;

    private Long userId;

    private User user;

    private Long taskId;

    private String contractName;

    private String taskProcessName;

    private String userName;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getNote() {
        return note;
    }

    public void setNote(String note) {
        this.note = note;
    }

    public UserAction getAction() {
        return action;
    }

    public void setAction(UserAction action) {
        this.action = action;
    }

    public DateTime getAction_datetime() {
        return action_datetime;
    }

    public void setAction_datetime(DateTime action_datetime) {
        this.action_datetime = action_datetime;
    }

    public Long getContractId() {
        return contractId;
    }

    public void setContractId(Long contractId) {
        this.contractId = contractId;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public Long getTaskId() {
        return taskId;
    }

    public void setTaskId(Long taskId) {
        this.taskId = taskId;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public String getContractName() {
        return contractName;
    }

    public void setContractName(String contractName) {
        this.contractName = contractName;
    }

    public String getTaskProcessName() {
        return taskProcessName;
    }

    public void setTaskProcessName(String taskProcessName) {
        this.taskProcessName = taskProcessName;
    }

    public String getUserName() {
        return userName;
    }

    public void setUserName(String userName) {
        this.userName = userName;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (o == null || getClass() != o.getClass()) {
            return false;
        }

        ContractHistoryDTO contract_historyDTO = (ContractHistoryDTO) o;

        if ( ! Objects.equals(id, contract_historyDTO.id)) return false;

        return true;
    }

    @Override
    public int hashCode() {
        return Objects.hashCode(id);
    }

    @Override
    public String toString() {
        return "ContractHistoryDTO{" +
                "id=" + id +
                ", note='" + note + "'" +
                ", action='" + action + "'" +
                ", action_datetime='" + action_datetime + "'" +
                '}';
    }
}
