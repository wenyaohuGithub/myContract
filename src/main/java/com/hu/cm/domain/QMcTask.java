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
 * QMcTask is a Querydsl query type for QMcTask
 */
@Generated("com.mysema.query.sql.codegen.MetaDataSerializer")
public class QMcTask extends com.mysema.query.sql.RelationalPathBase<QMcTask> {

    private static final long serialVersionUID = 640261746;

    public static final QMcTask mcTask = new QMcTask("mc_task");

    public final NumberPath<Long> assignedTo = createNumber("assignedTo", Long.class);

    public final NumberPath<Long> contractId = createNumber("contractId", Long.class);

    public final NumberPath<Long> departmentId = createNumber("departmentId", Long.class);

    public final NumberPath<Long> id = createNumber("id", Long.class);

    public final NumberPath<Long> performedBy = createNumber("performedBy", Long.class);

    public final DateTimePath<java.sql.Timestamp> performedDatetime = createDateTime("performedDatetime", java.sql.Timestamp.class);

    public final NumberPath<Long> processId = createNumber("processId", Long.class);

    public final StringPath result = createString("result");

    public final NumberPath<Integer> sequence = createNumber("sequence", Integer.class);

    public final com.mysema.query.sql.PrimaryKey<QMcTask> mcTaskPk = createPrimaryKey(id);

    public final com.mysema.query.sql.ForeignKey<QMcProcess> taskProcessIdFk = createForeignKey(processId, "id");

    public final com.mysema.query.sql.ForeignKey<QMcUser> taskPerformerIdFk = createForeignKey(performedBy, "id");

    public final com.mysema.query.sql.ForeignKey<QMcDepartment> taskDepartmentIdFk = createForeignKey(departmentId, "id");

    public final com.mysema.query.sql.ForeignKey<QMcContract> taskContractIdFk = createForeignKey(contractId, "id");

    public final com.mysema.query.sql.ForeignKey<QMcUser> taskAssigneeIdFk = createForeignKey(assignedTo, "id");

    public final com.mysema.query.sql.ForeignKey<QMcContract> _currentTaskIdFk = createInvForeignKey(id, "current_task_id");

    public final com.mysema.query.sql.ForeignKey<QMcContractHistory> _contractHistoryTaskIdFk = createInvForeignKey(id, "task_id");

    public final com.mysema.query.sql.ForeignKey<QMcMessage> _messageTaskIdFk = createInvForeignKey(id, "task_id");

    public QMcTask(String variable) {
        super(QMcTask.class, forVariable(variable), "public", "mc_task");
        addMetadata();
    }

    public QMcTask(String variable, String schema, String table) {
        super(QMcTask.class, forVariable(variable), schema, table);
        addMetadata();
    }

    public QMcTask(Path<? extends QMcTask> path) {
        super(path.getType(), path.getMetadata(), "public", "mc_task");
        addMetadata();
    }

    public QMcTask(PathMetadata<?> metadata) {
        super(QMcTask.class, metadata, "public", "mc_task");
        addMetadata();
    }

    public void addMetadata() {
        addMetadata(assignedTo, ColumnMetadata.named("assigned_to").withIndex(5).ofType(Types.BIGINT).withSize(19));
        addMetadata(contractId, ColumnMetadata.named("contract_id").withIndex(2).ofType(Types.BIGINT).withSize(19));
        addMetadata(departmentId, ColumnMetadata.named("department_id").withIndex(4).ofType(Types.BIGINT).withSize(19));
        addMetadata(id, ColumnMetadata.named("id").withIndex(1).ofType(Types.BIGINT).withSize(19).notNull());
        addMetadata(performedBy, ColumnMetadata.named("performed_by").withIndex(8).ofType(Types.BIGINT).withSize(19));
        addMetadata(performedDatetime, ColumnMetadata.named("performed_datetime").withIndex(9).ofType(Types.TIMESTAMP).withSize(29).withDigits(6));
        addMetadata(processId, ColumnMetadata.named("process_id").withIndex(3).ofType(Types.BIGINT).withSize(19));
        addMetadata(result, ColumnMetadata.named("result").withIndex(7).ofType(Types.VARCHAR).withSize(255));
        addMetadata(sequence, ColumnMetadata.named("sequence").withIndex(6).ofType(Types.INTEGER).withSize(10));
    }

}

