package com.hu.cm.domain;

import org.hibernate.annotations.Cache;
import org.hibernate.annotations.CacheConcurrencyStrategy;

import javax.persistence.*;
import java.io.Serializable;
import java.util.Objects;


/**
 * A BankAccount.
 */
@Entity
@Table(name = "MC_BANK_ACCOUNT")
@Cache(usage = CacheConcurrencyStrategy.NONSTRICT_READ_WRITE)
public class BankAccount implements Serializable {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long id;

    @Column(name = "bank_name")
    private String bank_name;

    @Column(name = "account_name")
    private String account_name;

    @Column(name = "account_number")
    private String account_number;

    @ManyToOne
    @JoinColumn(name="owner_id")
    private ContractParty owner;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getBank_name() {
        return bank_name;
    }

    public void setBank_name(String bank_name) {
        this.bank_name = bank_name;
    }

    public String getAccount_name() {
        return account_name;
    }

    public void setAccount_name(String account_name) {
        this.account_name = account_name;
    }

    public String getAccount_number() {
        return account_number;
    }

    public void setAccount_number(String account_number) {
        this.account_number = account_number;
    }

    public ContractParty getOwner() {
        return owner;
    }

    public void setOwner(ContractParty owner) {
        this.owner = owner;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (o == null || getClass() != o.getClass()) {
            return false;
        }

        BankAccount bank_account = (BankAccount) o;

        if ( ! Objects.equals(id, bank_account.id)) return false;

        return true;
    }

    @Override
    public int hashCode() {
        return Objects.hashCode(id);
    }

    @Override
    public String toString() {
        return "BankAccount{" +
                "id=" + id +
                ", bank_name='" + bank_name + "'" +
                ", account_name='" + account_name + "'" +
                ", account_number='" + account_number + "'" +
                '}';
    }
}
