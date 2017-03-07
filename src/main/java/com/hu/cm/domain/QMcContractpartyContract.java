package com.hu.cm.domain;

import com.mysema.query.sql.ColumnMetadata;
import com.mysema.query.types.Path;
import com.mysema.query.types.PathMetadata;
import com.mysema.query.types.path.NumberPath;

import javax.annotation.Generated;
import java.sql.Types;

import static com.mysema.query.types.PathMetadataFactory.forVariable;


/**
 * QMcContractpartyContract is a Querydsl query type for QMcContractpartyContract
 */
@Generated("com.mysema.query.sql.codegen.MetaDataSerializer")
public class QMcContractpartyContract extends com.mysema.query.sql.RelationalPathBase<QMcContractpartyContract> {

    private static final long serialVersionUID = -764939015;

    public static final QMcContractpartyContract mcContractpartyContract = new QMcContractpartyContract("mc_contractparty_contract");

    public final NumberPath<Long> contractId = createNumber("contractId", Long.class);

    public final NumberPath<Long> contractPartyId = createNumber("contractPartyId", Long.class);

    public final com.mysema.query.sql.PrimaryKey<QMcContractpartyContract> mcContractpartyContractPkey = createPrimaryKey(contractPartyId, contractId);

    public final com.mysema.query.sql.ForeignKey<QMcContract> contractpartycontractContractIdFk = createForeignKey(contractId, "id");

    public final com.mysema.query.sql.ForeignKey<QMcContractParty> contractpartycontractContractPartyIdFk = createForeignKey(contractPartyId, "id");

    public QMcContractpartyContract(String variable) {
        super(QMcContractpartyContract.class, forVariable(variable), "public", "mc_contractparty_contract");
        addMetadata();
    }

    public QMcContractpartyContract(String variable, String schema, String table) {
        super(QMcContractpartyContract.class, forVariable(variable), schema, table);
        addMetadata();
    }

    public QMcContractpartyContract(Path<? extends QMcContractpartyContract> path) {
        super(path.getType(), path.getMetadata(), "public", "mc_contractparty_contract");
        addMetadata();
    }

    public QMcContractpartyContract(PathMetadata<?> metadata) {
        super(QMcContractpartyContract.class, metadata, "public", "mc_contractparty_contract");
        addMetadata();
    }

    public void addMetadata() {
        addMetadata(contractId, ColumnMetadata.named("contract_id").withIndex(2).ofType(Types.BIGINT).withSize(19).notNull());
        addMetadata(contractPartyId, ColumnMetadata.named("contract_party_id").withIndex(1).ofType(Types.BIGINT).withSize(19).notNull());
    }

}

