package com.hu.cm.domain;

import com.mysema.query.types.Path;
import com.mysema.query.types.PathMetadata;
import com.mysema.query.types.path.*;

import javax.annotation.Generated;

import static com.mysema.query.types.PathMetadataFactory.forVariable;


/**
 * QContractParty is a Querydsl query type for ContractParty
 */
@Generated("com.mysema.query.codegen.EntitySerializer")
public class QContractParty extends EntityPathBase<ContractParty> {

    private static final long serialVersionUID = 1643945690L;

    private static final PathInits INITS = PathInits.DIRECT2;

    public static final QContractParty contractParty = new QContractParty("contractParty");

    public final com.hu.cm.domain.admin.QAccount account;

    public final com.hu.cm.domain.configuration.QAddress address;

    public final SetPath<BankAccount, QBankAccount> bank_accounts = this.<BankAccount, QBankAccount>createSet("bank_accounts", BankAccount.class, QBankAccount.class, PathInits.DIRECT2);

    public final StringPath business_certificate = createString("business_certificate");

    public final SetPath<Contract, QContract> contracts = this.<Contract, QContract>createSet("contracts", Contract.class, QContract.class, PathInits.DIRECT2);

    public final StringPath description = createString("description");

    public final NumberPath<Long> id = createNumber("id", Long.class);

    public final StringPath legal_representative = createString("legal_representative");

    public final StringPath name = createString("name");

    public final StringPath professional_certificate = createString("professional_certificate");

    public final NumberPath<java.math.BigDecimal> registered_capital = createNumber("registered_capital", java.math.BigDecimal.class);

    public final StringPath registration_id = createString("registration_id");

    public final StringPath registration_inspection_record = createString("registration_inspection_record");

    public QContractParty(String variable) {
        this(ContractParty.class, forVariable(variable), INITS);
    }

    public QContractParty(Path<? extends ContractParty> path) {
        this(path.getType(), path.getMetadata(), path.getMetadata().isRoot() ? INITS : PathInits.DEFAULT);
    }

    public QContractParty(PathMetadata<?> metadata) {
        this(metadata, metadata.isRoot() ? INITS : PathInits.DEFAULT);
    }

    public QContractParty(PathMetadata<?> metadata, PathInits inits) {
        this(ContractParty.class, metadata, inits);
    }

    public QContractParty(Class<? extends ContractParty> type, PathMetadata<?> metadata, PathInits inits) {
        super(type, metadata, inits);
        this.account = inits.isInitialized("account") ? new com.hu.cm.domain.admin.QAccount(forProperty("account")) : null;
        this.address = inits.isInitialized("address") ? new com.hu.cm.domain.configuration.QAddress(forProperty("address")) : null;
    }

}

