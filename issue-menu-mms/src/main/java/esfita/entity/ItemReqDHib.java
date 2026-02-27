package esfita.entity;

import java.io.Serializable;
import java.util.Date;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

@Entity
@Getter
@Setter
@JsonIgnoreProperties({ "hibernateLazyInitializer", "handler" })
@Table(name = "item_req_d", schema = "dbo")
public class ItemReqDHib implements Serializable {

	/**
	 * 
	 */
	private static final long serialVersionUID = 2128345077105232222L;

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(name = "ID", updatable = false)
	private int id;

	@Column(name = "HEADER_FK")
	private int headerFk;

	@Column(name = "REQ_TYPE") // 0 means Menu Items 1 means Ration Items
	private int reqType;

	@Column(name = "DATE")
	private Date date;

	@Column(name = "ADDITIONAL") // 0 means usual 1 means Additional
	private int additional;

	@Column(name = "CATEGORY_FK")
	private int categoryFk;

	@Column(name = "CATEGORY")
	private String category;

	@Column(name = "ITEM_CODE")
	private String itemCode;

	@Column(name = "ITEM_NAME")
	private String itemName;

	@Column(name = "PACKAGE_ID")
	private String packageId;

	@Column(name = "PACKAGE_PRICE")
	private double packagePrice;

	@Column(name = "PACKAGE_BASE_FACTOR")
	private double packageBaseFactor;

	@Column(name = "PACKAGE_SECONDARY_FACTOR")
	private double packageSecondaryFactor;

	@Column(name = "PACKAGE_BASE_UNIT")
	private String packageBaseUnit;

	@Column(name = "PACKAGE_SECONDARY_UNIT")
	private String packageSecondaryUnit;

	@Column(name = "PACKAGE_SECONDARY_COST")
	private double packageSecondaryCost;

	@Column(name = "BASE_QUANTITY")
	private double baseQuantity;

	@Column(name = "SECONDARY_QUANTITY")
	private double secondaryQuantity;

	@Column(name = "CHEF_UNIT")
	private String chefUnit;

	public int getId() {
		return id;
	}

	public void setId(int id) {
		this.id = id;
	}

	public int getHeaderFk() {
		return headerFk;
	}

	public void setHeaderFk(int headerFk) {
		this.headerFk = headerFk;
	}

	public int getReqType() {
		return reqType;
	}

	public void setReqType(int reqType) {
		this.reqType = reqType;
	}

	public Date getDate() {
		return date;
	}

	public void setDate(Date date) {
		this.date = date;
	}

	public int getAdditional() {
		return additional;
	}

	public void setAdditional(int additional) {
		this.additional = additional;
	}

	public int getCategoryFk() {
		return categoryFk;
	}

	public void setCategoryFk(int categoryFk) {
		this.categoryFk = categoryFk;
	}

	public String getCategory() {
		return category;
	}

	public void setCategory(String category) {
		this.category = category;
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

	public String getChefUnit() {
		return chefUnit;
	}

	public void setChefUnit(String chefUnit) {
		this.chefUnit = chefUnit;
	}

	public double getCostPrice() {
		return costPrice;
	}

	public void setCostPrice(double costPrice) {
		this.costPrice = costPrice;
	}


	public static long getSerialversionuid() {
		return serialVersionUID;
	}

	@Column(name = "COST_PRICE")
	private double costPrice;
	@Column(name = "QUANTITY")
	private double quantity;
	
	@Column(name = "COST")
	private double cost;

	public double getQuantity() {
		return quantity;
	}

	public void setQuantity(double quantity) {
		this.quantity = quantity;
	}

	public double getCost() {
		return cost;
	}

	public void setCost(double cost) {
		this.cost = cost;
	}
}


