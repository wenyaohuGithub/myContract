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
 * QMcRoleAuthority is a Querydsl query type for QMcRoleAuthority
 */
@Generated("com.mysema.query.sql.codegen.MetaDataSerializer")
public class QMcRoleAuthority extends com.mysema.query.sql.RelationalPathBase<QMcRoleAuthority> {

    private static final long serialVersionUID = 1721376032;

    public static final QMcRoleAuthority mcRoleAuthority = new QMcRoleAuthority("mc_role_authority");

    public final NumberPath<Long> authorityId = createNumber("authorityId", Long.class);

    public final StringPath createdBy = createString("createdBy");

    public final DateTimePath<java.sql.Timestamp> createdDate = createDateTime("createdDate", java.sql.Timestamp.class);

    public final NumberPath<Long> id = createNumber("id", Long.class);

    public final StringPath lastModifiedBy = createString("lastModifiedBy");

    public final DateTimePath<java.sql.Timestamp> lastModifiedDate = createDateTime("lastModifiedDate", java.sql.Timestamp.class);

    public final NumberPath<Long> roleId = createNumber("roleId", Long.class);

    public final com.mysema.query.sql.PrimaryKey<QMcRoleAuthority> mcRoleAuthorityPk = createPrimaryKey(id);

    public final com.mysema.query.sql.ForeignKey<QMcRole> roleauthorityRoleIdFk = createForeignKey(roleId, "id");

    public final com.mysema.query.sql.ForeignKey<QMcAuthority> authorityIdFk = createForeignKey(authorityId, "id");

    public QMcRoleAuthority(String variable) {
        super(QMcRoleAuthority.class, forVariable(variable), "public", "mc_role_authority");
        addMetadata();
    }

    public QMcRoleAuthority(String variable, String schema, String table) {
        super(QMcRoleAuthority.class, forVariable(variable), schema, table);
        addMetadata();
    }

    public QMcRoleAuthority(Path<? extends QMcRoleAuthority> path) {
        super(path.getType(), path.getMetadata(), "public", "mc_role_authority");
        addMetadata();
    }

    public QMcRoleAuthority(PathMetadata<?> metadata) {
        super(QMcRoleAuthority.class, metadata, "public", "mc_role_authority");
        addMetadata();
    }

    public void addMetadata() {
        addMetadata(authorityId, ColumnMetadata.named("authority_id").withIndex(3).ofType(Types.BIGINT).withSize(19).notNull());
        addMetadata(createdBy, ColumnMetadata.named("created_by").withIndex(4).ofType(Types.VARCHAR).withSize(50));
        addMetadata(createdDate, ColumnMetadata.named("created_date").withIndex(5).ofType(Types.TIMESTAMP).withSize(29).withDigits(6));
        addMetadata(id, ColumnMetadata.named("id").withIndex(1).ofType(Types.BIGINT).withSize(19).notNull());
        addMetadata(lastModifiedBy, ColumnMetadata.named("last_modified_by").withIndex(6).ofType(Types.VARCHAR).withSize(50));
        addMetadata(lastModifiedDate, ColumnMetadata.named("last_modified_date").withIndex(7).ofType(Types.TIMESTAMP).withSize(29).withDigits(6));
        addMetadata(roleId, ColumnMetadata.named("role_id").withIndex(2).ofType(Types.BIGINT).withSize(19).notNull());
    }

}

