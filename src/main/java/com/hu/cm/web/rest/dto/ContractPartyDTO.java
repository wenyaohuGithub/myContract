package com.hu.cm.web.rest.dto;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.hu.cm.domain.BankAccount;
import com.hu.cm.domain.Category;
import com.hu.cm.domain.Contract;
import com.hu.cm.domain.ContractParty;
import com.hu.cm.domain.admin.User;
import com.hu.cm.domain.configuration.Address;
import com.hu.cm.domain.configuration.ContractSample;
import com.hu.cm.domain.configuration.FundSource;
import com.hu.cm.domain.enumeration.ContractStatus;
import com.hu.cm.domain.enumeration.ContractingMethod;
import com.hu.cm.domain.enumeration.Currency;
import com.hu.cm.domain.enumeration.ProcessState;
import org.hibernate.annotations.Cache;
import org.hibernate.annotations.CacheConcurrencyStrategy;
import org.joda.time.DateTime;

import javax.persistence.Column;
import javax.persistence.ManyToMany;
import javax.persistence.ManyToOne;
import javax.persistence.OneToMany;
import java.math.BigDecimal;
import java.util.HashSet;
import java.util.Objects;
import java.util.Set;

public class ContractPartyDTO {
    private Long id;

    private String name;

    private String description;

    private String registration_id;

    private BigDecimal registered_capital;

    private String legal_representative;

    private String registration_inspection_record;

    private String professional_certificate;

    private String business_certificate;

    private Address address;


    private Set<BankAccount> bank_accounts = new HashSet<>();

    private Set<ContractDTO> contracts = new HashSet<>();

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

    public Set<ContractDTO> getContracts() {
        return contracts;
    }

    public void setContracts(Set<ContractDTO> contracts) {
        this.contracts = contracts;
    }

    public ContractPartyDTO(Long id){
        this.id = id;
    }

    public ContractPartyDTO(String name) { this.name = name; }

    @Override
    public String toString() {
        return "ContractPartyDTO{" +
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
