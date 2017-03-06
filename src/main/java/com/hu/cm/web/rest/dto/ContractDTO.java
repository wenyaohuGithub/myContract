package com.hu.cm.web.rest.dto;


import com.hu.cm.domain.admin.User;
import com.hu.cm.domain.configuration.ContractSample;
import com.hu.cm.domain.configuration.FundSource;
import com.hu.cm.domain.enumeration.ContractingMethod;
import com.hu.cm.domain.enumeration.Currency;

import java.math.BigDecimal;
import java.util.HashSet;
import java.util.Set;

public class ContractDTO {
    private Long id;

    private String name;

    private String reviewIdentifier;

    private String contractIdentifier;

    private ContractingMethod contractingMethod;

    private BigDecimal amount;

    private String amountWritten;

    private String description;

    private Currency currency;

    private BigDecimal amountCurrentYear;

    private String submitDate;

    private String startDate;

    private String endDate;

    private String expireDate;

    private String createdDate;

    private String modifiedDate;

    private ProcessDTO firstReviewProcess;

    private TaskDTO nextTask;

    private Boolean isMultiYear;

    private String status;

    private TaskDTO currentTask;

    private String approveDate;

    private String signDate;

    private String archiveDate;

    private ContractPartyDTO contractParty;

    private DepartmentDTO administrativeDepartment;

    private User administrator;

    private User author;

    private User assignee;

    private User modifiedBy;

    private CategoryDTO category;

    private FundSource fundSource;

    private ContractSample contractSample;

    private Set<DepartmentDTO> relatedDepartments = new HashSet<>();

    private Set<ProjectDTO> projects = new HashSet<>();

    private Boolean isDraft;

    private Boolean rejectable;

    private Boolean approvable;


    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getReviewIdentifier() {
        return reviewIdentifier;
    }

    public void setReviewIdentifier(String reviewIdentifier) {
        this.reviewIdentifier = reviewIdentifier;
    }

    public String getContractIdentifier() {
        return contractIdentifier;
    }

    public void setContractIdentifier(String contractIdentifier) {
        this.contractIdentifier = contractIdentifier;
    }

    public ContractingMethod getContractingMethod() {
        return contractingMethod;
    }

    public void setContractingMethod(ContractingMethod contractingMethod) {
        this.contractingMethod = contractingMethod;
    }

    public BigDecimal getAmount() {
        return amount;
    }

    public void setAmount(BigDecimal amount) {
        this.amount = amount;
    }

    public String getAmountWritten() {
        return amountWritten;
    }

    public void setAmountWritten(String amountWritten) {
        this.amountWritten = amountWritten;
    }

    public Currency getCurrency() {
        return currency;
    }

    public void setCurrency(Currency currency) {
        this.currency = currency;
    }

    public BigDecimal getAmountCurrentYear() {
        return amountCurrentYear;
    }

    public void setAmountCurrentYear(BigDecimal amountCurrentYear) {
        this.amountCurrentYear = amountCurrentYear;
    }

    public String getSubmitDate() {
        return submitDate;
    }

    public void setSubmitDate(String submitDate) {
        this.submitDate = submitDate;
    }

    public String getStartDate() {
        return startDate;
    }

    public void setStartDate(String startDate) {
        this.startDate = startDate;
    }

    public String getEndDate() {
        return endDate;
    }

    public void setEndDate(String endDate) {
        this.endDate = endDate;
    }

    public String getExpireDate() {
        return expireDate;
    }

    public void setExpireDate(String expireDate) {
        this.expireDate = expireDate;
    }

    public Boolean getIsMultiYear() {
        return isMultiYear;
    }

    public void setIsMultiYear(Boolean isMultiYear) {
        this.isMultiYear = isMultiYear;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public TaskDTO getCurrentTask() {
        return currentTask;
    }

    public void setCurrentTask(TaskDTO currentTask) {
        this.currentTask = currentTask;
    }

    public String getApproveDate() {
        return approveDate;
    }

    public void setApproveDate(String approveDate) {
        this.approveDate = approveDate;
    }

    public String getSignDate() {
        return signDate;
    }

    public void setSignDate(String signDate) {
        this.signDate = signDate;
    }

    public String getArchiveDate() {
        return archiveDate;
    }

    public void setArchiveDate(String archiveDate) {
        this.archiveDate = archiveDate;
    }

    public ContractPartyDTO getContractParty() {
        return contractParty;
    }

    public void setContractParty(ContractPartyDTO contractParty) {
        this.contractParty = contractParty;
    }

    public CategoryDTO getCategory() {
        return category;
    }

    public void setCategory(CategoryDTO category) {
        this.category = category;
    }

    public FundSource getFundSource() {
        return fundSource;
    }

    public void setFundSource(FundSource fundSource) {
        this.fundSource = fundSource;
    }

    public ContractSample getContractSample() {
        return contractSample;
    }

    public void setContractSample(ContractSample contractSample) {
        this.contractSample = contractSample;
    }

    public Set<DepartmentDTO> getRelatedDepartments() {
        return relatedDepartments;
    }

    public void setRelatedDepartments(Set<DepartmentDTO> departments) {
        this.relatedDepartments = departments;
    }

    public User getAuthor() {
        return author;
    }

    public void setAuthor(User author) {
        this.author = author;
    }

    public User getAdministrator() {
        return administrator;
    }

    public void setAdministrator(User administrator) {
        this.administrator = administrator;
    }

    public DepartmentDTO getAdministrativeDepartment() {
        return administrativeDepartment;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public void setAdministrativeDepartment(DepartmentDTO administrativeDepartment) {
        this.administrativeDepartment = administrativeDepartment;
    }

    public Set<ProjectDTO> getProjects() {
        return projects;
    }

    public void setProjects(Set<ProjectDTO> projects) {
        this.projects = projects;
    }

    public User getAssignee() {
        return assignee;
    }

    public void setAssignee(User assignee) {
        this.assignee = assignee;
    }

    public Boolean getIsDraft() {
        return isDraft;
    }

    public void setIsDraft(Boolean draft) {
        isDraft = draft;
    }

    public User getModifiedBy() {
        return modifiedBy;
    }

    public void setModifiedBy(User modifiedBy) {
        this.modifiedBy = modifiedBy;
    }

    public String getCreatedDate() {
        return createdDate;
    }

    public void setCreatedDate(String createdDate) {
        this.createdDate = createdDate;
    }

    public String getModifiedDate() {
        return modifiedDate;
    }

    public void setModifiedDate(String modifiedDate) {
        this.modifiedDate = modifiedDate;
    }

    public ProcessDTO getFirstReviewProcess() {
        return firstReviewProcess;
    }

    public void setFirstReviewProcess(ProcessDTO firstReviewProcess) {
        this.firstReviewProcess = firstReviewProcess;
    }

    public Boolean getMultiYear() {
        return isMultiYear;
    }

    public void setMultiYear(Boolean multiYear) {
        isMultiYear = multiYear;
    }

    public TaskDTO getNextTask() {
        return nextTask;
    }

    public void setNextTask(TaskDTO nextTask) {
        this.nextTask = nextTask;
    }

    public Boolean getApprovable() {
        return approvable;
    }

    public void setApprovable(Boolean approvable) {
        this.approvable = approvable;
    }

    public Boolean getRejectable() {
        return rejectable;
    }

    public void setRejectable(Boolean rejectable) {
        this.rejectable = rejectable;
    }

    @Override
    public String toString() {
        return "Contract{" +
            "id=" + id +
            ", name='" + name + "'" +
            ", review_identifier='" + reviewIdentifier + "'" +
            ", contract_identifier='" + contractIdentifier + "'" +
            ", contracting_method='" + contractingMethod + "'" +
            ", amount='" + amount + "'" +
            ", amount_written='" + amountWritten + "'" +
            ", currency='" + currency + "'" +
            ", amount_current_year='" + amountCurrentYear + "'" +
            ", submit_date='" + submitDate + "'" +
            ", start_date='" + startDate + "'" +
            ", end_date='" + endDate + "'" +
            ", expire_date='" + expireDate + "'" +
            ", is_multi_year='" + isMultiYear + "'" +
            ", status='" + status + "'" +
            ", approve_date='" + approveDate + "'" +
            ", sign_date='" + signDate + "'" +
            ", archive_date='" + archiveDate + "'" +
            '}';
    }
}
