package esfita.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import esfita.entity.ItemCategoryMasterHib;

public interface ItemCategoryMasterRepository extends JpaRepository<ItemCategoryMasterHib, Integer>{

	@Query("select m from ItemCategoryMasterHib m where m.itemCategoryCode = ?1")
	ItemCategoryMasterHib findByCode(String itemCode);
	@Query("SELECT m FROM ItemCategoryMasterHib m ORDER BY m.id DESC")
	List<ItemCategoryMasterHib> orderBy();
	
	 @Query("SELECT i FROM ItemCategoryMasterHib i WHERE i.id = :id")
	    ItemCategoryMasterHib findById(@Param("id") int id);
}
