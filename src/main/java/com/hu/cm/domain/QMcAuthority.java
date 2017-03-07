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
 * QMcAuthority is a Querydsl query type for QMcAuthority
 */
@Generated("com.mysema.query.sql.codegen.MetaDataSerializer")
public class QMcAuthority extends com.mysema.query.sql.RelationalPathBase<QMcAuthority> {

    private static final long serialVersionUID = -28431754;

    public static final QMcAuthority mcAuthority = new QMcAuthority("mc_authority");

    public final StringPath createdBy = createString("createdBy");

    public final DateTimePath<java.sql.Timestamp> createdDate = createDateTime("createdDate", java.sql.Timestamp.class);

    public final StringPath description = createString("description");

    public final NumberPath<Long> id = createNumber("id", Long.class);

    public final StringPath lastModifiedBy = createString("lastModifiedBy");

    public final DateTimePath<java.sql.Timestamp> lastModifiedDate = createDateTime("lastModifiedDate", java.sql.Timestamp.class);

    public final StringPath name = createString("name");

    public final NumberPath<Long> parentId = createNumber("parentId", Long.class);

    public final com.mysema.query.sql.PrimaryKey<QMcAuthority> mcAuthorityPk = createPrimaryKey(id);

    public final com.mysema.query.sql.ForeignKey<QMcRoleAuthority> _authorityIdFk = createInvForeignKey(id, "authority_id");

    public QMcAuthority(String variable) {
        super(QMcAuthority.class, forVariable(variable), "public", "mc_authority");
        addMetadata();
    }

    public QMcAuthority(String variable, String schema, String table) {
        super(QMcAuthority.class, forVariable(variable), schema, table);
        addMetadata();
    }

    public QMcAuthority(Path<? extends QMcAuthority> path) {
        super(path.getType(), path.getMetadata(), "public", "mc_authority");
        addMetadata();
    }

    public QMcAuthority(PathMetadata<?> metadata) {
        super(QMcAuthority.class, metadata, "public", "mc_authority");
        addMetadata();
    }

    public void addMetadata() {
        addMetadata(createdBy, ColumnMetadata.named("created_by").withIndex(5).ofType(Types.VARCHAR).withSize(50));
        addMetadata(createdDate, ColumnMetadata.named("created_date").withIndex(6).ofType(Types.TIMESTAMP).withSize(29).withDigits(6));
        addMetadata(description, ColumnMetadata.named("description").withIndex(3).ofType(Types.VARCHAR).withSize(255));
        addMetadata(id, ColumnMetadata.named("id").withIndex(1).ofType(Types.BIGINT).withSize(19).notNull());
        addMetadata(lastModifiedBy, ColumnMetadata.named("last_modified_by").withIndex(7).ofType(Types.VARCHAR).withSize(50));
        addMetadata(lastModifiedDate, ColumnMetadata.named("last_modified_date").withIndex(8).ofType(Types.TIMESTAMP).withSize(29).withDigits(6));
        addMetadata(name, ColumnMetadata.named("name").withIndex(2).ofType(Types.VARCHAR).withSize(50).notNull());
        addMetadata(parentId, ColumnMetadata.named("parent_id").withIndex(4).ofType(Types.BIGINT).withSize(19));
    }

}

