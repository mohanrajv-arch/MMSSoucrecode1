package esfita.entity;

import java.util.Date;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Data;

@Entity
@Data
@JsonIgnoreProperties({ "hibernateLazyInitializer", "handler" })
@Table(name = "meal_set_menu_i", schema = "dbo")
public class MealSetMenuIHib {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(name = "id", updatable = false)
	private int id;

	@Column(name = "menu_fk")
	private int menuFk;

	@Column(name = "menu_d_fk")
	private int menuDFk;

	@Column(name = "recipe_fk")
	private int recipeFk;

	@Column(name = "category_fk")
	private int categoryFk;

	@Column(name = "category_name")
	private String categoryName;

	@Column(name = "item_fk")
	private int itemFk;

	@Column(name = "item_code")
	private String itemCode;

	@Column(name = "item_name")
	private String itemName;

	@Column(name = "package_id")
	private String packageId;

	@Column(name = "package_price")
	private double packagePrice;

	@Column(name = "package_base_factor")
	private double packageBaseFactor;

	@Column(name = "package_secondary_factor")
	private double packageSecondaryFactor;

	@Column(name = "package_base_unit")
	private String packageBaseUnit;

	@Column(name = "package_secondary_unit")
	private String packageSecondaryUnit;

	@Column(name = "package_secondary_cost")
	private double packageSecondaryCost;

	@Column(name = "base_quantity")
	private double baseQuantity;

	@Column(name = "secondary_quantity")
	private double secondaryQuantity;

	@Column(name = "total")
	private double total;

	@Column(name = "status")
	private char status;

	@Column(name = "created_by")
	private int createdBy;

	@Column(name = "created_date_time")
	private Date createdDateTime;

	@Column(name = "last_act_by")
	private int lastActBy;

	@Column(name = "last_act_date_time")
	private Date lastActDateTime;

	public int getId() {
		return id;
	}

	public void setId(int id) {
		this.id = id;
	}

	public int getMenuFk() {
		return menuFk;
	}

	public void setMenuFk(int menuFk) {
		this.menuFk = menuFk;
	}

	public int getMenuDFk() {
		return menuDFk;
	}

	public void setMenuDFk(int menuDFk) {
		this.menuDFk = menuDFk;
	}

	public int getRecipeFk() {
		return recipeFk;
	}

	public void setRecipeFk(int recipeFk) {
		this.recipeFk = recipeFk;
	}

	public int getCategoryFk() {
		return categoryFk;
	}

	public void setCategoryFk(int categoryFk) {
		this.categoryFk = categoryFk;
	}

	public String getCategoryName() {
		return categoryName;
	}

	public void setCategoryName(String categoryName) {
		this.categoryName = categoryName;
	}

	public int getItemFk() {
		return itemFk;
	}

	public void setItemFk(int itemFk) {
		this.itemFk = itemFk;
	}

	public String getItemCode() {
		return itemCode;
	}

	public void setItemCode(String itemCode) {
		this.itemCode = itemCode;
	}

	public String getItemName() {
		return itemName;
	}

	public void setItemName(String itemName) {
		this.itemName = itemName;
	}

	public String getPackageId() {
		return packageId;
	}

	public void setPackageId(String packageId) {
		this.packageId = packageId;
	}

	public double getPackagePrice() {
		return packagePrice;
	}

	public void setPackagePrice(double packagePrice) {
		this.packagePrice = packagePrice;
	}

	public double getPackageBaseFactor() {
		return packageBaseFactor;
	}

	public void setPackageBaseFactor(double packageBaseFactor) {
		this.packageBaseFactor = packageBaseFactor;
	}

	public double getPackageSecondaryFactor() {
		return packageSecondaryFactor;
	}

	public void setPackageSecondaryFactor(double packageSecondaryFactor) {
		this.packageSecondaryFactor = packageSecondaryFactor;
	}

	public String getPackageBaseUnit() {
		return packageBaseUnit;
	}

	public void setPackageBaseUnit(String packageBaseUnit) {
		this.packageBaseUnit = packageBaseUnit;
	}

	public String getPackageSecondaryUnit() {
		return packageSecondaryUnit;
	}

	public void setPackageSecondaryUnit(String packageSecondaryUnit) {
		this.packageSecondaryUnit = packageSecondaryUnit;
	}

	public double getPackageSecondaryCost() {
		return packageSecondaryCost;
	}

	public void setPackageSecondaryCost(double packageSecondaryCost) {
		this.packageSecondaryCost = packageSecondaryCost;
	}

	public double getBaseQuantity() {
		return baseQuantity;
	}

	public void setBaseQuantity(double baseQuantity) {
		this.baseQuantity = baseQuantity;
	}

	public double getSecondaryQuantity() {
		return secondaryQuantity;
	}

	public void setSecondaryQuantity(double secondaryQuantity) {
		this.secondaryQuantity = secondaryQuantity;
	}

	public double getTotal() {
		return total;
	}

	public void setTotal(double total) {
		this.total = total;
	}

	public char getStatus() {
		return status;
	}

	public void setStatus(char status) {
		this.status = status;
	}

	public int getCreatedBy() {
		return createdBy;
	}

	public void setCreatedBy(int createdBy) {
		this.createdBy = createdBy;
	}

	public Date getCreatedDateTime() {
		return createdDateTime;
	}

	public void setCreatedDateTime(Date createdDateTime) {
		this.createdDateTime = createdDateTime;
	}

	public int getLastActBy() {
		return lastActBy;
	}

	public void setLastActBy(int lastActBy) {
		this.lastActBy = lastActBy;
	}

	public Date getLastActDateTime() {
		return lastActDateTime;
	}

	public void setLastActDateTime(Date lastActDateTime) {
		this.lastActDateTime = lastActDateTime;
	}

}
