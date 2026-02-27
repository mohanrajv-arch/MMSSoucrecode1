package esfita.dto;

import java.io.Serializable;
import java.util.ArrayList;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import lombok.Data;

@Data
public class ItemRequisitionDTO implements Serializable {
	/**
	* 
	*/
	private static final long serialVersionUID = 5974997880608309343L;

	private int id;
	private int issueMFk;
	private int locationFk;
	private int issueHFk;
	private int issueDFk;
	public int getId() {
		return id;
	}

	public void setId(int id) {
		this.id = id;
	}

	public int getIssueMFk() {
		return issueMFk;
	}

	public void setIssueMFk(int issueMFk) {
		this.issueMFk = issueMFk;
	}

	public int getLocationFk() {
		return locationFk;
	}

	public void setLocationFk(int locationFk) {
		this.locationFk = locationFk;
	}

	public int getIssueHFk() {
		return issueHFk;
	}

	public void setIssueHFk(int issueHFk) {
		this.issueHFk = issueHFk;
	}

	public int getIssueDFk() {
		return issueDFk;
	}

	public void setIssueDFk(int issueDFk) {
		this.issueDFk = issueDFk;
	}

	public String getSingleDate() {
		return singleDate;
	}

	public void setSingleDate(String singleDate) {
		this.singleDate = singleDate;
	}

	public String getFromDate() {
		return fromDate;
	}

	public void setFromDate(String fromDate) {
		this.fromDate = fromDate;
	}

	public String getToDate() {
		return toDate;
	}

	public void setToDate(String toDate) {
		this.toDate = toDate;
	}

	public Date getSingleDates() {
		return singleDates;
	}

	public void setSingleDates(Date singleDates) {
		this.singleDates = singleDates;
	}

	public Date getFromDates() {
		return fromDates;
	}

	public void setFromDates(Date fromDates) {
		this.fromDates = fromDates;
	}

	public Date getToDates() {
		return toDates;
	}

	public void setToDates(Date toDates) {
		this.toDates = toDates;
	}

	public Integer getFinalMenuFk() {
		return finalMenuFk;
	}

	public void setFinalMenuFk(Integer finalMenuFk) {
		this.finalMenuFk = finalMenuFk;
	}

	public String getFinalMenuName() {
		return finalMenuName;
	}

	public void setFinalMenuName(String finalMenuName) {
		this.finalMenuName = finalMenuName;
	}

	public int getMenuFk() {
		return menuFk;
	}

	public void setMenuFk(int menuFk) {
		this.menuFk = menuFk;
	}

	public String getMenuName() {
		return menuName;
	}

	public void setMenuName(String menuName) {
		this.menuName = menuName;
	}

	public int getTotalDays() {
		return totalDays;
	}

	public void setTotalDays(int totalDays) {
		this.totalDays = totalDays;
	}

	public double getTotalPob() {
		return totalPob;
	}

	public void setTotalPob(double totalPob) {
		this.totalPob = totalPob;
	}

	public int getTotalMeals() {
		return totalMeals;
	}

	public void setTotalMeals(int totalMeals) {
		this.totalMeals = totalMeals;
	}

	public int getTotalItems() {
		return totalItems;
	}

	public void setTotalItems(int totalItems) {
		this.totalItems = totalItems;
	}

	public int getIssueStatus() {
		return issueStatus;
	}

	public void setIssueStatus(int issueStatus) {
		this.issueStatus = issueStatus;
	}

	public int getIssuStatusStr() {
		return issuStatusStr;
	}

	public void setIssuStatusStr(int issuStatusStr) {
		this.issuStatusStr = issuStatusStr;
	}

	public int getMealTypeFk() {
		return mealTypeFk;
	}

	public void setMealTypeFk(int mealTypeFk) {
		this.mealTypeFk = mealTypeFk;
	}

	public String getMealType() {
		return mealType;
	}

	public void setMealType(String mealType) {
		this.mealType = mealType;
	}

	public String getDate() {
		return date;
	}

	public void setDate(String date) {
		this.date = date;
	}

	public Long getItemFk() {
		return itemFk;
	}

	public void setItemFk(Long itemFk) {
		this.itemFk = itemFk;
	}

	public Long getItemCategoryFk() {
		return itemCategoryFk;
	}

	public void setItemCategoryFk(Long itemCategoryFk) {
		this.itemCategoryFk = itemCategoryFk;
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

	public double getAdjustQuantity() {
		return adjustQuantity;
	}

	public void setAdjustQuantity(double adjustQuantity) {
		this.adjustQuantity = adjustQuantity;
	}

	public double getBaseTotal() {
		return baseTotal;
	}

	public void setBaseTotal(double baseTotal) {
		this.baseTotal = baseTotal;
	}

	public double getAdjustTotal() {
		return adjustTotal;
	}

	public void setAdjustTotal(double adjustTotal) {
		this.adjustTotal = adjustTotal;
	}

	public double getMenuItemCost() {
		return menuItemCost;
	}

	public void setMenuItemCost(double menuItemCost) {
		this.menuItemCost = menuItemCost;
	}

	public int getItemCount() {
		return itemCount;
	}

	public void setItemCount(int itemCount) {
		this.itemCount = itemCount;
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

	public List<ItemRequisitionDTO> getRequisitionList() {
		return requisitionList;
	}

	public void setRequisitionList(List<ItemRequisitionDTO> requisitionList) {
		this.requisitionList = requisitionList;
	}

	public List<ItemRequisitionDTO> getItemList() {
		return itemList;
	}

	public void setItemList(List<ItemRequisitionDTO> itemList) {
		this.itemList = itemList;
	}

	public List<ItemRequisitionDTO> getMenuList() {
		return menuList;
	}

	public void setMenuList(List<ItemRequisitionDTO> menuList) {
		this.menuList = menuList;
	}

	public Map<Integer, ItemRequisitionDTO> getFinalMenuSummaryMap() {
		return finalMenuSummaryMap;
	}

	public void setFinalMenuSummaryMap(Map<Integer, ItemRequisitionDTO> finalMenuSummaryMap) {
		this.finalMenuSummaryMap = finalMenuSummaryMap;
	}

	public String getIssueStatusStr() {
		return issueStatusStr;
	}

	public void setIssueStatusStr(String issueStatusStr) {
		this.issueStatusStr = issueStatusStr;
	}

	public String getRequisitionType() {
		return requisitionType;
	}

	public void setRequisitionType(String requisitionType) {
		this.requisitionType = requisitionType;
	}

	public String getRemarks() {
		return remarks;
	}

	public void setRemarks(String remarks) {
		this.remarks = remarks;
	}

	public String getItemCategoryName() {
		return itemCategoryName;
	}

	public void setItemCategoryName(String itemCategoryName) {
		this.itemCategoryName = itemCategoryName;
	}

	public double getQuantity() {
		return quantity;
	}

	public void setQuantity(double quantity) {
		this.quantity = quantity;
	}

	public double getAdditionalItemCost() {
		return additionalItemCost;
	}

	public void setAdditionalItemCost(double additionalItemCost) {
		this.additionalItemCost = additionalItemCost;
	}

	public double getTotalCost() {
		return totalCost;
	}

	public void setTotalCost(double totalCost) {
		this.totalCost = totalCost;
	}

	public double getAdjustedQuantity() {
		return adjustedQuantity;
	}

	public void setAdjustedQuantity(double adjustedQuantity) {
		this.adjustedQuantity = adjustedQuantity;
	}

	public double getAdjustedTotal() {
		return adjustedTotal;
	}

	public void setAdjustedTotal(double adjustedTotal) {
		this.adjustedTotal = adjustedTotal;
	}

	public List<ItemRequisitionDTO> getAdditionalItems() {
		return additionalItems;
	}

	public void setAdditionalItems(List<ItemRequisitionDTO> additionalItems) {
		this.additionalItems = additionalItems;
	}

	public int getCreatedBy() {
		return createdBy;
	}

	public void setCreatedBy(int createdBy) {
		this.createdBy = createdBy;
	}

	public String getReqNo() {
		return reqNo;
	}

	public void setReqNo(String reqNo) {
		this.reqNo = reqNo;
	}

	public Date getDates() {
		return dates;
	}

	public void setDates(Date dates) {
		this.dates = dates;
	}

	public String getPeriod() {
		return period;
	}

	public void setPeriod(String period) {
		this.period = period;
	}

	public String getMenuFkStr() {
		return menuFkStr;
	}

	public void setMenuFkStr(String menuFkStr) {
		this.menuFkStr = menuFkStr;
	}

	public Map<String, List<ItemRequisitionDTO>> getDateWiseAdditionalItemList() {
		return dateWiseAdditionalItemList;
	}

	public void setDateWiseAdditionalItemList(Map<String, List<ItemRequisitionDTO>> dateWiseAdditionalItemList) {
		this.dateWiseAdditionalItemList = dateWiseAdditionalItemList;
	}

	public List<ItemRequisitionDTO> getConsolidatedItemList() {
		return consolidatedItemList;
	}

	public void setConsolidatedItemList(List<ItemRequisitionDTO> consolidatedItemList) {
		this.consolidatedItemList = consolidatedItemList;
	}

	public String getItemType() {
		return itemType;
	}

	public void setItemType(String itemType) {
		this.itemType = itemType;
	}

	public Map<String, List<ItemRequisitionDTO>> getDateWiseItemList() {
		return dateWiseItemList;
	}

	public void setDateWiseItemList(Map<String, List<ItemRequisitionDTO>> dateWiseItemList) {
		this.dateWiseItemList = dateWiseItemList;
	}

	public List<ItemRequisitionDTO> getSummaryItemList() {
		return summaryItemList;
	}

	public void setSummaryItemList(List<ItemRequisitionDTO> summaryItemList) {
		this.summaryItemList = summaryItemList;
	}

	public int getInsertionType() {
		return insertionType;
	}

	public void setInsertionType(int insertionType) {
		this.insertionType = insertionType;
	}

	public int getRequestType() {
		return requestType;
	}

	public void setRequestType(int requestType) {
		this.requestType = requestType;
	}

	public int getAdditional() {
		return additional;
	}

	public void setAdditional(int additional) {
		this.additional = additional;
	}

	public List<Integer> getMenuFkList() {
		return menuFkList;
	}

	public void setMenuFkList(List<Integer> menuFkList) {
		this.menuFkList = menuFkList;
	}

	public Map<String, Double> getDateQuantities() {
		return dateQuantities;
	}

	public void setDateQuantities(Map<String, Double> dateQuantities) {
		this.dateQuantities = dateQuantities;
	}

	public double getPob() {
		return pob;
	}

	public void setPob(double pob) {
		this.pob = pob;
	}

	public static long getSerialversionuid() {
		return serialVersionUID;
	}

	private String singleDate;
	private String fromDate;
	private String toDate;
	private Date singleDates;
	private Date fromDates;
	private Date toDates;

	private Integer finalMenuFk;
	private String finalMenuName;
	private int menuFk;
	private String menuName;
	private int totalDays;
	private double totalPob;
	private int totalMeals;
	private int totalItems;
	private int issueStatus;
	private int issuStatusStr;
	private int mealTypeFk;
	private String mealType;
	private String date;
	private Long itemFk;
	private Long itemCategoryFk;
	private String itemCode;
	private String itemName;
	private String packageId;
	private double packagePrice;
	private String chefUnit;
	private double costPrice;
	private double baseQuantity;
	private double secondaryQuantity;
	private double adjustQuantity;
	private double baseTotal;
	private double adjustTotal;
	private double menuItemCost;
	private int itemCount;

	private double packageBaseFactor;
	private double packageSecondaryFactor;
	private String packageBaseUnit;
	private String packageSecondaryUnit;
	private double packageSecondaryCost;
	

	private List<ItemRequisitionDTO> requisitionList = new ArrayList<>();
	private List<ItemRequisitionDTO> itemList = new ArrayList<>();

	private List<ItemRequisitionDTO> menuList = new ArrayList<>();
	private Map<Integer, ItemRequisitionDTO> finalMenuSummaryMap;

	private String issueStatusStr;
	private String requisitionType;
	private String remarks;
	private String itemCategoryName;
	private double quantity;
	private double additionalItemCost;
	private double totalCost;
	private double adjustedQuantity;
	private double adjustedTotal;
	private List<ItemRequisitionDTO> additionalItems = new ArrayList<>();
	private int createdBy;
	private String reqNo;
	private Date dates;
	private String period;
	private String menuFkStr;

	Map<String, List<ItemRequisitionDTO>> dateWiseAdditionalItemList = new HashMap<>();
	private List<ItemRequisitionDTO> consolidatedItemList = new ArrayList<>();
	private String itemType;
	Map<String, List<ItemRequisitionDTO>> dateWiseItemList = new HashMap<>();
	private List<ItemRequisitionDTO> summaryItemList = new ArrayList<>();
	private int insertionType;
	private int requestType;
	private int additional;
	private List<Integer> menuFkList;
	private Map<String, Double> dateQuantities = new HashMap<>();
	
	private double pob;
	
	private String locationCode;
	private String locationName;
	private String createdDate;
	
	
	
	public String getLocationCode() {
		return locationCode;
	}

	public void setLocationCode(String locationCode) {
		this.locationCode = locationCode;
	}

	public String getLocationName() {
		return locationName;
	}

	public void setLocationName(String locationName) {
		this.locationName = locationName;
	}

	public String getCreatedDate() {
		return createdDate;
	}

	public void setCreatedDate(String createdDate) {
		this.createdDate = createdDate;
	}

}
