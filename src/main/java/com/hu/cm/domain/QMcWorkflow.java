package com.hu.cm.domain;

import com.mysema.query.sql.ColumnMetadata;
import com.mysema.query.types.Path;
import com.mysema.query.types.PathMetadata;
import com.mysema.query.types.path.NumberPath;
import com.mysema.query.types.path.StringPath;

import javax.annotation.Generated;
import java.sql.Types;

import static com.mysema.query.types.PathMetadataFactory.forVariable;


/**
 * QMcWorkflow is a Querydsl query type for QMcWorkflow
 */
@Generated("com.mysema.query.sql.codegen.MetaDataSerializer")
public class QMcWorkflow extends com.mysema.query.sql.RelationalPathBase<QMcWorkflow> {

    private static final long serialVersionUID = -1121517012;

    public static final QMcWorkflow mcWorkflow = new QMcWorkflow("mc_workflow");

    public final NumberPath<Long> accountId = createNumber("accountId", Long.class);

    public final StringPath description = createString("description");

    public final NumberPath<Long> id = createNumber("id", Long.class);

    public final StringPath name = createString("name");

    public final com.mysema.query.sql.PrimaryKey<QMcWorkflow> mcWorkflowPk = createPrimaryKey(id);

    public final com.mysema.query.sql.ForeignKey<QMcAccount> workflowAccountIdFk = createForeignKey(accountId, "id");

    public final com.mysema.query.sql.ForeignKey<QMcWorkflowProcess> _workflowProcessProcessIdFk = createInvForeignKey(id, "workflow_id");

    public final com.mysema.query.sql.ForeignKey<QMcCategory> _categoryWorkflowIdFk = createInvForeignKey(id, "workflow_id");

    public QMcWorkflow(String variable) {
        super(QMcWorkflow.class, forVariable(variable), "public", "mc_workflow");
        addMetadata();
    }

    public QMcWorkflow(String variable, String schema, String table) {
        super(QMcWorkflow.class, forVariable(variable), schema, table);
        addMetadata();
    }

    public QMcWorkflow(Path<? extends QMcWorkflow> path) {
        super(path.getType(), path.getMetadata(), "public", "mc_workflow");
        addMetadata();
    }

    public QMcWorkflow(PathMetadata<?> metadata) {
        super(QMcWorkflow.class, metadata, "public", "mc_workflow");
        addMetadata();
    }

    public void addMetadata() {
        addMetadata(accountId, ColumnMetadata.named("account_id").withIndex(4).ofType(Types.BIGINT).withSize(19));
        addMetadata(description, ColumnMetadata.named("description").withIndex(3).ofType(Types.VARCHAR).withSize(255));
        addMetadata(id, ColumnMetadata.named("id").withIndex(1).ofType(Types.BIGINT).withSize(19).notNull());
        addMetadata(name, ColumnMetadata.named("name").withIndex(2).ofType(Types.VARCHAR).withSize(255));
    }

}

