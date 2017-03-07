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
 * QMcContractSample is a Querydsl query type for QMcContractSample
 */
@Generated("com.mysema.query.sql.codegen.MetaDataSerializer")
public class QMcContractSample extends com.mysema.query.sql.RelationalPathBase<QMcContractSample> {

    private static final long serialVersionUID = -1974746615;

    public static final QMcContractSample mcContractSample = new QMcContractSample("mc_contract_sample");

    public final NumberPath<Long> accountId = createNumber("accountId", Long.class);

    public final StringPath description = createString("description");

    public final StringPath fileName = createString("fileName");

    public final NumberPath<Long> id = createNumber("id", Long.class);

    public final DateTimePath<java.sql.Timestamp> modifiedDateTime = createDateTime("modifiedDateTime", java.sql.Timestamp.class);

    public final StringPath name = createString("name");

    public final StringPath path = createString("path");

    public final NumberPath<Long> revision = createNumber("revision", Long.class);

    public final StringPath uploadedBy = createString("uploadedBy");

    public final DateTimePath<java.sql.Timestamp> uploadedDateTime = createDateTime("uploadedDateTime", java.sql.Timestamp.class);

    public final com.mysema.query.sql.PrimaryKey<QMcContractSample> mcContractSamplePk = createPrimaryKey(id);

    public final com.mysema.query.sql.ForeignKey<QMcAccount> contractSampleAccountIdFk = createForeignKey(accountId, "id");

    public final com.mysema.query.sql.ForeignKey<QMcContract> _contractContractSampleIdFk = createInvForeignKey(id, "contract_sample_id");

    public QMcContractSample(String variable) {
        super(QMcContractSample.class, forVariable(variable), "public", "mc_contract_sample");
        addMetadata();
    }

    public QMcContractSample(String variable, String schema, String table) {
        super(QMcContractSample.class, forVariable(variable), schema, table);
        addMetadata();
    }

    public QMcContractSample(Path<? extends QMcContractSample> path) {
        super(path.getType(), path.getMetadata(), "public", "mc_contract_sample");
        addMetadata();
    }

    public QMcContractSample(PathMetadata<?> metadata) {
        super(QMcContractSample.class, metadata, "public", "mc_contract_sample");
        addMetadata();
    }

    public void addMetadata() {
        addMetadata(accountId, ColumnMetadata.named("account_id").withIndex(6).ofType(Types.BIGINT).withSize(19));
        addMetadata(description, ColumnMetadata.named("description").withIndex(3).ofType(Types.VARCHAR).withSize(255));
        addMetadata(fileName, ColumnMetadata.named("file_name").withIndex(5).ofType(Types.VARCHAR).withSize(255));
        addMetadata(id, ColumnMetadata.named("id").withIndex(1).ofType(Types.BIGINT).withSize(19).notNull());
        addMetadata(modifiedDateTime, ColumnMetadata.named("modified_date_time").withIndex(9).ofType(Types.TIMESTAMP).withSize(29).withDigits(6));
        addMetadata(name, ColumnMetadata.named("name").withIndex(2).ofType(Types.VARCHAR).withSize(255));
        addMetadata(path, ColumnMetadata.named("path").withIndex(4).ofType(Types.VARCHAR).withSize(255));
        addMetadata(revision, ColumnMetadata.named("revision").withIndex(10).ofType(Types.BIGINT).withSize(19));
        addMetadata(uploadedBy, ColumnMetadata.named("uploaded_by").withIndex(7).ofType(Types.VARCHAR).withSize(50));
        addMetadata(uploadedDateTime, ColumnMetadata.named("uploaded_date_time").withIndex(8).ofType(Types.TIMESTAMP).withSize(29).withDigits(6));
    }

}

