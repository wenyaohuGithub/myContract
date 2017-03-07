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
 * QMcPersistentAuditEvtData is a Querydsl query type for QMcPersistentAuditEvtData
 */
@Generated("com.mysema.query.sql.codegen.MetaDataSerializer")
public class QMcPersistentAuditEvtData extends com.mysema.query.sql.RelationalPathBase<QMcPersistentAuditEvtData> {

    private static final long serialVersionUID = -1309875274;

    public static final QMcPersistentAuditEvtData mcPersistentAuditEvtData = new QMcPersistentAuditEvtData("mc_persistent_audit_evt_data");

    public final NumberPath<Long> eventId = createNumber("eventId", Long.class);

    public final StringPath name = createString("name");

    public final StringPath value = createString("value");

    public final com.mysema.query.sql.PrimaryKey<QMcPersistentAuditEvtData> mcPersistentAuditEvtDataPkey = createPrimaryKey(eventId, name);

    public final com.mysema.query.sql.ForeignKey<QMcPersistentAuditEvent> evtPersAuditEvtDataFk = createForeignKey(eventId, "event_id");

    public QMcPersistentAuditEvtData(String variable) {
        super(QMcPersistentAuditEvtData.class, forVariable(variable), "public", "mc_persistent_audit_evt_data");
        addMetadata();
    }

    public QMcPersistentAuditEvtData(String variable, String schema, String table) {
        super(QMcPersistentAuditEvtData.class, forVariable(variable), schema, table);
        addMetadata();
    }

    public QMcPersistentAuditEvtData(Path<? extends QMcPersistentAuditEvtData> path) {
        super(path.getType(), path.getMetadata(), "public", "mc_persistent_audit_evt_data");
        addMetadata();
    }

    public QMcPersistentAuditEvtData(PathMetadata<?> metadata) {
        super(QMcPersistentAuditEvtData.class, metadata, "public", "mc_persistent_audit_evt_data");
        addMetadata();
    }

    public void addMetadata() {
        addMetadata(eventId, ColumnMetadata.named("event_id").withIndex(1).ofType(Types.BIGINT).withSize(19).notNull());
        addMetadata(name, ColumnMetadata.named("name").withIndex(2).ofType(Types.VARCHAR).withSize(255).notNull());
        addMetadata(value, ColumnMetadata.named("value").withIndex(3).ofType(Types.VARCHAR).withSize(255));
    }

}

