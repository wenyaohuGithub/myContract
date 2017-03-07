package com.hu.cm.domain.admin;

import com.mysema.query.types.Path;
import com.mysema.query.types.PathMetadata;
import com.mysema.query.types.path.*;

import javax.annotation.Generated;

import static com.mysema.query.types.PathMetadataFactory.forVariable;


/**
 * QDepartment is a Querydsl query type for Department
 */
@Generated("com.mysema.query.codegen.EntitySerializer")
public class QDepartment extends EntityPathBase<Department> {

    private static final long serialVersionUID = 885613483L;

    private static final PathInits INITS = PathInits.DIRECT2;

    public static final QDepartment department = new QDepartment("department");

    public final QAccount account;

    public final BooleanPath active = createBoolean("active");

    public final StringPath description = createString("description");

    public final SetPath<User, QUser> employees = this.<User, QUser>createSet("employees", User.class, QUser.class, PathInits.DIRECT2);

    public final NumberPath<Long> id = createNumber("id", Long.class);

    public final StringPath name = createString("name");

    public final QDepartment parentDepartment;

    public final SetPath<com.hu.cm.domain.Contract, com.hu.cm.domain.QContract> relatedContracts = this.<com.hu.cm.domain.Contract, com.hu.cm.domain.QContract>createSet("relatedContracts", com.hu.cm.domain.Contract.class, com.hu.cm.domain.QContract.class, PathInits.DIRECT2);

    public final EnumPath<com.hu.cm.domain.enumeration.DepartmentType> type = createEnum("type", com.hu.cm.domain.enumeration.DepartmentType.class);

    public QDepartment(String variable) {
        this(Department.class, forVariable(variable), INITS);
    }

    public QDepartment(Path<? extends Department> path) {
        this(path.getType(), path.getMetadata(), path.getMetadata().isRoot() ? INITS : PathInits.DEFAULT);
    }

    public QDepartment(PathMetadata<?> metadata) {
        this(metadata, metadata.isRoot() ? INITS : PathInits.DEFAULT);
    }

    public QDepartment(PathMetadata<?> metadata, PathInits inits) {
        this(Department.class, metadata, inits);
    }

    public QDepartment(Class<? extends Department> type, PathMetadata<?> metadata, PathInits inits) {
        super(type, metadata, inits);
        this.account = inits.isInitialized("account") ? new QAccount(forProperty("account")) : null;
        this.parentDepartment = inits.isInitialized("parentDepartment") ? new QDepartment(forProperty("parentDepartment"), inits.get("parentDepartment")) : null;
    }

}

