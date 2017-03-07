package com.hu.cm.domain.configuration;

import com.mysema.query.types.Path;
import com.mysema.query.types.PathMetadata;
import com.mysema.query.types.path.DateTimePath;
import com.mysema.query.types.path.EntityPathBase;
import com.mysema.query.types.path.NumberPath;
import com.mysema.query.types.path.StringPath;

import javax.annotation.Generated;

import static com.mysema.query.types.PathMetadataFactory.forVariable;


/**
 * QContractSample is a Querydsl query type for ContractSample
 */
@Generated("com.mysema.query.codegen.EntitySerializer")
public class QContractSample extends EntityPathBase<ContractSample> {

    private static final long serialVersionUID = -1181058386L;

    public static final QContractSample contractSample = new QContractSample("contractSample");

    public final StringPath description = createString("description");

    public final StringPath file_name = createString("file_name");

    public final NumberPath<Long> id = createNumber("id", Long.class);

    public final DateTimePath<org.joda.time.DateTime> modified_date_time = createDateTime("modified_date_time", org.joda.time.DateTime.class);

    public final StringPath name = createString("name");

    public final StringPath path = createString("path");

    public final NumberPath<Long> revision = createNumber("revision", Long.class);

    public final StringPath uploaded_by = createString("uploaded_by");

    public final DateTimePath<org.joda.time.DateTime> uploaded_date_time = createDateTime("uploaded_date_time", org.joda.time.DateTime.class);

    public QContractSample(String variable) {
        super(ContractSample.class, forVariable(variable));
    }

    public QContractSample(Path<? extends ContractSample> path) {
        super(path.getType(), path.getMetadata());
    }

    public QContractSample(PathMetadata<?> metadata) {
        super(ContractSample.class, metadata);
    }

}

