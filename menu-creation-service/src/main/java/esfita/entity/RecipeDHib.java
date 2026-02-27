package esfita.entity;

import java.io.Serializable;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Data;

@Entity
@Data
@Table(name = "recipe_d", schema = "dbo")
public class RecipeDHib implements Serializable {
	
	

		/**
		 * 
		 */
		private static final long serialVersionUID = 4802307283921879776L;

		@Id
		@GeneratedValue(strategy = GenerationType.IDENTITY)
		@Column(name = "id", updatable = false)
		private int id;

		@Column(name = "recipe_fk")
		private int recipeFk;

		@Column(name = "category_fk")
		private Integer  categoryFk;

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
		private Double packagePrice;

		@Column(name = "package_base_factor")
		private Double packageBaseFactor;

		@Column(name = "package_secondary_factor")
		private Double packageSecondaryFactor;

		@Column(name = "package_base_unit")
		private String packageBaseUnit;

		@Column(name = "package_secondary_unit")
		private String packageSecondaryUnit;

		@Column(name = "package_secondary_cost")
		private Double packageSecondaryCost;

		@Column(name = "base_quantity")
		private Double baseQuantity;

		
		@Column(name = "secondary_quantity")
		private Double secondaryQuantity;

		@Column(name = "total")
		private Double total;
		
		@Column(name = "status")
		private char status;

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

		public Integer getCategoryFk() {
			return categoryFk;
		}

		public void setCategoryFk(Integer categoryFk) {
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

		public Double getPackagePrice() {
			return packagePrice;
		}

		public void setPackagePrice(Double packagePrice) {
			this.packagePrice = packagePrice;
		}

		public Double getPackageBaseFactor() {
			return packageBaseFactor;
		}

		public void setPackageBaseFactor(Double packageBaseFactor) {
			this.packageBaseFactor = packageBaseFactor;
		}

		public Double getPackageSecondaryFactor() {
			return packageSecondaryFactor;
		}

		public void setPackageSecondaryFactor(Double packageSecondaryFactor) {
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

		public Double getPackageSecondaryCost() {
			return packageSecondaryCost;
		}

		public void setPackageSecondaryCost(Double packageSecondaryCost) {
			this.packageSecondaryCost = packageSecondaryCost;
		}

		public Double getBaseQuantity() {
			return baseQuantity;
		}

		public void setBaseQuantity(Double baseQuantity) {
			this.baseQuantity = baseQuantity;
		}

		

		public char getStatus() {
			return status;
		}

		public void setStatus(char status) {
			this.status = status;
		}

		public Double getSecondaryQuantity() {
			return secondaryQuantity;
		}

		public void setSecondaryQuantity(Double secondaryQuantity) {
			this.secondaryQuantity = secondaryQuantity;
		}

		public Double getTotal() {
			return total;
		}

		public void setTotal(Double total) {
			this.total = total;
		}

}
