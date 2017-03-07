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
 * QMcUseraccountRole is a Querydsl query type for QMcUseraccountRole
 */
@Generated("com.mysema.query.sql.codegen.MetaDataSerializer")
public class QMcUseraccountRole extends com.mysema.query.sql.RelationalPathBase<QMcUseraccountRole> {

    private static final long serialVersionUID = 1093118091;

    public static final QMcUseraccountRole mcUseraccountRole = new QMcUseraccountRole("mc_useraccount_role");

    public final StringPath createdBy = createString("createdBy");

    public final DateTimePath<java.sql.Timestamp> createdDate = createDateTime("createdDate", java.sql.Timestamp.class);

    public final StringPath lastModifiedBy = createString("lastModifiedBy");

    public final DateTimePath<java.sql.Timestamp> lastModifiedDate = createDateTime("lastModifiedDate", java.sql.Timestamp.class);

    public final NumberPath<Long> roleId = createNumber("roleId", Long.class);

    public final NumberPath<Long> userAccountId = createNumber("userAccountId", Long.class);

    public final com.mysema.query.sql.PrimaryKey<QMcUseraccountRole> mcUseraccountRolePkey = createPrimaryKey(userAccountId, roleId);

    public final com.mysema.query.sql.ForeignKey<QMcUserAccount> userAccountIdFk = createForeignKey(userAccountId, "id");

    public final com.mysema.query.sql.ForeignKey<QMcRole> useraccountRoleIdFk = createForeignKey(roleId, "id");

    public QMcUseraccountRole(String variable) {
        super(QMcUseraccountRole.class, forVariable(variable), "public", "mc_useraccount_role");
        addMetadata();
    }

    public QMcUseraccountRole(String variable, String schema, String table) {
        super(QMcUseraccountRole.class, forVariable(variable), schema, table);
        addMetadata();
    }

    public QMcUseraccountRole(Path<? extends QMcUseraccountRole> path) {
        super(path.getType(), path.getMetadata(), "public", "mc_useraccount_role");
        addMetadata();
    }

    public QMcUseraccountRole(PathMetadata<?> metadata) {
        super(QMcUseraccountRole.class, metadata, "public", "mc_useraccount_role");
        addMetadata();
    }

    public void addMetadata() {
        addMetadata(createdBy, ColumnMetadata.named("created_by").withIndex(3).ofType(Types.VARCHAR).withSize(50));
        addMetadata(createdDate, ColumnMetadata.named("created_date").withIndex(4).ofType(Types.TIMESTAMP).withSize(29).withDigits(6));
        addMetadata(lastModifiedBy, ColumnMetadata.named("last_modified_by").withIndex(5).ofType(Types.VARCHAR).withSize(50));
        addMetadata(lastModifiedDate, ColumnMetadata.named("last_modified_date").withIndex(6).ofType(Types.TIMESTAMP).withSize(29).withDigits(6));
        addMetadata(roleId, ColumnMetadata.named("role_id").withIndex(2).ofType(Types.BIGINT).withSize(19).notNull());
        addMetadata(userAccountId, ColumnMetadata.named("user_account_id").withIndex(1).ofType(Types.BIGINT).withSize(19).notNull());
    }

}

