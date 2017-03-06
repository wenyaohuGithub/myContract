package com.hu.cm.domain;

import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import com.hu.cm.domain.admin.Department;
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


/**
 * A Task.
 */
@Entity
@Table(name = "MC_TASK")
@Cache(usage = CacheConcurrencyStrategy.NONSTRICT_READ_WRITE)
public class Task implements Serializable {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long id;

    @Column(name = "sequence")
    private Integer sequence;

    @Column(name = "result")
    private String result;

    @Type(type = "org.jadira.usertype.dateandtime.joda.PersistentDateTime")
    @JsonSerialize(using = CustomDateTimeSerializer.class)
    @JsonDeserialize(using = CustomDateTimeDeserializer.class)
    @Column(name = "performed_datetime")
    private DateTime performedDatetime;

    @ManyToOne
    private Contract contract;

    @ManyToOne
    private Process process;

    @ManyToOne
    private Department department;

    @ManyToOne
    @JoinColumn(name="assigned_to")
    private User assignee;

    @ManyToOne
    @JoinColumn(name="performed_by")
    private User performer;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Integer getSequence() {
        return sequence;
    }

    public void setSequence(Integer sequence) {
        this.sequence = sequence;
    }

    public Contract getContract() {
        return contract;
    }

    public void setContract(Contract contract) {
        this.contract = contract;
    }

    public Process getProcess() {
        return process;
    }

    public void setProcess(Process process) {
        this.process = process;
    }

    public Department getDepartment() {
        return department;
    }

    public void setDepartment(Department department) {
        this.department = department;
    }

    public DateTime getPerformedDatetime() {
        return performedDatetime;
    }

    public void setPerformedDatetime(DateTime performedDatetime) {
        this.performedDatetime = performedDatetime;
    }

    public User getAssignee() {
        return assignee;
    }

    public void setAssignee(User assignee) {
        this.assignee = assignee;
    }

    public User getPerformer() {
        return performer;
    }

    public void setPerformer(User performer) {
        this.performer = performer;
    }

    public String getResult() {
        return result;
    }

    public void setResult(String result) {
        this.result = result;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (o == null || getClass() != o.getClass()) {
            return false;
        }

        Task task = (Task) o;

        if(task.id != null && task.id == this.id){
            return true;
        } else {
            if(task.getContract().getId() == this.getContract().getId()
                && task.getProcess().getId() == this.getProcess().getId()
                && task.getSequence() == this.getSequence()){
                return true;
            }
        }
        return false;
    }

    @Override
    public int hashCode() {
        return Objects.hashCode(id);
    }

    @Override
    public String toString() {
        return "Task{" +
                "id=" + id +
                ", sequence='" + sequence + "'" +
                '}';
    }
}
