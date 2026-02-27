package esfita.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import esfita.entity.ItemMasterHib;

public interface ItemMasterRepository extends JpaRepository<ItemMasterHib, Integer> {

	@Query("SELECT m FROM ItemMasterHib m WHERE m.status = 'A' ORDER BY m.categoryName ASC")
	List<ItemMasterHib> orderBy();

	@Query("SELECT i FROM ItemMasterHib i WHERE i.categoryFk = ?1 AND i.status = 'A'")
	List<ItemMasterHib> findByCategoryFk(int categoryId);

	@Query("SELECT i FROM ItemMasterHib i WHERE i.id = ?1")
	ItemMasterHib findByid(int id);

	
}
