package esfita.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import esfita.entity.MstCategoryMasterHib;

public interface MstCategoryMasterRepository extends JpaRepository<MstCategoryMasterHib, Integer> {

	@Query("SELECT m FROM MstCategoryMasterHib m WHERE m.status = 'A' ORDER BY m.id DESC")
	List<MstCategoryMasterHib> orderBy();
}
