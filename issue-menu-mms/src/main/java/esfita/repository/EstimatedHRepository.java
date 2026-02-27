package esfita.repository;


import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;



import esfita.entity.EstimatedHHib;


@Repository
public interface EstimatedHRepository extends JpaRepository<EstimatedHHib, Integer>{

	
	@Query(value = "SELECT * FROM dbo.estimation_h e " +
            "WHERE e.location_fk = :locationFk " +
            "AND EXTRACT(YEAR FROM e.date) = :year " +
            "AND EXTRACT(MONTH FROM e.date) = :month", 
    nativeQuery = true)
List<EstimatedHHib> findAllByLocationAndMonthYear(
     @Param("locationFk") int locationFk, 
     @Param("year") int year,
     @Param("month") int month);

	@Query(value = "SELECT SUM(e.total_pob) AS total_pob, SUM(e.total_cost) AS total_cost " +
            "FROM dbo.estimation_h e " +
            "WHERE e.location_fk = :locationFk " +
            "AND EXTRACT(YEAR FROM e.date) = :year " +
            "AND EXTRACT(MONTH FROM e.date) = :month", 
    nativeQuery = true)
Object getSummaryTotalsNative(@Param("locationFk") int locationFk,
                           @Param("year") int year,
                           @Param("month") int month);
	@Query(value = "SELECT h.date, d.item_code, d.item_name, d.secondary_quantity " +
		       "FROM dbo.estimation_h h " +
		       "INNER JOIN dbo.estimation_d d ON d.estimation_h_fk = h.id " +
		       "WHERE h.location_fk = ?1 " +  // Use ?1 for positional parameter
		       "ORDER BY h.date", 
		       nativeQuery = true)
		List<Object[]> listOfEstimation(int locationFk);

		@Query(value = "SELECT \r\n" + 
				"	    COALESCE(c.category_group, '') as category_group,\r\n" + 
				"	    s.category_name,\r\n" + 
				"	    s.item_code,\r\n" + 
				"	    s.item_name,\r\n" + 
				"	    s.package_id,\r\n" + 
				"	    s.package_secondary_unit,\r\n" + 
				"	    COALESCE(s.available_qty, 0) as available_qty\r\n" + 
				"	FROM dbo.stock_table s \r\n" + 
				"	LEFT JOIN dbo.mst_item_category c \r\n" + 
				"       ON LOWER(c.category_name) = LOWER(s.category_name)", 
			       nativeQuery = true)
			List<Object[]> stockList();	
}
