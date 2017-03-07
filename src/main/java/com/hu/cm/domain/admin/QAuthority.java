package com.hu.cm.domain.admin;

import com.mysema.query.types.Path;
import com.mysema.query.types.PathMetadata;
import com.mysema.query.types.path.EntityPathBase;
import com.mysema.query.types.path.StringPath;

import javax.annotation.Generated;

import static com.mysema.query.types.PathMetadataFactory.forVariable;


/**
 * QAuthority is a Querydsl query type for Authority
 */
@Generated("com.mysema.query.codegen.EntitySerializer")
public class QAuthority extends EntityPathBase<Authority> {

    private static final long serialVersionUID = -1709770806L;

    public static final QAuthority authority = new QAuthority("authority");

    public final StringPath name = createString("name");

    public QAuthority(String variable) {
        super(Authority.class, forVariable(variable));
    }

    public QAuthority(Path<? extends Authority> path) {
        super(path.getType(), path.getMetadata());
    }

    public QAuthority(PathMetadata<?> metadata) {
        super(Authority.class, metadata);
    }

}

