package com.hu.cm.domain.configuration;

import com.mysema.query.types.Path;
import com.mysema.query.types.PathMetadata;
import com.mysema.query.types.path.EntityPathBase;
import com.mysema.query.types.path.NumberPath;
import com.mysema.query.types.path.StringPath;

import javax.annotation.Generated;

import static com.mysema.query.types.PathMetadataFactory.forVariable;


/**
 * QAddress is a Querydsl query type for Address
 */
@Generated("com.mysema.query.codegen.EntitySerializer")
public class QAddress extends EntityPathBase<Address> {

    private static final long serialVersionUID = -892569886L;

    public static final QAddress address = new QAddress("address");

    public final StringPath address_line_1 = createString("address_line_1");

    public final StringPath address_line_2 = createString("address_line_2");

    public final StringPath city = createString("city");

    public final StringPath country = createString("country");

    public final NumberPath<Long> id = createNumber("id", Long.class);

    public final StringPath postal_code = createString("postal_code");

    public final StringPath province = createString("province");

    public QAddress(String variable) {
        super(Address.class, forVariable(variable));
    }

    public QAddress(Path<? extends Address> path) {
        super(path.getType(), path.getMetadata());
    }

    public QAddress(PathMetadata<?> metadata) {
        super(Address.class, metadata);
    }

}

