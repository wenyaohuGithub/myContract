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
 * QMcUser is a Querydsl query type for QMcUser
 */
@Generated("com.mysema.query.sql.codegen.MetaDataSerializer")
public class QMcUser extends com.mysema.query.sql.RelationalPathBase<QMcUser> {

    private static final long serialVersionUID = 640308408;

    public static final QMcUser mcUser = new QMcUser("mc_user");

    public final BooleanPath activated = createBoolean("activated");

    public final StringPath activationKey = createString("activationKey");

    public final StringPath createdBy = createString("createdBy");

    public final DateTimePath<java.sql.Timestamp> createdDate = createDateTime("createdDate", java.sql.Timestamp.class);

    public final NumberPath<Long> departmentId = createNumber("departmentId", Long.class);

    public final StringPath email = createString("email");

    public final StringPath firstName = createString("firstName");

    public final NumberPath<Long> id = createNumber("id", Long.class);

    public final StringPath langKey = createString("langKey");

    public final StringPath lastModifiedBy = createString("lastModifiedBy");

    public final DateTimePath<java.sql.Timestamp> lastModifiedDate = createDateTime("lastModifiedDate", java.sql.Timestamp.class);

    public final StringPath lastName = createString("lastName");

    public final StringPath login = createString("login");

    public final StringPath password = createString("password");

    public final DateTimePath<java.sql.Timestamp> resetDate = createDateTime("resetDate", java.sql.Timestamp.class);

    public final StringPath resetKey = createString("resetKey");

    public final BooleanPath system = createBoolean("system");

    public final com.mysema.query.sql.PrimaryKey<QMcUser> mcUserPk = createPrimaryKey(id);

    public final com.mysema.query.sql.ForeignKey<QMcDepartment> departmentIdFk = createForeignKey(departmentId, "id");

    public final com.mysema.query.sql.ForeignKey<QMcContract> _assigneeIdFk = createInvForeignKey(id, "assignee_id");

    public final com.mysema.query.sql.ForeignKey<QMcTask> _taskPerformerIdFk = createInvForeignKey(id, "performed_by");

    public final com.mysema.query.sql.ForeignKey<QMcUserAccount> _useraccountUserIdFk = createInvForeignKey(id, "user_id");

    public final com.mysema.query.sql.ForeignKey<QMcContract> _contractAdministratorIdFk = createInvForeignKey(id, "administrator_id");

    public final com.mysema.query.sql.ForeignKey<QMcContract> _modifiedByUserIdFk = createInvForeignKey(id, "modified_by");

    public final com.mysema.query.sql.ForeignKey<QMcContractHistory> _contractHistoryUserIdFk = createInvForeignKey(id, "user_id");

    public final com.mysema.query.sql.ForeignKey<QMcContract> _contractAuthorIdIdFk = createInvForeignKey(id, "author_id");

    public final com.mysema.query.sql.ForeignKey<QMcTask> _taskAssigneeIdFk = createInvForeignKey(id, "assigned_to");

    public final com.mysema.query.sql.ForeignKey<QMcMessage> _messageRecipientIdFk = createInvForeignKey(id, "recipient_id");

    public final com.mysema.query.sql.ForeignKey<QMcMessage> _messageSenderIdFk = createInvForeignKey(id, "sender_id");

    public QMcUser(String variable) {
        super(QMcUser.class, forVariable(variable), "public", "mc_user");
        addMetadata();
    }

    public QMcUser(String variable, String schema, String table) {
        super(QMcUser.class, forVariable(variable), schema, table);
        addMetadata();
    }

    public QMcUser(Path<? extends QMcUser> path) {
        super(path.getType(), path.getMetadata(), "public", "mc_user");
        addMetadata();
    }

    public QMcUser(PathMetadata<?> metadata) {
        super(QMcUser.class, metadata, "public", "mc_user");
        addMetadata();
    }

    public void addMetadata() {
        addMetadata(activated, ColumnMetadata.named("activated").withIndex(7).ofType(Types.BIT).withSize(1).notNull());
        addMetadata(activationKey, ColumnMetadata.named("activation_key").withIndex(11).ofType(Types.VARCHAR).withSize(20));
        addMetadata(createdBy, ColumnMetadata.named("created_by").withIndex(13).ofType(Types.VARCHAR).withSize(50));
        addMetadata(createdDate, ColumnMetadata.named("created_date").withIndex(14).ofType(Types.TIMESTAMP).withSize(29).withDigits(6));
        addMetadata(departmentId, ColumnMetadata.named("department_id").withIndex(8).ofType(Types.BIGINT).withSize(19));
        addMetadata(email, ColumnMetadata.named("email").withIndex(6).ofType(Types.VARCHAR).withSize(100));
        addMetadata(firstName, ColumnMetadata.named("first_name").withIndex(4).ofType(Types.VARCHAR).withSize(50));
        addMetadata(id, ColumnMetadata.named("id").withIndex(1).ofType(Types.BIGINT).withSize(19).notNull());
        addMetadata(langKey, ColumnMetadata.named("lang_key").withIndex(10).ofType(Types.VARCHAR).withSize(5));
        addMetadata(lastModifiedBy, ColumnMetadata.named("last_modified_by").withIndex(16).ofType(Types.VARCHAR).withSize(50));
        addMetadata(lastModifiedDate, ColumnMetadata.named("last_modified_date").withIndex(17).ofType(Types.TIMESTAMP).withSize(29).withDigits(6));
        addMetadata(lastName, ColumnMetadata.named("last_name").withIndex(5).ofType(Types.VARCHAR).withSize(50));
        addMetadata(login, ColumnMetadata.named("login").withIndex(2).ofType(Types.VARCHAR).withSize(50).notNull());
        addMetadata(password, ColumnMetadata.named("password").withIndex(3).ofType(Types.VARCHAR).withSize(60));
        addMetadata(resetDate, ColumnMetadata.named("reset_date").withIndex(15).ofType(Types.TIMESTAMP).withSize(29).withDigits(6));
        addMetadata(resetKey, ColumnMetadata.named("reset_key").withIndex(12).ofType(Types.VARCHAR).withSize(20));
        addMetadata(system, ColumnMetadata.named("system").withIndex(9).ofType(Types.BIT).withSize(1));
    }

}

