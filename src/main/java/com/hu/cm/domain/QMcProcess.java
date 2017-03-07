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
 * QMcProcess is a Querydsl query type for QMcProcess
 */
@Generated("com.mysema.query.sql.codegen.MetaDataSerializer")
public class QMcProcess extends com.mysema.query.sql.RelationalPathBase<QMcProcess> {

    private static final long serialVersionUID = 1315730018;

    public static final QMcProcess mcProcess = new QMcProcess("mc_process");

    public final StringPath createdBy = createString("createdBy");

    public final DateTimePath<java.sql.Timestamp> createdDate = createDateTime("createdDate", java.sql.Timestamp.class);

    public final StringPath description = createString("description");

    public final NumberPath<Long> id = createNumber("id", Long.class);

    public final StringPath lastModifiedBy = createString("lastModifiedBy");

    public final DateTimePath<java.sql.Timestamp> lastModifiedDate = createDateTime("lastModifiedDate", java.sql.Timestamp.class);

    public final StringPath name = createString("name");

    public final com.mysema.query.sql.PrimaryKey<QMcProcess> mcProcessPk = createPrimaryKey(id);

    public final com.mysema.query.sql.ForeignKey<QMcContract> _firstReviewProcessIdFk = createInvForeignKey(id, "first_review_process");

    public final com.mysema.query.sql.ForeignKey<QMcTask> _taskProcessIdFk = createInvForeignKey(id, "process_id");

    public final com.mysema.query.sql.ForeignKey<QMcWorkflowProcess> _processProcessWorkflowIdFk = createInvForeignKey(id, "process_id");

    public QMcProcess(String variable) {
        super(QMcProcess.class, forVariable(variable), "public", "mc_process");
        addMetadata();
    }

    public QMcProcess(String variable, String schema, String table) {
        super(QMcProcess.class, forVariable(variable), schema, table);
        addMetadata();
    }

    public QMcProcess(Path<? extends QMcProcess> path) {
        super(path.getType(), path.getMetadata(), "public", "mc_process");
        addMetadata();
    }

    public QMcProcess(PathMetadata<?> metadata) {
        super(QMcProcess.class, metadata, "public", "mc_process");
        addMetadata();
    }

    public void addMetadata() {
        addMetadata(createdBy, ColumnMetadata.named("created_by").withIndex(4).ofType(Types.VARCHAR).withSize(50));
        addMetadata(createdDate, ColumnMetadata.named("created_date").withIndex(5).ofType(Types.TIMESTAMP).withSize(29).withDigits(6));
        addMetadata(description, ColumnMetadata.named("description").withIndex(3).ofType(Types.VARCHAR).withSize(255));
        addMetadata(id, ColumnMetadata.named("id").withIndex(1).ofType(Types.BIGINT).withSize(19).notNull());
        addMetadata(lastModifiedBy, ColumnMetadata.named("last_modified_by").withIndex(6).ofType(Types.VARCHAR).withSize(50));
        addMetadata(lastModifiedDate, ColumnMetadata.named("last_modified_date").withIndex(7).ofType(Types.TIMESTAMP).withSize(29).withDigits(6));
        addMetadata(name, ColumnMetadata.named("name").withIndex(2).ofType(Types.VARCHAR).withSize(50));
    }

}

