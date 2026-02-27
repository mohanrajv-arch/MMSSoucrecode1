package esfita.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import esfita.entity.CategoryMasterHib;


public interface CategoryMasterRepository  extends JpaRepository<CategoryMasterHib, Integer>{

	@Query("select m from CategoryMasterHib m where m.categoryCode = ?1")
	CategoryMasterHib findByCode(String categoryCode);
	@Query("SELECT m FROM CategoryMasterHib m ORDER BY m.id DESC")
	List<CategoryMasterHib> orderBy();
	 @Query("SELECT r FROM CategoryMasterHib r WHERE r.id = :id")
	 CategoryMasterHib findById(@Param("id") int id);
	 
}
