package com.hu.cm.domain;

import com.mysema.query.sql.ColumnMetadata;
import com.mysema.query.types.Path;
import com.mysema.query.types.PathMetadata;
import com.mysema.query.types.path.NumberPath;

import javax.annotation.Generated;
import java.sql.Types;

import static com.mysema.query.types.PathMetadataFactory.forVariable;


/**
 * QMcUserAccount is a Querydsl query type for QMcUserAccount
 */
@Generated("com.mysema.query.sql.codegen.MetaDataSerializer")
public class QMcUserAccount extends com.mysema.query.sql.RelationalPathBase<QMcUserAccount> {

    private static final long serialVersionUID = 540249685;

    public static final QMcUserAccount mcUserAccount = new QMcUserAccount("mc_user_account");

    public final NumberPath<Long> accountId = createNumber("accountId", Long.class);

    public final NumberPath<Long> id = createNumber("id", Long.class);

    public final NumberPath<Long> userId = createNumber("userId", Long.class);

    public final com.mysema.query.sql.PrimaryKey<QMcUserAccount> mcUserAccountPk = createPrimaryKey(id);

    public final com.mysema.query.sql.ForeignKey<QMcAccount> useraccountAccountIdFk = createForeignKey(accountId, "id");

    public final com.mysema.query.sql.ForeignKey<QMcUser> useraccountUserIdFk = createForeignKey(userId, "id");

    public final com.mysema.query.sql.ForeignKey<QMcUseraccountRole> _userAccountIdFk = createInvForeignKey(id, "user_account_id");

    public QMcUserAccount(String variable) {
        super(QMcUserAccount.class, forVariable(variable), "public", "mc_user_account");
        addMetadata();
    }

    public QMcUserAccount(String variable, String schema, String table) {
        super(QMcUserAccount.class, forVariable(variable), schema, table);
        addMetadata();
    }

    public QMcUserAccount(Path<? extends QMcUserAccount> path) {
        super(path.getType(), path.getMetadata(), "public", "mc_user_account");
        addMetadata();
    }

    public QMcUserAccount(PathMetadata<?> metadata) {
        super(QMcUserAccount.class, metadata, "public", "mc_user_account");
        addMetadata();
    }

    public void addMetadata() {
        addMetadata(accountId, ColumnMetadata.named("account_id").withIndex(3).ofType(Types.BIGINT).withSize(19).notNull());
        addMetadata(id, ColumnMetadata.named("id").withIndex(1).ofType(Types.BIGINT).withSize(19).notNull());
        addMetadata(userId, ColumnMetadata.named("user_id").withIndex(2).ofType(Types.BIGINT).withSize(19).notNull());
    }

}

