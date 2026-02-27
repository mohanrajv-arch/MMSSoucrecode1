package esfita.repositoy;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import esfita.entity.BasePortionQuantityMasterHib;

public interface BasePortionQuantityMasterRepository extends JpaRepository<BasePortionQuantityMasterHib, Integer> {

	@Query("select m from BasePortionQuantityMasterHib m where m.quantity=?1")
	BasePortionQuantityMasterHib findCode(double code);

	@Query("select m from BasePortionQuantityMasterHib m ORDER BY m.status ASC, m.id DESC")
	List<BasePortionQuantityMasterHib> orderBy();

	@Query("select m from BasePortionQuantityMasterHib m where m.id=?1")
	BasePortionQuantityMasterHib findOne(int id);
}
