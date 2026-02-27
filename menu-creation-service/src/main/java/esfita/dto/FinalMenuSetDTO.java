package esfita.dto;

import java.io.Serializable;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;

import lombok.Data;

@Data
public class FinalMenuSetDTO implements Serializable {
	/**
	 * 
	 */
	private static final long serialVersionUID = -618698139459221555L;
	private int id;
	private String menuName;
	private String notes;
	private String finalMenuName;
	private String templateName;
	private String mealType;
	private Integer mealTypeFk;
	private Integer approvalStatus;
	private String approvalStatusStr;
	private char status;
	private String statusStr;
	private int totalCategories;
	private int totalRecipes;
	private int approverBy;
	private String approver;
	private Date createdDate;
	private int createdBy;
	private Date updatedDate;
	private String categoriesName;
	private List<FinalMenuSetDTO> categoryList = new ArrayList<>();
	private List<FinalMenuSetDTO> finalSetMenuList = new ArrayList<>();
	private int totalMenu;
	private int activeMenu;
	private int pendingApproval;
	private double averageCost;

	private int mealTypeCount;
	private int categoryFk;
	private String newMenuName;
	private double totalCost;
	private String recipeName;
	private double recipeCost;
	private int templateFk;
	private String mealTypeName;
	private String categoryName;
	private int recipeCount;
	private double perPortionCost;
	private double perPortionSize;
	private int recipeFk;
	private int categoryCount;
	private double portionSize;
	private int menuFk;
	private int menuDFk;
	private int finalMenuFk;
	private List<ComboBoxDTO> availableRecipes;

	private List<FinalMenuSetDTO> recipes = new ArrayList<>();
	private List<FinalMenuSetDTO> detailList = new ArrayList<>();
	private List<FinalMenuSetDTO> categoryNameList;

	
	private double cost;
	private int totalRecipeCount;
	private double totalMenuCost;
	private int lastActBy;
	private String menuSetName;
	private List<FinalMenuSetDTO> selectedMeals = new ArrayList<>();

	private String icon;
	private String iconColor;
	private String userName;
	private FinalMenuSetDTO updatedList;

	private String uom;

	public int getId() {
		return id;
	}

	public void setId(int id) {
		this.id = id;
	}

	public String getMenuName() {
		return menuName;
	}

	public void setMenuName(String menuName) {
		this.menuName = menuName;
	}

	public String getNotes() {
		return notes;
	}

	public void setNotes(String notes) {
		this.notes = notes;
	}

	public String getFinalMenuName() {
		return finalMenuName;
	}

	public void setFinalMenuName(String finalMenuName) {
		this.finalMenuName = finalMenuName;
	}

	public String getTemplateName() {
		return templateName;
	}

	public void setTemplateName(String templateName) {
		this.templateName = templateName;
	}

	public Integer getMealTypeFk() {
		return mealTypeFk;
	}

	public void setMealTypeFk(Integer mealTypeFk) {
		this.mealTypeFk = mealTypeFk;
	}

	public Integer getApprovalStatus() {
		return approvalStatus;
	}

	public void setApprovalStatus(Integer approvalStatus) {
		this.approvalStatus = approvalStatus;
	}

	public String getApprovalStatusStr() {
		return approvalStatusStr;
	}

	public void setApprovalStatusStr(String approvalStatusStr) {
		this.approvalStatusStr = approvalStatusStr;
	}

	public char getStatus() {
		return status;
	}

	public void setStatus(char status) {
		this.status = status;
	}

	public String getStatusStr() {
		return statusStr;
	}

	public void setStatusStr(String statusStr) {
		this.statusStr = statusStr;
	}

	public int getTotalCategories() {
		return totalCategories;
	}

	public void setTotalCategories(int totalCategories) {
		this.totalCategories = totalCategories;
	}

	public int getTotalRecipes() {
		return totalRecipes;
	}

	public void setTotalRecipes(int totalRecipes) {
		this.totalRecipes = totalRecipes;
	}

	public int getApproverBy() {
		return approverBy;
	}

	public void setApproverBy(int approverBy) {
		this.approverBy = approverBy;
	}

	public String getApprover() {
		return approver;
	}

	public void setApprover(String approver) {
		this.approver = approver;
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

	public String getCategoriesName() {
		return categoriesName;
	}

	public void setCategoriesName(String categoriesName) {
		this.categoriesName = categoriesName;
	}

	public List<FinalMenuSetDTO> getCategoryList() {
		return categoryList;
	}

	public void setCategoryList(List<FinalMenuSetDTO> categoryList) {
		this.categoryList = categoryList;
	}

	public List<FinalMenuSetDTO> getFinalSetMenuList() {
		return finalSetMenuList;
	}

	public void setFinalSetMenuList(List<FinalMenuSetDTO> finalSetMenuList) {
		this.finalSetMenuList = finalSetMenuList;
	}

	public int getTotalMenu() {
		return totalMenu;
	}

	public void setTotalMenu(int totalMenu) {
		this.totalMenu = totalMenu;
	}

	public int getActiveMenu() {
		return activeMenu;
	}

	public void setActiveMenu(int activeMenu) {
		this.activeMenu = activeMenu;
	}

	public int getPendingApproval() {
		return pendingApproval;
	}

	public void setPendingApproval(int pendingApproval) {
		this.pendingApproval = pendingApproval;
	}

	public int getMealTypeCount() {
		return mealTypeCount;
	}

	public void setMealTypeCount(int mealTypeCount) {
		this.mealTypeCount = mealTypeCount;
	}

	public int getCategoryFk() {
		return categoryFk;
	}

	public void setCategoryFk(int categoryFk) {
		this.categoryFk = categoryFk;
	}

	public String getNewMenuName() {
		return newMenuName;
	}

	public void setNewMenuName(String newMenuName) {
		this.newMenuName = newMenuName;
	}

	public double getTotalCost() {
		return totalCost;
	}

	public void setTotalCost(double totalCost) {
		this.totalCost = totalCost;
	}

	public String getRecipeName() {
		return recipeName;
	}

	public void setRecipeName(String recipeName) {
		this.recipeName = recipeName;
	}

	public double getRecipeCost() {
		return recipeCost;
	}

	public void setRecipeCost(double recipeCost) {
		this.recipeCost = recipeCost;
	}

	public int getTemplateFk() {
		return templateFk;
	}

	public void setTemplateFk(int templateFk) {
		this.templateFk = templateFk;
	}

	public String getMealTypeName() {
		return mealTypeName;
	}

	public void setMealTypeName(String mealTypeName) {
		this.mealTypeName = mealTypeName;
	}

	public String getCategoryName() {
		return categoryName;
	}

	public void setCategoryName(String categoryName) {
		this.categoryName = categoryName;
	}

	public int getRecipeCount() {
		return recipeCount;
	}

	public void setRecipeCount(int recipeCount) {
		this.recipeCount = recipeCount;
	}

	public double getPerPortionCost() {
		return perPortionCost;
	}

	public void setPerPortionCost(double perPortionCost) {
		this.perPortionCost = perPortionCost;
	}

	public double getPerPortionSize() {
		return perPortionSize;
	}

	public void setPerPortionSize(double perPortionSize) {
		this.perPortionSize = perPortionSize;
	}

	public int getRecipeFk() {
		return recipeFk;
	}

	public void setRecipeFk(int recipeFk) {
		this.recipeFk = recipeFk;
	}

	public int getCategoryCount() {
		return categoryCount;
	}

	public void setCategoryCount(int categoryCount) {
		this.categoryCount = categoryCount;
	}

	public double getPortionSize() {
		return portionSize;
	}

	public void setPortionSize(double portionSize) {
		this.portionSize = portionSize;
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

	public int getFinalMenuFk() {
		return finalMenuFk;
	}

	public void setFinalMenuFk(int finalMenuFk) {
		this.finalMenuFk = finalMenuFk;
	}

	public List<ComboBoxDTO> getAvailableRecipes() {
		return availableRecipes;
	}

	public void setAvailableRecipes(List<ComboBoxDTO> availableRecipes) {
		this.availableRecipes = availableRecipes;
	}

	public List<FinalMenuSetDTO> getRecipes() {
		return recipes;
	}

	public void setRecipes(List<FinalMenuSetDTO> recipes) {
		this.recipes = recipes;
	}

	public List<FinalMenuSetDTO> getDetailList() {
		return detailList;
	}

	public void setDetailList(List<FinalMenuSetDTO> detailList) {
		this.detailList = detailList;
	}

	public double getCost() {
		return cost;
	}

	public void setCost(double cost) {
		this.cost = cost;
	}

	public int getTotalRecipeCount() {
		return totalRecipeCount;
	}

	public void setTotalRecipeCount(int totalRecipeCount) {
		this.totalRecipeCount = totalRecipeCount;
	}

	public double getTotalMenuCost() {
		return totalMenuCost;
	}

	public void setTotalMenuCost(double totalMenuCost) {
		this.totalMenuCost = totalMenuCost;
	}

	public int getLastActBy() {
		return lastActBy;
	}

	public void setLastActBy(int lastActBy) {
		this.lastActBy = lastActBy;
	}

	public String getMenuSetName() {
		return menuSetName;
	}

	public void setMenuSetName(String menuSetName) {
		this.menuSetName = menuSetName;
	}

	public List<FinalMenuSetDTO> getSelectedMeals() {
		return selectedMeals;
	}

	public void setSelectedMeals(List<FinalMenuSetDTO> selectedMeals) {
		this.selectedMeals = selectedMeals;
	}

	public String getIcon() {
		return icon;
	}

	public void setIcon(String icon) {
		this.icon = icon;
	}

	public String getIconColor() {
		return iconColor;
	}

	public void setIconColor(String iconColor) {
		this.iconColor = iconColor;
	}

	public FinalMenuSetDTO getUpdatedList() {
		return updatedList;
	}

	public void setUpdatedList(FinalMenuSetDTO updatedList) {
		this.updatedList = updatedList;
	}

	public String getUom() {
		return uom;
	}

	public void setUom(String uom) {
		this.uom = uom;
	}

	public String getUserName() {
		return userName;
	}

	public void setUserName(String userName) {
		this.userName = userName;
	}

	public String getMealType() {
		return mealType;
	}

	public void setMealType(String mealType) {
		this.mealType = mealType;
	}

	public double getAverageCost() {
		return averageCost;
	}

	public void setAverageCost(double averageCost) {
		this.averageCost = averageCost;
	}

	public List<FinalMenuSetDTO> getCategoryNameList() {
		return categoryNameList;
	}

	public void setCategoryNameList(List<FinalMenuSetDTO> categoryNameList) {
		this.categoryNameList = categoryNameList;
	}

}
