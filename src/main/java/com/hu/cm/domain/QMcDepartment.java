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
 * QMcDepartment is a Querydsl query type for QMcDepartment
 */
@Generated("com.mysema.query.sql.codegen.MetaDataSerializer")
public class QMcDepartment extends com.mysema.query.sql.RelationalPathBase<QMcDepartment> {

    private static final long serialVersionUID = 1467516543;

    public static final QMcDepartment mcDepartment = new QMcDepartment("mc_department");

    public final NumberPath<Long> accountId = createNumber("accountId", Long.class);

    public final BooleanPath active = createBoolean("active");

    public final StringPath createdBy = createString("createdBy");

    public final DateTimePath<java.sql.Timestamp> createdDate = createDateTime("createdDate", java.sql.Timestamp.class);

    public final StringPath description = createString("description");

    public final NumberPath<Long> id = createNumber("id", Long.class);

    public final StringPath lastModifiedBy = createString("lastModifiedBy");

    public final DateTimePath<java.sql.Timestamp> lastModifiedDate = createDateTime("lastModifiedDate", java.sql.Timestamp.class);

    public final StringPath name = createString("name");

    public final NumberPath<Long> parentId = createNumber("parentId", Long.class);

    public final StringPath type = createString("type");

    public final com.mysema.query.sql.PrimaryKey<QMcDepartment> mcDepartmentPk = createPrimaryKey(id);

    public final com.mysema.query.sql.ForeignKey<QMcDepartment> parentIdFk = createForeignKey(parentId, "id");

    public final com.mysema.query.sql.ForeignKey<QMcAccount> deptAccountIdFk = createForeignKey(accountId, "id");

    public final com.mysema.query.sql.ForeignKey<QMcDepartment> _parentIdFk = createInvForeignKey(id, "parent_id");

    public final com.mysema.query.sql.ForeignKey<QMcUser> _departmentIdFk = createInvForeignKey(id, "department_id");

    public final com.mysema.query.sql.ForeignKey<QMcTask> _taskDepartmentIdFk = createInvForeignKey(id, "department_id");

    public final com.mysema.query.sql.ForeignKey<QMcContract> _contractAdministrativeDepartmentIdFk = createInvForeignKey(id, "administrative_department_id");

    public final com.mysema.query.sql.ForeignKey<QMcContractDepartment> _contractDepartmentDepartmentIdFk = createInvForeignKey(id, "department_id");

    public QMcDepartment(String variable) {
        super(QMcDepartment.class, forVariable(variable), "public", "mc_department");
        addMetadata();
    }

    public QMcDepartment(String variable, String schema, String table) {
        super(QMcDepartment.class, forVariable(variable), schema, table);
        addMetadata();
    }

    public QMcDepartment(Path<? extends QMcDepartment> path) {
        super(path.getType(), path.getMetadata(), "public", "mc_department");
        addMetadata();
    }

    public QMcDepartment(PathMetadata<?> metadata) {
        super(QMcDepartment.class, metadata, "public", "mc_department");
        addMetadata();
    }

    public void addMetadata() {
        addMetadata(accountId, ColumnMetadata.named("account_id").withIndex(7).ofType(Types.BIGINT).withSize(19));
        addMetadata(active, ColumnMetadata.named("active").withIndex(6).ofType(Types.BIT).withSize(1));
        addMetadata(createdBy, ColumnMetadata.named("created_by").withIndex(8).ofType(Types.VARCHAR).withSize(50));
        addMetadata(createdDate, ColumnMetadata.named("created_date").withIndex(9).ofType(Types.TIMESTAMP).withSize(29).withDigits(6));
        addMetadata(description, ColumnMetadata.named("description").withIndex(3).ofType(Types.VARCHAR).withSize(255));
        addMetadata(id, ColumnMetadata.named("id").withIndex(1).ofType(Types.BIGINT).withSize(19).notNull());
        addMetadata(lastModifiedBy, ColumnMetadata.named("last_modified_by").withIndex(10).ofType(Types.VARCHAR).withSize(50));
        addMetadata(lastModifiedDate, ColumnMetadata.named("last_modified_date").withIndex(11).ofType(Types.TIMESTAMP).withSize(29).withDigits(6));
        addMetadata(name, ColumnMetadata.named("name").withIndex(2).ofType(Types.VARCHAR).withSize(50));
        addMetadata(parentId, ColumnMetadata.named("parent_id").withIndex(5).ofType(Types.BIGINT).withSize(19));
        addMetadata(type, ColumnMetadata.named("type").withIndex(4).ofType(Types.VARCHAR).withSize(50));
    }

}

