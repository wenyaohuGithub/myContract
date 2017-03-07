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
 * QMcAddress is a Querydsl query type for QMcAddress
 */
@Generated("com.mysema.query.sql.codegen.MetaDataSerializer")
public class QMcAddress extends com.mysema.query.sql.RelationalPathBase<QMcAddress> {

    private static final long serialVersionUID = 477556711;

    public static final QMcAddress mcAddress = new QMcAddress("mc_address");

    public final StringPath addressLine1 = createString("addressLine1");

    public final StringPath addressLine2 = createString("addressLine2");

    public final StringPath city = createString("city");

    public final StringPath country = createString("country");

    public final StringPath createdBy = createString("createdBy");

    public final DateTimePath<java.sql.Timestamp> createdDate = createDateTime("createdDate", java.sql.Timestamp.class);

    public final NumberPath<Long> id = createNumber("id", Long.class);

    public final StringPath lastModifiedBy = createString("lastModifiedBy");

    public final DateTimePath<java.sql.Timestamp> lastModifiedDate = createDateTime("lastModifiedDate", java.sql.Timestamp.class);

    public final StringPath postalCode = createString("postalCode");

    public final StringPath province = createString("province");

    public final com.mysema.query.sql.PrimaryKey<QMcAddress> mcAddressPk = createPrimaryKey(id);

    public final com.mysema.query.sql.ForeignKey<QMcContractParty> _contractPartyAddressIdFk = createInvForeignKey(id, "address_id");

    public QMcAddress(String variable) {
        super(QMcAddress.class, forVariable(variable), "public", "mc_address");
        addMetadata();
    }

    public QMcAddress(String variable, String schema, String table) {
        super(QMcAddress.class, forVariable(variable), schema, table);
        addMetadata();
    }

    public QMcAddress(Path<? extends QMcAddress> path) {
        super(path.getType(), path.getMetadata(), "public", "mc_address");
        addMetadata();
    }

    public QMcAddress(PathMetadata<?> metadata) {
        super(QMcAddress.class, metadata, "public", "mc_address");
        addMetadata();
    }

    public void addMetadata() {
        addMetadata(addressLine1, ColumnMetadata.named("address_line_1").withIndex(2).ofType(Types.VARCHAR).withSize(255));
        addMetadata(addressLine2, ColumnMetadata.named("address_line_2").withIndex(3).ofType(Types.VARCHAR).withSize(255));
        addMetadata(city, ColumnMetadata.named("city").withIndex(4).ofType(Types.VARCHAR).withSize(255));
        addMetadata(country, ColumnMetadata.named("country").withIndex(6).ofType(Types.VARCHAR).withSize(255));
        addMetadata(createdBy, ColumnMetadata.named("created_by").withIndex(8).ofType(Types.VARCHAR).withSize(50));
        addMetadata(createdDate, ColumnMetadata.named("created_date").withIndex(9).ofType(Types.TIMESTAMP).withSize(29).withDigits(6));
        addMetadata(id, ColumnMetadata.named("id").withIndex(1).ofType(Types.BIGINT).withSize(19).notNull());
        addMetadata(lastModifiedBy, ColumnMetadata.named("last_modified_by").withIndex(10).ofType(Types.VARCHAR).withSize(50));
        addMetadata(lastModifiedDate, ColumnMetadata.named("last_modified_date").withIndex(11).ofType(Types.TIMESTAMP).withSize(29).withDigits(6));
        addMetadata(postalCode, ColumnMetadata.named("postal_code").withIndex(7).ofType(Types.VARCHAR).withSize(255));
        addMetadata(province, ColumnMetadata.named("province").withIndex(5).ofType(Types.VARCHAR).withSize(255));
    }

}

