package com.hu.cm.web.rest.dto;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.hu.cm.domain.Contract;
import com.hu.cm.domain.admin.User;
import org.hibernate.annotations.*;
import org.hibernate.validator.constraints.Email;

import javax.persistence.*;
import javax.persistence.Cache;
import javax.persistence.CascadeType;
import javax.validation.constraints.NotNull;
import javax.validation.constraints.Pattern;
import javax.validation.constraints.Size;
import java.util.HashSet;
import java.util.List;
import java.util.Objects;
import java.util.Set;

public class DepartmentDTO {

    private Long id;

    private String name;

    private String description;

    private String type;

    private Boolean active;

    private DepartmentDTO parentDepartment;

    private Set<UserDTO> employees = new HashSet<>();

    private Set<ContractDTO> relatedContracts = new HashSet<>();

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

    public Set<UserDTO> getEmployees() {
        return employees;
    }

    public void setEmployee(Set<UserDTO> employees) {
        this.employees = employees;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public DepartmentDTO getParentDepartment() {
        return parentDepartment;
    }

    public void setParentDepartment(DepartmentDTO parentDepartment) {
        this.parentDepartment = parentDepartment;
    }

    public Set<ContractDTO> getRelatedContracts() {
        return relatedContracts;
    }

    public void setRelatedContracts(Set<ContractDTO> relatedContracts) {
        this.relatedContracts = relatedContracts;
    }

    public DepartmentDTO (Long id){
        this.id = id;
    }

    @Override
    public String toString() {
        return "DepartmentDTO{" +
            "id=" + id +
            ", name='" + name + "'" +
            ", description='" + description + "'" +
            ", type='" + type + "'" +
            '}';
    }
}
