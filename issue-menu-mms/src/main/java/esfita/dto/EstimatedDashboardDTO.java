package esfita.dto;

import java.io.Serializable;
import java.util.Date;
import java.util.List;

import lombok.Data;

@Data
public class EstimatedDashboardDTO implements Serializable {

	/**
	 * 
	 */
	private static final long serialVersionUID = -1888108755396906548L;
	private int locationFk;
	private int estimationHFk;
	private int id;
	private Date date;

	public int getLocationFk() {
		return locationFk;
	}

	public void setLocationFk(int locationFk) {
		this.locationFk = locationFk;
	}

	public int getEstimationHFk() {
		return estimationHFk;
	}

	public void setEstimationHFk(int estimationHFk) {
		this.estimationHFk = estimationHFk;
	}

	public int getId() {
		return id;
	}

	public void setId(int id) {
		this.id = id;
	}

	public Date getDate() {
		return date;
	}

	public void setDate(Date date) {
		this.date = date;
	}

	public Double getTotalCost() {
		return totalCost;
	}

	public void setTotalCost(Double totalCost) {
		this.totalCost = totalCost;
	}

	public Double getTotalPob() {
		return totalPob;
	}

	public void setTotalPob(Double totalPob) {
		this.totalPob = totalPob;
	}

	public String getStatus() {
		return status;
	}

	public void setStatus(String status) {
		this.status = status;
	}

	public String getCreatedBy() {
		return createdBy;
	}

	public void setCreatedBy(String createdBy) {
		this.createdBy = createdBy;
	}

	public Date getCreatedDate() {
		return createdDate;
	}

	public void setCreatedDate(Date createdDate) {
		this.createdDate = createdDate;
	}

	public String getLastActBy() {
		return lastActBy;
	}

	public void setLastActBy(String lastActBy) {
		this.lastActBy = lastActBy;
	}

	public Date getLastActDate() {
		return lastActDate;
	}

	public void setLastActDate(Date lastActDate) {
		this.lastActDate = lastActDate;
	}

	public int getSubCategoryFk() {
		return subCategoryFk;
	}

	public void setSubCategoryFk(int subCategoryFk) {
		this.subCategoryFk = subCategoryFk;
	}

	public String getSubCategoryName() {
		return subCategoryName;
	}

	public void setSubCategoryName(String subCategoryName) {
		this.subCategoryName = subCategoryName;
	}

	public String getMainCategoryName() {
		return mainCategoryName;
	}

	public void setMainCategoryName(String mainCategoryName) {
		this.mainCategoryName = mainCategoryName;
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

	public double getTotalQuantity() {
		return totalQuantity;
	}

	public void setTotalQuantity(double totalQuantity) {
		this.totalQuantity = totalQuantity;
	}

	public double getCost() {
		return cost;
	}

	public void setCost(double cost) {
		this.cost = cost;
	}

	public double getPercentage() {
		return percentage;
	}

	public void setPercentage(double percentage) {
		this.percentage = percentage;
	}

	public List<EstimatedDashboardDTO> getDailyList() {
		return dailyList;
	}

	public void setDailyList(List<EstimatedDashboardDTO> dailyList) {
		this.dailyList = dailyList;
	}

	public List<EstimatedDashboardDTO> getMainCategoryList() {
		return mainCategoryList;
	}

	public void setMainCategoryList(List<EstimatedDashboardDTO> mainCategoryList) {
		this.mainCategoryList = mainCategoryList;
	}

	public List<EstimatedDashboardDTO> getItemList() {
		return itemList;
	}

	public void setItemList(List<EstimatedDashboardDTO> itemList) {
		this.itemList = itemList;
	}

	public static long getSerialversionuid() {
		return serialVersionUID;
	}

	private Double totalCost;
	private Double totalPob;

	private String status;
	private String createdBy;
	private Date createdDate;
	private String lastActBy;
	private Date lastActDate;

	private int subCategoryFk;
	private String subCategoryName;
	private String mainCategoryName;

	private String itemCode;
	private String itemName;

	private String packageId;
	private double packagePrice;
	private double packageBaseFactor;
	private double packageSecondaryFactor;
	private String packageBaseUnit;
	private String packageSecondaryUnit;
	private double packageSecondaryCost;

	private double baseQuantity;
	private double secondaryQuantity;
	private String chefUnit;
	private double totalQuantity;
	private double cost;

	private double percentage;

	private List<EstimatedDashboardDTO> dailyList; // per day
	private List<EstimatedDashboardDTO> mainCategoryList;
	private List<EstimatedDashboardDTO> itemList;

	public EstimatedDashboardDTO(String mainCategoryName, Double totalCost) {
		this.mainCategoryName = mainCategoryName;
		this.baseQuantity = baseQuantity;
		this.totalCost = totalCost;
	}

	public EstimatedDashboardDTO() {

	}
//    private EstimatedDashboardDTO dashboardList = new EstimatedDashboardDTO();
}
