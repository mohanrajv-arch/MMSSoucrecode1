package esfita.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;


import esfita.entity.EstimatedDHib;


@Repository
public interface EstimatedDRepository extends JpaRepository<EstimatedDHib, Integer>{

	@Query(value = "SELECT e.main_category_name AS mainCategoryName, " +
            "SUM(e.base_quantity) AS totalBaseQuantity, " +
            "SUM(e.cost) AS totalCost " +
            "FROM dbo.estimation_d e " +
            "WHERE e.estimation_h_fk = :estimationHFK " +
            "GROUP BY e.main_category_name", 
    nativeQuery = true)
List<Object[]> findTotalCostAndBaseQuantityByMainCategory(
     @Param("estimationHFK") int estimationHFK);

@Query("SELECT e FROM EstimatedDHib e " +
        "WHERE e.subCategoryFk  = :categoryFk " +
        "AND e.estimationHFk = :estimationHFK")
 List<EstimatedDHib> findTotalByCategoryFk(
         @Param("categoryFk") int categoryFk,
         @Param("estimationHFK") int estimationHFK);
 
 
 @Query("SELECT e FROM EstimatedDHib e WHERE e.estimationHFk = :estimationHFK")
 List<EstimatedDHib> itemList(@Param("estimationHFK") int estimationHFK);




}
