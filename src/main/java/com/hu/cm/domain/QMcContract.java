package com.hu.cm.domain;

import com.mysema.query.sql.ColumnMetadata;
import com.mysema.query.types.Path;
import com.mysema.query.types.PathMetadata;
import com.mysema.query.types.path.BooleanPath;
import com.mysema.query.types.path.DateTimePath;
import com.mysema.query.types.path.NumberPath;
import com.mysema.query.types.path.StringPath;

import javax.annotation.Generated;
import java.sql.Types;

import static com.mysema.query.types.PathMetadataFactory.forVariable;


/**
 * QMcContract is a Querydsl query type for QMcContract
 */
@Generated("com.mysema.query.sql.codegen.MetaDataSerializer")
public class QMcContract extends com.mysema.query.sql.RelationalPathBase<QMcContract> {

    private static final long serialVersionUID = -1723843713;

    public static final QMcContract mcContract = new QMcContract("mc_contract");

    public final NumberPath<Long> accountId = createNumber("accountId", Long.class);

    public final NumberPath<Long> administrativeDepartmentId = createNumber("administrativeDepartmentId", Long.class);

    public final NumberPath<Long> administratorId = createNumber("administratorId", Long.class);

    public final NumberPath<Double> amount = createNumber("amount", Double.class);

    public final NumberPath<Double> amountCurrentYear = createNumber("amountCurrentYear", Double.class);

    public final StringPath amountWritten = createString("amountWritten");

    public final DateTimePath<java.sql.Timestamp> approveDate = createDateTime("approveDate", java.sql.Timestamp.class);

    public final DateTimePath<java.sql.Timestamp> archiveDate = createDateTime("archiveDate", java.sql.Timestamp.class);

    public final NumberPath<Long> assigneeId = createNumber("assigneeId", Long.class);

    public final NumberPath<Long> authorId = createNumber("authorId", Long.class);

    public final NumberPath<Long> categoryId = createNumber("categoryId", Long.class);

    public final StringPath contractIdentifier = createString("contractIdentifier");

    public final StringPath contractingMethod = createString("contractingMethod");

    public final NumberPath<Long> contractPartyId = createNumber("contractPartyId", Long.class);

    public final NumberPath<Long> contractSampleId = createNumber("contractSampleId", Long.class);

    public final DateTimePath<java.sql.Timestamp> createdDate = createDateTime("createdDate", java.sql.Timestamp.class);

    public final StringPath currency = createString("currency");

    public final NumberPath<Long> currentTaskId = createNumber("currentTaskId", Long.class);

    public final StringPath description = createString("description");

    public final DateTimePath<java.sql.Timestamp> endDate = createDateTime("endDate", java.sql.Timestamp.class);

    public final DateTimePath<java.sql.Timestamp> expireDate = createDateTime("expireDate", java.sql.Timestamp.class);

    public final NumberPath<Long> firstReviewProcess = createNumber("firstReviewProcess", Long.class);

    public final NumberPath<Long> fundSourceId = createNumber("fundSourceId", Long.class);

    public final NumberPath<Long> id = createNumber("id", Long.class);

    public final BooleanPath isMultiYear = createBoolean("isMultiYear");

    public final NumberPath<Long> modifiedBy = createNumber("modifiedBy", Long.class);

    public final DateTimePath<java.sql.Timestamp> modifiedDate = createDateTime("modifiedDate", java.sql.Timestamp.class);

    public final StringPath name = createString("name");

    public final StringPath reviewIdentifier = createString("reviewIdentifier");

    public final DateTimePath<java.sql.Timestamp> signDate = createDateTime("signDate", java.sql.Timestamp.class);

    public final DateTimePath<java.sql.Timestamp> startDate = createDateTime("startDate", java.sql.Timestamp.class);

    public final StringPath status = createString("status");

    public final DateTimePath<java.sql.Timestamp> submitDate = createDateTime("submitDate", java.sql.Timestamp.class);

    public final com.mysema.query.sql.PrimaryKey<QMcContract> mcContractPk = createPrimaryKey(id);

    public final com.mysema.query.sql.ForeignKey<QMcProcess> firstReviewProcessIdFk = createForeignKey(firstReviewProcess, "id");

    public final com.mysema.query.sql.ForeignKey<QMcContractParty> contractPartyIdFk = createForeignKey(contractPartyId, "id");

    public final com.mysema.query.sql.ForeignKey<QMcTask> currentTaskIdFk = createForeignKey(currentTaskId, "id");

    public final com.mysema.query.sql.ForeignKey<QMcCategory> contractCategoryIdFk = createForeignKey(categoryId, "id");

    public final com.mysema.query.sql.ForeignKey<QMcContractSample> contractContractSampleIdFk = createForeignKey(contractSampleId, "id");

    public final com.mysema.query.sql.ForeignKey<QMcUser> assigneeIdFk = createForeignKey(assigneeId, "id");

    public final com.mysema.query.sql.ForeignKey<QMcAccount> contractAccountIdFk = createForeignKey(accountId, "id");

    public final com.mysema.query.sql.ForeignKey<QMcFundSource> contractFundSourceIdFk = createForeignKey(fundSourceId, "id");

    public final com.mysema.query.sql.ForeignKey<QMcDepartment> contractAdministrativeDepartmentIdFk = createForeignKey(administrativeDepartmentId, "id");

    public final com.mysema.query.sql.ForeignKey<QMcUser> contractAdministratorIdFk = createForeignKey(administratorId, "id");

    public final com.mysema.query.sql.ForeignKey<QMcUser> modifiedByUserIdFk = createForeignKey(modifiedBy, "id");

    public final com.mysema.query.sql.ForeignKey<QMcUser> contractAuthorIdIdFk = createForeignKey(authorId, "id");

    public final com.mysema.query.sql.ForeignKey<QMcContractDepartment> _contractDepartmentContractIdFk = createInvForeignKey(id, "contract_id");

    public final com.mysema.query.sql.ForeignKey<QMcContractHistory> _contractHistoryContractIdFk = createInvForeignKey(id, "contract_id");

    public final com.mysema.query.sql.ForeignKey<QMcContractpartyContract> _contractpartycontractContractIdFk = createInvForeignKey(id, "contract_id");

    public final com.mysema.query.sql.ForeignKey<QMcTask> _taskContractIdFk = createInvForeignKey(id, "contract_id");

    public final com.mysema.query.sql.ForeignKey<QMcContractProject> _contractprojectContractIdFk = createInvForeignKey(id, "contract_id");

    public QMcContract(String variable) {
        super(QMcContract.class, forVariable(variable), "public", "mc_contract");
        addMetadata();
    }

    public QMcContract(String variable, String schema, String table) {
        super(QMcContract.class, forVariable(variable), schema, table);
        addMetadata();
    }

    public QMcContract(Path<? extends QMcContract> path) {
        super(path.getType(), path.getMetadata(), "public", "mc_contract");
        addMetadata();
    }

    public QMcContract(PathMetadata<?> metadata) {
        super(QMcContract.class, metadata, "public", "mc_contract");
        addMetadata();
    }

    public void addMetadata() {
        addMetadata(accountId, ColumnMetadata.named("account_id").withIndex(30).ofType(Types.BIGINT).withSize(19));
        addMetadata(administrativeDepartmentId, ColumnMetadata.named("administrative_department_id").withIndex(23).ofType(Types.BIGINT).withSize(19));
        addMetadata(administratorId, ColumnMetadata.named("administrator_id").withIndex(24).ofType(Types.BIGINT).withSize(19));
        addMetadata(amount, ColumnMetadata.named("amount").withIndex(7).ofType(Types.NUMERIC).withSize(10).withDigits(2));
        addMetadata(amountCurrentYear, ColumnMetadata.named("amount_current_year").withIndex(10).ofType(Types.NUMERIC).withSize(10).withDigits(2));
        addMetadata(amountWritten, ColumnMetadata.named("amount_written").withIndex(8).ofType(Types.VARCHAR).withSize(255));
        addMetadata(approveDate, ColumnMetadata.named("approve_date").withIndex(20).ofType(Types.TIMESTAMP).withSize(29).withDigits(6));
        addMetadata(archiveDate, ColumnMetadata.named("archive_date").withIndex(22).ofType(Types.TIMESTAMP).withSize(29).withDigits(6));
        addMetadata(assigneeId, ColumnMetadata.named("assignee_id").withIndex(33).ofType(Types.BIGINT).withSize(19));
        addMetadata(authorId, ColumnMetadata.named("author_id").withIndex(25).ofType(Types.BIGINT).withSize(19));
        addMetadata(categoryId, ColumnMetadata.named("category_id").withIndex(26).ofType(Types.BIGINT).withSize(19));
        addMetadata(contractIdentifier, ColumnMetadata.named("contract_identifier").withIndex(5).ofType(Types.VARCHAR).withSize(255));
        addMetadata(contractingMethod, ColumnMetadata.named("contracting_method").withIndex(6).ofType(Types.VARCHAR).withSize(255));
        addMetadata(contractPartyId, ColumnMetadata.named("contract_party_id").withIndex(29).ofType(Types.BIGINT).withSize(19));
        addMetadata(contractSampleId, ColumnMetadata.named("contract_sample_id").withIndex(28).ofType(Types.BIGINT).withSize(19));
        addMetadata(createdDate, ColumnMetadata.named("created_date").withIndex(11).ofType(Types.TIMESTAMP).withSize(29).withDigits(6));
        addMetadata(currency, ColumnMetadata.named("currency").withIndex(9).ofType(Types.VARCHAR).withSize(255));
        addMetadata(currentTaskId, ColumnMetadata.named("current_task_id").withIndex(19).ofType(Types.BIGINT).withSize(19));
        addMetadata(description, ColumnMetadata.named("description").withIndex(3).ofType(Types.VARCHAR).withSize(255));
        addMetadata(endDate, ColumnMetadata.named("end_date").withIndex(14).ofType(Types.TIMESTAMP).withSize(29).withDigits(6));
        addMetadata(expireDate, ColumnMetadata.named("expire_date").withIndex(15).ofType(Types.TIMESTAMP).withSize(29).withDigits(6));
        addMetadata(firstReviewProcess, ColumnMetadata.named("first_review_process").withIndex(18).ofType(Types.BIGINT).withSize(19));
        addMetadata(fundSourceId, ColumnMetadata.named("fund_source_id").withIndex(27).ofType(Types.BIGINT).withSize(19));
        addMetadata(id, ColumnMetadata.named("id").withIndex(1).ofType(Types.BIGINT).withSize(19).notNull());
        addMetadata(isMultiYear, ColumnMetadata.named("is_multi_year").withIndex(16).ofType(Types.BIT).withSize(1));
        addMetadata(modifiedBy, ColumnMetadata.named("modified_by").withIndex(32).ofType(Types.BIGINT).withSize(19));
        addMetadata(modifiedDate, ColumnMetadata.named("modified_date").withIndex(31).ofType(Types.TIMESTAMP).withSize(29).withDigits(6));
        addMetadata(name, ColumnMetadata.named("name").withIndex(2).ofType(Types.VARCHAR).withSize(255));
        addMetadata(reviewIdentifier, ColumnMetadata.named("review_identifier").withIndex(4).ofType(Types.VARCHAR).withSize(255));
        addMetadata(signDate, ColumnMetadata.named("sign_date").withIndex(21).ofType(Types.TIMESTAMP).withSize(29).withDigits(6));
        addMetadata(startDate, ColumnMetadata.named("start_date").withIndex(13).ofType(Types.TIMESTAMP).withSize(29).withDigits(6));
        addMetadata(status, ColumnMetadata.named("status").withIndex(17).ofType(Types.VARCHAR).withSize(255));
        addMetadata(submitDate, ColumnMetadata.named("submit_date").withIndex(12).ofType(Types.TIMESTAMP).withSize(29).withDigits(6));
    }

}

