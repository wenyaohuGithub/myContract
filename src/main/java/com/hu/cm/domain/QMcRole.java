package com.hu.cm.domain;

import com.mysema.query.sql.ColumnMetadata;
import com.mysema.query.types.Path;
import com.mysema.query.types.PathMetadata;
import com.mysema.query.types.path.BooleanPath;
import com.mysema.query.types.path.DateTimePath;
import com.mysema.query.types.path.NumberPath;
import com.mysema.query.types.path.StringPath;

import javax.annotation.Generated;
import java.sql.Types;

import static com.mysema.query.types.PathMetadataFactory.forVariable;


/**
 * QMcRole is a Querydsl query type for QMcRole
 */
@Generated("com.mysema.query.sql.codegen.MetaDataSerializer")
public class QMcRole extends com.mysema.query.sql.RelationalPathBase<QMcRole> {

    private static final long serialVersionUID = 640215395;

    public static final QMcRole mcRole = new QMcRole("mc_role");

    public final NumberPath<Long> accountId = createNumber("accountId", Long.class);

    public final StringPath createdBy = createString("createdBy");

    public final DateTimePath<java.sql.Timestamp> createdDate = createDateTime("createdDate", java.sql.Timestamp.class);

    public final BooleanPath deleted = createBoolean("deleted");

    public final StringPath description = createString("description");

    public final NumberPath<Long> id = createNumber("id", Long.class);

    public final StringPath lastModifiedBy = createString("lastModifiedBy");

    public final DateTimePath<java.sql.Timestamp> lastModifiedDate = createDateTime("lastModifiedDate", java.sql.Timestamp.class);

    public final StringPath name = createString("name");

    public final BooleanPath system = createBoolean("system");

    public final com.mysema.query.sql.PrimaryKey<QMcRole> mcRolePk = createPrimaryKey(id);

    public final com.mysema.query.sql.ForeignKey<QMcAccount> roleAccountIdFk = createForeignKey(accountId, "id");

    public final com.mysema.query.sql.ForeignKey<QMcRoleAuthority> _roleauthorityRoleIdFk = createInvForeignKey(id, "role_id");

    public final com.mysema.query.sql.ForeignKey<QMcUseraccountRole> _useraccountRoleIdFk = createInvForeignKey(id, "role_id");

    public QMcRole(String variable) {
        super(QMcRole.class, forVariable(variable), "public", "mc_role");
        addMetadata();
    }

    public QMcRole(String variable, String schema, String table) {
        super(QMcRole.class, forVariable(variable), schema, table);
        addMetadata();
    }

    public QMcRole(Path<? extends QMcRole> path) {
        super(path.getType(), path.getMetadata(), "public", "mc_role");
        addMetadata();
    }

    public QMcRole(PathMetadata<?> metadata) {
        super(QMcRole.class, metadata, "public", "mc_role");
        addMetadata();
    }

    public void addMetadata() {
        addMetadata(accountId, ColumnMetadata.named("account_id").withIndex(6).ofType(Types.BIGINT).withSize(19));
        addMetadata(createdBy, ColumnMetadata.named("created_by").withIndex(7).ofType(Types.VARCHAR).withSize(50));
        addMetadata(createdDate, ColumnMetadata.named("created_date").withIndex(8).ofType(Types.TIMESTAMP).withSize(29).withDigits(6));
        addMetadata(deleted, ColumnMetadata.named("deleted").withIndex(5).ofType(Types.BIT).withSize(1));
        addMetadata(description, ColumnMetadata.named("description").withIndex(3).ofType(Types.VARCHAR).withSize(255));
        addMetadata(id, ColumnMetadata.named("id").withIndex(1).ofType(Types.BIGINT).withSize(19).notNull());
        addMetadata(lastModifiedBy, ColumnMetadata.named("last_modified_by").withIndex(9).ofType(Types.VARCHAR).withSize(50));
        addMetadata(lastModifiedDate, ColumnMetadata.named("last_modified_date").withIndex(10).ofType(Types.TIMESTAMP).withSize(29).withDigits(6));
        addMetadata(name, ColumnMetadata.named("name").withIndex(2).ofType(Types.VARCHAR).withSize(50).notNull());
        addMetadata(system, ColumnMetadata.named("system").withIndex(4).ofType(Types.BIT).withSize(1));
    }

}

