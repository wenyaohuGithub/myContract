package com.hu.cm.domain.admin;

import com.mysema.query.types.Path;
import com.mysema.query.types.PathMetadata;
import com.mysema.query.types.path.*;

import javax.annotation.Generated;

import static com.mysema.query.types.PathMetadataFactory.forVariable;


/**
 * QPersistentAuditEvent is a Querydsl query type for PersistentAuditEvent
 */
@Generated("com.mysema.query.codegen.EntitySerializer")
public class QPersistentAuditEvent extends EntityPathBase<PersistentAuditEvent> {

    private static final long serialVersionUID = 1131591311L;

    public static final QPersistentAuditEvent persistentAuditEvent = new QPersistentAuditEvent("persistentAuditEvent");

    public final DateTimePath<org.joda.time.LocalDateTime> auditEventDate = createDateTime("auditEventDate", org.joda.time.LocalDateTime.class);

    public final StringPath auditEventType = createString("auditEventType");

    public final MapPath<String, String, StringPath> data = this.<String, String, StringPath>createMap("data", String.class, String.class, StringPath.class);

    public final NumberPath<Long> id = createNumber("id", Long.class);

    public final StringPath principal = createString("principal");

    public QPersistentAuditEvent(String variable) {
        super(PersistentAuditEvent.class, forVariable(variable));
    }

    public QPersistentAuditEvent(Path<? extends PersistentAuditEvent> path) {
        super(path.getType(), path.getMetadata());
    }

    public QPersistentAuditEvent(PathMetadata<?> metadata) {
        super(PersistentAuditEvent.class, metadata);
    }

}

