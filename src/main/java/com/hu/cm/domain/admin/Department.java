package com.hu.cm.domain.admin;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.hu.cm.domain.Contract;
import com.hu.cm.domain.enumeration.DepartmentType;
import org.hibernate.annotations.Cache;
import org.hibernate.annotations.CacheConcurrencyStrategy;

import javax.persistence.*;
import java.io.Serializable;
import java.util.HashSet;
import java.util.Set;
import java.util.Objects;


/**
 * A Department.
 */
@Entity
@Table(name = "MC_DEPARTMENT")
@Cache(usage = CacheConcurrencyStrategy.NONSTRICT_READ_WRITE)
public class Department implements Serializable {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long id;

    @Column(name = "name")
    private String name;

    @Column(name = "description")
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(name = "type")
    private DepartmentType type;

    @Column(name = "active")
    private Boolean active;

    @ManyToOne
    @JoinColumn(name="account_id")
    private Account account;

    @ManyToOne(cascade={CascadeType.ALL})
    @JoinColumn(name="parent_id")
    private Department parentDepartment;

    @OneToMany(mappedBy = "departmentId")
    @JsonIgnore
    @Cache(usage = CacheConcurrencyStrategy.NONSTRICT_READ_WRITE)
    private Set<User> employees = new HashSet<>();

    @ManyToMany
    @JoinTable(name = "MC_CONTRACT_DEPARTMENT",
            joinColumns = { @JoinColumn(name = "DEPARTMENT_ID") }, inverseJoinColumns = { @JoinColumn(name = "CONTRACT_ID") })
    @JsonIgnore
    @Cache(usage = CacheConcurrencyStrategy.NONSTRICT_READ_WRITE)
    private Set<Contract> relatedContracts = new HashSet<>();

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

    public Set<User> getEmployees() {
        return employees;
    }

    public void setEmployee(Set<User> employees) {
        this.employees = employees;
    }

    public DepartmentType getType() {
        return type;
    }

    public void setType(DepartmentType type) {
        this.type = type;
    }

    public Department getParentDepartment() {
        return parentDepartment;
    }

    public void setParentDepartment(Department parentDepartment) {
        this.parentDepartment = parentDepartment;
    }

    public Set<Contract> getRelatedContracts() {
        return relatedContracts;
    }

    public void setRelatedContracts(Set<Contract> relatedContracts) {
        this.relatedContracts = relatedContracts;
    }

    public Account getAccount() {
        return account;
    }

    public void setAccount(Account account) {
        this.account = account;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (o == null || getClass() != o.getClass()) {
            return false;
        }

        Department department = (Department) o;

        if ( ! Objects.equals(id, department.id)) return false;

        return true;
    }

    @Override
    public int hashCode() {
        return Objects.hashCode(id);
    }

    @Override
    public String toString() {
        return "Department{" +
                "id=" + id +
                ", name='" + name + "'" +
                ", description='" + description + "'" +
                ", type='" + type + "'" +
                '}';
    }
}
