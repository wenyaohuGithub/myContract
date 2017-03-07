package com.hu.cm.domain;

import com.mysema.query.types.Path;
import com.mysema.query.types.PathMetadata;
import com.mysema.query.types.path.*;

import javax.annotation.Generated;

import static com.mysema.query.types.PathMetadataFactory.forVariable;


/**
 * QTask is a Querydsl query type for Task
 */
@Generated("com.mysema.query.codegen.EntitySerializer")
public class QTask extends EntityPathBase<Task> {

    private static final long serialVersionUID = -2145406753L;

    private static final PathInits INITS = PathInits.DIRECT2;

    public static final QTask task = new QTask("task");

    public final com.hu.cm.domain.admin.QUser assignee;

    public final QContract contract;

    public final com.hu.cm.domain.admin.QDepartment department;

    public final NumberPath<Long> id = createNumber("id", Long.class);

    public final DateTimePath<org.joda.time.DateTime> performedDatetime = createDateTime("performedDatetime", org.joda.time.DateTime.class);

    public final com.hu.cm.domain.admin.QUser performer;

    public final com.hu.cm.domain.configuration.QProcess process;

    public final StringPath result = createString("result");

    public final NumberPath<Integer> sequence = createNumber("sequence", Integer.class);

    public QTask(String variable) {
        this(Task.class, forVariable(variable), INITS);
    }

    public QTask(Path<? extends Task> path) {
        this(path.getType(), path.getMetadata(), path.getMetadata().isRoot() ? INITS : PathInits.DEFAULT);
    }

    public QTask(PathMetadata<?> metadata) {
        this(metadata, metadata.isRoot() ? INITS : PathInits.DEFAULT);
    }

    public QTask(PathMetadata<?> metadata, PathInits inits) {
        this(Task.class, metadata, inits);
    }

    public QTask(Class<? extends Task> type, PathMetadata<?> metadata, PathInits inits) {
        super(type, metadata, inits);
        this.assignee = inits.isInitialized("assignee") ? new com.hu.cm.domain.admin.QUser(forProperty("assignee")) : null;
        this.contract = inits.isInitialized("contract") ? new QContract(forProperty("contract"), inits.get("contract")) : null;
        this.department = inits.isInitialized("department") ? new com.hu.cm.domain.admin.QDepartment(forProperty("department"), inits.get("department")) : null;
        this.performer = inits.isInitialized("performer") ? new com.hu.cm.domain.admin.QUser(forProperty("performer")) : null;
        this.process = inits.isInitialized("process") ? new com.hu.cm.domain.configuration.QProcess(forProperty("process")) : null;
    }

}

