package com.hu.cm.service;

import com.hu.cm.domain.Contract;
import com.hu.cm.domain.QMcContract;
import com.hu.cm.repository.ContractRepository;
import com.hu.cm.service.util.SearchFieldUtil;
import com.mysema.query.group.GroupBy;
import com.mysema.query.sql.PostgresTemplates;
import com.mysema.query.sql.SQLTemplates;
import com.mysema.query.jpa.sql.JPASQLQuery;
import com.mysema.query.support.Expressions;
import com.mysema.query.types.ExpressionUtils;
import com.mysema.query.types.OrderSpecifier;
import com.mysema.query.types.Predicate;
import org.joda.time.format.DateTimeFormat;
import org.joda.time.format.DateTimeFormatter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import javax.persistence.EntityManager;
import javax.persistence.PersistenceContext;
import java.math.BigDecimal;
import java.util.Map;

import static com.hu.cm.jpa.predicates.ContractPredicates.*;

@Service
public final  class RepositoryContractService implements ContractSearchService {
    private final DateTimeFormatter fmt = DateTimeFormat.forPattern("yyyy-MM-dd");

    private final ContractRepository repository;

    @Autowired
    public RepositoryContractService(ContractRepository repository) {
        this.repository = repository;
    }

    @PersistenceContext
    private EntityManager entityManager;

    @Transactional(readOnly = true)
    @Override
    public Page<Contract> findBySearchTerm(String searchTerm, Pageable pageRequest, Long accountId) {
        //Search fields: name, ContractParty, amount between amount1 and amount2, signed date between signDate1 and signDate2
        //name:abc;contractPartyId:1;amount1:2345;amount2:3455;signDate1:xxxx;signDate2:xxxx
        Predicate searchPred = null;
        Map<String, String> searchFields = SearchFieldUtil.parseSearchField(searchTerm);
        for (String key : searchFields.keySet()) {
            String value = searchFields.get(key);
            if(key.equals("name")){
                searchPred = ExpressionUtils.allOf(searchPred, nameContainsIgnoreCase(value));
            } else if(key.equals("contractPartyId")){
                searchPred = ExpressionUtils.allOf(searchPred, contractPartyIdMatches(Long.parseLong(value)));
            } else if(key.equals("amount1")) {
                searchPred = ExpressionUtils.allOf(searchPred, amountEqualOrMore(new BigDecimal(value)));
            } else if(key.equals("amount2")) {
                searchPred = ExpressionUtils.allOf(searchPred, amountEqualOrLess(new BigDecimal(value)));
            } else if(key.equals("signDate1")) {
                searchPred = ExpressionUtils.allOf(searchPred, signDateOnOrLater(fmt.parseDateTime(value)));
            } else if(key.equals("signDate2")) {
                searchPred = ExpressionUtils.allOf(searchPred, signDateOnOrEarlier(fmt.parseDateTime(value)));
            }
        }
        searchPred = ExpressionUtils.allOf(searchPred, accountIdEq(accountId));
        Page<Contract> searchResults = repository.findAll(searchPred, pageRequest);
        return searchResults;
    }

    private OrderSpecifier<String> orderByNameAsc(){
        return QContract.contract.name.asc();
    }

    @Override
    public Map<String, Double> amountSumByMonth(Long accountId){
        SQLTemplates templates = new PostgresTemplates();
        QAccount account = QAccount.account;
        QMcContract contract = QMcContract.mcContract;
        JPASQLQuery query = new JPASQLQuery(entityManager, templates);

        Map<String,Double> results = (Map<String, Double>)query.from(contract)
                .innerJoin(account).on(account.id.eq(contract.accountId)).where(account.id.eq(accountId))
                        .transform(GroupBy.groupBy(Expressions.stringTemplate("date_trunc({0}, {1})", "month", contract.startDate))
                                .as(GroupBy.sum(contract.amount)));
        return results;
    }
}
