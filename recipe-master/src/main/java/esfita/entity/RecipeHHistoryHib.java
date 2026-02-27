package esfita.entity;

import java.io.Serializable;
import java.util.Date;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Data;

@Entity
@Data
@Table(name = "recipe_h_history", schema = "dbo")
public class RecipeHHistoryHib implements Serializable {
	
	/**
	 * 
	 */
	private static final long serialVersionUID = -3813238973830559274L;
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(name = "id", updatable = false)
	private int id;

	@Column(name = "recipe_fk")
	private int recipeFk;

	@Column(name = "version_no")
	private int versionNo;

	@Column(name = "unique_no")
	private String uniqueNo;

	@Column(name = "recipe_name")
	private String recipeName;

	@Column(name = "ref_no")
	private String refNo;

	@Column(name = "cooking_instruction")
	private String cookingInstruction;

	@Column(name = "country_origin_fk")
	private int countryOriginFk;

	@Column(name = "base_quantity_fk")
	private int baseQuantityFk;

	@Column(name = "base_quantity")
	private double baseQuantity;

	@Column(name = "uom")
	private String uom;


	@Column(name = "finished_product")
	private double finishedProduct;

	@Column(name = "portion_size")
	private double portionSize;

	@Column(name = "image_url")
	private String imageUrl;

	@Column(name = "total_cost")
	private double totalCost;

	@Column(name = "per_portion_cost")
	private double perPortionCost;

	@Column(name = "status")
	private char status;

	@Column(name = "created_date")
	private Date createdDate;

	@Column(name = "created_by")
	private int createdBy;

	@Column(name = "update_date")
	private Date updatedDate;

	@Column(name = "update_by")
	private int updateBy;
	
	public int getId() {
		return id;
	}

	public void setId(int id) {
		this.id = id;
	}

	public int getRecipeFk() {
		return recipeFk;
	}

	public void setRecipeFk(int recipeFk) {
		this.recipeFk = recipeFk;
	}

	public int getVersionNo() {
		return versionNo;
	}

	public void setVersionNo(int versionNo) {
		this.versionNo = versionNo;
	}

	public String getUniqueNo() {
		return uniqueNo;
	}

	public void setUniqueNo(String uniqueNo) {
		this.uniqueNo = uniqueNo;
	}

	public String getRecipeName() {
		return recipeName;
	}

	public void setRecipeName(String recipeName) {
		this.recipeName = recipeName;
	}

	public String getRefNo() {
		return refNo;
	}

	public void setRefNo(String refNo) {
		this.refNo = refNo;
	}

	public String getCookingInstruction() {
		return cookingInstruction;
	}

	public void setCookingInstruction(String cookingInstruction) {
		this.cookingInstruction = cookingInstruction;
	}

	public int getCountryOriginFk() {
		return countryOriginFk;
	}

	public void setCountryOriginFk(int countryOriginFk) {
		this.countryOriginFk = countryOriginFk;
	}

	public int getBaseQuantityFk() {
		return baseQuantityFk;
	}

	public void setBaseQuantityFk(int baseQuantityFk) {
		this.baseQuantityFk = baseQuantityFk;
	}

	public double getBaseQuantity() {
		return baseQuantity;
	}

	public void setBaseQuantity(double baseQuantity) {
		this.baseQuantity = baseQuantity;
	}

	public String getUom() {
		return uom;
	}

	public void setUom(String uom) {
		this.uom = uom;
	}

	public double getFinishedProduct() {
		return finishedProduct;
	}

	public void setFinishedProduct(double finishedProduct) {
		this.finishedProduct = finishedProduct;
	}

	public double getPortionSize() {
		return portionSize;
	}

	public void setPortionSize(double portionSize) {
		this.portionSize = portionSize;
	}

	public String getImageUrl() {
		return imageUrl;
	}

	public void setImageUrl(String imageUrl) {
		this.imageUrl = imageUrl;
	}

	public double getTotalCost() {
		return totalCost;
	}

	public void setTotalCost(double totalCost) {
		this.totalCost = totalCost;
	}

	public double getPerPortionCost() {
		return perPortionCost;
	}

	public void setPerPortionCost(double perPortionCost) {
		this.perPortionCost = perPortionCost;
	}

	public char getStatus() {
		return status;
	}

	public void setStatus(char status) {
		this.status = status;
	}

	public Date getCreatedDate() {
		return createdDate;
	}

	public void setCreatedDate(Date createdDate) {
		this.createdDate = createdDate;
	}

	public int getCreatedBy() {
		return createdBy;
	}

	public void setCreatedBy(int createdBy) {
		this.createdBy = createdBy;
	}

	public Date getUpdatedDate() {
		return updatedDate;
	}

	public void setUpdatedDate(Date updatedDate) {
		this.updatedDate = updatedDate;
	}

	public int getUpdateBy() {
		return updateBy;
	}

	public void setUpdateBy(int updateBy) {
		this.updateBy = updateBy;
	}

	public double getCalories() {
		return calories;
	}

	public void setCalories(double calories) {
		this.calories = calories;
	}

	public double getProtein() {
		return protein;
	}

	public void setProtein(double protein) {
		this.protein = protein;
	}

	public double getCarbs() {
		return carbs;
	}

	public void setCarbs(double carbs) {
		this.carbs = carbs;
	}

	public double getFat() {
		return fat;
	}

	public void setFat(double fat) {
		this.fat = fat;
	}

	public static long getSerialversionuid() {
		return serialVersionUID;
	}

	@Column(name = "calories")
	private double calories;
	
	@Column(name = "protein")
	private double protein;
	
	@Column(name = "carbs")
	private double carbs;
	
	@Column(name = "fat")
	private double fat;

	
}
