package com.hu.cm.domain;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.hu.cm.domain.admin.Account;
import com.hu.cm.domain.admin.Role;
import com.hu.cm.domain.configuration.Address;
import org.hibernate.annotations.Cache;
import org.hibernate.annotations.CacheConcurrencyStrategy;

import javax.persistence.*;
import java.io.Serializable;
import java.math.BigDecimal;
import java.util.HashSet;
import java.util.Set;
import java.util.Objects;


/**
 * A ContractParty.
 */
@Entity
@Table(name = "MC_CONTRACT_PARTY")
@Cache(usage = CacheConcurrencyStrategy.NONSTRICT_READ_WRITE)
public class ContractParty implements Serializable {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long id;

    @Column(name = "name")
    private String name;

    @Column(name = "description")
    private String description;

    @Column(name = "registration_id")
    private String registration_id;

    @Column(name = "registered_capital", precision=10, scale=2)
    private BigDecimal registered_capital;

    @Column(name = "legal_representative")
    private String legal_representative;

    @Column(name = "registration_inspection_record")
    private String registration_inspection_record;

    @Column(name = "professional_certificate")
    private String professional_certificate;

    @Column(name = "business_certificate")
    private String business_certificate;

    @ManyToOne
    private Address address;

    @ManyToOne
    @JoinColumn(name="account_id")
    private Account account;

    @OneToMany(mappedBy = "owner")
    @JsonIgnore
    @Cache(usage = CacheConcurrencyStrategy.NONSTRICT_READ_WRITE)
    private Set<BankAccount> bank_accounts = new HashSet<>();

    @ManyToMany
    @JoinTable(name = "MC_CONTRACTPARTY_CONTRACT",
            joinColumns = { @JoinColumn(name = "contract_party_id") }, inverseJoinColumns = { @JoinColumn(name = "contract_id") })
    @JsonIgnore
    @Cache(usage = CacheConcurrencyStrategy.NONSTRICT_READ_WRITE)
    private Set<Contract> contracts = new HashSet<>();

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

    public String getRegistration_id() {
        return registration_id;
    }

    public void setRegistration_id(String registration_id) {
        this.registration_id = registration_id;
    }

    public BigDecimal getRegistered_capital() {
        return registered_capital;
    }

    public void setRegistered_capital(BigDecimal registered_capital) {
        this.registered_capital = registered_capital;
    }

    public String getLegal_representative() {
        return legal_representative;
    }

    public void setLegal_representative(String legal_representative) {
        this.legal_representative = legal_representative;
    }

    public String getRegistration_inspection_record() {
        return registration_inspection_record;
    }

    public void setRegistration_inspection_record(String registration_inspection_record) {
        this.registration_inspection_record = registration_inspection_record;
    }

    public String getProfessional_certificate() {
        return professional_certificate;
    }

    public void setProfessional_certificate(String professional_certificate) {
        this.professional_certificate = professional_certificate;
    }

    public String getBusiness_certificate() {
        return business_certificate;
    }

    public void setBusiness_certificate(String business_certificate) {
        this.business_certificate = business_certificate;
    }

    public Address getAddress() {
        return address;
    }

    public void setAddress(Address address) {
        this.address = address;
    }

    public Set<BankAccount> getBank_accounts() {
        return bank_accounts;
    }

    public void setBank_accounts(Set<BankAccount> bank_accounts) {
        this.bank_accounts = bank_accounts;
    }

    public Set<Contract> getContracts() {
        return contracts;
    }

    public void setContracts(Set<Contract> contracts) {
        this.contracts = contracts;
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

        ContractParty contract_party = (ContractParty) o;

        if ( ! Objects.equals(id, contract_party.id)) return false;

        return true;
    }

    @Override
    public int hashCode() {
        return Objects.hashCode(id);
    }

    @Override
    public String toString() {
        return "ContractParty{" +
                "id=" + id +
                ", name='" + name + "'" +
                ", description='" + description + "'" +
                ", registration_id='" + registration_id + "'" +
                ", registered_capital='" + registered_capital + "'" +
                ", legal_representative='" + legal_representative + "'" +
                ", registration_inspection_record='" + registration_inspection_record + "'" +
                ", professional_certificate='" + professional_certificate + "'" +
                ", business_certificate='" + business_certificate + "'" +
                '}';
    }
}
