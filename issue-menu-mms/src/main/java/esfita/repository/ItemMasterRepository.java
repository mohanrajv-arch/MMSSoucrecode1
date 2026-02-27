package esfita.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import esfita.entity.ItemMasterHib;
import esfita.service.ItemRequisitionService.ItemDropdownProjection;

public interface ItemMasterRepository  extends JpaRepository<ItemMasterHib, Integer> {

	@Query("SELECT m FROM ItemMasterHib m ORDER BY m.id DESC")
	List<ItemMasterHib> orderBy();

	@Query("SELECT i FROM ItemMasterHib i WHERE i.categoryFk = ?1")
	List<ItemMasterHib> findByCategoryFk(int categoryId);
	
	@Query("SELECT i FROM ItemMasterHib i WHERE i.id = ?1")
	ItemMasterHib findByid(int id);
	
	@Query("SELECT i.id AS id, i.categoryFk AS categoryFk, i.categoryName AS categoryName, " +
		       "i.itemCode AS itemCode, i.itemName AS itemName, i.packageId AS packageId, " +
		       "i.packagePrice AS packagePrice, i.packageBaseFactor AS packageBaseFactor, " +
		       "i.packageSecondaryFactor AS packageSecondaryFactor, " +
		       "i.packageBaseUnit AS packageBaseUnit, i.packageSecondaryUnit AS packageSecondaryUnit, " +
		       "i.packageSecondaryCost AS packageSecondaryCost " +
		       "FROM ItemMasterHib i WHERE i.status = 'A' ORDER BY i.itemName ASC")
	List<ItemDropdownProjection> loadItemDropdownFast();

}
