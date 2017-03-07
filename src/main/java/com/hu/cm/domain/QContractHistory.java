package com.hu.cm.domain;

import com.mysema.query.types.Path;
import com.mysema.query.types.PathMetadata;
import com.mysema.query.types.path.*;

import javax.annotation.Generated;

import static com.mysema.query.types.PathMetadataFactory.forVariable;


/**
 * QContractHistory is a Querydsl query type for ContractHistory
 */
@Generated("com.mysema.query.codegen.EntitySerializer")
public class QContractHistory extends EntityPathBase<ContractHistory> {

    private static final long serialVersionUID = 1003699080L;

    private static final PathInits INITS = PathInits.DIRECT2;

    public static final QContractHistory contractHistory = new QContractHistory("contractHistory");

    public final EnumPath<com.hu.cm.domain.enumeration.UserAction> action = createEnum("action", com.hu.cm.domain.enumeration.UserAction.class);

    public final DateTimePath<org.joda.time.DateTime> action_datetime = createDateTime("action_datetime", org.joda.time.DateTime.class);

    public final QContract contract;

    public final NumberPath<Long> id = createNumber("id", Long.class);

    public final StringPath note = createString("note");

    public final QTask task;

    public final com.hu.cm.domain.admin.QUser user;

    public QContractHistory(String variable) {
        this(ContractHistory.class, forVariable(variable), INITS);
    }

    public QContractHistory(Path<? extends ContractHistory> path) {
        this(path.getType(), path.getMetadata(), path.getMetadata().isRoot() ? INITS : PathInits.DEFAULT);
    }

    public QContractHistory(PathMetadata<?> metadata) {
        this(metadata, metadata.isRoot() ? INITS : PathInits.DEFAULT);
    }

    public QContractHistory(PathMetadata<?> metadata, PathInits inits) {
        this(ContractHistory.class, metadata, inits);
    }

    public QContractHistory(Class<? extends ContractHistory> type, PathMetadata<?> metadata, PathInits inits) {
        super(type, metadata, inits);
        this.contract = inits.isInitialized("contract") ? new QContract(forProperty("contract"), inits.get("contract")) : null;
        this.task = inits.isInitialized("task") ? new QTask(forProperty("task"), inits.get("task")) : null;
        this.user = inits.isInitialized("user") ? new com.hu.cm.domain.admin.QUser(forProperty("user")) : null;
    }

}

