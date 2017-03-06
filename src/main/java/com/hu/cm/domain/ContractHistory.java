package com.hu.cm.domain;

import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import com.hu.cm.domain.admin.Account;
import com.hu.cm.domain.admin.User;
import com.hu.cm.domain.configuration.Process;
import com.hu.cm.domain.util.CustomDateTimeDeserializer;
import com.hu.cm.domain.util.CustomDateTimeSerializer;
import org.hibernate.annotations.Cache;
import org.hibernate.annotations.CacheConcurrencyStrategy;
import org.hibernate.annotations.Type;
import org.joda.time.DateTime;

import javax.persistence.*;
import java.io.Serializable;
import java.util.Objects;

import com.hu.cm.domain.enumeration.UserAction;

/**
 * A ContractHistory.
 */
@Entity
@Table(name = "MC_CONTRACT_HISTORY")
@Cache(usage = CacheConcurrencyStrategy.NONSTRICT_READ_WRITE)
public class ContractHistory implements Serializable {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long id;

    @Column(name = "note")
    private String note;

    @Enumerated(EnumType.STRING)
    @Column(name = "action")
    private UserAction action;

    @Type(type = "org.jadira.usertype.dateandtime.joda.PersistentDateTime")
    @JsonSerialize(using = CustomDateTimeSerializer.class)
    @JsonDeserialize(using = CustomDateTimeDeserializer.class)
    @Column(name = "action_datetime")
    private DateTime action_datetime;

    @ManyToOne
    private Contract contract;

    @ManyToOne
    private User user;

    @ManyToOne
    private Task task;

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

    public Contract getContract() {
        return contract;
    }

    public void setContract(Contract contract) {
        this.contract = contract;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public Task getTask() {
        return task;
    }

    public void setTask(Task task) {
        this.task = task;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (o == null || getClass() != o.getClass()) {
            return false;
        }

        ContractHistory contract_history = (ContractHistory) o;

        if ( ! Objects.equals(id, contract_history.id)) return false;

        return true;
    }

    @Override
    public int hashCode() {
        return Objects.hashCode(id);
    }

    @Override
    public String toString() {
        return "ContractHistory{" +
                "id=" + id +
                ", note='" + note + "'" +
                ", action='" + action + "'" +
                ", action_datetime='" + action_datetime + "'" +
                '}';
    }
}
