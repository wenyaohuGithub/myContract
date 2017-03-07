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
 * QMcProject is a Querydsl query type for QMcProject
 */
@Generated("com.mysema.query.sql.codegen.MetaDataSerializer")
public class QMcProject extends com.mysema.query.sql.RelationalPathBase<QMcProject> {

    private static final long serialVersionUID = 1315938060;

    public static final QMcProject mcProject = new QMcProject("mc_project");

    public final NumberPath<Long> accountId = createNumber("accountId", Long.class);

    public final StringPath createdBy = createString("createdBy");

    public final DateTimePath<java.sql.Timestamp> createdDate = createDateTime("createdDate", java.sql.Timestamp.class);

    public final StringPath description = createString("description");

    public final NumberPath<Long> id = createNumber("id", Long.class);

    public final StringPath identifier = createString("identifier");

    public final StringPath lastModifiedBy = createString("lastModifiedBy");

    public final DateTimePath<java.sql.Timestamp> lastModifiedDate = createDateTime("lastModifiedDate", java.sql.Timestamp.class);

    public final StringPath manager = createString("manager");

    public final StringPath name = createString("name");

    public final com.mysema.query.sql.PrimaryKey<QMcProject> mcProjectPk = createPrimaryKey(id);

    public final com.mysema.query.sql.ForeignKey<QMcAccount> projectAccountIdFk = createForeignKey(accountId, "id");

    public final com.mysema.query.sql.ForeignKey<QMcContractProject> _projectIdFk = createInvForeignKey(id, "project_id");

    public QMcProject(String variable) {
        super(QMcProject.class, forVariable(variable), "public", "mc_project");
        addMetadata();
    }

    public QMcProject(String variable, String schema, String table) {
        super(QMcProject.class, forVariable(variable), schema, table);
        addMetadata();
    }

    public QMcProject(Path<? extends QMcProject> path) {
        super(path.getType(), path.getMetadata(), "public", "mc_project");
        addMetadata();
    }

    public QMcProject(PathMetadata<?> metadata) {
        super(QMcProject.class, metadata, "public", "mc_project");
        addMetadata();
    }

    public void addMetadata() {
        addMetadata(accountId, ColumnMetadata.named("account_id").withIndex(6).ofType(Types.BIGINT).withSize(19));
        addMetadata(createdBy, ColumnMetadata.named("created_by").withIndex(7).ofType(Types.VARCHAR).withSize(50));
        addMetadata(createdDate, ColumnMetadata.named("created_date").withIndex(8).ofType(Types.TIMESTAMP).withSize(29).withDigits(6));
        addMetadata(description, ColumnMetadata.named("description").withIndex(4).ofType(Types.VARCHAR).withSize(255));
        addMetadata(id, ColumnMetadata.named("id").withIndex(1).ofType(Types.BIGINT).withSize(19).notNull());
        addMetadata(identifier, ColumnMetadata.named("identifier").withIndex(3).ofType(Types.VARCHAR).withSize(255));
        addMetadata(lastModifiedBy, ColumnMetadata.named("last_modified_by").withIndex(9).ofType(Types.VARCHAR).withSize(50));
        addMetadata(lastModifiedDate, ColumnMetadata.named("last_modified_date").withIndex(10).ofType(Types.TIMESTAMP).withSize(29).withDigits(6));
        addMetadata(manager, ColumnMetadata.named("manager").withIndex(5).ofType(Types.VARCHAR).withSize(255));
        addMetadata(name, ColumnMetadata.named("name").withIndex(2).ofType(Types.VARCHAR).withSize(255));
    }

}

