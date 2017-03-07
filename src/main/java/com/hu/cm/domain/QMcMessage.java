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
 * QMcMessage is a Querydsl query type for QMcMessage
 */
@Generated("com.mysema.query.sql.codegen.MetaDataSerializer")
public class QMcMessage extends com.mysema.query.sql.RelationalPathBase<QMcMessage> {

    private static final long serialVersionUID = -1714793478;

    public static final QMcMessage mcMessage = new QMcMessage("mc_message");

    public final StringPath content = createString("content");

    public final NumberPath<Long> id = createNumber("id", Long.class);

    public final BooleanPath read = createBoolean("read");

    public final NumberPath<Long> recipientId = createNumber("recipientId", Long.class);

    public final DateTimePath<java.sql.Timestamp> sendDatetime = createDateTime("sendDatetime", java.sql.Timestamp.class);

    public final NumberPath<Long> senderId = createNumber("senderId", Long.class);

    public final StringPath subject = createString("subject");

    public final NumberPath<Long> taskId = createNumber("taskId", Long.class);

    public final com.mysema.query.sql.PrimaryKey<QMcMessage> mcMessagePk = createPrimaryKey(id);

    public final com.mysema.query.sql.ForeignKey<QMcTask> messageTaskIdFk = createForeignKey(taskId, "id");

    public final com.mysema.query.sql.ForeignKey<QMcUser> messageRecipientIdFk = createForeignKey(recipientId, "id");

    public final com.mysema.query.sql.ForeignKey<QMcUser> messageSenderIdFk = createForeignKey(senderId, "id");

    public QMcMessage(String variable) {
        super(QMcMessage.class, forVariable(variable), "public", "mc_message");
        addMetadata();
    }

    public QMcMessage(String variable, String schema, String table) {
        super(QMcMessage.class, forVariable(variable), schema, table);
        addMetadata();
    }

    public QMcMessage(Path<? extends QMcMessage> path) {
        super(path.getType(), path.getMetadata(), "public", "mc_message");
        addMetadata();
    }

    public QMcMessage(PathMetadata<?> metadata) {
        super(QMcMessage.class, metadata, "public", "mc_message");
        addMetadata();
    }

    public void addMetadata() {
        addMetadata(content, ColumnMetadata.named("content").withIndex(3).ofType(Types.VARCHAR).withSize(255));
        addMetadata(id, ColumnMetadata.named("id").withIndex(1).ofType(Types.BIGINT).withSize(19).notNull());
        addMetadata(read, ColumnMetadata.named("read").withIndex(5).ofType(Types.BIT).withSize(1));
        addMetadata(recipientId, ColumnMetadata.named("recipient_id").withIndex(7).ofType(Types.BIGINT).withSize(19));
        addMetadata(sendDatetime, ColumnMetadata.named("send_datetime").withIndex(4).ofType(Types.TIMESTAMP).withSize(29).withDigits(6));
        addMetadata(senderId, ColumnMetadata.named("sender_id").withIndex(6).ofType(Types.BIGINT).withSize(19));
        addMetadata(subject, ColumnMetadata.named("subject").withIndex(2).ofType(Types.VARCHAR).withSize(255));
        addMetadata(taskId, ColumnMetadata.named("task_id").withIndex(8).ofType(Types.BIGINT).withSize(19));
    }

}

