package com.hu.cm.domain;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import com.hu.cm.domain.admin.Account;
import com.hu.cm.domain.admin.Department;
import com.hu.cm.domain.admin.User;
import com.hu.cm.domain.configuration.Process;
import com.hu.cm.domain.configuration.ContractSample;
import com.hu.cm.domain.configuration.FundSource;
import com.hu.cm.domain.enumeration.ContractStatus;
import com.hu.cm.domain.util.CustomDateTimeDeserializer;
import com.hu.cm.domain.util.CustomDateTimeSerializer;
import org.hibernate.annotations.*;
import org.hibernate.annotations.Cache;
import org.joda.time.DateTime;

import javax.persistence.*;
import javax.persistence.CascadeType;
import javax.persistence.Entity;
import javax.persistence.Table;
import java.io.Serializable;
import java.math.BigDecimal;
import java.util.HashSet;
import java.util.Set;
import java.util.Objects;

import com.hu.cm.domain.enumeration.ContractingMethod;
import com.hu.cm.domain.enumeration.Currency;


/**
 * A Contract.
 */
@Entity
@Table(name = "MC_CONTRACT")
@Cache(usage = CacheConcurrencyStrategy.NONSTRICT_READ_WRITE)
public class Contract implements Serializable {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long id;

    @Column(name = "name")
    private String name;

    @Column(name = "review_identifier")
    private String reviewIdentifier;

    @Column(name = "contract_identifier")
    private String contractIdentifier;

    @Enumerated(EnumType.STRING)
    @Column(name = "contracting_method")
    private ContractingMethod contractingMethod;

    @Column(name = "amount", precision=10, scale=2)
    private BigDecimal amount;

    @Column(name = "amount_written")
    private String amountWritten;

    @Column(name = "description")
    private String description;

    @Column(name = "content")
    private String content;

    @Column(name = "contract_file_path")
    private String contractFilePath;

    @Enumerated(EnumType.STRING)
    @Column(name = "currency")
    private Currency currency;

    @Column(name = "amount_current_year", precision=10, scale=2)
    private BigDecimal amountCurrentYear;

    @Type(type = "org.jadira.usertype.dateandtime.joda.PersistentDateTime")
    @JsonSerialize(using = CustomDateTimeSerializer.class)
    @JsonDeserialize(using = CustomDateTimeDeserializer.class)
    @Column(name = "submit_date")
    private DateTime submitDate;

    @Type(type = "org.jadira.usertype.dateandtime.joda.PersistentDateTime")
    @JsonSerialize(using = CustomDateTimeSerializer.class)
    @JsonDeserialize(using = CustomDateTimeDeserializer.class)
    @Column(name = "start_date")
    private DateTime startDate;

    @Type(type = "org.jadira.usertype.dateandtime.joda.PersistentDateTime")
    @JsonSerialize(using = CustomDateTimeSerializer.class)
    @JsonDeserialize(using = CustomDateTimeDeserializer.class)
    @Column(name = "end_date")
    private DateTime endDate;

    @Type(type = "org.jadira.usertype.dateandtime.joda.PersistentDateTime")
    @JsonSerialize(using = CustomDateTimeSerializer.class)
    @JsonDeserialize(using = CustomDateTimeDeserializer.class)
    @Column(name = "expire_date")
    private DateTime expireDate;

    @Type(type = "org.jadira.usertype.dateandtime.joda.PersistentDateTime")
    @JsonSerialize(using = CustomDateTimeSerializer.class)
    @JsonDeserialize(using = CustomDateTimeDeserializer.class)
    @Column(name = "modified_date")
    private DateTime modifiedDate;

    @Column(name = "is_multi_year")
    private Boolean isMultiYear;

    @Enumerated(EnumType.STRING)
    @JoinColumn(name = "status")
    private ContractStatus status;

    @ManyToOne
    @JoinColumn(name = "first_review_process")
    private Process firstReviewProcess;

    @ManyToOne
    @JoinColumn(name = "current_task_id")
    private Task currentTask;

    @Type(type = "org.jadira.usertype.dateandtime.joda.PersistentDateTime")
    @JsonSerialize(using = CustomDateTimeSerializer.class)
    @JsonDeserialize(using = CustomDateTimeDeserializer.class)
    @Column(name = "approve_date")
    private DateTime approveDate;

    @Type(type = "org.jadira.usertype.dateandtime.joda.PersistentDateTime")
    @JsonSerialize(using = CustomDateTimeSerializer.class)
    @JsonDeserialize(using = CustomDateTimeDeserializer.class)
    @Column(name = "sign_date")
    private DateTime signDate;

    @Type(type = "org.jadira.usertype.dateandtime.joda.PersistentDateTime")
    @JsonSerialize(using = CustomDateTimeSerializer.class)
    @JsonDeserialize(using = CustomDateTimeDeserializer.class)
    @Column(name = "archive_date")
    private DateTime archiveDate;

    @Type(type = "org.jadira.usertype.dateandtime.joda.PersistentDateTime")
    @JsonSerialize(using = CustomDateTimeSerializer.class)
    @JsonDeserialize(using = CustomDateTimeDeserializer.class)
    @Column(name = "created_date")
    private DateTime createdDate;

    @ManyToOne
    @JoinColumn(name = "contract_party_id")
    private ContractParty contractParty;

    @ManyToOne
    @JoinColumn(name="account_id")
    private Account account;

    @ManyToOne
    @JoinColumn(name = "administrative_department_id")
    private Department administrativeDepartment;

    @ManyToOne
    @JoinColumn(name = "administrator_id")
    private User administrator;

    @ManyToOne
    @JoinColumn(name = "author_id")
    private User author;

    @ManyToOne
    @JoinColumn(name = "modified_by")
    private User modifiedBy;

    @ManyToOne
    @JoinColumn(name = "assignee_id")
    private User assignee;

    @ManyToOne
    private Category category;

    @ManyToOne
    @JoinColumn(name = "fund_source_id")
    private FundSource fundSource;

    @ManyToOne
    @JoinColumn(name = "contract_sample_id")
    private ContractSample contractSample;

    @ManyToMany
    @JoinTable(name = "MC_CONTRACT_DEPARTMENT",
        joinColumns = { @JoinColumn(name = "CONTRACT_ID") }, inverseJoinColumns = { @JoinColumn(name = "DEPARTMENT_ID") })
    @JsonIgnore
    @Cache(usage = CacheConcurrencyStrategy.NONSTRICT_READ_WRITE)
    private Set<Department> relatedDepartments = new HashSet<>();

    @ManyToMany
    @JoinTable(name = "MC_CONTRACT_PROJECT",
        joinColumns = { @JoinColumn(name = "CONTRACT_ID") }, inverseJoinColumns = { @JoinColumn(name = "PROJECT_ID") })
    @JsonIgnore
    @Cache(usage = CacheConcurrencyStrategy.NONSTRICT_READ_WRITE)
    private Set<Project> projects = new HashSet<>();


    @OneToMany(cascade = CascadeType.ALL, mappedBy = "contract", orphanRemoval = true)
    @JsonIgnore
    @Cache(usage = CacheConcurrencyStrategy.NONSTRICT_READ_WRITE)
    private Set<Task> tasks = new HashSet<>();

    @OneToMany(cascade = CascadeType.ALL, mappedBy = "contract", orphanRemoval = true)
    @JsonIgnore
    @Cache(usage = CacheConcurrencyStrategy.NONSTRICT_READ_WRITE)
    private Set<Attachment> attachments = new HashSet<>();

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

    public DateTime getSubmitDate() {
        return submitDate;
    }

    public void setSubmitDate(DateTime submitDate) {
        this.submitDate = submitDate;
    }

    public DateTime getStartDate() {
        return startDate;
    }

    public void setStartDate(DateTime startDate) {
        this.startDate = startDate;
    }

    public DateTime getEndDate() {
        return endDate;
    }

    public void setEndDate(DateTime endDate) {
        this.endDate = endDate;
    }

    public DateTime getExpireDate() {
        return expireDate;
    }

    public void setExpireDate(DateTime expireDate) {
        this.expireDate = expireDate;
    }

    public Boolean getIsMultiYear() {
        return isMultiYear;
    }

    public void setIsMultiYear(Boolean isMultiYear) {
        this.isMultiYear = isMultiYear;
    }

    public ContractStatus getStatus() {
        return status;
    }

    public void setStatus(ContractStatus status) {
        this.status = status;
    }

    public Task getCurrentTask() {
        return currentTask;
    }

    public void setCurrentTask(Task currentTask) {
        this.currentTask = currentTask;
    }

    public DateTime getApproveDate() {
        return approveDate;
    }

    public void setApproveDate(DateTime approveDate) {
        this.approveDate = approveDate;
    }

    public DateTime getSignDate() {
        return signDate;
    }

    public void setSignDate(DateTime signDate) {
        this.signDate = signDate;
    }

    public DateTime getArchiveDate() {
        return archiveDate;
    }

    public void setArchiveDate(DateTime archiveDate) {
        this.archiveDate = archiveDate;
    }

    public ContractParty getContractParty() {
        return contractParty;
    }

    public void setContractParty(ContractParty contractParty) {
        this.contractParty = contractParty;
    }

    public Category getCategory() {
        return category;
    }

    public void setCategory(Category category) {
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

    public Set<Department> getRelatedDepartments() {
        return relatedDepartments;
    }

    public void setRelatedDepartments(Set<Department> departments) {
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

    public Department getAdministrativeDepartment() {
        return administrativeDepartment;
    }

    public void setAdministrativeDepartment(Department administrativeDepartment) {
        this.administrativeDepartment = administrativeDepartment;
    }

    public Set<Project> getProjects() {
        return projects;
    }

    public void setProjects(Set<Project> projects) {
        this.projects = projects;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public DateTime getModifiedDate() {
        return modifiedDate;
    }

    public void setModifiedDate(DateTime modifiedDate) {
        this.modifiedDate = modifiedDate;
    }

    public User getAssignee() {
        return assignee;
    }

    public void setAssignee(User assignee) {
        this.assignee = assignee;
    }

    public User getModifiedBy() {
        return modifiedBy;
    }

    public void setModifiedBy(User modifiedBy) {
        this.modifiedBy = modifiedBy;
    }

    public DateTime getCreatedDate() {
        return createdDate;
    }

    public void setCreatedDate(DateTime createdDate) {
        this.createdDate = createdDate;
    }

    public Process getFirstReviewProcess() {
        return firstReviewProcess;
    }

    public void setFirstReviewProcess(Process firstReviewProcess) {
        this.firstReviewProcess = firstReviewProcess;
    }

    public Set<Task> getTasks() {
        return tasks;
    }

    public void setTasks(Set<Task> tasks) {
        this.tasks = tasks;
    }

    public Account getAccount() {
        return account;
    }

    public void setAccount(Account account) {
        this.account = account;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public String getContractFilePath() {
        return contractFilePath;
    }

    public void setContractFilePath(String contractFilePath) {
        this.contractFilePath = contractFilePath;
    }

    public Set<Attachment> getAttachments() {
        return attachments;
    }

    public void setAttachments(Set<Attachment> attachments) {
        this.attachments = attachments;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (o == null || getClass() != o.getClass()) {
            return false;
        }

        Contract contract = (Contract) o;

        if ( ! Objects.equals(id, contract.id)) return false;

        return true;
    }

    @Override
    public int hashCode() {
        return Objects.hashCode(id);
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
