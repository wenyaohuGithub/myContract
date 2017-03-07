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
 * QMcPersistentAuditEvent is a Querydsl query type for QMcPersistentAuditEvent
 */
@Generated("com.mysema.query.sql.codegen.MetaDataSerializer")
public class QMcPersistentAuditEvent extends com.mysema.query.sql.RelationalPathBase<QMcPersistentAuditEvent> {

    private static final long serialVersionUID = -998023069;

    public static final QMcPersistentAuditEvent mcPersistentAuditEvent = new QMcPersistentAuditEvent("mc_persistent_audit_event");

    public final DateTimePath<java.sql.Timestamp> eventDate = createDateTime("eventDate", java.sql.Timestamp.class);

    public final NumberPath<Long> eventId = createNumber("eventId", Long.class);

    public final StringPath eventType = createString("eventType");

    public final StringPath principal = createString("principal");

    public final com.mysema.query.sql.PrimaryKey<QMcPersistentAuditEvent> mcPersistentAuditEventPk = createPrimaryKey(eventId);

    public final com.mysema.query.sql.ForeignKey<QMcPersistentAuditEvtData> _evtPersAuditEvtDataFk = createInvForeignKey(eventId, "event_id");

    public QMcPersistentAuditEvent(String variable) {
        super(QMcPersistentAuditEvent.class, forVariable(variable), "public", "mc_persistent_audit_event");
        addMetadata();
    }

    public QMcPersistentAuditEvent(String variable, String schema, String table) {
        super(QMcPersistentAuditEvent.class, forVariable(variable), schema, table);
        addMetadata();
    }

    public QMcPersistentAuditEvent(Path<? extends QMcPersistentAuditEvent> path) {
        super(path.getType(), path.getMetadata(), "public", "mc_persistent_audit_event");
        addMetadata();
    }

    public QMcPersistentAuditEvent(PathMetadata<?> metadata) {
        super(QMcPersistentAuditEvent.class, metadata, "public", "mc_persistent_audit_event");
        addMetadata();
    }

    public void addMetadata() {
        addMetadata(eventDate, ColumnMetadata.named("event_date").withIndex(3).ofType(Types.TIMESTAMP).withSize(29).withDigits(6));
        addMetadata(eventId, ColumnMetadata.named("event_id").withIndex(1).ofType(Types.BIGINT).withSize(19).notNull());
        addMetadata(eventType, ColumnMetadata.named("event_type").withIndex(4).ofType(Types.VARCHAR).withSize(255));
        addMetadata(principal, ColumnMetadata.named("principal").withIndex(2).ofType(Types.VARCHAR).withSize(255).notNull());
    }

}

