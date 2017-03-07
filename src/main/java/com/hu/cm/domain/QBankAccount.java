package com.hu.cm.domain;

import com.mysema.query.types.Path;
import com.mysema.query.types.PathMetadata;
import com.mysema.query.types.path.EntityPathBase;
import com.mysema.query.types.path.NumberPath;
import com.mysema.query.types.path.PathInits;
import com.mysema.query.types.path.StringPath;

import javax.annotation.Generated;

import static com.mysema.query.types.PathMetadataFactory.forVariable;


/**
 * QBankAccount is a Querydsl query type for BankAccount
 */
@Generated("com.mysema.query.codegen.EntitySerializer")
public class QBankAccount extends EntityPathBase<BankAccount> {

    private static final long serialVersionUID = -90059849L;

    private static final PathInits INITS = PathInits.DIRECT2;

    public static final QBankAccount bankAccount = new QBankAccount("bankAccount");

    public final StringPath account_name = createString("account_name");

    public final StringPath account_number = createString("account_number");

    public final StringPath bank_name = createString("bank_name");

    public final NumberPath<Long> id = createNumber("id", Long.class);

    public final QContractParty owner;

    public QBankAccount(String variable) {
        this(BankAccount.class, forVariable(variable), INITS);
    }

    public QBankAccount(Path<? extends BankAccount> path) {
        this(path.getType(), path.getMetadata(), path.getMetadata().isRoot() ? INITS : PathInits.DEFAULT);
    }

    public QBankAccount(PathMetadata<?> metadata) {
        this(metadata, metadata.isRoot() ? INITS : PathInits.DEFAULT);
    }

    public QBankAccount(PathMetadata<?> metadata, PathInits inits) {
        this(BankAccount.class, metadata, inits);
    }

    public QBankAccount(Class<? extends BankAccount> type, PathMetadata<?> metadata, PathInits inits) {
        super(type, metadata, inits);
        this.owner = inits.isInitialized("owner") ? new QContractParty(forProperty("owner"), inits.get("owner")) : null;
    }

}

