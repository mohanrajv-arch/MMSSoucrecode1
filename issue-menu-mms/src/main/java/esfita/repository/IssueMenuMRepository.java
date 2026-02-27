package esfita.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import esfita.entity.IssueMenuMHib;

@Repository
public interface IssueMenuMRepository extends JpaRepository<IssueMenuMHib, Integer> {

	List<IssueMenuMHib> findByLocationFk(Integer locationFk);

	@Query(value = "SELECT * FROM dbo.issue_menu_m m " + "WHERE m.location_fk = :locationFk AND m.issue_status = 3 "
			+ "AND ((:singleDate IS NOT NULL AND m.menu_date = CAST(:singleDate AS varchar)) "
			+ "OR (:singleDate IS NULL AND :fromDate IS NOT NULL AND m.menu_date BETWEEN CAST(:fromDate AS varchar) AND CAST(:toDate AS varchar))) "
			+ "ORDER BY m.id", nativeQuery = true)

	List<IssueMenuMHib> findMenus(@Param("locationFk") int locationFk, @Param("singleDate") String singleDate,
			@Param("fromDate") String fromDate, @Param("toDate") String toDate);

	@Query(value = "SELECT * FROM dbo.issue_menu_m m " + "WHERE m.location_fk = :locationFk "
			+ "ORDER BY m.id", nativeQuery = true)

	List<IssueMenuMHib> findMenusByLocatioFk(@Param("locationFk") int locationFk);

	@Query("SELECT i FROM IssueMenuMHib i WHERE i.finalMenuFk = :menuFk")
	IssueMenuMHib findByMenuFk(@Param("menuFk") int menuFk);

	@Query("SELECT i FROM IssueMenuMHib i WHERE i.id = :id")
	IssueMenuMHib findById(@Param("id") int id);

	@Query("SELECT i.pob, i.total FROM IssueMenuMHib i WHERE i.id IN :ids")
	List<Object[]> findPobAndCostByIds(@Param("ids") List<Integer> ids);

	@Query(value = """
			    SELECT menu_date, pob, total
			    FROM dbo.issue_menu_m
			    WHERE id IN (:ids)
			""", nativeQuery = true)
	List<Object[]> findDetailsByIds(@Param("ids") List<Integer> ids);

}
