package com.hu.cm.domain;

import com.mysema.query.sql.ColumnMetadata;
import com.mysema.query.types.Path;
import com.mysema.query.types.PathMetadata;
import com.mysema.query.types.path.DateTimePath;
import com.mysema.query.types.path.NumberPath;
import com.mysema.query.types.path.StringPath;

import javax.annotation.Generated;
import java.sql.Types;

import static com.mysema.query.types.PathMetadataFactory.forVariable;


/**
 * QMcBankAccount is a Querydsl query type for QMcBankAccount
 */
@Generated("com.mysema.query.sql.codegen.MetaDataSerializer")
public class QMcBankAccount extends com.mysema.query.sql.RelationalPathBase<QMcBankAccount> {

    private static final long serialVersionUID = 1162871492;

    public static final QMcBankAccount mcBankAccount = new QMcBankAccount("mc_bank_account");

    public final StringPath accountName = createString("accountName");

    public final StringPath accountNumber = createString("accountNumber");

    public final StringPath bankName = createString("bankName");

    public final StringPath createdBy = createString("createdBy");

    public final DateTimePath<java.sql.Timestamp> createdDate = createDateTime("createdDate", java.sql.Timestamp.class);

    public final NumberPath<Long> id = createNumber("id", Long.class);

    public final StringPath lastModifiedBy = createString("lastModifiedBy");

    public final DateTimePath<java.sql.Timestamp> lastModifiedDate = createDateTime("lastModifiedDate", java.sql.Timestamp.class);

    public final NumberPath<Long> ownerId = createNumber("ownerId", Long.class);

    public final com.mysema.query.sql.PrimaryKey<QMcBankAccount> mcBankAccountPk = createPrimaryKey(id);

    public final com.mysema.query.sql.ForeignKey<QMcContractParty> ownerIdFk = createForeignKey(ownerId, "id");

    public QMcBankAccount(String variable) {
        super(QMcBankAccount.class, forVariable(variable), "public", "mc_bank_account");
        addMetadata();
    }

    public QMcBankAccount(String variable, String schema, String table) {
        super(QMcBankAccount.class, forVariable(variable), schema, table);
        addMetadata();
    }

    public QMcBankAccount(Path<? extends QMcBankAccount> path) {
        super(path.getType(), path.getMetadata(), "public", "mc_bank_account");
        addMetadata();
    }

    public QMcBankAccount(PathMetadata<?> metadata) {
        super(QMcBankAccount.class, metadata, "public", "mc_bank_account");
        addMetadata();
    }

    public void addMetadata() {
        addMetadata(accountName, ColumnMetadata.named("account_name").withIndex(3).ofType(Types.VARCHAR).withSize(255));
        addMetadata(accountNumber, ColumnMetadata.named("account_number").withIndex(4).ofType(Types.VARCHAR).withSize(255));
        addMetadata(bankName, ColumnMetadata.named("bank_name").withIndex(2).ofType(Types.VARCHAR).withSize(255));
        addMetadata(createdBy, ColumnMetadata.named("created_by").withIndex(6).ofType(Types.VARCHAR).withSize(50));
        addMetadata(createdDate, ColumnMetadata.named("created_date").withIndex(7).ofType(Types.TIMESTAMP).withSize(29).withDigits(6));
        addMetadata(id, ColumnMetadata.named("id").withIndex(1).ofType(Types.BIGINT).withSize(19).notNull());
        addMetadata(lastModifiedBy, ColumnMetadata.named("last_modified_by").withIndex(8).ofType(Types.VARCHAR).withSize(50));
        addMetadata(lastModifiedDate, ColumnMetadata.named("last_modified_date").withIndex(9).ofType(Types.TIMESTAMP).withSize(29).withDigits(6));
        addMetadata(ownerId, ColumnMetadata.named("owner_id").withIndex(5).ofType(Types.BIGINT).withSize(19));
    }

}

