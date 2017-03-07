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
 * QMcAccount is a Querydsl query type for QMcAccount
 */
@Generated("com.mysema.query.sql.codegen.MetaDataSerializer")
public class QMcAccount extends com.mysema.query.sql.RelationalPathBase<QMcAccount> {

    private static final long serialVersionUID = 447929888;

    public static final QMcAccount mcAccount = new QMcAccount("mc_account");

    public final BooleanPath active = createBoolean("active");

    public final StringPath createdBy = createString("createdBy");

    public final DateTimePath<java.sql.Timestamp> createdDate = createDateTime("createdDate", java.sql.Timestamp.class);

    public final BooleanPath deleted = createBoolean("deleted");

    public final StringPath description = createString("description");

    public final NumberPath<Long> id = createNumber("id", Long.class);

    public final StringPath lastModifiedBy = createString("lastModifiedBy");

    public final DateTimePath<java.sql.Timestamp> lastModifiedDate = createDateTime("lastModifiedDate", java.sql.Timestamp.class);

    public final StringPath name = createString("name");

    public final StringPath processConfiguration = createString("processConfiguration");

    public final com.mysema.query.sql.PrimaryKey<QMcAccount> mcAccountPk = createPrimaryKey(id);

    public final com.mysema.query.sql.ForeignKey<QMcProject> _projectAccountIdFk = createInvForeignKey(id, "account_id");

    public final com.mysema.query.sql.ForeignKey<QMcContract> _contractAccountIdFk = createInvForeignKey(id, "account_id");

    public final com.mysema.query.sql.ForeignKey<QMcContractSample> _contractSampleAccountIdFk = createInvForeignKey(id, "account_id");

    public final com.mysema.query.sql.ForeignKey<QMcRole> _roleAccountIdFk = createInvForeignKey(id, "account_id");

    public final com.mysema.query.sql.ForeignKey<QMcUserAccount> _useraccountAccountIdFk = createInvForeignKey(id, "account_id");

    public final com.mysema.query.sql.ForeignKey<QMcWorkflow> _workflowAccountIdFk = createInvForeignKey(id, "account_id");

    public final com.mysema.query.sql.ForeignKey<QMcDepartment> _deptAccountIdFk = createInvForeignKey(id, "account_id");

    public final com.mysema.query.sql.ForeignKey<QMcFundSource> _funcsourceAccountIdFk = createInvForeignKey(id, "account_id");

    public final com.mysema.query.sql.ForeignKey<QMcContractParty> _contractPartyAccountIdFk = createInvForeignKey(id, "account_id");

    public QMcAccount(String variable) {
        super(QMcAccount.class, forVariable(variable), "public", "mc_account");
        addMetadata();
    }

    public QMcAccount(String variable, String schema, String table) {
        super(QMcAccount.class, forVariable(variable), schema, table);
        addMetadata();
    }

    public QMcAccount(Path<? extends QMcAccount> path) {
        super(path.getType(), path.getMetadata(), "public", "mc_account");
        addMetadata();
    }

    public QMcAccount(PathMetadata<?> metadata) {
        super(QMcAccount.class, metadata, "public", "mc_account");
        addMetadata();
    }

    public void addMetadata() {
        addMetadata(active, ColumnMetadata.named("active").withIndex(4).ofType(Types.BIT).withSize(1));
        addMetadata(createdBy, ColumnMetadata.named("created_by").withIndex(7).ofType(Types.VARCHAR).withSize(50));
        addMetadata(createdDate, ColumnMetadata.named("created_date").withIndex(8).ofType(Types.TIMESTAMP).withSize(29).withDigits(6));
        addMetadata(deleted, ColumnMetadata.named("deleted").withIndex(5).ofType(Types.BIT).withSize(1));
        addMetadata(description, ColumnMetadata.named("description").withIndex(3).ofType(Types.VARCHAR).withSize(255));
        addMetadata(id, ColumnMetadata.named("id").withIndex(1).ofType(Types.BIGINT).withSize(19).notNull());
        addMetadata(lastModifiedBy, ColumnMetadata.named("last_modified_by").withIndex(9).ofType(Types.VARCHAR).withSize(50));
        addMetadata(lastModifiedDate, ColumnMetadata.named("last_modified_date").withIndex(10).ofType(Types.TIMESTAMP).withSize(29).withDigits(6));
        addMetadata(name, ColumnMetadata.named("name").withIndex(2).ofType(Types.VARCHAR).withSize(50).notNull());
        addMetadata(processConfiguration, ColumnMetadata.named("process_configuration").withIndex(6).ofType(Types.VARCHAR).withSize(50));
    }

}

