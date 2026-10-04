package com.safety.backend.repository;

import com.safety.backend.model.Report;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ReportRepository extends JpaRepository<Report, Long> {

    Optional<Report> findByReportNumber(String reportNumber);

    List<Report> findByTypeOrderByCreatedAtDesc(String type);

    List<Report> findByStatusOrderByCreatedAtDesc(String status);

    List<Report> findByDivisionOrderByCreatedAtDesc(String division);

    List<Report> findAllByOrderByCreatedAtDesc();

    long countByType(String type);

    long countByStatus(String status);

}
