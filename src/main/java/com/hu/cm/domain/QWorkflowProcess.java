package com.hu.cm.domain;

import com.mysema.query.types.Path;
import com.mysema.query.types.PathMetadata;
import com.mysema.query.types.path.EntityPathBase;
import com.mysema.query.types.path.NumberPath;
import com.mysema.query.types.path.PathInits;

import javax.annotation.Generated;

import static com.mysema.query.types.PathMetadataFactory.forVariable;


/**
 * QWorkflowProcess is a Querydsl query type for WorkflowProcess
 */
@Generated("com.mysema.query.codegen.EntitySerializer")
public class QWorkflowProcess extends EntityPathBase<WorkflowProcess> {

    private static final long serialVersionUID = 458899990L;

    private static final PathInits INITS = PathInits.DIRECT2;

    public static final QWorkflowProcess workflowProcess = new QWorkflowProcess("workflowProcess");

    public final NumberPath<Long> id = createNumber("id", Long.class);

    public final com.hu.cm.domain.configuration.QProcess process;

    public final NumberPath<Integer> sequence = createNumber("sequence", Integer.class);

    public final QWorkflow workflow;

    public QWorkflowProcess(String variable) {
        this(WorkflowProcess.class, forVariable(variable), INITS);
    }

    public QWorkflowProcess(Path<? extends WorkflowProcess> path) {
        this(path.getType(), path.getMetadata(), path.getMetadata().isRoot() ? INITS : PathInits.DEFAULT);
    }

    public QWorkflowProcess(PathMetadata<?> metadata) {
        this(metadata, metadata.isRoot() ? INITS : PathInits.DEFAULT);
    }

    public QWorkflowProcess(PathMetadata<?> metadata, PathInits inits) {
        this(WorkflowProcess.class, metadata, inits);
    }

    public QWorkflowProcess(Class<? extends WorkflowProcess> type, PathMetadata<?> metadata, PathInits inits) {
        super(type, metadata, inits);
        this.process = inits.isInitialized("process") ? new com.hu.cm.domain.configuration.QProcess(forProperty("process")) : null;
        this.workflow = inits.isInitialized("workflow") ? new QWorkflow(forProperty("workflow"), inits.get("workflow")) : null;
    }

}

