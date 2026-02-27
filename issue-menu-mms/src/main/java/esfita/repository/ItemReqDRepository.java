package esfita.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;



import esfita.entity.ItemReqDHib;

@Repository
public interface ItemReqDRepository extends JpaRepository<ItemReqDHib, Integer> {
	@Query(value = "SELECT COUNT(DISTINCT item_code) " + "FROM dbo.item_req_d "
			+ "WHERE header_fk = :id", nativeQuery = true)
	Integer uniqueItemCountByMenuM(@Param("id") int id);

	@Query("SELECT i FROM ItemReqDHib i WHERE i.headerFk = :headerFk ")
	List<ItemReqDHib> findByMenuMFk(@Param("headerFk") Integer headerFk);
	
	List<ItemReqDHib> findByHeaderFk(Integer headerFk);


}
