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
import lombok.Data;

@Entity
@Data
@JsonIgnoreProperties({ "hibernateLazyInitializer", "handler" })
@Table(name = "meal_set_menu_h", schema = "dbo")
public class MealSetMenuHHib implements Serializable {

	/**
	 * 
	 */
	private static final long serialVersionUID = 6211062319895868667L;

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(name = "id", updatable = false)
	private int id;

	@Column(name = "meal_type_fk")
	private int mealTypeFk;

	@Column(name = "meal_type_name")
	private String mealTypeName;

	@Column(name = "template_fk")
	private int templateFk;

	@Column(name = "template_name")
	private String templateName;

	@Column(name = "menu_name")
	private String menuName;

	@Column(name = "category_count")
	private int categoryCount;

	@Column(name = "recipe_count")
	private int recipeCount;

	@Column(name = "total_cost")
	private double totalCost;

	@Column(name = "status")
	private char status;

	@Column(name = "approval_status")
	private int approvalStatus;

	@Column(name = "approved_by")
	private int approvedBy;

	@Column(name = "created_by")
	private int createdBy;

	@Column(name = "created_date_time")
	private Date createdDateTime;

	@Column(name = "last_act_by")
	private int lastActBy;

	@Column(name = "last_act_date_time")
	private Date lastActDateTime;

	@Column(name = "actual_category_count")
	private int actualCategoryCount;

	@Column(name = "actual_recipe_count")
	private int actualRecipeCount;

	public int getId() {
		return id;
	}

	public void setId(int id) {
		this.id = id;
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

	public String getMenuName() {
		return menuName;
	}

	public void setMenuName(String menuName) {
		this.menuName = menuName;
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

	public char getStatus() {
		return status;
	}

	public void setStatus(char status) {
		this.status = status;
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

	public int getActualCategoryCount() {
		return actualCategoryCount;
	}

	public void setActualCategoryCount(int actualCategoryCount) {
		this.actualCategoryCount = actualCategoryCount;
	}

	public int getActualRecipeCount() {
		return actualRecipeCount;
	}

	public void setActualRecipeCount(int actualRecipeCount) {
		this.actualRecipeCount = actualRecipeCount;
	}
}
