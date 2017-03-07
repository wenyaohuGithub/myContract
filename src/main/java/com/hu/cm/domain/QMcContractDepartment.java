package com.hu.cm.domain;

import com.mysema.query.sql.ColumnMetadata;
import com.mysema.query.types.Path;
import com.mysema.query.types.PathMetadata;
import com.mysema.query.types.path.NumberPath;

import javax.annotation.Generated;
import java.sql.Types;

import static com.mysema.query.types.PathMetadataFactory.forVariable;


/**
 * QMcContractDepartment is a Querydsl query type for QMcContractDepartment
 */
@Generated("com.mysema.query.sql.codegen.MetaDataSerializer")
public class QMcContractDepartment extends com.mysema.query.sql.RelationalPathBase<QMcContractDepartment> {

    private static final long serialVersionUID = 1162299441;

    public static final QMcContractDepartment mcContractDepartment = new QMcContractDepartment("mc_contract_department");

    public final NumberPath<Long> contractId = createNumber("contractId", Long.class);

    public final NumberPath<Long> departmentId = createNumber("departmentId", Long.class);

    public final com.mysema.query.sql.ForeignKey<QMcContract> contractDepartmentContractIdFk = createForeignKey(contractId, "id");

    public final com.mysema.query.sql.ForeignKey<QMcDepartment> contractDepartmentDepartmentIdFk = createForeignKey(departmentId, "id");

    public QMcContractDepartment(String variable) {
        super(QMcContractDepartment.class, forVariable(variable), "public", "mc_contract_department");
        addMetadata();
    }

    public QMcContractDepartment(String variable, String schema, String table) {
        super(QMcContractDepartment.class, forVariable(variable), schema, table);
        addMetadata();
    }

    public QMcContractDepartment(Path<? extends QMcContractDepartment> path) {
        super(path.getType(), path.getMetadata(), "public", "mc_contract_department");
        addMetadata();
    }

    public QMcContractDepartment(PathMetadata<?> metadata) {
        super(QMcContractDepartment.class, metadata, "public", "mc_contract_department");
        addMetadata();
    }

    public void addMetadata() {
        addMetadata(contractId, ColumnMetadata.named("contract_id").withIndex(1).ofType(Types.BIGINT).withSize(19).notNull());
        addMetadata(departmentId, ColumnMetadata.named("department_id").withIndex(2).ofType(Types.BIGINT).withSize(19).notNull());
    }

}

