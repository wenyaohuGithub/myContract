package com.hu.cm.domain;

import com.mysema.query.sql.ColumnMetadata;
import com.mysema.query.types.Path;
import com.mysema.query.types.PathMetadata;
import com.mysema.query.types.path.NumberPath;

import javax.annotation.Generated;
import java.sql.Types;

import static com.mysema.query.types.PathMetadataFactory.forVariable;


/**
 * QMcContractProject is a Querydsl query type for QMcContractProject
 */
@Generated("com.mysema.query.sql.codegen.MetaDataSerializer")
public class QMcContractProject extends com.mysema.query.sql.RelationalPathBase<QMcContractProject> {

    private static final long serialVersionUID = 1033210522;

    public static final QMcContractProject mcContractProject = new QMcContractProject("mc_contract_project");

    public final NumberPath<Long> contractId = createNumber("contractId", Long.class);

    public final NumberPath<Long> projectId = createNumber("projectId", Long.class);

    public final com.mysema.query.sql.PrimaryKey<QMcContractProject> mcContractProjectPkey = createPrimaryKey(contractId, projectId);

    public final com.mysema.query.sql.ForeignKey<QMcProject> projectIdFk = createForeignKey(projectId, "id");

    public final com.mysema.query.sql.ForeignKey<QMcContract> contractprojectContractIdFk = createForeignKey(contractId, "id");

    public QMcContractProject(String variable) {
        super(QMcContractProject.class, forVariable(variable), "public", "mc_contract_project");
        addMetadata();
    }

    public QMcContractProject(String variable, String schema, String table) {
        super(QMcContractProject.class, forVariable(variable), schema, table);
        addMetadata();
    }

    public QMcContractProject(Path<? extends QMcContractProject> path) {
        super(path.getType(), path.getMetadata(), "public", "mc_contract_project");
        addMetadata();
    }

    public QMcContractProject(PathMetadata<?> metadata) {
        super(QMcContractProject.class, metadata, "public", "mc_contract_project");
        addMetadata();
    }

    public void addMetadata() {
        addMetadata(contractId, ColumnMetadata.named("contract_id").withIndex(1).ofType(Types.BIGINT).withSize(19).notNull());
        addMetadata(projectId, ColumnMetadata.named("project_id").withIndex(2).ofType(Types.BIGINT).withSize(19).notNull());
    }

}

