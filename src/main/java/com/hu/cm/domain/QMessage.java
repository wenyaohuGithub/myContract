package com.hu.cm.domain;

import com.mysema.query.types.Path;
import com.mysema.query.types.PathMetadata;
import com.mysema.query.types.path.*;

import javax.annotation.Generated;

import static com.mysema.query.types.PathMetadataFactory.forVariable;


/**
 * QMessage is a Querydsl query type for Message
 */
@Generated("com.mysema.query.codegen.EntitySerializer")
public class QMessage extends EntityPathBase<Message> {

    private static final long serialVersionUID = 2088013421L;

    private static final PathInits INITS = PathInits.DIRECT2;

    public static final QMessage message = new QMessage("message");

    public final StringPath content = createString("content");

    public final NumberPath<Long> id = createNumber("id", Long.class);

    public final BooleanPath read = createBoolean("read");

    public final com.hu.cm.domain.admin.QUser recipient;

    public final DateTimePath<org.joda.time.DateTime> send_datetime = createDateTime("send_datetime", org.joda.time.DateTime.class);

    public final com.hu.cm.domain.admin.QUser sender;

    public final StringPath subject = createString("subject");

    public final QTask task;

    public QMessage(String variable) {
        this(Message.class, forVariable(variable), INITS);
    }

    public QMessage(Path<? extends Message> path) {
        this(path.getType(), path.getMetadata(), path.getMetadata().isRoot() ? INITS : PathInits.DEFAULT);
    }

    public QMessage(PathMetadata<?> metadata) {
        this(metadata, metadata.isRoot() ? INITS : PathInits.DEFAULT);
    }

    public QMessage(PathMetadata<?> metadata, PathInits inits) {
        this(Message.class, metadata, inits);
    }

    public QMessage(Class<? extends Message> type, PathMetadata<?> metadata, PathInits inits) {
        super(type, metadata, inits);
        this.recipient = inits.isInitialized("recipient") ? new com.hu.cm.domain.admin.QUser(forProperty("recipient")) : null;
        this.sender = inits.isInitialized("sender") ? new com.hu.cm.domain.admin.QUser(forProperty("sender")) : null;
        this.task = inits.isInitialized("task") ? new QTask(forProperty("task"), inits.get("task")) : null;
    }

}

