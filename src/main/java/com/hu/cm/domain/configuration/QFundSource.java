package com.hu.cm.domain.configuration;

import com.mysema.query.types.Path;
import com.mysema.query.types.PathMetadata;
import com.mysema.query.types.path.*;

import javax.annotation.Generated;

import static com.mysema.query.types.PathMetadataFactory.forVariable;


/**
 * QFundSource is a Querydsl query type for FundSource
 */
@Generated("com.mysema.query.codegen.EntitySerializer")
public class QFundSource extends EntityPathBase<FundSource> {

    private static final long serialVersionUID = -1862228590L;

    public static final QFundSource fundSource = new QFundSource("fundSource");

    public final BooleanPath deleted = createBoolean("deleted");

    public final DateTimePath<org.joda.time.DateTime> deleted_date_time = createDateTime("deleted_date_time", org.joda.time.DateTime.class);

    public final StringPath description = createString("description");

    public final NumberPath<Long> id = createNumber("id", Long.class);

    public final StringPath name = createString("name");

    public QFundSource(String variable) {
        super(FundSource.class, forVariable(variable));
    }

    public QFundSource(Path<? extends FundSource> path) {
        super(path.getType(), path.getMetadata());
    }

    public QFundSource(PathMetadata<?> metadata) {
        super(FundSource.class, metadata);
    }

}

