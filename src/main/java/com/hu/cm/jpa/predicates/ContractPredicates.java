package com.hu.cm.jpa.predicates;

import com.hu.cm.domain.QContract;
import com.mysema.query.types.Predicate;
import org.joda.time.DateTime;

import java.math.BigDecimal;

public final class ContractPredicates {

    private ContractPredicates() {}

    public static Predicate nameContainsIgnoreCase(String searchTerm) {
        if (searchTerm == null || searchTerm.isEmpty()) {
            return QContract.contract.isNotNull();
        } else {
            return QContract.contract.name.containsIgnoreCase(searchTerm);
        }
    }

    public static Predicate contractPartyIdMatches(Long contractPartyId){
        if(contractPartyId == null){
            return QContract.contract.isNotNull();
        } else {
            return QContract.contract.contractParty.id.eq(contractPartyId);
        }
    }

    public static Predicate amountBetween(BigDecimal amount1, BigDecimal amount2){
        if(amount1 != null && amount2 != null){
            return QContract.contract.amount.between(amount1, amount2);
        } else {
            return QContract.contract.isNotNull();
        }
    }

    public static Predicate signDateBetween(DateTime signDate1, DateTime signDate2){
        if(signDate1 != null && signDate2 != null){
            return QContract.contract.signDate.between(signDate1, signDate2);
        } else {
            return QContract.contract.isNotNull();
        }
    }

    public static Predicate signDateOnOrEarlier(DateTime signDateTo){
        if(signDateTo == null){
            return QContract.contract.isNotNull();
        } else {
            return QContract.contract.signDate.before(signDateTo).or(QContract.contract.signDate.eq(signDateTo));
        }
    }

    public static Predicate signDateOnOrLater(DateTime signDateFrom){
        if(signDateFrom == null){
            return QContract.contract.isNotNull();
        } else {
            return QContract.contract.signDate.after(signDateFrom).or(QContract.contract.signDate.eq(signDateFrom));
        }
    }

    public static Predicate amountEqualOrLess(BigDecimal amountTo){
        if(amountTo == null){
            return QContract.contract.isNotNull();
        } else {
            return QContract.contract.amount.lt(amountTo).or(QContract.contract.amount.eq(amountTo));
        }
    }

    public static Predicate amountEqualOrMore(BigDecimal amountFrom){
        if(amountFrom == null){
            return QContract.contract.isNotNull();
        } else {
            return QContract.contract.amount.gt(amountFrom).or(QContract.contract.amount.eq(amountFrom));
        }
    }

    public static Predicate accountIdEq(Long accountId){
        if(accountId == null){
            return QContract.contract.isNotNull();
        } else {
            return QContract.contract.account.id.eq(accountId);
        }
    }
}
