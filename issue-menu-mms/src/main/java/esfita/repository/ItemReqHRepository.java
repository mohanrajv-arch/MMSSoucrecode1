package esfita.repository;

import java.util.Date;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import esfita.entity.ItemReqHHib;

@Repository
public interface ItemReqHRepository extends JpaRepository<ItemReqHHib, Integer> {

	@Query("select r from ItemReqHHib r where r.reqId LIKE ?1")
	List<ItemReqHHib> transactionNo(String ref);

	@Query("SELECT m FROM ItemReqHHib m WHERE m.locationFk = ?1 ORDER BY m.id DESC")
	List<ItemReqHHib> findBym(int locationFk);

	@Query("SELECT i FROM ItemReqHHib i WHERE i.id = :id")
	ItemReqHHib findById(@Param("id") int id);

	@Query(value = "SELECT * FROM dbo.item_req_h " + "WHERE location_fk = :locationFk "
			+ "AND :givenDate BETWEEN FROM_DATE AND TO_DATE", nativeQuery = true)
	List<ItemReqHHib> findByLocationAndDate(@Param("locationFk") int locationFk, @Param("givenDate") Date givenDate);

}
