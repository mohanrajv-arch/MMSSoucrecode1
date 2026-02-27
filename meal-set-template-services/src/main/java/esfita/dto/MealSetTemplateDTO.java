package esfita.dto;

import java.io.Serializable;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;

public class MealSetTemplateDTO implements Serializable {
	private static final long serialVersionUID = -7945563915091220374L;
	private int id;
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
	private List<MealSetTemplateDTO> categoryList = new ArrayList<>();
	private List<MealSetTemplateDTO> mealSetTemplateList = new ArrayList<>();
	private int totalTemplate;
	private int activeTemplate;
	private int mealTypeCount;
	private int recipePercentage;
	private int categoryFk;
	private String newTemplateName;
	private List<MealSetTemplateDTO> subList = new ArrayList<>();

	private transient List<Object> mealList = new ArrayList<>();

	private double avgCategories;
	private String userName;
	private boolean success;
	private String message;

	public int getId() {
		return id;
	}

	public void setId(int id) {
		this.id = id;
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

	public List<MealSetTemplateDTO> getCategoryList() {
		return categoryList;
	}

	public void setCategoryList(List<MealSetTemplateDTO> categoryList) {
		this.categoryList = categoryList;
	}

	public List<MealSetTemplateDTO> getMealSetTemplateList() {
		return mealSetTemplateList;
	}

	public void setMealSetTemplateList(List<MealSetTemplateDTO> mealSetTemplateList) {
		this.mealSetTemplateList = mealSetTemplateList;
	}

	public int getTotalTemplate() {
		return totalTemplate;
	}

	public void setTotalTemplate(int totalTemplate) {
		this.totalTemplate = totalTemplate;
	}

	public int getActiveTemplate() {
		return activeTemplate;
	}

	public void setActiveTemplate(int activeTemplate) {
		this.activeTemplate = activeTemplate;
	}

	public int getMealTypeCount() {
		return mealTypeCount;
	}

	public void setMealTypeCount(int mealTypeCount) {
		this.mealTypeCount = mealTypeCount;
	}

	public int getRecipePercentage() {
		return recipePercentage;
	}

	public void setRecipePercentage(int recipePercentage) {
		this.recipePercentage = recipePercentage;
	}

	public int getCategoryFk() {
		return categoryFk;
	}

	public void setCategoryFk(int categoryFk) {
		this.categoryFk = categoryFk;
	}

	public String getNewTemplateName() {
		return newTemplateName;
	}

	public void setNewTemplateName(String newTemplateName) {
		this.newTemplateName = newTemplateName;
	}

	public List<MealSetTemplateDTO> getSubList() {
		return subList;
	}

	public void setSubList(List<MealSetTemplateDTO> subList) {
		this.subList = subList;
	}

	public List<Object> getMealList() {
		return mealList;
	}

	public void setMealList(List<Object> mealList) {
		this.mealList = mealList;
	}

	public double getAvgCategories() {
		return avgCategories;
	}

	public void setAvgCategories(double avgCategories) {
		this.avgCategories = avgCategories;
	}

	public boolean isSuccess() {
		return success;
	}

	public void setSuccess(boolean success) {
		this.success = success;
	}

	public String getMessage() {
		return message;
	}

	public void setMessage(String message) {
		this.message = message;
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

}
