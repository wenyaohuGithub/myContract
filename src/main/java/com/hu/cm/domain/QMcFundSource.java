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
 * QMcFundSource is a Querydsl query type for QMcFundSource
 */
@Generated("com.mysema.query.sql.codegen.MetaDataSerializer")
public class QMcFundSource extends com.mysema.query.sql.RelationalPathBase<QMcFundSource> {

    private static final long serialVersionUID = 505008749;

    public static final QMcFundSource mcFundSource = new QMcFundSource("mc_fund_source");

    public final NumberPath<Long> accountId = createNumber("accountId", Long.class);

    public final StringPath createdBy = createString("createdBy");

    public final DateTimePath<java.sql.Timestamp> createdDate = createDateTime("createdDate", java.sql.Timestamp.class);

    public final BooleanPath deleted = createBoolean("deleted");

    public final DateTimePath<java.sql.Timestamp> deletedDateTime = createDateTime("deletedDateTime", java.sql.Timestamp.class);

    public final StringPath description = createString("description");

    public final NumberPath<Long> id = createNumber("id", Long.class);

    public final StringPath lastModifiedBy = createString("lastModifiedBy");

    public final DateTimePath<java.sql.Timestamp> lastModifiedDate = createDateTime("lastModifiedDate", java.sql.Timestamp.class);

    public final StringPath name = createString("name");

    public final com.mysema.query.sql.PrimaryKey<QMcFundSource> mcFundSourcePk = createPrimaryKey(id);

    public final com.mysema.query.sql.ForeignKey<QMcAccount> funcsourceAccountIdFk = createForeignKey(accountId, "id");

    public final com.mysema.query.sql.ForeignKey<QMcContract> _contractFundSourceIdFk = createInvForeignKey(id, "fund_source_id");

    public QMcFundSource(String variable) {
        super(QMcFundSource.class, forVariable(variable), "public", "mc_fund_source");
        addMetadata();
    }

    public QMcFundSource(String variable, String schema, String table) {
        super(QMcFundSource.class, forVariable(variable), schema, table);
        addMetadata();
    }

    public QMcFundSource(Path<? extends QMcFundSource> path) {
        super(path.getType(), path.getMetadata(), "public", "mc_fund_source");
        addMetadata();
    }

    public QMcFundSource(PathMetadata<?> metadata) {
        super(QMcFundSource.class, metadata, "public", "mc_fund_source");
        addMetadata();
    }

    public void addMetadata() {
        addMetadata(accountId, ColumnMetadata.named("account_id").withIndex(4).ofType(Types.BIGINT).withSize(19));
        addMetadata(createdBy, ColumnMetadata.named("created_by").withIndex(7).ofType(Types.VARCHAR).withSize(50));
        addMetadata(createdDate, ColumnMetadata.named("created_date").withIndex(8).ofType(Types.TIMESTAMP).withSize(29).withDigits(6));
        addMetadata(deleted, ColumnMetadata.named("deleted").withIndex(5).ofType(Types.BIT).withSize(1));
        addMetadata(deletedDateTime, ColumnMetadata.named("deleted_date_time").withIndex(6).ofType(Types.TIMESTAMP).withSize(29).withDigits(6));
        addMetadata(description, ColumnMetadata.named("description").withIndex(3).ofType(Types.VARCHAR).withSize(255));
        addMetadata(id, ColumnMetadata.named("id").withIndex(1).ofType(Types.BIGINT).withSize(19).notNull());
        addMetadata(lastModifiedBy, ColumnMetadata.named("last_modified_by").withIndex(9).ofType(Types.VARCHAR).withSize(50));
        addMetadata(lastModifiedDate, ColumnMetadata.named("last_modified_date").withIndex(10).ofType(Types.TIMESTAMP).withSize(29).withDigits(6));
        addMetadata(name, ColumnMetadata.named("name").withIndex(2).ofType(Types.VARCHAR).withSize(255));
    }

}

