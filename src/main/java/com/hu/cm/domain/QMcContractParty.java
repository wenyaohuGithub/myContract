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
 * QMcContractParty is a Querydsl query type for QMcContractParty
 */
@Generated("com.mysema.query.sql.codegen.MetaDataSerializer")
public class QMcContractParty extends com.mysema.query.sql.RelationalPathBase<QMcContractParty> {

    private static final long serialVersionUID = -1174845785;

    public static final QMcContractParty mcContractParty = new QMcContractParty("mc_contract_party");

    public final NumberPath<Long> accountId = createNumber("accountId", Long.class);

    public final NumberPath<Long> addressId = createNumber("addressId", Long.class);

    public final StringPath businessCertificate = createString("businessCertificate");

    public final StringPath createdBy = createString("createdBy");

    public final DateTimePath<java.sql.Timestamp> createdDate = createDateTime("createdDate", java.sql.Timestamp.class);

    public final StringPath description = createString("description");

    public final NumberPath<Long> id = createNumber("id", Long.class);

    public final StringPath lastModifiedBy = createString("lastModifiedBy");

    public final DateTimePath<java.sql.Timestamp> lastModifiedDate = createDateTime("lastModifiedDate", java.sql.Timestamp.class);

    public final StringPath legalRepresentative = createString("legalRepresentative");

    public final StringPath name = createString("name");

    public final StringPath professionalCertificate = createString("professionalCertificate");

    public final NumberPath<Double> registeredCapital = createNumber("registeredCapital", Double.class);

    public final StringPath registrationId = createString("registrationId");

    public final StringPath registrationInspectionRecord = createString("registrationInspectionRecord");

    public final com.mysema.query.sql.PrimaryKey<QMcContractParty> mcContractPartyPk = createPrimaryKey(id);

    public final com.mysema.query.sql.ForeignKey<QMcAddress> contractPartyAddressIdFk = createForeignKey(addressId, "id");

    public final com.mysema.query.sql.ForeignKey<QMcAccount> contractPartyAccountIdFk = createForeignKey(accountId, "id");

    public final com.mysema.query.sql.ForeignKey<QMcContract> _contractPartyIdFk = createInvForeignKey(id, "contract_party_id");

    public final com.mysema.query.sql.ForeignKey<QMcBankAccount> _ownerIdFk = createInvForeignKey(id, "owner_id");

    public final com.mysema.query.sql.ForeignKey<QMcContractpartyContract> _contractpartycontractContractPartyIdFk = createInvForeignKey(id, "contract_party_id");

    public QMcContractParty(String variable) {
        super(QMcContractParty.class, forVariable(variable), "public", "mc_contract_party");
        addMetadata();
    }

    public QMcContractParty(String variable, String schema, String table) {
        super(QMcContractParty.class, forVariable(variable), schema, table);
        addMetadata();
    }

    public QMcContractParty(Path<? extends QMcContractParty> path) {
        super(path.getType(), path.getMetadata(), "public", "mc_contract_party");
        addMetadata();
    }

    public QMcContractParty(PathMetadata<?> metadata) {
        super(QMcContractParty.class, metadata, "public", "mc_contract_party");
        addMetadata();
    }

    public void addMetadata() {
        addMetadata(accountId, ColumnMetadata.named("account_id").withIndex(11).ofType(Types.BIGINT).withSize(19));
        addMetadata(addressId, ColumnMetadata.named("address_id").withIndex(10).ofType(Types.BIGINT).withSize(19));
        addMetadata(businessCertificate, ColumnMetadata.named("business_certificate").withIndex(9).ofType(Types.VARCHAR).withSize(255));
        addMetadata(createdBy, ColumnMetadata.named("created_by").withIndex(12).ofType(Types.VARCHAR).withSize(50));
        addMetadata(createdDate, ColumnMetadata.named("created_date").withIndex(13).ofType(Types.TIMESTAMP).withSize(29).withDigits(6));
        addMetadata(description, ColumnMetadata.named("description").withIndex(3).ofType(Types.VARCHAR).withSize(255));
        addMetadata(id, ColumnMetadata.named("id").withIndex(1).ofType(Types.BIGINT).withSize(19).notNull());
        addMetadata(lastModifiedBy, ColumnMetadata.named("last_modified_by").withIndex(14).ofType(Types.VARCHAR).withSize(50));
        addMetadata(lastModifiedDate, ColumnMetadata.named("last_modified_date").withIndex(15).ofType(Types.TIMESTAMP).withSize(29).withDigits(6));
        addMetadata(legalRepresentative, ColumnMetadata.named("legal_representative").withIndex(6).ofType(Types.VARCHAR).withSize(255));
        addMetadata(name, ColumnMetadata.named("name").withIndex(2).ofType(Types.VARCHAR).withSize(255));
        addMetadata(professionalCertificate, ColumnMetadata.named("professional_certificate").withIndex(8).ofType(Types.VARCHAR).withSize(255));
        addMetadata(registeredCapital, ColumnMetadata.named("registered_capital").withIndex(5).ofType(Types.NUMERIC).withSize(10).withDigits(2));
        addMetadata(registrationId, ColumnMetadata.named("registration_id").withIndex(4).ofType(Types.VARCHAR).withSize(255));
        addMetadata(registrationInspectionRecord, ColumnMetadata.named("registration_inspection_record").withIndex(7).ofType(Types.VARCHAR).withSize(255));
    }

}

