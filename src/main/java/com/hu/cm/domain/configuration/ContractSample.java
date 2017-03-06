package com.hu.cm.domain.configuration;

import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import com.hu.cm.domain.util.CustomDateTimeDeserializer;
import com.hu.cm.domain.util.CustomDateTimeSerializer;
import org.hibernate.annotations.Cache;
import org.hibernate.annotations.CacheConcurrencyStrategy;
import org.hibernate.annotations.Type;
import org.joda.time.DateTime;

import javax.persistence.*;
import java.io.Serializable;
import java.util.Objects;


/**
 * A ContractSample.
 */
@Entity
@Table(name = "MC_CONTRACT_SAMPLE")
@Cache(usage = CacheConcurrencyStrategy.NONSTRICT_READ_WRITE)
public class ContractSample implements Serializable {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long id;

    @Column(name = "name")
    private String name;

    @Column(name = "description")
    private String description;

    @Column(name = "path")
    private String path;

    @Column(name = "file_name")
    private String file_name;

    @Column(name = "uploaded_by")
    private String uploaded_by;

    @Type(type = "org.jadira.usertype.dateandtime.joda.PersistentDateTime")
    @JsonSerialize(using = CustomDateTimeSerializer.class)
    @JsonDeserialize(using = CustomDateTimeDeserializer.class)
    @Column(name = "uploaded_date_time")
    private DateTime uploaded_date_time;

    @Type(type = "org.jadira.usertype.dateandtime.joda.PersistentDateTime")
    @JsonSerialize(using = CustomDateTimeSerializer.class)
    @JsonDeserialize(using = CustomDateTimeDeserializer.class)
    @Column(name = "modified_date_time")
    private DateTime modified_date_time;

    @Column(name = "revision")
    private Long revision;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getPath() {
        return path;
    }

    public void setPath(String path) {
        this.path = path;
    }

    public String getFile_name() {
        return file_name;
    }

    public void setFile_name(String file_name) {
        this.file_name = file_name;
    }

    public String getUploaded_by() {
        return uploaded_by;
    }

    public void setUploaded_by(String uploaded_by) {
        this.uploaded_by = uploaded_by;
    }

    public DateTime getUploaded_date_time() {
        return uploaded_date_time;
    }

    public void setUploaded_date_time(DateTime uploaded_date_time) {
        this.uploaded_date_time = uploaded_date_time;
    }

    public DateTime getModified_date_time() {
        return modified_date_time;
    }

    public void setModified_date_time(DateTime modified_date_time) {
        this.modified_date_time = modified_date_time;
    }

    public Long getRevision() {
        return revision;
    }

    public void setRevision(Long revision) {
        this.revision = revision;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (o == null || getClass() != o.getClass()) {
            return false;
        }

        ContractSample contract_sample = (ContractSample) o;

        if ( ! Objects.equals(id, contract_sample.id)) return false;

        return true;
    }

    @Override
    public int hashCode() {
        return Objects.hashCode(id);
    }

    @Override
    public String toString() {
        return "ContractSample{" +
                "id=" + id +
                ", name='" + name + "'" +
                ", description='" + description + "'" +
                ", path='" + path + "'" +
                ", file_name='" + file_name + "'" +
                ", uploaded_by='" + uploaded_by + "'" +
                ", uploaded_date_time='" + uploaded_date_time + "'" +
                ", modified_date_time='" + modified_date_time + "'" +
                ", revision='" + revision + "'" +
                '}';
    }
}
