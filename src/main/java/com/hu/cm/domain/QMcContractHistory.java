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
 * QMcContractHistory is a Querydsl query type for QMcContractHistory
 */
@Generated("com.mysema.query.sql.codegen.MetaDataSerializer")
public class QMcContractHistory extends com.mysema.query.sql.RelationalPathBase<QMcContractHistory> {

    private static final long serialVersionUID = -2025511915;

    public static final QMcContractHistory mcContractHistory = new QMcContractHistory("mc_contract_history");

    public final StringPath action = createString("action");

    public final DateTimePath<java.sql.Timestamp> actionDatetime = createDateTime("actionDatetime", java.sql.Timestamp.class);

    public final NumberPath<Long> contractId = createNumber("contractId", Long.class);

    public final NumberPath<Long> id = createNumber("id", Long.class);

    public final StringPath note = createString("note");

    public final NumberPath<Long> taskId = createNumber("taskId", Long.class);

    public final NumberPath<Long> userId = createNumber("userId", Long.class);

    public final com.mysema.query.sql.PrimaryKey<QMcContractHistory> mcContractHistoryPk = createPrimaryKey(id);

    public final com.mysema.query.sql.ForeignKey<QMcContract> contractHistoryContractIdFk = createForeignKey(contractId, "id");

    public final com.mysema.query.sql.ForeignKey<QMcTask> contractHistoryTaskIdFk = createForeignKey(taskId, "id");

    public final com.mysema.query.sql.ForeignKey<QMcUser> contractHistoryUserIdFk = createForeignKey(userId, "id");

    public QMcContractHistory(String variable) {
        super(QMcContractHistory.class, forVariable(variable), "public", "mc_contract_history");
        addMetadata();
    }

    public QMcContractHistory(String variable, String schema, String table) {
        super(QMcContractHistory.class, forVariable(variable), schema, table);
        addMetadata();
    }

    public QMcContractHistory(Path<? extends QMcContractHistory> path) {
        super(path.getType(), path.getMetadata(), "public", "mc_contract_history");
        addMetadata();
    }

    public QMcContractHistory(PathMetadata<?> metadata) {
        super(QMcContractHistory.class, metadata, "public", "mc_contract_history");
        addMetadata();
    }

    public void addMetadata() {
        addMetadata(action, ColumnMetadata.named("action").withIndex(3).ofType(Types.VARCHAR).withSize(255));
        addMetadata(actionDatetime, ColumnMetadata.named("action_datetime").withIndex(4).ofType(Types.TIMESTAMP).withSize(29).withDigits(6));
        addMetadata(contractId, ColumnMetadata.named("contract_id").withIndex(5).ofType(Types.BIGINT).withSize(19));
        addMetadata(id, ColumnMetadata.named("id").withIndex(1).ofType(Types.BIGINT).withSize(19).notNull());
        addMetadata(note, ColumnMetadata.named("note").withIndex(2).ofType(Types.VARCHAR).withSize(255));
        addMetadata(taskId, ColumnMetadata.named("task_id").withIndex(7).ofType(Types.BIGINT).withSize(19));
        addMetadata(userId, ColumnMetadata.named("user_id").withIndex(6).ofType(Types.BIGINT).withSize(19));
    }

}

