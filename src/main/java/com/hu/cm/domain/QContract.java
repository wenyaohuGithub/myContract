package com.hu.cm.domain;

import com.mysema.query.types.Path;
import com.mysema.query.types.PathMetadata;
import com.mysema.query.types.path.*;

import javax.annotation.Generated;

import static com.mysema.query.types.PathMetadataFactory.forVariable;


/**
 * QContract is a Querydsl query type for Contract
 */
@Generated("com.mysema.query.codegen.EntitySerializer")
public class QContract extends EntityPathBase<Contract> {

    private static final long serialVersionUID = 199053164L;

    private static final PathInits INITS = PathInits.DIRECT2;

    public static final QContract contract = new QContract("contract");

    public final com.hu.cm.domain.admin.QAccount account;

    public final com.hu.cm.domain.admin.QDepartment administrativeDepartment;

    public final com.hu.cm.domain.admin.QUser administrator;

    public final NumberPath<java.math.BigDecimal> amount = createNumber("amount", java.math.BigDecimal.class);

    public final NumberPath<java.math.BigDecimal> amountCurrentYear = createNumber("amountCurrentYear", java.math.BigDecimal.class);

    public final StringPath amountWritten = createString("amountWritten");

    public final DateTimePath<org.joda.time.DateTime> approveDate = createDateTime("approveDate", org.joda.time.DateTime.class);

    public final DateTimePath<org.joda.time.DateTime> archiveDate = createDateTime("archiveDate", org.joda.time.DateTime.class);

    public final com.hu.cm.domain.admin.QUser assignee;

    public final com.hu.cm.domain.admin.QUser author;

    public final QCategory category;

    public final StringPath contractIdentifier = createString("contractIdentifier");

    public final EnumPath<com.hu.cm.domain.enumeration.ContractingMethod> contractingMethod = createEnum("contractingMethod", com.hu.cm.domain.enumeration.ContractingMethod.class);

    public final QContractParty contractParty;

    public final com.hu.cm.domain.configuration.QContractSample contractSample;

    public final DateTimePath<org.joda.time.DateTime> createdDate = createDateTime("createdDate", org.joda.time.DateTime.class);

    public final EnumPath<com.hu.cm.domain.enumeration.Currency> currency = createEnum("currency", com.hu.cm.domain.enumeration.Currency.class);

    public final QTask currentTask;

    public final StringPath description = createString("description");

    public final DateTimePath<org.joda.time.DateTime> endDate = createDateTime("endDate", org.joda.time.DateTime.class);

    public final DateTimePath<org.joda.time.DateTime> expireDate = createDateTime("expireDate", org.joda.time.DateTime.class);

    public final com.hu.cm.domain.configuration.QProcess firstReviewProcess;

    public final com.hu.cm.domain.configuration.QFundSource fundSource;

    public final NumberPath<Long> id = createNumber("id", Long.class);

    public final BooleanPath isMultiYear = createBoolean("isMultiYear");

    public final com.hu.cm.domain.admin.QUser modifiedBy;

    public final DateTimePath<org.joda.time.DateTime> modifiedDate = createDateTime("modifiedDate", org.joda.time.DateTime.class);

    public final StringPath name = createString("name");

    public final SetPath<Project, QProject> projects = this.<Project, QProject>createSet("projects", Project.class, QProject.class, PathInits.DIRECT2);

    public final SetPath<com.hu.cm.domain.admin.Department, com.hu.cm.domain.admin.QDepartment> relatedDepartments = this.<com.hu.cm.domain.admin.Department, com.hu.cm.domain.admin.QDepartment>createSet("relatedDepartments", com.hu.cm.domain.admin.Department.class, com.hu.cm.domain.admin.QDepartment.class, PathInits.DIRECT2);

    public final StringPath reviewIdentifier = createString("reviewIdentifier");

    public final DateTimePath<org.joda.time.DateTime> signDate = createDateTime("signDate", org.joda.time.DateTime.class);

    public final DateTimePath<org.joda.time.DateTime> startDate = createDateTime("startDate", org.joda.time.DateTime.class);

    public final EnumPath<com.hu.cm.domain.enumeration.ContractStatus> status = createEnum("status", com.hu.cm.domain.enumeration.ContractStatus.class);

    public final DateTimePath<org.joda.time.DateTime> submitDate = createDateTime("submitDate", org.joda.time.DateTime.class);

    public final SetPath<Task, QTask> tasks = this.<Task, QTask>createSet("tasks", Task.class, QTask.class, PathInits.DIRECT2);

    public QContract(String variable) {
        this(Contract.class, forVariable(variable), INITS);
    }

    public QContract(Path<? extends Contract> path) {
        this(path.getType(), path.getMetadata(), path.getMetadata().isRoot() ? INITS : PathInits.DEFAULT);
    }

    public QContract(PathMetadata<?> metadata) {
        this(metadata, metadata.isRoot() ? INITS : PathInits.DEFAULT);
    }

    public QContract(PathMetadata<?> metadata, PathInits inits) {
        this(Contract.class, metadata, inits);
    }

    public QContract(Class<? extends Contract> type, PathMetadata<?> metadata, PathInits inits) {
        super(type, metadata, inits);
        this.account = inits.isInitialized("account") ? new com.hu.cm.domain.admin.QAccount(forProperty("account")) : null;
        this.administrativeDepartment = inits.isInitialized("administrativeDepartment") ? new com.hu.cm.domain.admin.QDepartment(forProperty("administrativeDepartment"), inits.get("administrativeDepartment")) : null;
        this.administrator = inits.isInitialized("administrator") ? new com.hu.cm.domain.admin.QUser(forProperty("administrator")) : null;
        this.assignee = inits.isInitialized("assignee") ? new com.hu.cm.domain.admin.QUser(forProperty("assignee")) : null;
        this.author = inits.isInitialized("author") ? new com.hu.cm.domain.admin.QUser(forProperty("author")) : null;
        this.category = inits.isInitialized("category") ? new QCategory(forProperty("category"), inits.get("category")) : null;
        this.contractParty = inits.isInitialized("contractParty") ? new QContractParty(forProperty("contractParty"), inits.get("contractParty")) : null;
        this.contractSample = inits.isInitialized("contractSample") ? new com.hu.cm.domain.configuration.QContractSample(forProperty("contractSample")) : null;
        this.currentTask = inits.isInitialized("currentTask") ? new QTask(forProperty("currentTask"), inits.get("currentTask")) : null;
        this.firstReviewProcess = inits.isInitialized("firstReviewProcess") ? new com.hu.cm.domain.configuration.QProcess(forProperty("firstReviewProcess")) : null;
        this.fundSource = inits.isInitialized("fundSource") ? new com.hu.cm.domain.configuration.QFundSource(forProperty("fundSource")) : null;
        this.modifiedBy = inits.isInitialized("modifiedBy") ? new com.hu.cm.domain.admin.QUser(forProperty("modifiedBy")) : null;
    }

}

