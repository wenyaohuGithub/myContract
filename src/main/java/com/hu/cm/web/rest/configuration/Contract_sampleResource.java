package com.hu.cm.web.rest.configuration;

import com.codahale.metrics.annotation.Timed;
import com.hu.cm.domain.configuration.ContractSample;
import com.hu.cm.repository.configuration.Contract_sampleRepository;
import com.hu.cm.web.rest.util.PaginationUtil;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import javax.inject.Inject;
import javax.validation.Valid;
import java.net.URI;
import java.net.URISyntaxException;
import java.util.List;
import java.util.Optional;

/**
 * REST controller for managing ContractSample.
 */
@RestController
@RequestMapping("/api/config")
public class Contract_sampleResource {

    private final Logger log = LoggerFactory.getLogger(Contract_sampleResource.class);

    @Inject
    private Contract_sampleRepository contract_sampleRepository;

    /**
     * POST  /contract_samples -> Create a new contract_sample.
     */
    @RequestMapping(value = "/contract_samples",
            method = RequestMethod.POST,
            produces = MediaType.APPLICATION_JSON_VALUE)
    @Timed
    public ResponseEntity<ContractSample> create(@Valid @RequestBody ContractSample contract_sample) throws URISyntaxException {
        log.debug("REST request to save ContractSample : {}", contract_sample);
        if (contract_sample.getId() != null) {
            return ResponseEntity.badRequest().header("Failure", "A new contract_sample cannot already have an ID").body(null);
        }
        ContractSample result = contract_sampleRepository.save(contract_sample);
        return ResponseEntity.created(new URI("/api/contract_samples/" + contract_sample.getId())).body(result);
    }

    /**
     * PUT  /contract_samples -> Updates an existing contract_sample.
     */
    @RequestMapping(value = "/contract_samples",
        method = RequestMethod.PUT,
        produces = MediaType.APPLICATION_JSON_VALUE)
    @Timed
    public ResponseEntity<ContractSample> update(@Valid @RequestBody ContractSample contract_sample) throws URISyntaxException {
        log.debug("REST request to update ContractSample : {}", contract_sample);
        if (contract_sample.getId() == null) {
            return create(contract_sample);
        }
        ContractSample result = contract_sampleRepository.save(contract_sample);
        return ResponseEntity.ok().body(result);
    }

    /**
     * GET  /contract_samples -> get all the contract_samples.
     */
    @RequestMapping(value = "/contract_samples",
            method = RequestMethod.GET,
            produces = MediaType.APPLICATION_JSON_VALUE)
    @Timed
    public ResponseEntity<List<ContractSample>> getAll(@RequestParam(value = "page" , required = false) Integer offset,
                                                       @RequestParam(value = "per_page", required = false) Integer limit)
        throws URISyntaxException {
        Page<ContractSample> page = contract_sampleRepository.findAll(PaginationUtil.generatePageRequest(offset, limit));
        HttpHeaders headers = PaginationUtil.generatePaginationHttpHeaders(page, "/api/contract_samples", offset, limit);
        return new ResponseEntity<>(page.getContent(), headers, HttpStatus.OK);
    }

    /**
     * GET  /contract_samples/:id -> get the "id" contract_sample.
     */
    @RequestMapping(value = "/contract_samples/{id}",
            method = RequestMethod.GET,
            produces = MediaType.APPLICATION_JSON_VALUE)
    @Timed
    public ResponseEntity<ContractSample> get(@PathVariable Long id) {
        log.debug("REST request to get ContractSample : {}", id);
        return Optional.ofNullable(contract_sampleRepository.findOne(id))
            .map(contract_sample -> new ResponseEntity<>(
                contract_sample,
                HttpStatus.OK))
            .orElse(new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }

    /**
     * DELETE  /contract_samples/:id -> delete the "id" contract_sample.
     */
    @RequestMapping(value = "/contract_samples/{id}",
            method = RequestMethod.DELETE,
            produces = MediaType.APPLICATION_JSON_VALUE)
    @Timed
    public void delete(@PathVariable Long id) {
        log.debug("REST request to delete ContractSample : {}", id);
        contract_sampleRepository.delete(id);
    }
}
