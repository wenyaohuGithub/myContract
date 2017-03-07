package com.hu.cm.domain.admin;

import com.mysema.query.types.Path;
import com.mysema.query.types.PathMetadata;
import com.mysema.query.types.path.*;

import javax.annotation.Generated;

import static com.mysema.query.types.PathMetadataFactory.forVariable;


/**
 * QUser is a Querydsl query type for User
 */
@Generated("com.mysema.query.codegen.EntitySerializer")
public class QUser extends EntityPathBase<User> {

    private static final long serialVersionUID = 335774436L;

    public static final QUser user = new QUser("user");

    public final QAbstractAuditingEntity _super = new QAbstractAuditingEntity(this);

    public final BooleanPath activated = createBoolean("activated");

    public final StringPath activationKey = createString("activationKey");

    //inherited
    public final StringPath createdBy = _super.createdBy;

    //inherited
    public final DateTimePath<org.joda.time.DateTime> createdDate = _super.createdDate;

    public final NumberPath<Long> departmentId = createNumber("departmentId", Long.class);

    public final StringPath email = createString("email");

    public final StringPath firstName = createString("firstName");

    public final NumberPath<Long> id = createNumber("id", Long.class);

    public final StringPath langKey = createString("langKey");

    //inherited
    public final StringPath lastModifiedBy = _super.lastModifiedBy;

    //inherited
    public final DateTimePath<org.joda.time.DateTime> lastModifiedDate = _super.lastModifiedDate;

    public final StringPath lastName = createString("lastName");

    public final StringPath login = createString("login");

    public final StringPath password = createString("password");

    public final DateTimePath<org.joda.time.DateTime> resetDate = createDateTime("resetDate", org.joda.time.DateTime.class);

    public final StringPath resetKey = createString("resetKey");

    public final SetPath<UserAccount, QUserAccount> userAccounts = this.<UserAccount, QUserAccount>createSet("userAccounts", UserAccount.class, QUserAccount.class, PathInits.DIRECT2);

    public QUser(String variable) {
        super(User.class, forVariable(variable));
    }

    public QUser(Path<? extends User> path) {
        super(path.getType(), path.getMetadata());
    }

    public QUser(PathMetadata<?> metadata) {
        super(User.class, metadata);
    }

}

