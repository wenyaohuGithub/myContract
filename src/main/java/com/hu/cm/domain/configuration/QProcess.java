package com.hu.cm.domain.configuration;

import com.mysema.query.types.Path;
import com.mysema.query.types.PathMetadata;
import com.mysema.query.types.path.EntityPathBase;
import com.mysema.query.types.path.NumberPath;
import com.mysema.query.types.path.StringPath;

import javax.annotation.Generated;

import static com.mysema.query.types.PathMetadataFactory.forVariable;


/**
 * QProcess is a Querydsl query type for Process
 */
@Generated("com.mysema.query.codegen.EntitySerializer")
public class QProcess extends EntityPathBase<Process> {

    private static final long serialVersionUID = -54396579L;

    public static final QProcess process = new QProcess("process");

    public final StringPath description = createString("description");

    public final NumberPath<Long> id = createNumber("id", Long.class);

    public final StringPath name = createString("name");

    public QProcess(String variable) {
        super(Process.class, forVariable(variable));
    }

    public QProcess(Path<? extends Process> path) {
        super(path.getType(), path.getMetadata());
    }

    public QProcess(PathMetadata<?> metadata) {
        super(Process.class, metadata);
    }

}

