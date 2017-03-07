package com.hu.cm.domain;

import com.mysema.query.sql.ColumnMetadata;
import com.mysema.query.types.Path;
import com.mysema.query.types.PathMetadata;
import com.mysema.query.types.path.NumberPath;
import com.mysema.query.types.path.StringPath;

import javax.annotation.Generated;
import java.sql.Types;

import static com.mysema.query.types.PathMetadataFactory.forVariable;


/**
 * QMcCategory is a Querydsl query type for QMcCategory
 */
@Generated("com.mysema.query.sql.codegen.MetaDataSerializer")
public class QMcCategory extends com.mysema.query.sql.RelationalPathBase<QMcCategory> {

    private static final long serialVersionUID = -1106385045;

    public static final QMcCategory mcCategory = new QMcCategory("mc_category");

    public final NumberPath<Long> accountId = createNumber("accountId", Long.class);

    public final StringPath description = createString("description");

    public final NumberPath<Long> id = createNumber("id", Long.class);

    public final StringPath name = createString("name");

    public final NumberPath<Long> parentCategoryId = createNumber("parentCategoryId", Long.class);

    public final NumberPath<Long> workflowId = createNumber("workflowId", Long.class);

    public final com.mysema.query.sql.PrimaryKey<QMcCategory> mcCategoryPk = createPrimaryKey(id);

    public final com.mysema.query.sql.ForeignKey<QMcWorkflow> categoryWorkflowIdFk = createForeignKey(workflowId, "id");

    public final com.mysema.query.sql.ForeignKey<QMcCategory> categoryParentCategoryIdFk = createForeignKey(parentCategoryId, "id");

    public final com.mysema.query.sql.ForeignKey<QMcContract> _contractCategoryIdFk = createInvForeignKey(id, "category_id");

    public final com.mysema.query.sql.ForeignKey<QMcCategory> _categoryParentCategoryIdFk = createInvForeignKey(id, "parent_category_id");

    public QMcCategory(String variable) {
        super(QMcCategory.class, forVariable(variable), "public", "mc_category");
        addMetadata();
    }

    public QMcCategory(String variable, String schema, String table) {
        super(QMcCategory.class, forVariable(variable), schema, table);
        addMetadata();
    }

    public QMcCategory(Path<? extends QMcCategory> path) {
        super(path.getType(), path.getMetadata(), "public", "mc_category");
        addMetadata();
    }

    public QMcCategory(PathMetadata<?> metadata) {
        super(QMcCategory.class, metadata, "public", "mc_category");
        addMetadata();
    }

    public void addMetadata() {
        addMetadata(accountId, ColumnMetadata.named("account_id").withIndex(6).ofType(Types.BIGINT).withSize(19));
        addMetadata(description, ColumnMetadata.named("description").withIndex(3).ofType(Types.VARCHAR).withSize(255));
        addMetadata(id, ColumnMetadata.named("id").withIndex(1).ofType(Types.BIGINT).withSize(19).notNull());
        addMetadata(name, ColumnMetadata.named("name").withIndex(2).ofType(Types.VARCHAR).withSize(255));
        addMetadata(parentCategoryId, ColumnMetadata.named("parent_category_id").withIndex(4).ofType(Types.BIGINT).withSize(19));
        addMetadata(workflowId, ColumnMetadata.named("workflow_id").withIndex(5).ofType(Types.BIGINT).withSize(19));
    }

}

