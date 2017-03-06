package com.hu.cm.web.rest.dto;


import java.io.Serializable;
import java.util.Objects;


/**
 * A BankAccount.
 */

public class BankAccountDTO implements Serializable {

    private Long id;

    private String bank_name;

    private String account_name;

    private String account_number;

    private String account_owner;

    private Long owner_id;

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

    public String getAccount_owner() {
        return account_owner;
    }

    public void setAccount_owner(String account_owner) {
        this.account_owner = account_owner;
    }

    public Long getOwner_id() {
        return owner_id;
    }

    public void setOwner_id(Long owner_id) {
        this.owner_id = owner_id;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (o == null || getClass() != o.getClass()) {
            return false;
        }

        BankAccountDTO bank_account = (BankAccountDTO) o;

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
