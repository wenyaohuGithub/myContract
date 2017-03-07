package com.hu.cm.domain.admin;

import com.mysema.query.types.Path;
import com.mysema.query.types.PathMetadata;
import com.mysema.query.types.path.DateTimePath;
import com.mysema.query.types.path.EntityPathBase;
import com.mysema.query.types.path.StringPath;

import javax.annotation.Generated;

import static com.mysema.query.types.PathMetadataFactory.forVariable;


/**
 * QAbstractAuditingEntity is a Querydsl query type for AbstractAuditingEntity
 */
@Generated("com.mysema.query.codegen.SupertypeSerializer")
public class QAbstractAuditingEntity extends EntityPathBase<AbstractAuditingEntity> {

    private static final long serialVersionUID = 998587525L;

    public static final QAbstractAuditingEntity abstractAuditingEntity = new QAbstractAuditingEntity("abstractAuditingEntity");

    public final StringPath createdBy = createString("createdBy");

    public final DateTimePath<org.joda.time.DateTime> createdDate = createDateTime("createdDate", org.joda.time.DateTime.class);

    public final StringPath lastModifiedBy = createString("lastModifiedBy");

    public final DateTimePath<org.joda.time.DateTime> lastModifiedDate = createDateTime("lastModifiedDate", org.joda.time.DateTime.class);

    public QAbstractAuditingEntity(String variable) {
        super(AbstractAuditingEntity.class, forVariable(variable));
    }

    public QAbstractAuditingEntity(Path<? extends AbstractAuditingEntity> path) {
        super(path.getType(), path.getMetadata());
    }

    public QAbstractAuditingEntity(PathMetadata<?> metadata) {
        super(AbstractAuditingEntity.class, metadata);
    }

}

