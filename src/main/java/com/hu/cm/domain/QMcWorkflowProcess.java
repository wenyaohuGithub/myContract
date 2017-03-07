package com.hu.cm.domain;

import com.mysema.query.sql.ColumnMetadata;
import com.mysema.query.types.Path;
import com.mysema.query.types.PathMetadata;
import com.mysema.query.types.path.NumberPath;

import javax.annotation.Generated;
import java.sql.Types;

import static com.mysema.query.types.PathMetadataFactory.forVariable;


/**
 * QMcWorkflowProcess is a Querydsl query type for QMcWorkflowProcess
 */
@Generated("com.mysema.query.sql.codegen.MetaDataSerializer")
public class QMcWorkflowProcess extends com.mysema.query.sql.RelationalPathBase<QMcWorkflowProcess> {

    private static final long serialVersionUID = 1724656291;

    public static final QMcWorkflowProcess mcWorkflowProcess = new QMcWorkflowProcess("mc_workflow_process");

    public final NumberPath<Long> id = createNumber("id", Long.class);

    public final NumberPath<Long> processId = createNumber("processId", Long.class);

    public final NumberPath<Integer> sequence = createNumber("sequence", Integer.class);

    public final NumberPath<Long> workflowId = createNumber("workflowId", Long.class);

    public final com.mysema.query.sql.PrimaryKey<QMcWorkflowProcess> mcWorkflowProcessPk = createPrimaryKey(id);

    public final com.mysema.query.sql.ForeignKey<QMcProcess> processProcessWorkflowIdFk = createForeignKey(processId, "id");

    public final com.mysema.query.sql.ForeignKey<QMcWorkflow> workflowProcessProcessIdFk = createForeignKey(workflowId, "id");

    public QMcWorkflowProcess(String variable) {
        super(QMcWorkflowProcess.class, forVariable(variable), "public", "mc_workflow_process");
        addMetadata();
    }

    public QMcWorkflowProcess(String variable, String schema, String table) {
        super(QMcWorkflowProcess.class, forVariable(variable), schema, table);
        addMetadata();
    }

    public QMcWorkflowProcess(Path<? extends QMcWorkflowProcess> path) {
        super(path.getType(), path.getMetadata(), "public", "mc_workflow_process");
        addMetadata();
    }

    public QMcWorkflowProcess(PathMetadata<?> metadata) {
        super(QMcWorkflowProcess.class, metadata, "public", "mc_workflow_process");
        addMetadata();
    }

    public void addMetadata() {
        addMetadata(id, ColumnMetadata.named("id").withIndex(1).ofType(Types.BIGINT).withSize(19).notNull());
        addMetadata(processId, ColumnMetadata.named("process_id").withIndex(2).ofType(Types.BIGINT).withSize(19).notNull());
        addMetadata(sequence, ColumnMetadata.named("sequence").withIndex(4).ofType(Types.INTEGER).withSize(10));
        addMetadata(workflowId, ColumnMetadata.named("workflow_id").withIndex(3).ofType(Types.BIGINT).withSize(19).notNull());
    }

}

