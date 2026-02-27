package esfita.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import esfita.entity.MstLocationMenuHib;

public interface MstLocationMenuRepository extends JpaRepository<MstLocationMenuHib, Integer> {

	@Query("select m from MstLocationMenuHib m order by m.locationName asc")
	List<MstLocationMenuHib> orderBy();

	@Query("select m from MstLocationMenuHib m where status='A' order by m.locationName asc")
	List<MstLocationMenuHib> orderByActive();

	@Query("select m from MstLocationMenuHib m where locationPk=?1")
	MstLocationMenuHib retrieveLocation(int pk);

	@Query("select m from MstLocationMenuHib m where status = 'A'")
	List<MstLocationMenuHib> byStatusActive();

	@Query("select m from MstLocationMenuHib m where m.locationPk = ?1 AND m.status = 'A' order by m.locationPk desc")
	MstLocationMenuHib findById(int locationPk);

}