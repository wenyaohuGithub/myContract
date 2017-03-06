package com.hu.cm.web.rest.dto;

public class TaskDTO {

    private Long id;

    private Long contractId;

    private String contractName;

    private String processName;

    private int sequence;

    private String assignee;

    private String performedBy;

    private String perfomedDate;

    private String result;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getContractId() {
        return contractId;
    }

    public void setContractId(Long contractId) {
        this.contractId = contractId;
    }

    public String getProcessName() {
        return processName;
    }

    public void setProcessName(String processName) {
        this.processName = processName;
    }

    public int getSequence() {
        return sequence;
    }

    public void setSequence(int sequence) {
        this.sequence = sequence;
    }

    public String getContractName() {
        return contractName;
    }

    public void setContractName(String contractName) {
        this.contractName = contractName;
    }

    public String getAssignee() {
        return assignee;
    }

    public void setAssignee(String assignee) {
        this.assignee = assignee;
    }

    public String getPerformedBy() {
        return performedBy;
    }

    public void setPerformedBy(String performedBy) {
        this.performedBy = performedBy;
    }

    public String getPerfomedDate() {
        return perfomedDate;
    }

    public void setPerfomedDate(String perfomedDate) {
        this.perfomedDate = perfomedDate;
    }

    public String getResult() {
        return result;
    }

    public void setResult(String result) {
        this.result = result;
    }

    public TaskDTO(Long id){
        this.id = id;
    }

    public TaskDTO(){}
}
