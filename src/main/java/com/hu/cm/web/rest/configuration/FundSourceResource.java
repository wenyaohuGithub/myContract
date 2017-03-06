package com.hu.cm.web.rest.configuration;

import com.codahale.metrics.annotation.Timed;
import com.hu.cm.domain.configuration.FundSource;
import com.hu.cm.repository.configuration.FundSourceRepository;
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
 * REST controller for managing FundSource.
 */
@RestController
@RequestMapping("/api")
public class FundSourceResource {

    private final Logger log = LoggerFactory.getLogger(FundSourceResource.class);

    @Inject
    private FundSourceRepository fund_sourceRepository;

    /**
     * POST  /fund_sources -> Create a new fund_source.
     */
    @RequestMapping(value = "/fund_sources",
            method = RequestMethod.POST,
            produces = MediaType.APPLICATION_JSON_VALUE)
    @Timed
    public ResponseEntity<FundSource> create(@Valid @RequestBody FundSource fund_source) throws URISyntaxException {
        log.debug("REST request to save FundSource : {}", fund_source);
        if (fund_source.getId() != null) {
            return ResponseEntity.badRequest().header("Failure", "A new fund_source cannot already have an ID").body(null);
        }
        FundSource result = fund_sourceRepository.save(fund_source);
        return ResponseEntity.created(new URI("/api/fund_sources/" + fund_source.getId())).body(result);
    }

    /**
     * PUT  /fund_sources -> Updates an existing fund_source.
     */
    @RequestMapping(value = "/fund_sources",
        method = RequestMethod.PUT,
        produces = MediaType.APPLICATION_JSON_VALUE)
    @Timed
    public ResponseEntity<FundSource> update(@Valid @RequestBody FundSource fund_source) throws URISyntaxException {
        log.debug("REST request to update FundSource : {}", fund_source);
        if (fund_source.getId() == null) {
            return create(fund_source);
        }
        FundSource result = fund_sourceRepository.save(fund_source);
        return ResponseEntity.ok().body(result);
    }

    /**
     * GET  /fund_sources -> get all the fund_sources.
     */
    @RequestMapping(value = "/fund_sources",
            method = RequestMethod.GET,
            produces = MediaType.APPLICATION_JSON_VALUE)
    @Timed
    public ResponseEntity<List<FundSource>> getAll(@RequestParam(value = "page" , required = false) Integer offset,
                                                   @RequestParam(value = "per_page", required = false) Integer limit)
        throws URISyntaxException {
        Page<FundSource> page = fund_sourceRepository.findAll(PaginationUtil.generatePageRequest(offset, limit));
        HttpHeaders headers = PaginationUtil.generatePaginationHttpHeaders(page, "/api/fund_sources", offset, limit);
        return new ResponseEntity<>(page.getContent(), headers, HttpStatus.OK);
    }

    /**
     * GET  /fund_sources/:id -> get the "id" fund_source.
     */
    @RequestMapping(value = "/fund_sources/{id}",
            method = RequestMethod.GET,
            produces = MediaType.APPLICATION_JSON_VALUE)
    @Timed
    public ResponseEntity<FundSource> get(@PathVariable Long id) {
        log.debug("REST request to get FundSource : {}", id);
        return Optional.ofNullable(fund_sourceRepository.findOne(id))
            .map(fund_source -> new ResponseEntity<>(
                fund_source,
                HttpStatus.OK))
            .orElse(new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }

    /**
     * DELETE  /fund_sources/:id -> delete the "id" fund_source.
     */
    @RequestMapping(value = "/fund_sources/{id}",
            method = RequestMethod.DELETE,
            produces = MediaType.APPLICATION_JSON_VALUE)
    @Timed
    public void delete(@PathVariable Long id) {
        log.debug("REST request to delete FundSource : {}", id);
        fund_sourceRepository.delete(id);
    }
}
