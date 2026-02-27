package esfita.dto;

import java.io.Serializable;
import java.util.Date;
import java.util.List;

import lombok.Data;

@Data
public class IssueMenuToLocationDTO implements Serializable {

	/**
	* 
	*/
	private static final long serialVersionUID = 7259761836838413654L;
	// issue_menu_m fields
	private int id;
	private int finalMenuFk;
	private String name;

	public int getId() {
		return id;
	}

	public void setId(int id) {
		this.id = id;
	}

	public int getFinalMenuFk() {
		return finalMenuFk;
	}

	public void setFinalMenuFk(int finalMenuFk) {
		this.finalMenuFk = finalMenuFk;
	}

	public String getName() {
		return name;
	}

	public void setName(String name) {
		this.name = name;
	}

	public String getNotes() {
		return notes;
	}

	public void setNotes(String notes) {
		this.notes = notes;
	}

	public String getPriority() {
		return priority;
	}

	public void setPriority(String priority) {
		this.priority = priority;
	}

	public int getLocationFk() {
		return locationFk;
	}

	public void setLocationFk(int locationFk) {
		this.locationFk = locationFk;
	}

	public double getPob() {
		return pob;
	}

	public void setPob(double pob) {
		this.pob = pob;
	}

	public double getTotal() {
		return total;
	}

	public void setTotal(double total) {
		this.total = total;
	}

	public String getStatus() {
		return status;
	}

	public void setStatus(String status) {
		this.status = status;
	}

	public int getIssueStatus() {
		return issueStatus;
	}

	public void setIssueStatus(int issueStatus) {
		this.issueStatus = issueStatus;
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

	public Date getMenuIssuedDate() {
		return menuIssuedDate;
	}

	public void setMenuIssuedDate(Date menuIssuedDate) {
		this.menuIssuedDate = menuIssuedDate;
	}

	public int getIssueMenuHFk() {
		return issueMenuHFk;
	}

	public void setIssueMenuHFk(int issueMenuHFk) {
		this.issueMenuHFk = issueMenuHFk;
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

	public int getMealTypeFk() {
		return mealTypeFk;
	}

	public void setMealTypeFk(int mealTypeFk) {
		this.mealTypeFk = mealTypeFk;
	}

	public String getMealTypeName() {
		return mealTypeName;
	}

	public void setMealTypeName(String mealTypeName) {
		this.mealTypeName = mealTypeName;
	}

	public int getTemplateFk() {
		return templateFk;
	}

	public void setTemplateFk(int templateFk) {
		this.templateFk = templateFk;
	}

	public String getTemplateName() {
		return templateName;
	}

	public void setTemplateName(String templateName) {
		this.templateName = templateName;
	}

	public int getCategoryCount() {
		return categoryCount;
	}

	public void setCategoryCount(int categoryCount) {
		this.categoryCount = categoryCount;
	}

	public int getRecipeCount() {
		return recipeCount;
	}

	public void setRecipeCount(int recipeCount) {
		this.recipeCount = recipeCount;
	}

	public double getTotalCost() {
		return totalCost;
	}

	public void setTotalCost(double totalCost) {
		this.totalCost = totalCost;
	}

	public int getApprovalStatus() {
		return approvalStatus;
	}

	public void setApprovalStatus(int approvalStatus) {
		this.approvalStatus = approvalStatus;
	}

	public int getApprovedBy() {
		return approvedBy;
	}

	public void setApprovedBy(int approvedBy) {
		this.approvedBy = approvedBy;
	}

	public int getIssueMenuHFkDetail() {
		return issueMenuHFkDetail;
	}

	public void setIssueMenuHFkDetail(int issueMenuHFkDetail) {
		this.issueMenuHFkDetail = issueMenuHFkDetail;
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

	public int getRecipeFk() {
		return recipeFk;
	}

	public void setRecipeFk(int recipeFk) {
		this.recipeFk = recipeFk;
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

	public double getPobParticipation() {
		return pobParticipation;
	}

	public void setPobParticipation(double pobParticipation) {
		this.pobParticipation = pobParticipation;
	}

	public double getDetailTotalCost() {
		return detailTotalCost;
	}

	public void setDetailTotalCost(double detailTotalCost) {
		this.detailTotalCost = detailTotalCost;
	}

	public double getPerPortionCost() {
		return perPortionCost;
	}

	public void setPerPortionCost(double perPortionCost) {
		this.perPortionCost = perPortionCost;
	}

	public int getIssueMenuDFk() {
		return issueMenuDFk;
	}

	public void setIssueMenuDFk(int issueMenuDFk) {
		this.issueMenuDFk = issueMenuDFk;
	}

	public int getMenuDFk() {
		return menuDFk;
	}

	public void setMenuDFk(int menuDFk) {
		this.menuDFk = menuDFk;
	}

	public int getCategoryFkIngredient() {
		return categoryFkIngredient;
	}

	public void setCategoryFkIngredient(int categoryFkIngredient) {
		this.categoryFkIngredient = categoryFkIngredient;
	}

	public String getCategoryNameIngredient() {
		return categoryNameIngredient;
	}

	public void setCategoryNameIngredient(String categoryNameIngredient) {
		this.categoryNameIngredient = categoryNameIngredient;
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

	public double getBaseQuantityIngredient() {
		return baseQuantityIngredient;
	}

	public void setBaseQuantityIngredient(double baseQuantityIngredient) {
		this.baseQuantityIngredient = baseQuantityIngredient;
	}

	public double getSecondaryQuantity() {
		return secondaryQuantity;
	}

	public void setSecondaryQuantity(double secondaryQuantity) {
		this.secondaryQuantity = secondaryQuantity;
	}

	public double getIngredientTotal() {
		return ingredientTotal;
	}

	public void setIngredientTotal(double ingredientTotal) {
		this.ingredientTotal = ingredientTotal;
	}

	public String getLocationName() {
		return locationName;
	}

	public void setLocationName(String locationName) {
		this.locationName = locationName;
	}

	public List<IssueMenuToLocationDTO> getDetailList() {
		return detailList;
	}

	public void setDetailList(List<IssueMenuToLocationDTO> detailList) {
		this.detailList = detailList;
	}

	public List<IssueMenuToLocationDTO> getMenuDetail() {
		return menuDetail;
	}

	public void setMenuDetail(List<IssueMenuToLocationDTO> menuDetail) {
		this.menuDetail = menuDetail;
	}

	public List<IssueMenuToLocationDTO> getChangedDetails() {
		return changedDetails;
	}

	public void setChangedDetails(List<IssueMenuToLocationDTO> changedDetails) {
		this.changedDetails = changedDetails;
	}

	public List<IssueMenuToLocationDTO> getPendingApprovals() {
		return pendingApprovals;
	}

	public void setPendingApprovals(List<IssueMenuToLocationDTO> pendingApprovals) {
		this.pendingApprovals = pendingApprovals;
	}

	public List<IssueMenuToLocationDTO> getApprovedApprovals() {
		return approvedApprovals;
	}

	public void setApprovedApprovals(List<IssueMenuToLocationDTO> approvedApprovals) {
		this.approvedApprovals = approvedApprovals;
	}

	public List<IssueMenuToLocationDTO> getRejectedApprovals() {
		return rejectedApprovals;
	}

	public void setRejectedApprovals(List<IssueMenuToLocationDTO> rejectedApprovals) {
		this.rejectedApprovals = rejectedApprovals;
	}

	public String getMenuDateStr() {
		return menuDateStr;
	}

	public void setMenuDateStr(String menuDateStr) {
		this.menuDateStr = menuDateStr;
	}

	public double getActualPobParticipation() {
		return actualPobParticipation;
	}

	public void setActualPobParticipation(double actualPobParticipation) {
		this.actualPobParticipation = actualPobParticipation;
	}

	public double getActualPob() {
		return actualPob;
	}

	public void setActualPob(double actualPob) {
		this.actualPob = actualPob;
	}

	public String getIssuedStatusStr() {
		return issuedStatusStr;
	}

	public void setIssuedStatusStr(String issuedStatusStr) {
		this.issuedStatusStr = issuedStatusStr;
	}

	public String getStatusStr() {
		return statusStr;
	}

	public void setStatusStr(String statusStr) {
		this.statusStr = statusStr;
	}

	public static long getSerialversionuid() {
		return serialVersionUID;
	}

	public int getAddingStatus() {
		return addingStatus;
	}

	public void setAddingStatus(int addingStatus) {
		this.addingStatus = addingStatus;
	}

	public String getLocationCode() {
		return locationCode;
	}

	public void setLocationCode(String locationCode) {
		this.locationCode = locationCode;
	}

	private String notes;
	private String priority;
	private int locationFk;
	private double pob;
	private double total;
	private String status;
	private int issueStatus;
	private int createdBy;
	private Date createdDateTime;
	private int lastActBy;

	private Date menuIssuedDate;

	// issue_menu_h fields
	private int issueMenuHFk;
	private int menuFk;
	private String menuName;
	private int mealTypeFk;
	private String mealTypeName;
	private int templateFk;
	private String templateName;
	private int categoryCount;
	private int recipeCount;
	private double totalCost;
	private int approvalStatus;
	private int approvedBy;

	// final_set_menu_d fields
	private int issueMenuHFkDetail;
	private int categoryFk;
	private String categoryName;
	private int recipeFk;
	private String uniqueNo;
	private String recipeName;
	private String refNo;
	private String cookingInstruction;
	private int countryOriginFk;
	private int baseQuantityFk;
	private double baseQuantity;
	private String uom;
	private double finishedProduct;
	private double portionSize;
	private String imageUrl;
	private double pobParticipation;
	private double detailTotalCost;
	private double perPortionCost;

	// final_set_menu_i fields
	private int issueMenuDFk;
	private int menuDFk;
	private int categoryFkIngredient;
	private String categoryNameIngredient;
	private int itemFk;
	private String itemCode;
	private String itemName;
	private String packageId;
	private double packagePrice;
	private double packageBaseFactor;
	private double packageSecondaryFactor;
	private String packageBaseUnit;
	private String packageSecondaryUnit;
	private double packageSecondaryCost;
	private double baseQuantityIngredient;
	private double secondaryQuantity;
	private double ingredientTotal;

	private String locationName;

	// Optional nested lists to hold details and ingredients (if needed)
	private List<IssueMenuToLocationDTO> detailList;
	private List<IssueMenuToLocationDTO> menuDetail;
	private List<IssueMenuToLocationDTO> changedDetails;

	private List<IssueMenuToLocationDTO> pendingApprovals;
	private List<IssueMenuToLocationDTO> approvedApprovals;
	private List<IssueMenuToLocationDTO> rejectedApprovals;

	private String menuDateStr;

	private double actualPobParticipation;
	private double actualPob;
	private String issuedStatusStr;
	private String statusStr;
	private int addingStatus;
	private String locationCode;
}
