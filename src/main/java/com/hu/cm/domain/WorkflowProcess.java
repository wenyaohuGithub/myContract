package com.hu.cm.domain;

import com.hu.cm.domain.configuration.Process;
import org.hibernate.annotations.Cache;
import org.hibernate.annotations.CacheConcurrencyStrategy;

import javax.persistence.*;
import java.io.Serializable;
import java.util.HashSet;
import java.util.Objects;
import java.util.Set;


/**
 * A WorkflowProcess.
 */
@Entity
@Table(name = "MC_WORKFLOW_PROCESS")
@Cache(usage = CacheConcurrencyStrategy.NONSTRICT_READ_WRITE)
public class WorkflowProcess implements Serializable {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long id;

    /*
    @Column(name = "workflow_id")
    private Long workflowId;

    @Column(name = "process_id")
    private Long processId;
    */

    //@OneToOne(cascade = CascadeType.ALL, optional = false, fetch = FetchType.EAGER, orphanRemoval = true)
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name="process_id", nullable=false)
    @PrimaryKeyJoinColumn
    private Process process;

    //@OneToOne(cascade = CascadeType.ALL, optional = false, fetch = FetchType.EAGER, orphanRemoval = true)
    @ManyToOne(fetch = FetchType.EAGER)
    //@JoinColumn(name = "templatePageId", nullable = false, foreignKey = @ForeignKey(name="fk_tpf_template_page_id"))
    @JoinColumn(name="workflow_id", nullable=false)
    @PrimaryKeyJoinColumn
    private Workflow workflow;

    @Column(name = "sequence")
    private Integer sequence;


    public Integer getSequence() {
        return sequence;
    }

    public void setSequence(Integer sequence) {
        this.sequence = sequence;
    }
/*
    public Long getWorkflowId() {
        return workflowId;
    }

    public void setWorkflowId(Long workflowId) {
        this.workflowId = workflowId;
    }

    public Long getProcessId() {
        return processId;
    }


    public void setProcessId(Long processId) {
        this.processId = processId;
    }
*/

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Process getProcess() {
        return process;
    }

    public void setProcess(Process process) {
        this.process = process;
    }

    public Workflow getWorkflow() {
        return workflow;
    }

    public void setWorkflow(Workflow workflow) {
        this.workflow = workflow;
    }
    /*
    static class WorkflowProcessId implements Serializable {
        Long workflowId;
        Long processId;
    }*/
}
