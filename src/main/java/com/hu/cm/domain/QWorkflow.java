package com.hu.cm.domain;

import com.mysema.query.types.Path;
import com.mysema.query.types.PathMetadata;
import com.mysema.query.types.path.*;

import javax.annotation.Generated;

import static com.mysema.query.types.PathMetadataFactory.forVariable;


/**
 * QWorkflow is a Querydsl query type for Workflow
 */
@Generated("com.mysema.query.codegen.EntitySerializer")
public class QWorkflow extends EntityPathBase<Workflow> {

    private static final long serialVersionUID = 801379865L;

    private static final PathInits INITS = PathInits.DIRECT2;

    public static final QWorkflow workflow = new QWorkflow("workflow");

    public final com.hu.cm.domain.admin.QAccount account;

    public final StringPath description = createString("description");

    public final NumberPath<Long> id = createNumber("id", Long.class);

    public final StringPath name = createString("name");

    public final ListPath<com.hu.cm.domain.configuration.Process, com.hu.cm.domain.configuration.QProcess> processes = this.<com.hu.cm.domain.configuration.Process, com.hu.cm.domain.configuration.QProcess>createList("processes", com.hu.cm.domain.configuration.Process.class, com.hu.cm.domain.configuration.QProcess.class, PathInits.DIRECT2);

    public QWorkflow(String variable) {
        this(Workflow.class, forVariable(variable), INITS);
    }

    public QWorkflow(Path<? extends Workflow> path) {
        this(path.getType(), path.getMetadata(), path.getMetadata().isRoot() ? INITS : PathInits.DEFAULT);
    }

    public QWorkflow(PathMetadata<?> metadata) {
        this(metadata, metadata.isRoot() ? INITS : PathInits.DEFAULT);
    }

    public QWorkflow(PathMetadata<?> metadata, PathInits inits) {
        this(Workflow.class, metadata, inits);
    }

    public QWorkflow(Class<? extends Workflow> type, PathMetadata<?> metadata, PathInits inits) {
        super(type, metadata, inits);
        this.account = inits.isInitialized("account") ? new com.hu.cm.domain.admin.QAccount(forProperty("account")) : null;
    }

}

