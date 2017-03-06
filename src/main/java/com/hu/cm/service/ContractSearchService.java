package com.hu.cm.service;

import com.hu.cm.domain.Contract;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.Map;

/**
 * Created by wenyaohu on 2/27/17.
 */
public interface ContractSearchService {
    Page<Contract> findBySearchTerm(String searchTerm, Pageable pageRequest, Long accountId);
    Map<String, Double> amountSumByMonth(Long accountId);
}
